import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-lg">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center">
            <i className="fas fa-shield-alt text-xl text-gold-500"></i>
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">Hawaii Security CRM</h1>
            <p className="text-xs text-gold-400">Professional Crime Watch & Protection</p>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200">
            <div className="relative">
              <i className="fas fa-bell mr-2"></i>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </div>
            Notifications
          </Button>

          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <i className="fas fa-user text-white text-sm"></i>
            </div>
            <div className="text-sm">
              <div className="text-white font-medium">{user?.username || 'Unknown User'}</div>
              <div className="text-slate-400 text-xs">{user?.role || 'No Role'}</div>
            </div>
          </div>

          <Button
            onClick={() => window.location.href = "/api/logout"}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;