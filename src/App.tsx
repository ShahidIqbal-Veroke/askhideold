
import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ClerkProvider, SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Bell, Settings as SettingsIcon } from "lucide-react";
import { useAlerts } from "@/contexts/AlertContext";
import { useNavigate } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { EventProvider } from "@/contexts/EventContext";
import { AlertProvider } from "@/contexts/AlertContext";
import { CaseProvider } from "@/contexts/CaseContext";
import { CycleVieProvider } from "@/contexts/CycleVieContext";
import { HistoriqueProvider } from "@/contexts/HistoriqueContext";
import { RisqueProvider } from "@/contexts/RisqueContext";
import { DemandeProvider } from "@/contexts/DemandeContext";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { DemoInitializer } from "@/lib/demoInitializer";
import "@/lib/integrationExample";
import "@/utils/debugLocalStorage";
import "@/utils/testAlertFlow";
import "@/utils/verifyAlertCreation";

// Lazy load heavy components to improve initial load
const AppSidebar = lazy(() => import("@/components/AppSidebar").then(module => ({ default: module.AppSidebar })));
const SidebarTrigger = lazy(() => import("@/components/ui/sidebar").then(module => ({ default: module.SidebarTrigger })));
const UploadButton = lazy(() => import("./components/UploadButton"));
const UserProfile = lazy(() => import("./components/UserProfile"));
const RoleSelector = lazy(() => import("./components/RoleSelector"));

// Lazy load page components for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AnalysisResult = lazy(() => import("./pages/AnalysisResult"));
const AuditTrail = lazy(() => import("./pages/AuditTrail"));
const Settings = lazy(() => import("./pages/Settings"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const Team = lazy(() => import("./pages/Team"));
const Usage = lazy(() => import("./pages/Usage"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Feedback = lazy(() => import("./pages/Feedback"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Cases = lazy(() => import("./pages/Cases"));

// Event-Driven Architecture pages
const Events = lazy(() => import("./pages/Events"));
const RiskProfiles = lazy(() => import("./pages/RiskProfiles"));
const DashboardGestionnaire = lazy(() => import("./pages/DashboardGestionnaire"));
const DashboardSuperviseur = lazy(() => import("./pages/DashboardSuperviseur"));
const DashboardDirection = lazy(() => import("./pages/DashboardDirection"));

// DEPRECATED: Legacy Assuré-centric pages (will be removed)
const Assures = lazy(() => import("./pages/Assures"));
const Demandes = lazy(() => import("./pages/Demandes"));
const Historique = lazy(() => import("./pages/Historique"));
const Risques = lazy(() => import("./pages/Risques"));
const CycleVie = lazy(() => import("./pages/CycleVie"));
const RoleManager = lazy(() => import("./pages/RoleManager"));
const UserProfilePage = lazy(() => import("./pages/UserProfile"));

const queryClient = new QueryClient();

const HeaderContent = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { unreadCount } = useAlerts();
  const [language, setLanguage] = useState<'ar' | 'eng'>('eng');

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'User';

  return (
    <header className="w-full ">
      <div className="w-[98%] h-20 mt-2 mx-auto">
        <div
          className="px-6 py-4 flex items-center justify-between rounded-[12px] shadow-md"
          style={{
            background: '#FFFFFF2B',
            boxShadow: '30.75px 30.75px 71.74px 0px #0D64FF26',
            backdropFilter: 'blur(10.9px)',
            border: '1.28px solid',
            borderImageSource:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.3) -0.11%, rgba(153, 153, 153, 0) 65.18%)',
          }}
        >
          <div className="flex items-center gap-3">
            <Suspense fallback={<div className="w-8 h-8 bg-white/20 rounded animate-pulse"></div>}>
              <SidebarTrigger className="text-white hover:bg-white/20 rounded-lg p-2" />
            </Suspense>
            <span className="text-2xl font-bold text-slate-900">
              Hi {firstName}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="w-24 h-8 bg-white/20 rounded animate-pulse"></div>}>
              <UploadButton />
            </Suspense>
            <button
              onClick={() => navigate('/alerts')}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>


            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SettingsIcon className="w-5 h-5 text-slate-700" />
            </button>

            {/* Language Toggle */}
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm ${language === 'eng' ? 'text-gray-400' : 'text-blue-600 font-medium'}`}>
                Ar
              </span>
              <button
                onClick={() => setLanguage(language === 'eng' ? 'ar' : 'eng')}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${language === 'eng' ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${language === 'eng' ? 'translate-x-6' : 'translate-x-0'
                    }`}
                />
              </button>
              <span className={`text-sm ${language === 'eng' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                Eng
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const AppContent = () => {
  // Initialize demo data when the app loads
  useEffect(() => {
    DemoInitializer.init();
  }, []);

  return (
    <BrowserRouter>
      <SignedIn>
        <SidebarProvider>
          <div className="min-h-screen flex w-full"
            style={{
              background: 'linear-gradient(to bottom, #E3E8FF, #D8F7FF)',
            }}
          >

            <Suspense fallback={<div className="w-64 bg-white border-r border-slate-200 animate-pulse"></div>}>
              <AppSidebar />
            </Suspense>
            <div className="flex-1 flex flex-col">
              <HeaderContent />
              <main className="flex-1 p-6 rounded-[12px]"
                style={{
                  background: '#FFFFFF2B',
                  boxShadow: '30.75px 30.75px 71.74px 0px #0D64FF26',
                  backdropFilter: 'blur(10.9px)',
                  border: '1.28px solid',
                  marginLeft: '10px',
                  marginRight: '10px',
                  marginBottom: '10px',
                  borderImageSource: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) -0.11%, rgba(153, 153, 153, 0) 65.18%)',
                }}
              >
                <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/alerts" replace />} />
                    {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
                    {/* EVENT-DRIVEN Architecture (Primary) */}
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/cases" element={<Cases />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/risk-profiles" element={<RiskProfiles />} />

                    {/* Role-based Dashboards */}
                    <Route
                      path="/dashboard-gestionnaire"
                      element={
                        <RoleProtectedRoute requiredRole={['gestionnaire', 'admin']}>
                          <DashboardGestionnaire />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard-superviseur"
                      element={
                        <RoleProtectedRoute requiredRole={['superviseur', 'admin']}>
                          <DashboardSuperviseur />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard-direction"
                      element={
                        <RoleProtectedRoute requiredRole={['direction', 'admin']}>
                          <DashboardDirection />
                        </RoleProtectedRoute>
                      }
                    />

                    {/* DEPRECATED: Legacy Assuré-centric pages */}
                    <Route path="/assures" element={<Assures />} />
                    <Route path="/demandes" element={<Demandes />} />
                    <Route path="/historique" element={<Historique />} />
                    <Route path="/risques" element={<Risques />} />
                    <Route path="/cycle-vie" element={<CycleVie />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analysis-result" element={<AnalysisResult />} />
                    <Route path="/audit" element={<AuditTrail />} />

                    {/* Settings */}
                    <Route path="/api-keys" element={<ApiKeys />} />
                    <Route path="/team" element={<Team />} />
                    <Route
                      path="/role-manager"
                      element={
                        <RoleProtectedRoute requiredRole="admin">
                          <RoleManager />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route path="/user-profile" element={<UserProfilePage />} />
                    <Route path="/usage" element={<Usage />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* Support */}
                    <Route path="/documentation" element={<Documentation />} />
                    <Route path="/feedback" element={<Feedback />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </SignedIn>
      <SignedOut>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>}>
          <Login />
        </Suspense>
      </SignedOut>
    </BrowserRouter>
  );
};

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing Publishable Key');
}

const App = () => (
  <ClerkProvider publishableKey={publishableKey}>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <HistoriqueProvider>
          <AlertProvider>
            <EventProvider>
              <CaseProvider>
                <RisqueProvider>
                  <CycleVieProvider>
                    <DemandeProvider>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <AppContent />
                      </TooltipProvider>
                    </DemandeProvider>
                  </CycleVieProvider>
                </RisqueProvider>
              </CaseProvider>
            </EventProvider>
          </AlertProvider>
        </HistoriqueProvider>
      </SettingsProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
