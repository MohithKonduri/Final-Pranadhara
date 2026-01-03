import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, Timestamp, updateDoc, doc } from "firebase/firestore"
import twilio from "twilio"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const body = formData.get("Body") as string
        const from = formData.get("From") as string // Format: whatsapp:+919876543210

        console.log(`📩 Incoming WhatsApp from ${from}: ${body}`)

        // Extract phone number without the 'whatsapp:' prefix
        const phoneNumber = from.replace("whatsapp:", "")
        const cleanNumbers = [
            phoneNumber,
            phoneNumber.replace("+91", ""),
            phoneNumber.replace("+", ""),
            phoneNumber.startsWith("+91") ? phoneNumber.replace("+91", "") : phoneNumber
        ]

        // 1. Log the message in Firestore
        await addDoc(collection(db, "whatsappMessages"), {
            from: from,
            phoneNumber: phoneNumber,
            body: body,
            timestamp: Timestamp.now(),
            direction: "inbound"
        })

        // 2. Identify donor and process predefined keywords
        let donorFound = false
        const messageLower = body.toLowerCase().trim()

        // Search for donor by phone or whatsappNumber
        const donorsRef = collection(db, "donors")
        const q = query(donorsRef, where("phone", "in", cleanNumbers))
        const querySnapshot = await getDocs(q)

        let donorDoc: any = null
        if (!querySnapshot.empty) {
            donorDoc = querySnapshot.docs[0]
            donorFound = true
        } else {
            // Try searching whatsappNumber specifically
            const q2 = query(donorsRef, where("whatsappNumber", "in", cleanNumbers))
            const querySnapshot2 = await getDocs(q2)
            if (!querySnapshot2.empty) {
                donorDoc = querySnapshot2.docs[0]
                donorFound = true
            }
        }

        const twiml = new twilio.twiml.MessagingResponse()

        if (donorFound) {
            const donorData = donorDoc.data()

            if (messageLower === "available" || messageLower === "yes") {
                await updateDoc(doc(db, "donors", donorDoc.id), {
                    isAvailable: true,
                    updatedAt: Timestamp.now()
                })
                twiml.message(`Thank you ${donorData.name}! Your status has been updated to AVAILABLE. We will notify you if there's an emergency. Keep saving lives! ❤️`)
            }
            else if (messageLower === "unavailable" || messageLower === "no") {
                await updateDoc(doc(db, "donors", donorDoc.id), {
                    isAvailable: false,
                    updatedAt: Timestamp.now()
                })
                twiml.message(`Understood ${donorData.name}. Your status has been updated to UNAVAILABLE. You won't receive emergency alerts for now. Reply 'AVAILABLE' to resume.`)
            }
            else if (messageLower === "status") {
                twiml.message(`Hello ${donorData.name}! Current status: ${donorData.isAvailable ? "✅ AVAILABLE" : "❌ UNAVAILABLE"}. District: ${donorData.district}.`)
            }
            else {
                twiml.message(`Hi ${donorData.name}, we received your message. To update your status, reply with 'AVAILABLE' or 'UNAVAILABLE'.`)
            }
        } else {
            // If sender is not in our database
            if (messageLower.includes("join")) {
                twiml.message(`Welcome to NSS BloodConnect! It looks like you're not registered yet. Please visit our website to register as a donor and start saving lives: ${process.env.NEXT_PUBLIC_APP_URL || "https://nss-blood-connect.vercel.app"}`)
            } else {
                twiml.message("Hi! This is the NSS BloodConnect Automated System. We couldn't find your number in our donor database. Please register at our portal to receive emergency alerts.")
            }
        }

        // Return TwiML
        return new Response(twiml.toString(), {
            headers: {
                "Content-Type": "text/xml",
            },
        })
    } catch (error: any) {
        console.error("❌ Webhook Error:", error)
        return NextResponse.json({ error: "Webhook Failed" }, { status: 500 })
    }
}
