import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  History,
  Key,
  Users,
  Activity,
  Bell,
  Folder,
  User,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  Target,
  FileText,
  MessageCircle,
  Settings,
} from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/contexts/AlertContext";
import { useAuth } from "@/hooks/useAuth";

const CoreWorkflowItems = () => {
  const { unreadCount } = useAlerts();
  return [
    {
      title: "Alert Center",
      url: "/alerts",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { title: "Files", url: "/cases", icon: Folder },
    { title: "Events", url: "/events", icon: Zap },
  ];
};

const DashboardItems = ({ role }: { role: string }) => {
  const items = [{ title: "Dashboard", url: "/dashboard", icon: BarChart3 }];
  if (role === "gestionnaire" || role === "admin")
    items.push({
      title: "Mon Activité",
      url: "/dashboard-gestionnaire",
      icon: Target,
    });
  if (role === "superviseur" || role === "admin")
    items.push({
      title: "Dashboard Superviseur",
      url: "/dashboard-superviseur",
      icon: Users,
    });
  if (role === "direction" || role === "admin")
    items.push({
      title: "Dashboard Direction",
      url: "/dashboard-direction",
      icon: TrendingUp,
    });
  return items;
};

const DataExplorationItems = () => [
  { title: "Profils Risque", url: "/risk-profiles", icon: Shield },
  { title: "Historique", url: "/historique", icon: Clock },
  { title: "Audit Trail", url: "/audit", icon: History },
];

const LegacyItems = () => [
  { title: "Assurés (DEPRECATED)", url: "/assures", icon: User },
  { title: "Demandes (DEPRECATED)", url: "/demandes", icon: FileText },
];

const settingsItems = [
  { title: "API keys", url: "/api-keys", icon: Key },
  { title: "Team", url: "/team", icon: Users },
  { title: "Gestion des rôles", url: "/role-manager", icon: Shield, adminOnly: true },
  { title: "Usage", url: "/usage", icon: Activity },
  { title: "Settings", url: "/settings", icon: Settings },
];

const supportItems = [
  { title: "Documentation", url: "/documentation", icon: FileText },
  { title: "Feedback", url: "/feedback", icon: MessageCircle },
];

export function AppSidebar() {
  const { isAdmin, role } = useAuth();
  const location = useLocation();

  const coreWorkflowItems = CoreWorkflowItems();
  const dashboardItems = DashboardItems({ role });
  const dataExplorationItems = DataExplorationItems();
  const legacyItems = LegacyItems();

  const getOpenSection = () => {
    const path = location.pathname;
    if (path.startsWith("/alerts") || path.startsWith("/cases") || path.startsWith("/events")) return "workflow";
    if (path.startsWith("/dashboard") || path === "/") return "dashboards";
    if (path.startsWith("/risk-profiles") || path.startsWith("/historique") || path.startsWith("/audit")) return "data-exploration";
    if (path.startsWith("/api-keys") || path.startsWith("/team") || path.startsWith("/role-manager") || path.startsWith("/usage") || path.startsWith("/settings")) return "settings";
    if (path.startsWith("/documentation") || path.startsWith("/feedback")) return "support";
    if (path.startsWith("/assures") || path.startsWith("/demandes")) return "deprecated";
    return null;
  };

  const [openSection, setOpenSection] = useState<string | null>(() => getOpenSection() || "workflow");

  useEffect(() => {
    const section = getOpenSection();
    setOpenSection((currentSection) => (section !== currentSection ? section || currentSection : currentSection));
  }, [location.pathname]);

  const isRouteActive = (url: string) => location.pathname === url || location.pathname.startsWith(url + "/");

  const MenuSection = ({
    sectionKey,
    title,
    items,
    iconPath,
  }: {
    sectionKey: string;
    title: string;
    items: any[];
    iconPath?: string;
  }) => {
    const isOpen = openSection === sectionKey;
    const filteredItems = items.filter((item) => !item.adminOnly || isAdmin);
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
      if (isOpen && contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }, [isOpen, filteredItems.length]);

    return (
      <div
        className={`rounded-xl overflow-hidden transition-all duration-500 ${isOpen
            ? "bg-[#E3E7FE] shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#D0D7FF]"
            : "border-none  hover:border hover:border-gray-300"
          }`}
      >
        <button
          onClick={() => setOpenSection(isOpen ? null : sectionKey)}
          className="w-full text-left flex flex-col gap-1 px-4 py-3 transition-all duration-300"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {iconPath && (
                <img
                  src={iconPath}
                  alt=""
                  className="w-5 h-5"
                  style={{ filter: "brightness(0) invert(0)" }}
                />
              )}
              <span
                className={`text-base ${isOpen ? "font-bold" : "font-semibold"
                  } text-[#2B2B2B] tracking-wide`}
              >
                {title}
              </span>
            </div>
          </div>

          {isOpen && (
            <div
              className="w-full h-[1px] mt-2"
              style={{
                border: "0.5px solid",
                borderImageSource:
                  "linear-gradient(90deg, rgba(79,70,229,0) 0%, #4F46E5 50%, rgba(79,70,229,0) 100%)",
                borderImageSlice: 1,
              }}
            />
          )}
        </button>

        <div
          style={{
            height: isOpen ? `auto` : "0px",
            opacity: isOpen ? 1 : 0,
            transition: "height 0.5s ease, opacity 0.5s ease",
            overflow: "hidden",
          }}
        >
          <div ref={contentRef} className="px-4 pb-2 pt-1 space-y-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const navIsActive = isRouteActive(item.url);
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-300 ${navIsActive
                        ? "text-[#2B2B2B] font-medium"
                        : "text-[#2B2B2B]/80 hover:text-[#000]"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* <IconComponent className="w-4 h-4" /> */}
                      <span>{item.title}</span>
                    </div>
                    {/* {item.badge && (
                      <Badge
                        variant="destructive"
                        className="ml-auto bg-red-500 text-white text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )} */}
                  </NavLink>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No items available
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <style>{`
        [data-sidebar="sidebar"] {
          background: linear-gradient(to bottom, #E3E8FF, #D8F7FF) !important;
          color: #2B2B2B !important;
        }
        [data-sidebar="header"], [data-sidebar="content"] {
          background: transparent !important;
        }
        [data-sidebar="sidebar"], [data-sidebar="sidebar"] * {
          border-right: none !important;
        }
      `}</style>

      <Sidebar>
        <SidebarHeader className="p-4 flex flex-col items-center">
          <div className="flex items-center justify-center space-x-2 gap-2">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <svg
                width="48"
                height="48"
                viewBox="0 0 32 32"
                fill="none"
                className="block"
              >
                <rect x="2" y="4" width="28" height="6" fill="#2C4EF1" />
                <rect x="2" y="22" width="28" height="6" fill="#2C4EF1" />
                <rect x="13" y="10" width="6" height="12" fill="#2C4EF1" />
              </svg>
            </div>
            <h1
              className="text-4xl font-bold leading-none flex items-center"
              style={{ color: "#2B2B2B" }}
            >
              Hedi
            </h1>
          </div>

          <div
            className="mt-2 w-40 h-[2px]"
            style={{
              background:
                "linear-gradient(to right, transparent, #FFFFFF33, #FFFFFF33, #FFFFFF33, transparent)",
            }}
          />
        </SidebarHeader>

        <SidebarContent className="px-4 py-4 flex flex-col gap-3">
          <MenuSection sectionKey="workflow" title="Workflow Principal" items={coreWorkflowItems} iconPath="/icons/WorkflowPrincipal.svg" />
          <MenuSection sectionKey="dashboards" title="Dashboards" items={dashboardItems} iconPath="/icons/Dashboards.svg" />
          <MenuSection sectionKey="data-exploration" title="Data Exploration" items={dataExplorationItems} iconPath="/icons/DataExploration.svg" />
          <MenuSection sectionKey="settings" title="Settings" items={settingsItems} iconPath="/icons/Settings.svg" />
          <MenuSection sectionKey="support" title="Support" items={supportItems} iconPath="/icons/Support.svg" />
          {isAdmin && (
            <MenuSection sectionKey="deprecated" title="⚠️ DEPRECATED (Admin)" items={legacyItems} />
          )}
        </SidebarContent>
      </Sidebar>
    </div>
  );
}