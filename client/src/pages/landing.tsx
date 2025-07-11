import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6">
              <Sprout className="text-white text-2xl" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Plateforme PDR</h2>
              <p className="mt-2 text-sm text-gray-600">Ministère de l'Agriculture</p>
              <p className="text-sm text-gray-600">Suivi de l'exécution des programmes de développement régional (PDR)</p>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full"
            >
              Se Connecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
