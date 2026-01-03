"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Shield, Mail, Phone } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchGoogleSheetData, parseManagementData } from "@/lib/google-sheets"
import { PranadharaAdmin } from "@/lib/types"

export default function TeamPage() {
    const [admins, setAdmins] = useState<PranadharaAdmin[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadAdmins() {
            try {
                const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
                const spreadsheetId = process.env.NEXT_PUBLIC_ADMINS_SPREADSHEET_ID

                if (apiKey && spreadsheetId) {
                    console.log("Fetching team data...")
                    const rawData = await fetchGoogleSheetData({
                        apiKey,
                        spreadsheetId,
                        range: 'Sheet1!A:Z'
                    })
                    const parsedAdmins = parseManagementData(rawData)
                    console.log("Parsed team:", parsedAdmins)
                    setAdmins(parsedAdmins)
                } else {
                    console.log("Missing Google Sheets config")
                }
            } catch (error) {
                console.error("Error loading team:", error)
            } finally {
                setLoading(false)
            }
        }

        loadAdmins()
    }, [])

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h1 className="text-3xl font-bold mb-4">Pranadhara Team</h1>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Meet the dedicated team behind NSS Pranadhara BloodConnect.
                            </p>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-4 text-muted-foreground">Loading team info...</p>
                            </div>
                        ) : admins.length > 0 ? (
                            <div className="space-y-12">
                                {/* Leader Section - First Person */}
                                {admins[0] && (
                                    <div className="flex justify-center">
                                        <Card key={admins[0].id} className="text-center hover:shadow-xl transition-shadow border-primary/20 max-w-md w-full transform hover:scale-105 duration-300">
                                            <CardHeader>
                                                <div className="mx-auto relative h-48 w-48 mb-6">
                                                    <Image
                                                        src={admins[0].photoUrl || "/placeholder-avatar.svg"}
                                                        alt={admins[0].name}
                                                        fill
                                                        className="rounded-full object-contain bg-white border-4 border-black shadow-lg"
                                                        onError={(e) => {
                                                            e.currentTarget.src = "/placeholder-avatar.svg"
                                                        }}
                                                    />
                                                </div>
                                                <CardTitle className="text-3xl font-bold mb-2">{admins[0].name}</CardTitle>
                                                <div className="text-black font-semibold text-xl mb-1">{admins[0].designation}</div>
                                                {admins[0].role && <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium">{admins[0].role}</div>}
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3 text-base">
                                                    {admins[0].email && (
                                                        <div className="flex items-center justify-center text-muted-foreground group">
                                                            <Mail className="h-5 w-5 mr-3 group-hover:text-primary transition-colors" />
                                                            <a href={`mailto:${admins[0].email}`} className="hover:text-primary transition-colors">
                                                                {admins[0].email}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {admins[0].phone && (
                                                        <div className="flex items-center justify-center text-muted-foreground group">
                                                            <Phone className="h-5 w-5 mr-3 group-hover:text-primary transition-colors" />
                                                            <a href={`tel:${admins[0].phone}`} className="hover:text-primary transition-colors">
                                                                {admins[0].phone}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Team Members Grid - Rest of the Team */}
                                {admins.length > 1 && (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-8 border-t">
                                        {admins.slice(1).map((admin) => (
                                            <Card key={admin.id} className="text-center hover:shadow-lg transition-shadow border-primary/10">
                                                <CardHeader>
                                                    <div className="mx-auto relative h-32 w-32 mb-4">
                                                        <Image
                                                            src={admin.photoUrl || "/placeholder-avatar.svg"}
                                                            alt={admin.name}
                                                            fill
                                                            className="rounded-full object-contain bg-white border-4 border-background shadow-md"
                                                            onError={(e) => {
                                                                e.currentTarget.src = "/placeholder-avatar.svg"
                                                            }}
                                                        />
                                                    </div>
                                                    <CardTitle className="text-xl">{admin.name}</CardTitle>
                                                    <div className="text-black font-medium text-sm">{admin.designation}</div>
                                                    {admin.role && <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{admin.role}</div>}
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2 text-sm">
                                                        {admin.email && (
                                                            <div className="flex items-center justify-center text-muted-foreground">
                                                                <Mail className="h-4 w-4 mr-2" />
                                                                <a href={`mailto:${admin.email}`} className="hover:text-primary transition-colors">
                                                                    {admin.email}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {admin.phone && (
                                                            <div className="flex items-center justify-center text-muted-foreground">
                                                                <Phone className="h-4 w-4 mr-2" />
                                                                <a href={`tel:${admin.phone}`} className="hover:text-primary transition-colors">
                                                                    {admin.phone}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">Team Info Unavailable</h3>
                                <p className="text-muted-foreground">Team information will be available soon!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
