/**
 * WhatsApp Service Wrapper (Twilio Integration)
 * This file has been updated to use Twilio instead of whatsapp-web.js
 */

import { sendWhatsApp, sendEmergencyWhatsApp } from "./twilio-service"

export interface WhatsAppMessage {
  to: string
  message: string
}

export async function initializeWhatsApp(waitForReady: boolean = true): Promise<boolean> {
  console.log("📱 Twilio WhatsApp is always initialized")
  return true
}

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const success = await sendWhatsApp({ to: phoneNumber, body: message })
  return { success, error: success ? undefined : "Twilio WhatsApp failed" }
}

export async function sendBulkWhatsAppMessages(
  recipients: Array<{ phoneNumber: string; message: string }>
): Promise<{ success: number; failed: number; errors: Array<{ phoneNumber: string; error: string }> }> {
  // Group by message if they are different, but usually they are the same in this app
  const results = { success: 0, failed: 0, errors: [] as any[] }

  for (const recipient of recipients) {
    const success = await sendWhatsApp({ to: recipient.phoneNumber, body: recipient.message })
    if (success) {
      results.success++
    } else {
      results.failed++
      results.errors.push({ phoneNumber: recipient.phoneNumber, error: "Twilio WhatsApp failed" })
    }
  }

  return results
}

export function isWhatsAppReady(): boolean {
  return true
}

export function getWhatsAppStatus() {
  return {
    initialized: true,
    authenticated: true,
    ready: true,
    hasClient: true,
    qrCode: null,
    isInitializing: false,
    error: null,
    lastQRUpdate: null,
    loadingPercent: 100,
    loadingMessage: "Ready (Twilio Integration)"
  }
}

export function isInitializing(): boolean {
  return false
}

export function getQRCode(): string | null {
  return null
}

export async function logoutWhatsApp(): Promise<boolean> {
  return true
}
