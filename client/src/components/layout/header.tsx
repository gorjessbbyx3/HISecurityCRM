
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Hawaii Security CRM
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {user?.firstName || user?.username || 'User'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hover:bg-gray-50"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
