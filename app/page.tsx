"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Droplet, Users, Search, AlertCircle, Heart, Calendar, MapPin, Clock, Mail, Phone, Shield } from "lucide-react"
import { fetchGoogleSheetData, parseCampsData, parseManagementData } from "@/lib/google-sheets"

export default function Home() {
  const [camps, setCamps] = useState<any[]>([])
  const [management, setManagement] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // TODO: Replace with your actual Google Sheets configuration
      const GOOGLE_SHEETS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || ""
      const CAMPS_SPREADSHEET_ID = process.env.NEXT_PUBLIC_CAMPS_SPREADSHEET_ID || ""
      const MANAGEMENT_SPREADSHEET_ID = process.env.NEXT_PUBLIC_MANAGEMENT_SPREADSHEET_ID || "1Ku4oIh61y1ncyzOffqbNejBLdLsNXg--nrCacNKwo54"

      // Fetch camps data
      if (CAMPS_SPREADSHEET_ID && GOOGLE_SHEETS_API_KEY) {
        const campsRows = await fetchGoogleSheetData({
          spreadsheetId: CAMPS_SPREADSHEET_ID,
          apiKey: GOOGLE_SHEETS_API_KEY,
          range: "Sheet1!A:I", // Adjust range as needed
        })
        const parsedCamps = parseCampsData(campsRows)
        setCamps(parsedCamps.slice(0, 3)) // Show only 3 recent camps
      }

      // Fetch management data
      if (MANAGEMENT_SPREADSHEET_ID && GOOGLE_SHEETS_API_KEY) {
        const mgmtRows = await fetchGoogleSheetData({
          spreadsheetId: MANAGEMENT_SPREADSHEET_ID,
          apiKey: GOOGLE_SHEETS_API_KEY,
          range: "Sheet1!A:Z", // Using A:Z to capture horizontal columns
        })
        const parsedMgmt = parseManagementData(mgmtRows)
        setManagement(parsedMgmt)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-12 md:py-24 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">

              {/* Management Team Showcase - ABOVE Title */}
              {management.length > 0 && (
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-y-6 gap-x-2 md:gap-10">
                    {management.map((member) => (
                      <div key={member.id} className="flex flex-col items-center group">
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-32 md:h-32 mb-3 rounded-full overflow-hidden border-4 border-background shadow-xl scale-95 group-hover:scale-105 transition-transform duration-300 bg-muted">
                          <Image
                            src={member.photoUrl || "/placeholder-avatar.svg"}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="text-sm font-bold text-foreground px-1">{member.name}</h3>
                        {(member.role || member.designation) && (
                          <p className="text-[10px] md:text-xs font-medium text-primary uppercase tracking-tighter px-2">
                            {member.role || member.designation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">Vignan Pranadhara associated with NSS</h1>
              </div>
              <p className="text-lg text-muted-foreground mb-8 text-balance">
                Connecting voluntary blood donors across our college to help during emergencies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/login" prefetch>Login</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/admin/login" prefetch>Admin Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-balance">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Register as Donor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create your profile with your blood group, district, and availability status.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Search className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Search & Connect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Find available donors by blood group and district. Connect directly with them.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <AlertCircle className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Emergency Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Post emergency blood requests and notify available donors instantly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>



        {/* Stats Section */}
        <section className="py-20 md:py-32 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Active Donors</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <p className="text-muted-foreground">Lives Saved</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Emergency Support</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Ready to Make a Difference?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join our community of blood donors and help save lives in your college.
              </p>
              <Button size="lg" asChild>
                <Link href="/register" prefetch>Get Started Today</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
