import { LoginForm } from "@/components/forms/login-form";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
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

          {/* Login Form */}
          <LoginForm onLoginSuccess={() => setLocation("/dashboard")} />

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
