# WhatsApp Twilio Setup Guide

## Overview

The WhatsApp automation feature now uses **Twilio's Official WhatsApp API** to send instant alerts to registered donors. This is more reliable than the previous browser-based automation and doesn't require keeping a phone online or scanning QR codes regularly.

## Features

- ✅ Official Twilio WhatsApp API integration
- ✅ No QR code scanning required for operation
- ✅ Highly reliable bulk messaging
- ✅ Multi-channel support (SMS + WhatsApp via Twilio)
- ✅ Admin broadcast feature for specific districts

## Setup Instructions

### Step 1: Twilio Configuration

1. **Get Twilio Credentials**:
   - Log in to your [Twilio Console](https://www.twilio.com/console).
   - Locate your **Account SID** and **Auth Token**.
   - Get a **Twilio WhatsApp Number** (usually a sandbox number for testing, or a registered business profile for production).

2. **Configure Environment Variables**:
   Add or update these in your `.env.local` file:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=your_twilio_sms_number_here
   TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number_here
   ```

3. **WhatsApp Sandbox (For Testing)**:
   - Go to **Messaging → Try it out → Send a WhatsApp message**.
   - Your donors must send a specific code (e.g., `join [sandbox-code]`) to your Twilio number to receive messages during the sandbox phase.

### Step 2: Configure Twilio Sandbox Webhooks

1. Go to **Messaging → Try it out → Send a WhatsApp message** in the Twilio Console.
2. Click on the **Sandbox Settings** tab.
3. Configure your endpoint URLs:
   - **When a message comes in**: `https://your-domain.com/api/whatsapp/webhook`
   - **Status callback URL**: `https://your-domain.com/api/whatsapp/status`
4. Click **Save**.

*Note: For local testing, use a tool like **ngrok** to create a public URL for your local server (e.g., `ngrok http 3000`).*

### Step 3: Verify Admin Dashboard

1. **Access Admin Panel**:
   - Go to `/admin/whatsapp`
   - You should see "Twilio Webhook Active" status.
   - The status should always show "Ready".

### Step 3: Broadcast Messages

1. **Navigate to WhatsApp Broadcast** in the admin panel.
2. **Filter by District** if needed.
3. **Compose your message** and click "Send Broadcast".
4. Messages will be queued and sent via Twilio's API.

## How It Works

### Code Structure

- `lib/twilio-service.ts`: Contains the shared logic for both SMS and WhatsApp.
- `lib/whatsapp-service.ts`: A wrapper that maintains compatibility but uses Twilio under the hood.
- `app/api/send-whatsapp/route.ts`: Server-side API that triggers Twilio messages.

### Sending Logic

When an emergency is logged:
1. The system identifies donors in the specified district with the matching blood group.
2. It calls the WhatsApp API.
3. Twilio sends a message from your registered number to the donor's WhatsApp number.

## Troubleshooting

### Messages Not Received
1. **Sandbox Check**: If using a Twilio Sandbox, ensure the donor has opted-in by sending the "join" keyword.
2. **Credentials**: Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct in the environment variables.
3. **Number Format**: Ensure phone numbers are in E.164 format (e.g., `+919876543210`). The system tries to format them automatically, but starting with a plus is recommended.

### API Errors
- Check the server console logs for `❌ Twilio WhatsApp failed` messages.
- Common errors include invalid credentials or trying to send to a number that hasn't opted in to the sandbox.

## Production Notes

For production use, you should:
1. Register a **WhatsApp Business Profile** through Twilio.
2. Get your WhatsApp templates approved by Meta (Twilio helps with this).
3. Use your own verified phone number instead of the generic sandbox.

---
_NSS BloodConnect System - Updated to Twilio WhatsApp_
