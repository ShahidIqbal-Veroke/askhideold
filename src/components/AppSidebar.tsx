import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, FileText, History, Settings, MessageCircle, Upload, Key, Users, Activity, Bell, Folder, User, Clock, Shield, Repeat, Zap, TrendingUp, Target, Database, AlertTriangle } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/contexts/AlertContext";
import { useAuth } from "@/hooks/useAuth";

// EVENT-DRIVEN: Core workflow items
const CoreWorkflowItems = () => {
  const { unreadCount } = useAlerts();
  
  return [{
    title: "Centre d'Alertes",
    url: "/alerts",
    icon: Bell,
    badge: unreadCount > 0 ? unreadCount : undefined,
  }, {
    title: "Dossiers",
    url: "/cases",
    icon: Folder,
  }, {
    title: "Événements",
    url: "/events",
    icon: Zap,
  }];
};

// DASHBOARDS: Role-based analytics
const DashboardItems = ({ role }) => {
  const items = [];

  // Add role-specific dashboards with proper role checking
  if (role === 'gestionnaire' || role === 'admin') {
    items.push({
      title: "Mon Activité",
      url: "/dashboard-gestionnaire",
      icon: Target,
      roleRequired: 'gestionnaire'
    });
  }
  
  // Fraud qualification dashboard - available to all fraud management roles

  
  if (role === 'superviseur' || role === 'admin') {
    items.push({
      title: "Dashboard",
      url: "/dashboard-superviseur",
      icon: Users,
      roleRequired: 'superviseur'
    });
  }
  
  if (role === 'direction' || role === 'admin') {
    items.push({
      title: "Dashboard",
      url: "/dashboard-direction",
      icon: TrendingUp,
      roleRequired: 'direction'
    });
  }
  
  return items;
};

// DATA EXPLORATION: For risk analysis
const DataExplorationItems = () => {
  return [{
    title: "Profils Risque",
    url: "/risk-profiles",
    icon: Shield,
  }, {
    title: "Historique",
    url: "/historique",
    icon: Clock,
  }, {
    title: "Audit Trail",
    url: "/audit",
    icon: History,
  }];
};

// DEPRECATED: Assuré-centric pages (will be removed)
const LegacyItems = () => {
  return [{
    title: "Assurés (DEPRECATED)",
    url: "/assures",
    icon: User,
  }, {
    title: "Demandes (DEPRECATED)",
    url: "/demandes",
    icon: FileText,
  }];
};
const settingsItems = [{
  title: "API keys",
  url: "/api-keys",
  icon: Key
}, {
  title: "Team",
  url: "/team",
  icon: Users
}, {
  title: "Gestion des rôles",
  url: "/role-manager",
  icon: Shield,
  adminOnly: true
}, {
  title: "Usage",
  url: "/usage",
  icon: Activity
}, {
  title: "Settings",
  url: "/settings",
  icon: Settings
}];
const supportItems = [{
  title: "Documentation",
  url: "/documentation",
  icon: FileText
}, {
  title: "Feedback",
  url: "/feedback",
  icon: MessageCircle
}];
export function AppSidebar() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { isAdmin, role, isGestionnaire, isSuperviseur, isDirection } = useAuth();
  
  // EVENT-DRIVEN: Get items based on architecture
  const coreWorkflowItems = CoreWorkflowItems();
  const dashboardItems = DashboardItems({ role });
  const dataExplorationItems = DataExplorationItems();
  const legacyItems = LegacyItems();
  
  const getNavCls = isActive => isActive ? "bg-blue-50 text-blue-600 font-medium border-r-2 border-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900";
  const MenuSection = ({
    title,
    items,
    showUpload = false
  }) => <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.filter(item => !item.adminOnly || isAdmin).map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={({
              isActive
            }) => `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${getNavCls(isActive)}`}>
                      <item.icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div>{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                        )}
                      </div>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}

            {showUpload && <>
                  <Separator className="my-2" />
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>;
  return <Sidebar className="border-r border-slate-200 bg-white">
        <SidebarHeader className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="4" width="28" height="6" fill="#4F46E5" />
                <rect x="2" y="22" width="28" height="6" fill="#4F46E5" />
                <rect x="13" y="10" width="6" height="12" fill="#4F46E5" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Hedi</h2>
              <p className="text-xs text-gray-500">Fraud by design</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <MenuSection title="Workflow Principal" items={coreWorkflowItems} showUpload={true} />
          <MenuSection title="Dashboards" items={dashboardItems} />
          <MenuSection title="Exploration Données" items={dataExplorationItems} />
          <MenuSection title="Settings" items={settingsItems} />
          <MenuSection title="Support" items={supportItems} />
          {isAdmin && <MenuSection title="⚠️ DEPRECATED (Admin)" items={legacyItems} />}
        </SidebarContent>
      </Sidebar>;
}