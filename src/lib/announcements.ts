import { put, list, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { Announcement, AnnouncementInput } from "@/lib/types";
import seed from "../../data/announcements.json";

const LOCAL_PATH = path.join(process.cwd(), "data", "announcements.json");
const BLOB_PATHNAME = "ayv-outlet/announcements.json";

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function optionalTrim(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s ? s : null;
}

function normalize(announcements: Announcement[]): Announcement[] {
  return announcements.map((a) => ({
    id: (a.id || "").trim(),
    title: (a.title || "").trim(),
    body: (a.body || "").trim(),
    imageUrl: optionalTrim(a.imageUrl),
    eventDateTime: optionalTrim(a.eventDateTime),
    ctaLabel: optionalTrim(a.ctaLabel),
    ctaUrl: optionalTrim(a.ctaUrl),
    active: Boolean(a.active),
    pinned: Boolean(a.pinned),
    createdAt:
      (a.createdAt || "").trim() || new Date().toISOString(),
  }));
}

function sortAnnouncements(list: Announcement[]): Announcement[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
    return b.createdAt.localeCompare(a.createdAt);
  });
}

async function readLocal(): Promise<Announcement[]> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    return normalize(JSON.parse(raw) as Announcement[]);
  } catch {
    return normalize(seed as Announcement[]);
  }
}

async function writeLocal(announcements: Announcement[]): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(
    LOCAL_PATH,
    JSON.stringify(announcements, null, 2),
    "utf8",
  );
}

async function readBlob(): Promise<Announcement[] | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 10 });
    const match =
      blobs.find((b) => b.pathname === BLOB_PATHNAME) ?? blobs[0];
    if (!match) return null;
    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return null;
    return normalize((await res.json()) as Announcement[]);
  } catch {
    return null;
  }
}

async function writeBlob(announcements: Announcement[]): Promise<void> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 20 });
    await Promise.all(blobs.map((b) => del(b.url)));
  } catch {
    // ignore cleanup errors
  }
  await put(BLOB_PATHNAME, JSON.stringify(announcements, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getAnnouncements(): Promise<Announcement[]> {
  if (hasBlobToken()) {
    const fromBlob = await readBlob();
    if (fromBlob && fromBlob.length > 0) return sortAnnouncements(fromBlob);
    const seeded = normalize(seed as Announcement[]);
    await writeBlob(seeded);
    return sortAnnouncements(seeded);
  }
  return sortAnnouncements(await readLocal());
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const all = await getAnnouncements();
  return all.filter((a) => a.active);
}

export async function saveAnnouncements(
  announcements: Announcement[],
): Promise<Announcement[]> {
  const next = sortAnnouncements(normalize(announcements));
  if (hasBlobToken()) {
    await writeBlob(next);
  } else {
    await writeLocal(next);
  }
  return next;
}

function slugId(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return `aviso-${base || "item"}-${Date.now().toString(36)}`;
}

function toAnnouncement(id: string, input: AnnouncementInput): Announcement {
  return {
    id,
    title: input.title.trim(),
    body: (input.body || "").trim(),
    imageUrl: optionalTrim(input.imageUrl),
    eventDateTime: optionalTrim(input.eventDateTime),
    ctaLabel: optionalTrim(input.ctaLabel),
    ctaUrl: optionalTrim(input.ctaUrl),
    active: input.active !== false,
    pinned: Boolean(input.pinned),
    createdAt:
      (input.createdAt || "").trim() || new Date().toISOString(),
  };
}

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<Announcement> {
  const title = (input.title || "").trim();
  if (!title) throw new Error("El título es obligatorio");
  const announcements = await getAnnouncements();
  const announcement = toAnnouncement(input.id || slugId(title), {
    ...input,
    title,
  });
  announcements.push(announcement);
  await saveAnnouncements(announcements);
  return announcement;
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput,
): Promise<Announcement | null> {
  const title = (input.title || "").trim();
  if (!title) throw new Error("El título es obligatorio");
  const announcements = await getAnnouncements();
  const idx = announcements.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const updated = toAnnouncement(id, {
    ...input,
    title,
    createdAt: announcements[idx].createdAt,
  });
  announcements[idx] = updated;
  await saveAnnouncements(announcements);
  return updated;
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const announcements = await getAnnouncements();
  const next = announcements.filter((a) => a.id !== id);
  if (next.length === announcements.length) return false;
  await saveAnnouncements(next);
  return true;
}
