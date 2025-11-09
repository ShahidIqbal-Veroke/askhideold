import { SignIn } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, TrendingUp } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and features */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12  rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="2" y="4" width="28" height="6" fill="#4F46E5"/>
                    <rect x="2" y="22" width="28" height="6" fill="#4F46E5"/>
                    <rect x="13" y="10" width="6" height="12" fill="#4F46E5"/>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Hedi</h1>
                <p className="text-slate-600">Dotez vos équipes des moyens pour détecter les nouveaux types de fraude</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Analyse intelligente</h3>
                <p className="text-slate-600">Détection automatique des documents suspects et des irrégularités</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Performances en temps réel</h3>
                <p className="text-slate-600">Tableaux de bord avec KPI et métriques de performance</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Sécurité renforcée</h3>
                <p className="text-slate-600">Audit trail complet et gestion des accès sécurisée</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">92%</div>
                <div className="text-sm text-slate-600">Taux de precision</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">0.8%</div>
                <div className="text-sm text-slate-600">Faux positifs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">15h</div>
                <div className="text-sm text-slate-600">Temps économisé</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900">Connexion</CardTitle>
              <p className="text-slate-600">Accédez à votre tableau de bord sécurisé</p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0 bg-transparent",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50",
                      formButtonPrimary: "bg-primary hover:bg-primary/90",
                      footerActionLink: "text-primary hover:text-primary/80",
                      identityPreviewText: "text-slate-600",
                      identityPreviewEditButton: "text-primary",
                    }
                  }}
                  redirectUrl="/dashboard"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;