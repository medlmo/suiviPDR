import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload } from "lucide-react";
import { insertConventionSchema, Convention, Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

const formSchema = insertConventionSchema.extend({
  linkedProjects: z.array(z.number()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ConventionModalProps {
  convention?: Convention | null;
  onClose: () => void;
}

export default function ConventionModal({ convention, onClose }: ConventionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    select: (data) => data || [],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: convention?.title || "",
      dateVisa: convention?.dateVisa || undefined,
      status: convention?.status || "pending",
      programme: convention?.programme || "",
      documentUrl: convention?.documentUrl || "",
      linkedProjects: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/conventions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conventions"] });
      toast({
        title: "Succès",
        description: "Convention créée avec succès",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de créer la convention",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("PUT", `/api/conventions/${convention!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conventions"] });
      toast({
        title: "Succès",
        description: "Convention mise à jour avec succès",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la convention",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (convention) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleProjectToggle = (projectId: number) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {convention ? "Modifier la convention" : "Renseignement de la convention"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Intitulé *</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Intitulé de la convention"
                required
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateVisa">Date de visa</Label>
              <Input
                id="dateVisa"
                type="date"
                {...form.register("dateVisa")}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="signed">Signé</SelectItem>
                <SelectItem value="adoption">Adoption par le conseil régional</SelectItem>
                <SelectItem value="partners">Signature par les partenaires</SelectItem>
                <SelectItem value="visa">Visé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="programme">Programme</Label>
            <Select value={form.watch("programme")} onValueChange={(value) => form.setValue("programme", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un programme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Programme de Développement Régional Oriental 2022-2027">
                  Programme de Développement Régional Oriental 2022-2027
                </SelectItem>
                <SelectItem value="Programme de Développement Régional Casablanca-Settat 2022-2027">
                  Programme de Développement Régional Casablanca-Settat 2022-2027
                </SelectItem>
                <SelectItem value="Programme de Développement Régional Rabat-Salé-Kénitra 2022-2027">
                  Programme de Développement Régional Rabat-Salé-Kénitra 2022-2027
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Importer les documents</Label>
            <Card>
              <CardContent className="pt-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Déposer le fichier PDF ou parcourir</p>
                  <Input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      // TODO: Handle file upload
                      const file = e.target.files?.[0];
                      if (file) {
                        toast({
                          title: "Fichier sélectionné",
                          description: `${file.name} sera téléchargé lors de la sauvegarde`,
                        });
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-2">
            <Label>Lier les projets</Label>
            <Card>
              <CardContent className="pt-6">
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {projects.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun projet disponible</p>
                  ) : (
                    projects.map((project: Project) => (
                      <div key={project.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`project-${project.id}`}
                          checked={selectedProjects.includes(project.id)}
                          onCheckedChange={() => handleProjectToggle(project.id)}
                        />
                        <Label
                          htmlFor={`project-${project.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {project.identifier} - {project.title}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Sauvegarde..." : convention ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
