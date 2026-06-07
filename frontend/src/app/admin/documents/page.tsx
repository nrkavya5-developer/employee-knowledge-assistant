"use client";

import AdminRoute from "@/components/AdminRoute";
import Link from "next/link";

export default function AdminDocumentsPage() {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
          <h1 className="text-lg font-semibold">Admin — Document Management</h1>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </header>
        <main className="mx-auto max-w-4xl p-6">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <p className="text-gray-500">Document upload & management UI (Block 4).</p>
          </div>
        </main>
      </div>
    </AdminRoute>
  );
}
