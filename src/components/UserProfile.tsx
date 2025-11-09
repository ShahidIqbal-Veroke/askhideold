import { LogOut, Settings, User, Crown, Shield, Users, Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const UserProfile = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleUserProfile = () => {
    navigate("/user-profile");
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3 text-purple-600" />;
      case 'direction':
        return <Activity className="w-3 h-3 text-blue-600" />;
      case 'superviseur':
        return <Shield className="w-3 h-3 text-green-600" />;
      case 'gestionnaire':
        return <Users className="w-3 h-3 text-slate-600" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'direction':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'superviseur':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'gestionnaire':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
    }
    return 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          {user?.imageUrl && <AvatarImage src={user.imageUrl} />}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-2">
            <div>
              <p className="text-sm font-medium">{user?.fullName || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <Badge className={`text-xs w-fit ${getRoleColor()}`}>
              {getRoleIcon()}
              <span className="ml-1 capitalize">{role}</span>
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleUserProfile}>
          <User className="mr-2 h-4 w-4" />
          Mon Profil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;