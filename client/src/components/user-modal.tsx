import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { insertLocalUserSchema, LocalUser } from "@shared/schema";
import { z } from "zod";

const formSchema = insertLocalUserSchema.extend({
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Vérifier la correspondance des mots de passe seulement s'ils sont fournis
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

interface UserModalProps {
  user?: LocalUser | null;
  onClose: () => void;
}

export default function UserModal({ user, onClose }: UserModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!user;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || "",
      password: "",
      confirmPassword: "",
      role: user?.role || "user",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { confirmPassword, ...userData } = data;
      console.log("Création d'utilisateur avec données:", userData);
      const response = await apiRequest("/api/users", {
        method: "POST",
        body: userData,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur a été créé avec succès",
      });
      onClose();
    },
    onError: (error: Error) => {
      console.error("Erreur lors de la création:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { confirmPassword, ...userData } = data;
      // Ne pas envoyer le mot de passe s'il est vide
      if (!userData.password) {
        delete userData.password;
      }
      console.log("Mise à jour d'utilisateur avec données:", userData);
      const response = await apiRequest(`/api/users/${user!.id}`, {
        method: "PUT",
        body: userData,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Utilisateur mis à jour",
        description: "L'utilisateur a été mis à jour avec succès",
      });
      onClose();
    },
    onError: (error: Error) => {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Soumission du formulaire:", data);
    console.log("Mode édition:", isEditing);
    if (isEditing) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d'utilisateur</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom d'utilisateur" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mot de passe {isEditing && "(laisser vide pour ne pas changer)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Mot de passe"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirmer le mot de passe"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="superviseur">Superviseur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending || updateUserMutation.isPending}
              >
                {isEditing ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}