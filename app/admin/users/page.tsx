"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  UserCheck,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
  const { toast } = useToast()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock data for users
  const users = [
    {
      id: 1,
      name: "Dr. Juan García",
      email: "juan.garcia@hospital.com",
      role: "medico",
      status: "active",
      lastLogin: "2024-01-20 14:30",
      phone: "+57 300 123 4567",
      department: "Medicina Interna",
      permissions: ["casos_view", "casos_edit", "historial_view"],
      createdAt: "2024-01-15",
      avatar: null
    },
    {
      id: 2,
      name: "Dra. María López",
      email: "maria.lopez@hospital.com",
      role: "medico",
      status: "active",
      lastLogin: "2024-01-20 15:45",
      phone: "+57 301 987 6543",
      department: "Cardiología",
      permissions: ["casos_view", "casos_edit", "historial_view", "urgencias_view"],
      createdAt: "2024-01-10",
      avatar: null
    },
    {
      id: 3,
      name: "Admin Sistema",
      email: "admin@hospital.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-20 16:00",
      phone: "+57 302 555 1234",
      department: "Sistemas",
      permissions: ["all"],
      createdAt: "2024-01-01",
      avatar: null
    },
    {
      id: 4,
      name: "Dr. Carlos Ruiz",
      email: "carlos.ruiz@hospital.com",
      role: "medico",
      status: "inactive",
      lastLogin: "2024-01-18 10:20",
      phone: "+57 303 444 5678",
      department: "Urgencias",
      permissions: ["casos_view", "urgencias_edit"],
      createdAt: "2024-01-12",
      avatar: null
    }
  ]

  const userStats = [
    {
      title: "Total Usuarios",
      value: users.length.toString(),
      change: "+2 este mes",
      icon: Users,
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Usuarios Activos",
      value: users.filter(u => u.status === "active").length.toString(),
      change: "75% del total",
      icon: UserCheck,
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      title: "Médicos",
      value: users.filter(u => u.role === "medico").length.toString(),
      change: "3 médicos",
      icon: Shield,
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      title: "Administradores",
      value: users.filter(u => u.role === "admin").length.toString(),
      change: "1 admin",
      icon: Settings,
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    }
  ]

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesRole && matchesStatus
  })

  const handleCreateUser = () => {
    toast({
      title: "Usuario creado",
      description: "El nuevo usuario ha sido creado exitosamente"
    })
    setIsCreateModalOpen(false)
  }

  const handleEditUser = () => {
    toast({
      title: "Usuario actualizado",
      description: "Los datos del usuario han sido actualizados"
    })
    setIsEditModalOpen(false)
  }

  const handleDeleteUser = (userId: number) => {
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado del sistema"
    })
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Activo
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Inactivo
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
        <Shield className="w-3 h-3 mr-1" />
        Administrador
      </Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
        <Shield className="w-3 h-3 mr-1" />
        Médico
      </Badge>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <Sidebar userRole="admin" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Gestión de Usuarios" userRole="admin" />
          
          <main className="flex-1 overflow-y-auto p-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {userStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className={`${stat.color} p-4 text-white`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/90 text-sm font-medium">{stat.title}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-white/80 text-xs">{stat.change}</p>
                          </div>
                          <Icon className="h-8 w-8 text-white/80" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Main Content */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>
                      Administrar usuarios del sistema, roles y permisos
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                        <DialogDescription>
                          Agregue un nuevo usuario al sistema
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nombre Completo</Label>
                          <Input id="name" placeholder="Dr. Juan Pérez" />
                        </div>
                        <div>
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <Input id="email" type="email" placeholder="juan.perez@hospital.com" />
                        </div>
                        <div>
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input id="phone" placeholder="+57 300 123 4567" />
                        </div>
                        <div>
                          <Label htmlFor="role">Rol</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="medico">Médico</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="department">Departamento</Label>
                          <Input id="department" placeholder="Medicina Interna" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateUser}>
                          Crear Usuario
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="list" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list">Lista de Usuarios</TabsTrigger>
                    <TabsTrigger value="permissions">Permisos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="list" className="space-y-4">
                    {/* Filters */}
                    <div className="flex gap-4">
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filtrar por rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los roles</SelectItem>
                          <SelectItem value="admin">Administradores</SelectItem>
                          <SelectItem value="medico">Médicos</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="active">Activos</SelectItem>
                          <SelectItem value="inactive">Inactivos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Users Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Último Acceso</TableHead>
                          <TableHead>Departamento</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {user.name.split(" ").map(n => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {user.lastLogin}
                              </div>
                            </TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setIsEditModalOpen(true)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  
                  <TabsContent value="permissions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Configuración de Permisos</CardTitle>
                        <CardDescription>
                          Gestionar permisos y roles del sistema
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Rol: Médico</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Ver casos
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Editar casos
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Ver historial
                              </div>
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-600" />
                                Configuración
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Rol: Administrador</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Todos los permisos
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Gestión de usuarios
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Configuración del sistema
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Respaldos
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Edit User Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Usuario</DialogTitle>
                  <DialogDescription>
                    Modificar información del usuario seleccionado
                  </DialogDescription>
                </DialogHeader>
                {selectedUser && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Nombre Completo</Label>
                      <Input id="edit-name" defaultValue={selectedUser.name} />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Correo Electrónico</Label>
                      <Input id="edit-email" type="email" defaultValue={selectedUser.email} />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">Teléfono</Label>
                      <Input id="edit-phone" defaultValue={selectedUser.phone} />
                    </div>
                    <div>
                      <Label htmlFor="edit-role">Rol</Label>
                      <Select defaultValue={selectedUser.role}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medico">Médico</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-status">Estado</Label>
                      <Select defaultValue={selectedUser.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleEditUser}>
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* User Details Modal */}
            <Dialog open={!!selectedUser && !isEditModalOpen} onOpenChange={() => setSelectedUser(null)}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Detalles del Usuario</DialogTitle>
                  <DialogDescription>
                    Información completa del usuario seleccionado
                  </DialogDescription>
                </DialogHeader>
                {selectedUser && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="text-lg">
                          {selectedUser.name.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                        <p className="text-muted-foreground">{selectedUser.email}</p>
                        <div className="flex gap-2 mt-2">
                          {getRoleBadge(selectedUser.role)}
                          {getStatusBadge(selectedUser.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Teléfono</p>
                        <p className="text-muted-foreground">{selectedUser.phone}</p>
                      </div>
                      <div>
                        <p className="font-medium">Departamento</p>
                        <p className="text-muted-foreground">{selectedUser.department}</p>
                      </div>
                      <div>
                        <p className="font-medium">Último Acceso</p>
                        <p className="text-muted-foreground">{selectedUser.lastLogin}</p>
                      </div>
                      <div>
                        <p className="font-medium">Fecha de Creación</p>
                        <p className="text-muted-foreground">{selectedUser.createdAt}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2">Permisos</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedUser.permissions.map((permission: string) => (
                          <div key={permission} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            {permission.replace("_", " ")}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
