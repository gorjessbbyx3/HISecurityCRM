import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState(true);

  const handlePasswordChange = () => {
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
  };

  const handleNotificationUpdate = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2" data-testid="text-page-title">
          Settings
        </h1>
        <p className="text-slate-400">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            data-testid="tab-security"
          >
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            data-testid="tab-notifications"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="privacy" 
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            data-testid="tab-privacy"
          >
            <Shield className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
              <CardDescription className="text-slate-400">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-slate-300">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-slate-300">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-slate-300">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-confirm-password"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handlePasswordChange}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                  data-testid="button-change-password"
                >
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-slate-400">
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    Enable Two-Factor Authentication
                  </p>
                  <p className="text-sm text-slate-400">
                    Require a code from your phone in addition to your password
                  </p>
                </div>
                <Switch data-testid="switch-2fa" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-slate-400">
                Choose how you want to be notified about updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Email Notifications</p>
                  <p className="text-sm text-slate-400">
                    Receive email updates about your account activity
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  data-testid="switch-email-notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Push Notifications</p>
                  <p className="text-sm text-slate-400">
                    Get instant alerts on your device
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  data-testid="switch-push-notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Incident Alerts</p>
                  <p className="text-sm text-slate-400">
                    Be notified immediately when new incidents are reported
                  </p>
                </div>
                <Switch
                  checked={incidentAlerts}
                  onCheckedChange={setIncidentAlerts}
                  data-testid="switch-incident-alerts"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-700">
                <Button
                  onClick={handleNotificationUpdate}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                  data-testid="button-save-notifications"
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Privacy Settings</CardTitle>
              <CardDescription className="text-slate-400">
                Control your data and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Profile Visibility</p>
                  <p className="text-sm text-slate-400">
                    Allow other team members to see your profile
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-profile-visibility" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Activity Status</p>
                  <p className="text-sm text-slate-400">
                    Show when you're online or active
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-activity-status" />
              </div>

              <div className="pt-4 border-t border-slate-700">
                <Button
                  variant="destructive"
                  className="w-full"
                  data-testid="button-delete-account"
                >
                  Delete Account
                </Button>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
