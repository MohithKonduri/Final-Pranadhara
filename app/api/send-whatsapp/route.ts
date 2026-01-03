import { NextRequest, NextResponse } from "next/server"
import { sendWhatsApp, sendEmergencyWhatsApp } from "@/lib/twilio-service"

// Mark this route as server-only
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, message, recipients } = body

    // Single message
    if (phoneNumber && message) {
      console.log(`📱 Sending single WhatsApp message via Twilio to ${phoneNumber}`)
      const result = await sendWhatsApp({ to: phoneNumber, body: message })

      if (result.success) {
        return NextResponse.json({ success: true, message: "WhatsApp message sent successfully via Twilio" })
      } else {
        return NextResponse.json(
          { success: false, error: result.error || "Failed to send WhatsApp message via Twilio." },
          { status: 500 }
        )
      }
    }

    // Bulk messages
    if (recipients && Array.isArray(recipients)) {
      console.log(`📱 Sending bulk WhatsApp messages via Twilio to ${recipients.length} recipients`)

      // Extraction of phone numbers
      const phoneNumbers = recipients.map(r => typeof r === 'string' ? r : r.phoneNumber).filter(Boolean)
      const bulkMessage = recipients[0]?.message || message || ""

      if (!bulkMessage) {
        return NextResponse.json(
          { success: false, error: "No message content provided for bulk send" },
          { status: 400 }
        )
      }

      const result = await sendEmergencyWhatsApp(phoneNumbers, bulkMessage)

      return NextResponse.json({
        success: result.failed === 0,
        sent: result.success,
        failed: result.failed,
        errors: result.errors,
      })
    }

    return NextResponse.json(
      { success: false, error: "Invalid request. Provide either phoneNumber+message or recipients array" },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("Error in send-whatsapp API (Twilio):", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send WhatsApp message" },
      { status: 500 }
    )
  }
}

// GET endpoint - simplified since Twilio doesn't need QR codes
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: {
      ready: true,
      initialized: true,
      authenticated: true,
      hasClient: true,
      qrCode: null,
      isInitializing: false,
      error: null,
      loadingPercent: 100,
      loadingMessage: "Ready (Twilio Integration)",
      isTwilio: true
    },
  })
}

// DELETE endpoint - simplified
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ message: "WhatsApp status remains ready (Twilio Integration)" })
}

// PATCH endpoint - simplified
export async function PATCH(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "WhatsApp already initialized via Twilio",
  })
}
