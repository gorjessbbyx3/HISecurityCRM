import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center">
              <i className="fas fa-shield-alt text-gold-500 text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white" data-testid="text-app-title">
                Hawaii Security CRM
              </h1>
              <p className="text-xs text-slate-400">Crime Watch & Protection Services</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center bg-slate-700 rounded-lg px-4 py-2">
            <i className="fas fa-search text-slate-400 mr-3"></i>
            <input 
              type="text" 
              placeholder="Search clients, properties, incidents..." 
              className="bg-transparent text-white placeholder-slate-400 outline-none text-sm w-64"
              data-testid="input-global-search"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="relative p-2 text-slate-400 hover:text-white transition-colors"
              data-testid="button-notifications"
            >
              <i className="fas fa-bell"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3 border-l border-slate-600 pl-4">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl}
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-gold-500"
                  data-testid="img-user-avatar"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center border-2 border-gold-500">
                  <i className="fas fa-user text-gold-500 text-sm"></i>
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white" data-testid="text-user-name">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email?.split('@')[0] || "Officer"
                  }
                </p>
                <p className="text-xs text-slate-400" data-testid="text-user-role">
                  {user?.role?.replace('_', ' ') || "Security Officer"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="text-slate-400 hover:text-white"
                data-testid="button-logout"
              >
                <i className="fas fa-chevron-down text-xs"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
