"use client";

import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
          <h1 className="text-lg font-semibold">Employee Knowledge Assistant</h1>
          <div className="flex items-center gap-4">
            {user?.role === "admin" && (
              <Link
                href="/admin/documents"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Admin Panel
              </Link>
            )}
            <span className="text-sm text-gray-600">{user?.full_name}</span>
            <button
              onClick={logout}
              className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-4xl p-6">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Welcome, {user?.full_name}</h2>
            <p className="mt-2 text-gray-600">
              You are logged in as <strong>{user?.role}</strong>.
            </p>
            <p className="mt-4 text-gray-500">
              Chat interface will be built in Block 8. Use the Admin Panel to upload documents.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
