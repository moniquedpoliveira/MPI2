"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Activity,
  Edit,
  Key,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { UserForm } from "@/components/user-form";
import { PasswordChangeDialog } from "@/components/password-change-dialog";
import {
  getUsersStats,
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  changeUserPassword,
  deleteUser,
} from "@/actions/users";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdministradorDashboard() {
  const queryClient = useQueryClient();
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["users-stats"],
    queryFn: getUsersStats,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const handleCreateUser = async (data: any) => {
    await createUser(data);
    // Invalidate and refetch both users and stats
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["users-stats"] });
  };

  const handleUpdateUser = async (data: any) => {
    if (editingUser) {
      await updateUser(editingUser.id, data);
      setEditingUser(null);
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  };

  const handleToggleStatus = async (userId: string) => {
    await toggleUserStatus(userId);
    // Invalidate and refetch both users and stats
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["users-stats"] });
  };

  const handleChangePassword = async (userId: string, newPassword: string) => {
    await changeUserPassword(userId, newPassword);
    // Invalidate and refetch users
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      confirm(
        "Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.",
      )
    ) {
      await deleteUser(userId);
      // Invalidate and refetch both users and stats
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
    }
  };

  const openEditForm = (user: any) => {
    setEditingUser(user);
    setUserFormOpen(true);
  };

  const openPasswordDialog = (user: any) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      ADMINISTRADOR: "Administrador",
      GESTOR_CONTRATO: "Gestor de Contrato",
      FISCAL_ADMINISTRATIVO: "Fiscal Administrativo",
      FISCAL_TECNICO: "Fiscal Técnico",
      ORDENADOR_DESPESAS: "Ordenador de Despesas",
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      ADMINISTRADOR: "bg-red-100 text-red-800",
      GESTOR_CONTRATO: "bg-blue-100 text-blue-800",
      FISCAL_ADMINISTRATIVO: "bg-green-100 text-green-800",
      FISCAL_TECNICO: "bg-yellow-100 text-yellow-800",
      ORDENADOR_DESPESAS: "bg-purple-100 text-purple-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div>
          <h1 className="font-semibold text-lg">Administração</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        <div className="ml-auto">
          <Button
            onClick={() => setUserFormOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Usuários
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                usuários cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuários Ativos
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? "..." : stats?.ativos || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats
                  ? `${((stats.ativos / stats.total) * 100).toFixed(1)}%`
                  : "0%"}{" "}
                do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuários Inativos
              </CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statsLoading ? "..." : stats?.inativos || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats
                  ? `${((stats.inativos / stats.total) * 100).toFixed(1)}%`
                  : "0%"}{" "}
                do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Atividade Hoje
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.hojeAtivos || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                usuários ativos hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              Gerencie todos os usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-center py-8">Carregando usuários...</div>
            ) : (
              <div className="space-y-4">
                {users?.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                          className={
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {user.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Criado em{" "}
                        {format(new Date(user.createdAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                        {user.lastLogin && (
                          <span>
                            {" "}
                            • Último login:{" "}
                            {format(
                              new Date(user.lastLogin),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR },
                            )}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPasswordDialog(user)}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        {user.isActive ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      {!user.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Form Dialog */}
      <UserForm
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        user={editingUser}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
      />

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        userId={selectedUser?.id || ""}
        userName={selectedUser?.name || ""}
        onSubmit={handleChangePassword}
      />
    </div>
  );
}
