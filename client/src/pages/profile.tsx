import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Shield, Calendar, Edit } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-slate-900 min-h-screen">
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full mt-6" />
          </div>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900 min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumbs />
          <div className="max-w-4xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2" data-testid="text-page-title">
                My Profile
              </h1>
              <p className="text-slate-400">
                Manage your account information and preferences
              </p>
            </div>

            <div className="grid gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Personal Information</CardTitle>
                <CardDescription className="text-slate-400">
                  Your account details and role information
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                data-testid="button-edit-profile"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-slate-700/50 rounded-lg">
              <div className="w-20 h-20 rounded-full bg-navy-700 flex items-center justify-center border-4 border-gold-500">
                <User className="w-10 h-10 text-gold-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white" data-testid="text-profile-name">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "Security Officer"}
                </h3>
                <p className="text-slate-400 flex items-center gap-2" data-testid="text-profile-role">
                  <Shield className="w-4 h-4" />
                  {user?.role?.replace('_', ' ').toUpperCase() || "SECURITY OFFICER"}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-300">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  defaultValue={user?.firstName || ""}
                  disabled={!isEditing}
                  className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-300">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  defaultValue={user?.lastName || ""}
                  disabled={!isEditing}
                  className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled={!isEditing}
                  className="bg-slate-700 border-slate-600 text-white pl-10 disabled:opacity-50"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="username"
                  defaultValue={user?.username || ""}
                  disabled
                  className="bg-slate-700 border-slate-600 text-white pl-10 disabled:opacity-50"
                  data-testid="input-username"
                />
              </div>
              <p className="text-xs text-slate-400">
                Username cannot be changed
              </p>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                  data-testid="button-save"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Account Information</CardTitle>
            <CardDescription className="text-slate-400">
              Additional account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-white">Member Since</p>
                  <p className="text-sm text-slate-400">
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-white">Access Level</p>
                  <p className="text-sm text-slate-400">
                    {user?.role?.replace('_', ' ').toUpperCase() || "STANDARD"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
