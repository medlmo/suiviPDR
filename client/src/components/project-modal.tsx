import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProjectSchema, Project } from "@shared/schema";
import { z } from "zod";

const formSchema = insertProjectSchema;

type FormData = z.infer<typeof formSchema>;

interface ProjectModalProps {
  project?: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: project?.identifier || "",
      title: project?.title || "",
      axis: project?.axis || "",
      domain: project?.domain || "",
      region: project?.region || "",
      province: project?.province || "",
      commune: project?.commune || "",
      budget: project?.budget || "",
      status: project?.status || "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("Création de projet avec données:", data);
      const response = await apiRequest("/api/projects", {
        method: "POST",
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Succès",
        description: "Le projet a été créé avec succès",
      });
      onClose();
    },
    onError: (error) => {
      console.error("Erreur lors de la création:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du projet",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("Mise à jour de projet avec données:", data);
      const response = await apiRequest(`/api/projects/${project?.id}`, {
        method: "PUT",
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Succès",
        description: "Le projet a été modifié avec succès",
      });
      onClose();
    },
    onError: (error) => {
      console.error("Erreur lors de la modification:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du projet",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    if (project) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {project ? "Modifier le projet" : "Nouveau projet"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Identifiant *</Label>
              <Input
                id="identifier"
                {...form.register("identifier")}
                placeholder="Ex: PDR-2024-001"
              />
              {form.formState.errors.identifier && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.identifier.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut *</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Titre du projet"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="axis">Axe *</Label>
              <Input
                id="axis"
                {...form.register("axis")}
                placeholder="Axe du projet"
              />
              {form.formState.errors.axis && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.axis.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domaine *</Label>
              <Input
                id="domain"
                {...form.register("domain")}
                placeholder="Domaine du projet"
              />
              {form.formState.errors.domain && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.domain.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Région *</Label>
              <Input
                id="region"
                {...form.register("region")}
                placeholder="Région"
              />
              {form.formState.errors.region && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.region.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Province *</Label>
              <Input
                id="province"
                {...form.register("province")}
                placeholder="Province"
              />
              {form.formState.errors.province && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.province.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commune">Commune *</Label>
              <Input
                id="commune"
                {...form.register("commune")}
                placeholder="Commune"
              />
              {form.formState.errors.commune && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.commune.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (MAD) *</Label>
              <Input
                id="budget"
                {...form.register("budget")}
                placeholder="0.00"
              />
              {form.formState.errors.budget && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.budget.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                {...form.register("location")}
                placeholder="Localisation du projet"
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.location.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {project ? "Modification..." : "Création..."}
                </>
              ) : (
                project ? "Modifier" : "Créer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}