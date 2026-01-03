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
import { Textarea } from "@/components/ui/textarea"
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
import { db } from "@/lib/firebase"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { Calendar, MapPin, Clock, Users, Plus, Edit, Trash2, Phone, Mail } from "lucide-react"
import type { Camp } from "@/lib/types"

export default function CampsPage() {
    const router = useRouter()
    const [camps, setCamps] = useState<Camp[]>([])
    const [filteredCamps, setFilteredCamps] = useState<Camp[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCamp, setEditingCamp] = useState<Camp | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [filterDistrict, setFilterDistrict] = useState<string>("all")

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        district: "",
        date: "",
        startTime: "",
        endTime: "",
        description: "",
        organizer: "",
        contactPhone: "",
        contactEmail: "",
        expectedDonors: "",
        actualDonors: "",
        status: "upcoming" as Camp["status"],
    })

    useEffect(() => {
        const adminSession = localStorage.getItem("adminSession")
        if (!adminSession) {
            router.push("/admin/login")
            return
        }
        fetchCamps()
    }, [router])

    useEffect(() => {
        filterCamps()
    }, [camps, filterStatus, filterDistrict])

    const fetchCamps = async () => {
        try {
            const campsSnapshot = await getDocs(collection(db, "camps"))
            const campsData = campsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Camp[]

            // Sort by date (upcoming first)
            campsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            setCamps(campsData)
        } catch (error) {
            console.error("Error fetching camps:", error)
        } finally {
            setLoading(false)
        }
    }

    const filterCamps = () => {
        let filtered = [...camps]

        if (filterStatus !== "all") {
            filtered = filtered.filter((camp) => camp.status === filterStatus)
        }

        if (filterDistrict !== "all") {
            filtered = filtered.filter((camp) => camp.district === filterDistrict)
        }

        setFilteredCamps(filtered)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const campData = {
                ...formData,
                expectedDonors: formData.expectedDonors ? parseInt(formData.expectedDonors) : undefined,
                actualDonors: formData.actualDonors ? parseInt(formData.actualDonors) : undefined,
                updatedAt: new Date().toISOString(),
            }

            if (editingCamp) {
                // Update existing camp
                await updateDoc(doc(db, "camps", editingCamp.id), campData)
            } else {
                // Add new camp
                await addDoc(collection(db, "camps"), {
                    ...campData,
                    createdAt: new Date().toISOString(),
                })
            }

            setIsDialogOpen(false)
            resetForm()
            fetchCamps()
        } catch (error) {
            console.error("Error saving camp:", error)
            alert("Failed to save camp. Please try again.")
        }
    }

    const handleEdit = (camp: Camp) => {
        setEditingCamp(camp)
        setFormData({
            name: camp.name || "",
            location: camp.location || "",
            district: camp.district || "",
            date: camp.date || "",
            startTime: camp.startTime || "",
            endTime: camp.endTime || "",
            description: camp.description || "",
            organizer: camp.organizer || "",
            contactPhone: camp.contactPhone || "",
            contactEmail: camp.contactEmail || "",
            expectedDonors: camp.expectedDonors?.toString() || "",
            actualDonors: camp.actualDonors?.toString() || "",
            status: camp.status || "upcoming",
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (campId: string) => {
        if (!confirm("Are you sure you want to delete this camp?")) return

        try {
            await deleteDoc(doc(db, "camps", campId))
            fetchCamps()
        } catch (error) {
            console.error("Error deleting camp:", error)
            alert("Failed to delete camp. Please try again.")
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            location: "",
            district: "",
            date: "",
            startTime: "",
            endTime: "",
            description: "",
            organizer: "",
            contactPhone: "",
            contactEmail: "",
            expectedDonors: "",
            actualDonors: "",
            status: "upcoming",
        })
        setEditingCamp(null)
    }

    const getStatusColor = (status: Camp["status"]) => {
        switch (status) {
            case "upcoming":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case "ongoing":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "completed":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            case "cancelled":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            default:
                return ""
        }
    }

    const uniqueDistricts = Array.from(new Set(camps.map((camp) => camp.district))).filter(d => d && d.trim() !== "").sort()

    if (loading) {
        return (
            <div className="flex h-screen">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <p>Loading camps...</p>
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
                        <div className="flex items-center">
                            <AdminMobileNav />
                            <h1 className="text-2xl font-bold">Blood Donation Camps</h1>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open)
                            if (!open) resetForm()
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Camp
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingCamp ? "Edit Camp" : "Add New Camp"}</DialogTitle>
                                    <DialogDescription>
                                        {editingCamp ? "Update camp details" : "Create a new blood donation camp"}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <Label htmlFor="name">Camp Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label htmlFor="location">Location *</Label>
                                            <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="district">District *</Label>
                                            <Input
                                                id="district"
                                                value={formData.district}
                                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="date">Date *</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="startTime">Start Time *</Label>
                                            <Input
                                                id="startTime"
                                                type="time"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="endTime">End Time *</Label>
                                            <Input
                                                id="endTime"
                                                type="time"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="organizer">Organizer *</Label>
                                            <Input
                                                id="organizer"
                                                value={formData.organizer}
                                                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contactPhone">Contact Phone *</Label>
                                            <Input
                                                id="contactPhone"
                                                type="tel"
                                                value={formData.contactPhone}
                                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label htmlFor="contactEmail">Contact Email *</Label>
                                            <Input
                                                id="contactEmail"
                                                type="email"
                                                value={formData.contactEmail}
                                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="expectedDonors">Expected Donors</Label>
                                            <Input
                                                id="expectedDonors"
                                                type="number"
                                                value={formData.expectedDonors}
                                                onChange={(e) => setFormData({ ...formData, expectedDonors: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="actualDonors">Actual Donors</Label>
                                            <Input
                                                id="actualDonors"
                                                type="number"
                                                value={formData.actualDonors}
                                                onChange={(e) => setFormData({ ...formData, actualDonors: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label htmlFor="status">Status *</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => setFormData({ ...formData, status: value as Camp["status"] })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                                    <SelectItem value="ongoing">Ongoing</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">{editingCamp ? "Update Camp" : "Create Camp"}</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Filters */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="filterStatus">Filter by Status</Label>
                                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                                            <SelectTrigger id="filterStatus">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="filterDistrict">Filter by District</Label>
                                        <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                                            <SelectTrigger id="filterDistrict">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Districts</SelectItem>
                                                {uniqueDistricts.map((district) => (
                                                    <SelectItem key={district} value={district}>
                                                        {district}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Camps Grid */}
                        {filteredCamps.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No camps found. Create your first camp!</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredCamps.map((camp) => (
                                    <Card key={camp.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg">{camp.name}</CardTitle>
                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(camp.status || "upcoming")}`}>
                                                        {(camp.status || "upcoming").charAt(0).toUpperCase() + (camp.status || "upcoming").slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleEdit(camp)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(camp.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>{camp.location}{camp.district ? `, ${camp.district}` : ""}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(camp.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>{camp.startTime} - {camp.endTime}</span>
                                            </div>
                                            {camp.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">{camp.description}</p>
                                            )}
                                            <div className="pt-2 border-t">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="h-4 w-4" />
                                                    <span>
                                                        {camp.actualDonors !== undefined ? `${camp.actualDonors} donors` :
                                                            camp.expectedDonors !== undefined ? `Expected: ${camp.expectedDonors}` :
                                                                "No donor count"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <Phone className="h-4 w-4" />
                                                    <span>{camp.contactPhone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <Mail className="h-4 w-4" />
                                                    <span className="truncate">{camp.contactEmail}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
