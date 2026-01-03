"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchGoogleSheetData, parseCampsData } from "@/lib/google-sheets"
import { Camp } from "@/lib/types"

export default function CampsPage() {
    const [camps, setCamps] = useState<Camp[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadCamps() {
            try {
                const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
                const spreadsheetId = process.env.NEXT_PUBLIC_CAMPS_SPREADSHEET_ID

                if (apiKey && spreadsheetId) {
                    console.log("Fetching camps data...")
                    const rawData = await fetchGoogleSheetData({
                        apiKey,
                        spreadsheetId,
                        range: 'Sheet1!A:I'
                    })
                    const parsedCamps = parseCampsData(rawData)
                    console.log("Parsed camps:", parsedCamps)
                    setCamps(parsedCamps)
                } else {
                    console.log("Missing Google Sheets config")
                }
            } catch (error) {
                console.error("Error loading camps:", error)
            } finally {
                setLoading(false)
            }
        }

        loadCamps()
    }, [])

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <section className="py-12 md:py-20 bg-muted/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h1 className="text-2xl md:text-4xl font-sans font-extrabold mb-4 max-w-4xl mx-auto leading-tight text-foreground tracking-tight">
                                "Blood cannot be manufactured — it can only be donated."
                            </h1>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-4 text-muted-foreground">Loading upcoming camps...</p>
                            </div>
                        ) : camps.length > 0 ? (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {camps.map((camp) => (
                                    <div key={camp.id} className="group relative overflow-hidden rounded-lg border bg-background shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                                        <div className="aspect-video relative overflow-hidden bg-muted">
                                            <Image
                                                src={camp.imageUrl || "/placeholder-camp.svg"}
                                                alt={camp.name}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/placeholder-camp.svg"
                                                }}
                                            />
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{camp.name}</h3>
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <MapPin className="mr-1 h-3 w-3" />
                                                        {camp.location}{camp.district ? `, ${camp.district}` : ""}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid gap-2 mb-4 text-sm">
                                                <div className="flex items-center text-muted-foreground">
                                                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                                                    {camp.date}
                                                </div>
                                                <div className="flex items-center text-muted-foreground">
                                                    <Clock className="mr-2 h-4 w-4 text-primary" />
                                                    {camp.time}
                                                </div>
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {camp.description}
                                            </p>

                                            <div className="pt-4 border-t flex items-center justify-between text-sm">
                                                <span className="font-medium">{camp.organizer}</span>
                                                <span className="text-primary">{camp.contact}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-background rounded-lg border shadow-sm">
                                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">No Upcoming Camps</h3>
                                <p className="text-muted-foreground">No upcoming camps at the moment. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
