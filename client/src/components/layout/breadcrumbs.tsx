import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const [location] = useLocation();

  const pathMapping: Record<string, string> = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/staff": "Staff Overview",
    "/staff-management": "Staff Management",
    "/clients": "Clients",
    "/properties": "Properties",
    "/reports": "Incident Reports",
    "/patrol-reports": "Patrol Reports",
    "/crime-intelligence": "Crime Intelligence",
    "/law-reference": "Hawaii Law Reference",
    "/hawaii-law": "Guard Card Law",
    "/community-outreach": "Community Outreach",
    "/accounting": "Accounting",
    "/scheduling": "Scheduling",
    "/profile": "My Profile",
    "/settings": "Settings",
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const paths = location.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = "";
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const label = pathMapping[currentPath] || path.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (location === "/" || location === "/dashboard") {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb" data-testid="breadcrumbs">
      <Link href="/" className="text-slate-400 hover:text-white transition-colors" data-testid="breadcrumb-home">
        <Home className="w-4 h-4" />
      </Link>
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <div key={item.path} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-slate-600" />
            {isLast ? (
              <span className="text-white font-medium" data-testid={`breadcrumb-current`}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.path}
                className="text-slate-400 hover:text-white transition-colors"
                data-testid={`breadcrumb-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
