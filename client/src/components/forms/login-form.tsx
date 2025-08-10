import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login({ username, password });

      if (success) {
        console.log('Navigating to dashboard...');
        window.location.href = '/dashboard';
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-white text-xl">Security Portal Access</CardTitle>
        <CardDescription className="text-slate-400">
          Sign in to access your security management dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Features */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm text-slate-300">
            <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
              <i className="fas fa-chart-line text-red-400 text-xs"></i>
            </div>
            <span>Crime Intelligence & Mapping</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-slate-300">
            <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
              <i className="fas fa-route text-blue-400 text-xs"></i>
            </div>
            <span>Patrol Management & Scheduling</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-slate-300">
            <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
              <i className="fas fa-building text-green-400 text-xs"></i>
            </div>
            <span>Client & Property Database</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-slate-300">
            <div className="w-6 h-6 bg-gold-500/20 rounded flex items-center justify-center">
              <i className="fas fa-gavel text-gold-400 text-xs"></i>
            </div>
            <span>Hawaii Law Reference</span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-800 px-2 text-slate-400">Secure Access</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-gold-500"
              data-testid="input-username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-gold-500"
              data-testid="input-password"
              required
            />
          </div>

          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold py-3 text-base shadow-lg disabled:opacity-50"
            data-testid="button-submit-login"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Signing In...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Security Notice */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center mt-0.5">
              <i className="fas fa-shield-alt text-blue-400 text-xs"></i>
            </div>
            <div className="text-xs text-slate-300">
              <p className="font-medium text-white mb-1">Secure Authentication</p>
              <p className="text-slate-400">
                Your login is protected by encrypted session management. 
                All data is secured and access is logged for security purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Credentials Notice */}
        <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-gold-500/20 rounded flex items-center justify-center mt-0.5">
              <i className="fas fa-info-circle text-gold-400 text-xs"></i>
            </div>
            <div className="text-xs text-slate-300">
              <p className="font-medium text-white mb-1">Demo Access</p>
              <p className="text-slate-400">
                Username: <span className="text-gold-400 font-mono">STREETPATROL808</span><br />
                Password: <span className="text-gold-400 font-mono">Password3211</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}