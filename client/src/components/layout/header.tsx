import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="glass-effect border-b border-slate-600/50 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-blue-400 transition-all duration-300 lg:hidden button-glow rounded-lg p-2"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gradient-blue">
              {getPageTitle()}
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
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