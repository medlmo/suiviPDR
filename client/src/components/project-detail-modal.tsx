import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Download, Edit, Info, MapPin, TrendingUp, Users } from "lucide-react";
import { Project, ProjectPartner, Partner, FinancialAdvance } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const { toast } = useToast();

  const { data: partners = [] } = useQuery({
    queryKey: ["/api/projects", project.id, "partners"],
    enabled: !!project.id,
  });

  const { data: financialAdvances = [] } = useQuery({
    queryKey: ["/api/projects", project.id, "financial-advances"],
    enabled: !!project.id,
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      "pending": { label: "En attente", variant: "secondary" as const },
      "in_progress": { label: "En cours", variant: "default" as const },
      "completed": { label: "Terminé", variant: "destructive" as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "outline" as const };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Téléchargement",
      description: "Génération du PDF en cours...",
    });
  };

  const handleEdit = () => {
    toast({
      title: "Modification",
      description: "Fonctionnalité de modification à venir.",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du Projet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project General Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Fiche d'information du projet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Intitulé</label>
                  <p className="text-sm text-gray-900">{project.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Identifiant</label>
                  <p className="text-sm text-gray-900">{project.identifier}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Axe de développement</label>
                  <p className="text-sm text-gray-900">{project.axis}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Domaine d'impact</label>
                  <p className="text-sm text-gray-900">{project.domain}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  {getStatusBadge(project.status)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localisation du Projet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Région</label>
                  <p className="text-sm text-gray-900">{project.region}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Province</label>
                  <p className="text-sm text-gray-900">{project.province}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Commune</label>
                  <p className="text-sm text-gray-900">{project.commune}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Avancement financier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(project.budget)}</div>
                  <div className="text-sm text-gray-500">Budget Global</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(project.engagements || 0)}</div>
                  <div className="text-sm text-gray-500">Engagements</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(project.payments || 0)}</div>
                  <div className="text-sm text-gray-500">Paiements</div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Taux d'avancement physique</span>
                  <span>{project.physicalProgress || 0}%</span>
                </div>
                <Progress value={project.physicalProgress || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Partners Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Partenaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Année</TableHead>
                      <TableHead>Partenaire</TableHead>
                      <TableHead>Contribution Prévue</TableHead>
                      <TableHead>Contribution Effective</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          Aucun partenaire associé
                        </TableCell>
                      </TableRow>
                    ) : (
                      partners.map((partner: ProjectPartner & { partner: Partner }) => (
                        <TableRow key={partner.id}>
                          <TableCell>{partner.year}</TableCell>
                          <TableCell>{partner.partner?.name || "Partenaire non défini"}</TableCell>
                          <TableCell>{formatCurrency(partner.plannedContribution)}</TableCell>
                          <TableCell>{formatCurrency(partner.actualContribution || 0)}</TableCell>
                          <TableCell>{getStatusBadge(partner.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
