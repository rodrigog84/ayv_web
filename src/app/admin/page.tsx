import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminLogin } from "@/components/admin-login";
import { AdminPanel } from "@/components/admin-panel";
import { isAdminAuthenticated } from "@/lib/auth";
import { getProducts, persistenceMode } from "@/lib/products";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await connection();
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return <AdminLogin />;
  }
  const products = await getProducts();
  return (
    <AdminPanel initialProducts={products} persistence={persistenceMode()} />
  );
}
