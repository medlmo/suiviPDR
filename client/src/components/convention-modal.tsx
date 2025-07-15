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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      console.log("Création de convention avec données:", data);
      
      // Upload file first if there's one
      let documentUrl = "";
      if (selectedFile) {
        setIsUploading(true);
        documentUrl = await uploadFile(selectedFile);
        setIsUploading(false);
      }
      
      const conventionData = {
        ...data,
        documentUrl,
      };
      
      const response = await apiRequest("/api/conventions", {
        method: "POST",
        body: conventionData,
      });
      return response;
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
      console.error("Erreur lors de la création de convention:", error);
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
      console.log("Mise à jour de convention avec données:", data);
      
      // Upload file first if there's a new one
      let documentUrl = convention?.documentUrl || "";
      if (selectedFile) {
        setIsUploading(true);
        documentUrl = await uploadFile(selectedFile);
        setIsUploading(false);
      }
      
      const conventionData = {
        ...data,
        documentUrl,
      };
      
      const response = await apiRequest(`/api/conventions/${convention!.id}`, {
        method: "PUT",
        body: conventionData,
      });
      return response;
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
      console.error("Erreur lors de la mise à jour de convention:", error);
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

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "Le fichier ne peut pas dépasser 10MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      if (!file.type.includes('pdf')) {
        toast({
          title: "Type de fichier non supporté",
          description: "Seuls les fichiers PDF sont acceptés",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      toast({
        title: "Fichier sélectionné",
        description: `${file.name} sera téléchargé lors de la sauvegarde`,
      });
    }
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
                    id="file-upload"
                    onChange={handleFileSelect}
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="mt-2">
                      <Button type="button" variant="outline" size="sm">
                        Parcourir
                      </Button>
                    </div>
                  </Label>
                  {selectedFile && (
                    <div className="mt-2 text-sm text-green-600">
                      ✓ {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </div>
                  )}
                  {convention?.documentUrl && !selectedFile && (
                    <div className="mt-2 text-sm text-blue-600">
                      📄 Document existant disponible
                    </div>
                  )}
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
              disabled={createMutation.isPending || updateMutation.isPending || isUploading}
            >
              {isUploading ? "Upload en cours..." : 
               (createMutation.isPending || updateMutation.isPending) ? "Sauvegarde..." : 
               convention ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
