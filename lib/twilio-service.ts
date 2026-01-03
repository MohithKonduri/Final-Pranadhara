// Server-side only - prevent client-side bundling
if (typeof window !== "undefined") {
    throw new Error("twilio-service can only be used server-side")
}

import type { Twilio } from 'twilio';

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
// We use a getter to avoid initialization errors if environment variables are missing during build
let client: Twilio | null = null;

async function getTwilioClient() {
    if (!accountSid || !authToken) {
        console.warn('⚠️ Twilio credentials missing from environment variables');
        return null;
    }

    if (!client) {
        const twilioModule = await import('twilio');
        const twilio = twilioModule.default;
        client = twilio(accountSid, authToken);
    }
    return client;
}

/**
 * Interface for SMS data
 */
export interface SMSData {
    to: string;
    body: string;
}

/**
 * Sends an SMS using Twilio
 * @param data SMS content and recipient
 * @returns Promise<boolean> success status
 */
export async function sendSMS(data: SMSData): Promise<boolean> {
    const twilioClient = await getTwilioClient();

    if (!twilioClient || !twilioPhoneNumber) {
        console.error('❌ Twilio is not configured. Please check your .env.local file.');
        return false;
    }

    try {
        // Format the phone number (E.164 format)
        let formattedTo = data.to.trim().replace(/\s+/g, '');

        // If it's 10 digits, assume India (+91)
        if (formattedTo.length === 10 && !formattedTo.startsWith('+')) {
            formattedTo = `+91${formattedTo}`;
        }
        // If it starts with 91 but no +, add +
        else if (formattedTo.length === 12 && formattedTo.startsWith('91')) {
            formattedTo = `+${formattedTo}`;
        }
        // Ensure it has a +
        else if (!formattedTo.startsWith('+')) {
            formattedTo = `+${formattedTo}`;
        }

        console.log(`📱 Attempting to send SMS to ${formattedTo}...`);

        const message = await twilioClient.messages.create({
            body: data.body,
            from: twilioPhoneNumber,
            to: formattedTo
        });

        if (message.sid) {
            console.log(`✅ SMS sent successfully! SID: ${message.sid}`);
            return true;
        }

        return false;
    } catch (error: any) {
        console.error('❌ Twilio SMS failed:', error.message || error);
        return false;
    }
}

/**
 * Sends a WhatsApp message using Twilio
 * @param data SMS content and recipient
 * @returns Promise<{ success: boolean; error?: string }> success status and optional error
 */
export async function sendWhatsApp(data: SMSData): Promise<{ success: boolean; error?: string }> {
    const twilioClient = await getTwilioClient();

    // Check for explicit WhatsApp number, fallback to generic Twilio number
    const whatsappSource = process.env.TWILIO_WHATSAPP_NUMBER || twilioPhoneNumber;

    if (!twilioClient || !whatsappSource) {
        const errorMsg = 'Twilio WhatsApp is not configured properly in .env.local';
        console.error(`❌ ${errorMsg}`);
        return { success: false, error: errorMsg };
    }

    try {
        // Format the phone number (E.164 format)
        let formattedTo = data.to.trim().replace(/\s+/g, '');

        // If it's 10 digits, assume India (+91)
        if (formattedTo.length === 10 && !formattedTo.startsWith('+')) {
            formattedTo = `+91${formattedTo}`;
        }
        // If it starts with 91 but no +, add +
        else if (formattedTo.length === 12 && formattedTo.startsWith('91')) {
            formattedTo = `+${formattedTo}`;
        }
        // Ensure it has a +
        else if (!formattedTo.startsWith('+')) {
            formattedTo = `+${formattedTo}`;
        }

        const whatsappTo = `whatsapp:${formattedTo}`;

        // Ensure from number has + and no spaces
        let formattedFrom = whatsappSource.trim().replace(/\s+/g, '');
        if (!formattedFrom.startsWith('+') && !formattedFrom.startsWith('whatsapp:')) {
            formattedFrom = `+${formattedFrom}`;
        }
        const whatsappFrom = formattedFrom.startsWith('whatsapp:') ? formattedFrom : `whatsapp:${formattedFrom}`;

        console.log(`📱 Attempting to send WhatsApp via Twilio to ${whatsappTo}...`);

        const message = await twilioClient.messages.create({
            body: data.body,
            from: whatsappFrom,
            to: whatsappTo
        });

        if (message.sid) {
            console.log(`✅ Twilio WhatsApp message sent successfully! SID: ${message.sid}`);
            return { success: true };
        }

        return { success: false, error: 'Failed to get SID from Twilio' };
    } catch (error: any) {
        const errorMsg = error.message || String(error);
        console.error('❌ Twilio WhatsApp failed:', errorMsg);
        return { success: false, error: errorMsg };
    }
}

/**
 * Function to send emergency SMS notifications to multiple recipients
 */
export async function sendEmergencySMS(phoneNumbers: string[], message: string): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };

    const smsPromises = phoneNumbers.map(async (phone) => {
        const success = await sendSMS({
            to: phone,
            body: message
        });

        if (success) {
            results.success++;
        } else {
            results.failed++;
        }
    });

    await Promise.all(smsPromises);
    return results;
}

/**
 * Function to send emergency WhatsApp notifications to multiple recipients via Twilio
 */
export async function sendEmergencyWhatsApp(phoneNumbers: string[], message: string): Promise<{ success: number; failed: number; errors: any[] }> {
    const results = { success: 0, failed: 0, errors: [] as any[] };

    for (const phone of phoneNumbers) {
        const result = await sendWhatsApp({
            to: phone,
            body: message
        });

        if (result.success) {
            results.success++;
        } else {
            results.failed++;
            results.errors.push({ phoneNumber: phone, error: result.error || "Twilio WhatsApp failed" });
        }
        // Add a small delay for rate limiting if needed, though Twilio handles bulk well
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
}
