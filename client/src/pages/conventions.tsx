import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Download, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Convention } from "@shared/schema";
import ConventionModal from "@/components/convention-modal";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";

export default function Conventions() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedConvention, setSelectedConvention] = useState<Convention | null>(null);

  const { data: conventions = [], isLoading, error } = useQuery({
    queryKey: ["/api/conventions"],
    retry: false,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      "signed": { label: "Signé", variant: "default" as const },
      "adoption": { label: "Adoption par le conseil régional", variant: "secondary" as const },
      "partners": { label: "Signature par les partenaires", variant: "outline" as const },
      "visa": { label: "Visé", variant: "destructive" as const },
      "pending": { label: "En attente", variant: "secondary" as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "outline" as const };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const handleDownload = (conventionId: number) => {
    // TODO: Implement PDF download
    toast({
      title: "Téléchargement",
      description: "Fonctionnalité de téléchargement à venir.",
    });
  };

  const handleViewProjects = (conventionId: number) => {
    // TODO: Implement view projects functionality
    toast({
      title: "Projets liés",
      description: "Affichage des projets liés à venir.",
    });
  };

  if (error) {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté. Redirection en cours...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return null;
    }
    
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erreur lors du chargement des conventions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Liste des conventions
            </CardTitle>
            {(user?.role === "admin" || user?.role === "user") && (
              <Button onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une Convention
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intitulé</TableHead>
                  <TableHead>Date de mise</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Projets</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span>Chargement...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : conventions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucune convention trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  conventions.map((convention: Convention) => (
                    <TableRow key={convention.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{convention.title}</TableCell>
                      <TableCell>{formatDate(convention.dateVisa)}</TableCell>
                      <TableCell>{getStatusBadge(convention.status)}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={convention.programme}>
                          {convention.programme}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProjects(convention.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement view details
                              toast({
                                title: "Détails",
                                description: "Affichage des détails à venir.",
                              });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(convention.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {(user?.role === "admin" || user?.role === "user") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedConvention(convention);
                                setShowModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <ConventionModal
          convention={selectedConvention}
          onClose={() => {
            setShowModal(false);
            setSelectedConvention(null);
          }}
        />
      )}
    </div>
  );
}
