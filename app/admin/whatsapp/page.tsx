"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Smartphone, AlertCircle, Send, Users, MessageSquare, ExternalLink } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminMobileNav } from "@/components/admin-mobile-nav"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Textarea } from "@/components/ui/textarea"

export default function AdminWhatsAppPage() {
  const router = useRouter()
  const [status, setStatus] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [donorCount, setDonorCount] = useState(0)
  const [donorsWithPhones, setDonorsWithPhones] = useState<any[]>([])
  const [filteredDonors, setFilteredDonors] = useState<any[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState("all")
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingStats, setLoadingStats] = useState(true)

  const checkStatus = async (silent: boolean = false) => {
    if (!silent) setIsChecking(true)
    try {
      const response = await fetch("/api/send-whatsapp")
      const data = await response.json()
      if (data.status) {
        setStatus(data.status)
      }
    } catch (err) {
      console.error("Failed to check status:", err)
      setError("Failed to check WhatsApp status. Please try again.")
    } finally {
      if (!silent) setIsChecking(false)
    }
  }

  const fetchDonorStats = async () => {
    setLoadingStats(true)
    try {
      const donorsCol = collection(db, "donors")
      const donorSnapshot = await getDocs(donorsCol)
      const donorList = donorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      const withPhones = donorList.filter((d: any) => d.phone || d.whatsappNumber)
      setDonorCount(donorList.length)
      setDonorsWithPhones(withPhones)
      setFilteredDonors(withPhones)
    } catch (err) {
      console.error("Error fetching donor stats:", err)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value)
    if (value === "all") {
      setFilteredDonors(donorsWithPhones)
    } else {
      setFilteredDonors(donorsWithPhones.filter(d => d.district === value))
    }
  }

  const DISTRICTS = [
    "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon",
    "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar",
    "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar",
    "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool",
    "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli",
    "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet",
    "Vikarabad", "Wanaparthy", "Warangal Urban", "Warangal Rural", "Yadadri Bhuvanagiri"
  ]

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastMessage.trim()) {
      setError("Please enter a message")
      return
    }

    if (filteredDonors.length === 0) {
      setError("No donors found in the selected category")
      return
    }

    if (!confirm(`Are you sure you want to send this WhatsApp broadcast to ${filteredDonors.length} donors via Twilio?`)) {
      return
    }

    setSending(true)
    setError(null)
    setSuccess(null)

    try {
      // Create recipients array with individual messages
      const recipients = filteredDonors.map(d => ({
        phoneNumber: d.whatsappNumber || d.phone,
        message: broadcastMessage
      }))

      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipients }) // Pass recipients array
      })

      const result = await response.json()

      if (result.success || result.sent > 0) {
        let msg = `Successfully sent WhatsApp messages to ${result.sent} donors!`
        if (result.failed > 0) {
          msg += ` (${result.failed} failed: ${result.errors?.[0]?.error || "Unknown error"})`
        }
        setSuccess(msg)
        setBroadcastMessage("")
      } else {
        const specificError = result.errors?.[0]?.error || result.error
        throw new Error(specificError || "Failed to send broadcast")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem("adminSession")
    if (!adminSession) {
      router.push("/admin/login")
      return
    }

    checkStatus()
    fetchDonorStats()
  }, [])

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-background px-6 py-4 flex items-center">
          <AdminMobileNav />
          <h1 className="text-2xl font-bold">WhatsApp (Twilio Integration)</h1>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Twilio Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Twilio Webhook Active</p>
                    <p className="text-sm text-green-700">WhatsApp messaging is managed through Twilio API. No QR code scanning required.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-md flex justify-between items-center">
                    <span className="font-medium text-sm">Service:</span>
                    <span className="text-sm font-bold text-blue-600">Twilio API</span>
                  </div>
                  <div className="p-3 bg-muted rounded-md flex justify-between items-center">
                    <span className="font-medium text-sm">Status:</span>
                    <span className="text-sm font-bold text-green-600">Always Ready</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => checkStatus()}
                  disabled={isChecking}
                  className="w-full"
                >
                  {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh Connection Status"}
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  WhatsApp Broadcast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg flex flex-col items-center justify-center text-center">
                    <Users className="h-8 w-8 mb-2 text-blue-500" />
                    <span className="text-2xl font-bold">{filteredDonors.length}</span>
                    <span className="text-xs text-muted-foreground">Donors in Category</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filter by District</label>
                    <select
                      className="w-full p-2 rounded-md border border-input bg-background"
                      value={selectedDistrict}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      disabled={sending}
                    >
                      <option value="all">All Districts</option>
                      {DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleBroadcast} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Broadcast Message</label>
                    <Textarea
                      placeholder="Enter the WhatsApp message content..."
                      className="min-h-[120px]"
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      disabled={sending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Note: Using Twilio sandbox may require donors to join your sandbox by sending 'join [code]' first.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={sending || filteredDonors.length === 0}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending via Twilio...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Broadcast to {filteredDonors.length} Donors
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Twilio WhatsApp Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p>Messaging is now handled via Twilio's Programmable Messaging API.</p>
                  <h3 className="text-foreground font-semibold flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Requirements
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Twilio Account SID and Auth Token in <code>.env.local</code></li>
                    <li>Twilio Phone Number (WhatsApp enabled)</li>
                    <li>For trials, donors must first opt-in to your Sandbox number</li>
                  </ul>

                  <h3 className="text-foreground font-semibold mt-4">Benefits</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Higher reliability and official support</li>
                    <li>No need to keep a phone connected or scan QR codes</li>
                    <li>Scalable for thousands of notifications</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
