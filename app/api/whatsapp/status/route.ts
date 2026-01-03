import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const messageSid = formData.get("MessageSid") as string
        const messageStatus = formData.get("MessageStatus") as string
        const to = formData.get("To") as string

        console.log(`📊 WhatsApp Status Update: ${to} -> ${messageStatus} (${messageSid})`)

        // Log status update in Firestore
        await addDoc(collection(db, "whatsappStatusLogs"), {
            messageSid: messageSid,
            status: messageStatus,
            to: to,
            timestamp: Timestamp.now()
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("❌ Status Callback Error:", error)
        return NextResponse.json({ error: "Callback Failed" }, { status: 500 })
    }
}
