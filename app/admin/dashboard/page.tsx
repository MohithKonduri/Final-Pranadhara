"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminMobileNav } from "@/components/admin-mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db, auth } from "@/lib/firebase"
import { collection, getDocs, query, where, addDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { BarChart3, Users, AlertCircle, TrendingUp, RefreshCw, Database, Shield, Calendar } from "lucide-react"
import { fetchGoogleSheetData, parseCampsData, parseManagementData } from "@/lib/google-sheets"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { Donor } from "@/lib/types"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalDonors: 0,
    availableDonors: 0,
    emergencyRequests: 0,
    bloodGroups: {} as Record<string, number>,
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem("adminSession")
    if (!adminSession) {
      router.push("/admin/login")
      return
    }

    // Wait for Firebase Auth to initialize
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        fetchStats()
      } else {
        // If localStorage exists but Firebase Auth fails, it might be loading or session expired
        // But usually onAuthStateChanged fires with null only if definitely signed out 
        // or initial load. 
        // We'll let the loader spin until we get a user, or if we timeout?
        // Actually, if we are here and user is null, we can't fetch data anyway due to rules.
        // So we just wait.
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchStats = async () => {
    try {
      if (!db) {
        setError("Firebase not initialized")
        setLoading(false)
        return
      }

      // Get all donors
      const donorsSnapshot = await getDocs(collection(db, "donors"))
      const donors = donorsSnapshot.docs.map((doc: any) => doc.data() as Donor)

      // Count available donors
      const availableDonors = donors.filter((d: Donor) => d.isAvailable).length

      // Count by blood group
      const bloodGroups: Record<string, number> = {}
      donors.forEach((donor: Donor) => {
        bloodGroups[donor.bloodGroup] = (bloodGroups[donor.bloodGroup] || 0) + 1
      })

      // Get emergency requests
      const emergencySnapshot = await getDocs(
        query(collection(db, "emergencyRequests"), where("status", "==", "open")),
      )

      setStats({
        totalDonors: donors.length,
        availableDonors,
        emergencyRequests: emergencySnapshot.size,
        bloodGroups,
      })
    } catch (error: any) {
      console.error("Error fetching stats:", error)
      // Only show error if it's not a permission error (which might resolve)
      if (error?.code !== 'permission-denied') {
        setError("Failed to load dashboard data")
      }
    } finally {
      setLoading(false)
    }
  }

  const syncCamps = async () => {
    setSyncing("camps")
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
      const spreadsheetId = process.env.NEXT_PUBLIC_CAMPS_SPREADSHEET_ID

      if (!apiKey || !spreadsheetId) {
        toast.error("Google Sheets configuration missing")
        return
      }

      const rawData = await fetchGoogleSheetData({ apiKey, spreadsheetId, range: "Sheet1!A:I" })
      const parsedCamps = parseCampsData(rawData)

      let imported = 0
      for (const camp of parsedCamps) {
        // Simple duplicate check by name and location
        const q = query(collection(db, "camps"), where("name", "==", camp.name), where("location", "==", camp.location))
        const existing = await getDocs(q)

        if (existing.empty) {
          const { id, ...campData } = camp
          await addDoc(collection(db, "camps"), {
            ...campData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          imported++
        }
      }

      toast.success(`Successfully imported ${imported} new camps!`)
    } catch (err) {
      console.error("Sync error:", err)
      toast.error("Failed to sync camps")
    } finally {
      setSyncing(null)
    }
  }

  const syncTeam = async () => {
    setSyncing("team")
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
      const spreadsheetId = process.env.NEXT_PUBLIC_ADMINS_SPREADSHEET_ID

      if (!apiKey || !spreadsheetId) {
        toast.error("Google Sheets configuration missing")
        return
      }

      const rawData = await fetchGoogleSheetData({ apiKey, spreadsheetId, range: "Sheet1!A:Z" })
      const parsedMgmt = parseManagementData(rawData)

      let imported = 0
      for (const member of parsedMgmt) {
        // Duplicate check by name
        const q = query(collection(db, "admins"), where("name", "==", member.name))
        const existing = await getDocs(q)

        if (existing.empty) {
          await addDoc(collection(db, "admins"), {
            name: member.name,
            email: `${member.name.toLowerCase().replace(/\s+/g, '')}@pranadhara.org`, // Placeholder
            phone: "",
            role: "moderator",
            designation: member.designation || member.name,
            photoUrl: member.photoUrl,
            isActive: true,
            permissions: {
              manageDonors: false,
              manageEmergencies: false,
              manageCamps: false,
              manageAdmins: false,
              sendNotifications: false
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          imported++
        }
      }

      toast.success(`Successfully imported ${imported} team members!`)
    } catch (err) {
      console.error("Sync error:", err)
      toast.error("Failed to sync team")
    } finally {
      setSyncing(null)
    }
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-background px-6 py-4 flex items-center">
          <AdminMobileNav />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Total Donors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalDonors}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Available Donors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.availableDonors}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    Emergency Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{stats.emergencyRequests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Availability Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalDonors > 0 ? Math.round((stats.availableDonors / stats.totalDonors) * 100) : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Blood Group Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Blood Group Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.bloodGroups).map(([group, count]) => (
                    <div key={group} className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{group}</div>
                      <div className="text-sm text-muted-foreground">{count} donors</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Migration / Sync */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data Migration (Import from Sheets)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If your data is currently in Google Sheets, use these buttons to import it into the new management system.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={syncCamps}
                    disabled={!!syncing}
                    variant="outline"
                    className="flex items-center gap-2 h-auto py-4 justify-start px-6"
                  >
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Sync Camps</div>
                      <div className="text-xs text-muted-foreground">Import from Camps Sheet</div>
                    </div>
                    {syncing === "camps" && <RefreshCw className="h-4 w-4 ml-auto animate-spin" />}
                  </Button>

                  <Button
                    onClick={syncTeam}
                    disabled={!!syncing}
                    variant="outline"
                    className="flex items-center gap-2 h-auto py-4 justify-start px-6"
                  >
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Sync Team</div>
                      <div className="text-xs text-muted-foreground">Import from Team Sheet</div>
                    </div>
                    {syncing === "team" && <RefreshCw className="h-4 w-4 ml-auto animate-spin" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Use the sidebar to manage donors, view emergency requests, and handle system settings.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <Button variant="outline" className="justify-start" onClick={() => router.push("/admin/donors")}>Manage Donors</Button>
                  <Button variant="outline" className="justify-start" onClick={() => router.push("/admin/emergencies")}>Emergency Requests</Button>
                  <Button variant="outline" className="justify-start" onClick={() => router.push("/admin/camps")}>Manage Camps</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
