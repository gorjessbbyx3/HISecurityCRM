
import { Link, useLocation } from "wouter";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function Sidebar() {
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
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dashboard</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full" title="System Online"></div>
          </div>
        </div>

        <NavigationMenu orientation="vertical" className="flex-col items-start max-w-none">
          <NavigationMenuList className="flex-col space-x-0 space-y-2">
            {navItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className="w-full space-y-1">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-3 px-3">
                  {section.section}
                </h4>
                {section.items.map((item, itemIndex) => (
                  <NavigationMenuItem key={itemIndex} className="w-full">
                    <Link href={item.path}>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "w-full justify-start h-auto py-3 px-3 text-sm font-medium transition-colors",
                          isActive(item.path)
                            ? "bg-navy-700 text-white hover:bg-navy-600"
                            : "bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white"
                        )}
                        data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <i className={`${item.icon} w-5 mr-3`}></i>
                        <span>{item.label}</span>
                        {(item as any).badge && (
                          <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                            (item as any).badge === "12" ? "bg-red-500 text-white" :
                            (item as any).badge === "3" ? "bg-yellow-500 text-black" :
                            "bg-blue-500 text-white"
                          }`}>
                            {(item as any).badge}
                          </span>
                        )}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </div>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </aside>
  );
}

export default Sidebar;
