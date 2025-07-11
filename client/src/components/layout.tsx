import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sprout, FolderOpen, FileText, LogOut, Users } from "lucide-react";
import logoSoussMassa from '../../../attached_assets/Logo.png';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: "projects" | "conventions" | "users";
  setActiveTab: (tab: "projects" | "conventions" | "users") => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                {/* Remplacement de l'icône Sprout par le logo */}
                <img src={logoSoussMassa} alt="Logo Région Souss Massa" className="w-10 h-10 object-contain rounded-full bg-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Suivi de l'exécution des PDR
                </h1>
                <p className="text-sm text-gray-500">Région Souss Massa</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.username || "Utilisateur"} ({user?.role || "user"})
              </span>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("projects")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === "projects"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FolderOpen size={16} />
              Projets
            </button>
            <button
              onClick={() => setActiveTab("conventions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === "conventions"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText size={16} />
              Conventions
            </button>
            {user?.role === "admin" && (
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "users"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users size={16} />
                Utilisateurs
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
