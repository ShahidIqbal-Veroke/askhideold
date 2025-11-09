import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Shield, Users, TrendingUp, Settings } from "lucide-react";

const roleConfig = {
  gestionnaire: {
    label: "Gestionnaire",
    icon: Shield,
    color: "bg-blue-100 text-blue-800",
  },
  superviseur: {
    label: "Superviseur", 
    icon: Users,
    color: "bg-green-100 text-green-800",
  },
  direction: {
    label: "Direction",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-800",
  },
  admin: {
    label: "Admin",
    icon: Settings,
    color: "bg-red-100 text-red-800",
    description: "Administration"
  }
};

const RoleSelector = () => {
  const { role, changeRole, baseRole } = useAuth();
  
  const handleRoleChange = (newRole: string) => {
    console.log('RoleSelector: changing role from', role, 'to', newRole);
    changeRole(newRole as UserRole);
  };

  const currentConfig = roleConfig[role as keyof typeof roleConfig];
  const CurrentIcon = currentConfig?.icon || Shield;

  return (
    <div className="flex items-center space-x-2">
      {/* Badge actuel */}
      <Badge className={`${currentConfig?.color} flex items-center space-x-1 px-2 py-1`}>
        <CurrentIcon className="w-3 h-3" />
        <span className="text-xs font-medium">{currentConfig?.label}</span>
      </Badge>
      
      {/* Sélecteur */}
      <Select value={role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-40 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(roleConfig).map(([roleKey, config]) => {
            const Icon = config.icon;
            const isBase = roleKey === baseRole;
            
            return (
              <SelectItem key={roleKey} value={roleKey}>
                <div className="flex items-center space-x-2">
                  <Icon className="w-3 h-3" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">
                      {config.label}
                      {isBase && <span className="text-green-600"> (défaut)</span>}
                    </span>
                    <span className="text-xs text-slate-500">{config.description}</span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleSelector;