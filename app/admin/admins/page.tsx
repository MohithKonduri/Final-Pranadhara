"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminMobileNav } from "@/components/admin-mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/firebase"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { Shield, Plus, Edit, Trash2, Mail, Phone, CheckCircle, XCircle } from "lucide-react"
import type { PranadharaAdmin } from "@/lib/types"

export default function AdminsPage() {
    const router = useRouter()
    const [admins, setAdmins] = useState<PranadharaAdmin[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingAdmin, setEditingAdmin] = useState<PranadharaAdmin | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "admin" as PranadharaAdmin["role"],
        permissions: {
            manageDonors: true,
            manageEmergencies: true,
            manageCamps: true,
            manageAdmins: false,
            sendNotifications: true,
        },
        isActive: true,
    })

    useEffect(() => {
        const adminSession = localStorage.getItem("adminSession")
        if (!adminSession) {
            router.push("/admin/login")
            return
        }
        fetchAdmins()
    }, [router])

    const fetchAdmins = async () => {
        try {
            const adminsSnapshot = await getDocs(collection(db, "admins"))
            const adminsData = adminsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as PranadharaAdmin[]

            // Sort by role (super_admin first) and then by name
            adminsData.sort((a, b) => {
                const roleOrder = { super_admin: 0, admin: 1, moderator: 2 }
                const roleCompare = roleOrder[a.role] - roleOrder[b.role]
                if (roleCompare !== 0) return roleCompare
                return a.name.localeCompare(b.name)
            })

            setAdmins(adminsData)
        } catch (error) {
            console.error("Error fetching admins:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const adminData = {
                ...formData,
                updatedAt: new Date().toISOString(),
            }

            if (editingAdmin) {
                // Update existing admin
                await updateDoc(doc(db, "admins", editingAdmin.id), adminData)
            } else {
                // Add new admin
                await addDoc(collection(db, "admins"), {
                    ...adminData,
                    createdAt: new Date().toISOString(),
                })
            }

            setIsDialogOpen(false)
            resetForm()
            fetchAdmins()
        } catch (error) {
            console.error("Error saving admin:", error)
            alert("Failed to save admin. Please try again.")
        }
    }

    const handleEdit = (admin: PranadharaAdmin) => {
        setEditingAdmin(admin)
        setFormData({
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            role: admin.role,
            permissions: admin.permissions,
            isActive: admin.isActive,
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (adminId: string) => {
        if (!confirm("Are you sure you want to delete this admin?")) return

        try {
            await deleteDoc(doc(db, "admins", adminId))
            fetchAdmins()
        } catch (error) {
            console.error("Error deleting admin:", error)
            alert("Failed to delete admin. Please try again.")
        }
    }

    const toggleAdminStatus = async (admin: PranadharaAdmin) => {
        try {
            await updateDoc(doc(db, "admins", admin.id), {
                isActive: !admin.isActive,
                updatedAt: new Date().toISOString(),
            })
            fetchAdmins()
        } catch (error) {
            console.error("Error updating admin status:", error)
            alert("Failed to update admin status. Please try again.")
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            role: "admin",
            permissions: {
                manageDonors: true,
                manageEmergencies: true,
                manageCamps: true,
                manageAdmins: false,
                sendNotifications: true,
            },
            isActive: true,
        })
        setEditingAdmin(null)
    }

    const getRoleBadgeColor = (role: PranadharaAdmin["role"]) => {
        switch (role) {
            case "super_admin":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            case "admin":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case "moderator":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            default:
                return ""
        }
    }

    const updatePermission = (key: keyof typeof formData.permissions, value: boolean) => {
        setFormData({
            ...formData,
            permissions: {
                ...formData.permissions,
                [key]: value,
            },
        })
    }

    if (loading) {
        return (
            <div className="flex h-screen">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <p>Loading admins...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="border-b border-border bg-background px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AdminMobileNav />
                            <div>
                                <h1 className="text-2xl font-bold">Pranadhara Admins</h1>
                                <p className="text-sm text-muted-foreground mt-1">Manage administrator accounts and permissions</p>
                            </div>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open)
                            if (!open) resetForm()
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Admin
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingAdmin ? "Edit Admin" : "Add New Admin"}</DialogTitle>
                                    <DialogDescription>
                                        {editingAdmin ? "Update admin details and permissions" : "Create a new administrator account"}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label htmlFor="role">Role *</Label>
                                            <Select
                                                value={formData.role}
                                                onValueChange={(value) => setFormData({ ...formData, role: value as PranadharaAdmin["role"] })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="moderator">Moderator</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-base font-semibold">Permissions</Label>
                                            <div className="mt-3 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="manageDonors" className="font-normal">Manage Donors</Label>
                                                    <Switch
                                                        id="manageDonors"
                                                        checked={formData.permissions.manageDonors}
                                                        onCheckedChange={(checked) => updatePermission("manageDonors", checked)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="manageEmergencies" className="font-normal">Manage Emergency Requests</Label>
                                                    <Switch
                                                        id="manageEmergencies"
                                                        checked={formData.permissions.manageEmergencies}
                                                        onCheckedChange={(checked) => updatePermission("manageEmergencies", checked)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="manageCamps" className="font-normal">Manage Camps</Label>
                                                    <Switch
                                                        id="manageCamps"
                                                        checked={formData.permissions.manageCamps}
                                                        onCheckedChange={(checked) => updatePermission("manageCamps", checked)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="manageAdmins" className="font-normal">Manage Admins</Label>
                                                    <Switch
                                                        id="manageAdmins"
                                                        checked={formData.permissions.manageAdmins}
                                                        onCheckedChange={(checked) => updatePermission("manageAdmins", checked)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="sendNotifications" className="font-normal">Send Notifications</Label>
                                                    <Switch
                                                        id="sendNotifications"
                                                        checked={formData.permissions.sendNotifications}
                                                        onCheckedChange={(checked) => updatePermission("sendNotifications", checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="isActive">Account Active</Label>
                                                <Switch
                                                    id="isActive"
                                                    checked={formData.isActive}
                                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">{editingAdmin ? "Update Admin" : "Create Admin"}</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{admins.length}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">
                                        {admins.filter((a) => a.isActive).length}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-purple-600">
                                        {admins.filter((a) => a.role === "super_admin").length}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Moderators</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">
                                        {admins.filter((a) => a.role === "moderator").length}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Admins Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Administrator Accounts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {admins.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No admins found. Create your first admin account!</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Contact</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Permissions</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {admins.map((admin) => (
                                                    <TableRow key={admin.id}>
                                                        <TableCell className="font-medium">{admin.name}</TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <Mail className="h-3 w-3" />
                                                                    <span className="text-muted-foreground">{admin.email}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <Phone className="h-3 w-3" />
                                                                    <span className="text-muted-foreground">{admin.phone}</span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getRoleBadgeColor(admin.role)}>
                                                                {admin.role.replace("_", " ").toUpperCase()}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {admin.permissions.manageDonors && (
                                                                    <Badge variant="outline" className="text-xs">Donors</Badge>
                                                                )}
                                                                {admin.permissions.manageEmergencies && (
                                                                    <Badge variant="outline" className="text-xs">Emergency</Badge>
                                                                )}
                                                                {admin.permissions.manageCamps && (
                                                                    <Badge variant="outline" className="text-xs">Camps</Badge>
                                                                )}
                                                                {admin.permissions.manageAdmins && (
                                                                    <Badge variant="outline" className="text-xs">Admins</Badge>
                                                                )}
                                                                {admin.permissions.sendNotifications && (
                                                                    <Badge variant="outline" className="text-xs">Notifications</Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => toggleAdminStatus(admin)}
                                                                className="gap-2"
                                                            >
                                                                {admin.isActive ? (
                                                                    <>
                                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                                        <span className="text-green-600">Active</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                                        <span className="text-red-600">Inactive</span>
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={() => handleEdit(admin)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={() => handleDelete(admin.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
