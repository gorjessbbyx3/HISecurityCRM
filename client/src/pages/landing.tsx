import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-slate-900 to-slate-900"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Login Portal */}
      <div className="relative min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <i className="fas fa-shield-alt text-gold-500 text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2" data-testid="text-login-title">
              Hawaii Security CRM
            </h1>
            <p className="text-slate-400" data-testid="text-login-subtitle">
              Crime Watch & Protection Services
            </p>
          </div>

          {/* Login Card */}
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

              {/* Login Button */}
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold py-3 text-base shadow-lg"
                data-testid="button-login"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In with Replit
              </Button>

              {/* Security Notice */}
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center mt-0.5">
                    <i className="fas fa-shield-alt text-blue-400 text-xs"></i>
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-medium text-white mb-1">Secure Authentication</p>
                    <p className="text-slate-400">
                      Your login is protected by Replit's secure authentication system. 
                      All data is encrypted and access is logged for security purposes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center mt-8 space-y-4">
            <div className="flex justify-center space-x-6 text-xs text-slate-400">
              <span className="flex items-center">
                <i className="fas fa-lock mr-1"></i>
                Secure Access
              </span>
              <span className="flex items-center">
                <i className="fas fa-clock mr-1"></i>
                24/7 Availability
              </span>
              <span className="flex items-center">
                <i className="fas fa-mobile-alt mr-1"></i>
                Mobile Ready
              </span>
            </div>
            
            <p className="text-xs text-slate-500">
              &copy; 2024 Hawaii Security CRM. Professional Security Management System.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
