import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === path;
  };

  const navItems = [
    {
      section: "Dashboard",
      items: [
        { path: "/", icon: "fas fa-tachometer-alt", label: "Overview" },
      ]
    },
    {
      section: "Crime Intelligence",
      items: [
        { path: "/crime-intelligence", icon: "fas fa-map-marked-alt", label: "Crime Maps" },
        { path: "/patrol-reports", icon: "fas fa-chart-line", label: "Patrol Reports" },
        { path: "/reports", icon: "fas fa-exclamation-triangle", label: "Incident Reports" },
      ]
    },
    {
      section: "Client Management",
      items: [
        { path: "/clients", icon: "fas fa-users", label: "Clients" },
        { path: "/properties", icon: "fas fa-building", label: "Properties" },
        { path: "/scheduling", icon: "fas fa-calendar-alt", label: "Scheduling" },
      ]
    },
    {
      section: "Staff Management",
      items: [
        { path: "/staff", icon: "fas fa-user-shield", label: "Staff Overview" },
        { path: "/staff-management", icon: "fas fa-users-cog", label: "Staff Management" },
      ]
    },
    {
      section: "Resources",
      items: [
        { path: "/law-reference", icon: "fas fa-gavel", label: "Hawaii Law Reference" },
        { path: "/hawaii-law", icon: "fas fa-balance-scale", label: "Guard Card Law" },
        { path: "/community-outreach", icon: "fas fa-hands-helping", label: "Community Outreach" },
      ]
    },
    {
      section: "Administration",
      items: [
        { path: "/accounting", icon: "fas fa-calculator", label: "Accounting" },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen sticky top-16" data-testid="sidebar">
      <nav className="p-4 space-y-2">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dashboard</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full" title="System Online"></div>
          </div>
        </div>

        {navItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-3">
              {section.section}
            </h4>
            {section.items.map((item, itemIndex) => (
              <Link 
                key={itemIndex}
                href={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-navy-700 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <i className={`${item.icon} w-5`}></i>
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                    item.badge === "12" ? "bg-red-500 text-white" :
                    item.badge === "3" ? "bg-yellow-500 text-black" :
                    "bg-blue-500 text-white"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
