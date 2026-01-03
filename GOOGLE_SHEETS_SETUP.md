# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets to display Camps and Pranadhara Admins data on your landing page.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. Two Google Sheets (one for Camps, one for Admins)

## Step 1: Create Google Sheets

### Camps Sheet

Create a Google Sheet with the following columns (in this exact order):

| Name | Location | District | Date | Time | Description | Organizer | Contact | Image URL |
|------|----------|----------|------|------|-------------|-----------|---------|-----------|
| Blood Donation Camp 2024 | Main Campus | Guntur | 15-01-2026 | 9:00 AM - 4:00 PM | Annual blood donation drive | NSS Vignan | 9876543210 | https://example.com/camp1.jpg |

**Column Descriptions:**
- **Name**: Camp name
- **Location**: Venue/location
- **District**: District name
- **Date**: Date of the camp
- **Time**: Time range
- **Description**: Brief description
- **Organizer**: Organizing body
- **Contact**: Contact number
- **Image URL**: Direct link to camp image (must be publicly accessible)

### Admins Sheet

Create a Google Sheet with the following columns (in this exact order):

| Name | Designation | Role | Email | Phone | Photo URL |
|------|-------------|------|-------|-------|-----------|
| John Doe | NSS Coordinator | Super Admin | john@example.com | 9876543210 | https://example.com/john.jpg |

**Column Descriptions:**
- **Name**: Full name
- **Designation**: Position/title
- **Role**: Role description
- **Email**: Email address
- **Phone**: Phone number
- **Photo URL**: Direct link to profile photo (must be publicly accessible)

## Step 2: Make Sheets Public

For each sheet:
1. Click **Share** button (top right)
2. Click **Change to anyone with the link**
3. Set permission to **Viewer**
4. Click **Done**

## Step 3: Get Spreadsheet IDs

The Spreadsheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

Copy the `SPREADSHEET_ID_HERE` part for both sheets.

## Step 4: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Sheets API**:
   - Go to **APIs & Services** > **Library**
   - Search for "Google Sheets API"
   - Click **Enable**

## Step 5: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. (Optional but recommended) Click **Restrict Key**:
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Click **Save**

## Step 6: Configure Environment Variables

Create or update `.env.local` file in your project root:

```env
# Google Sheets Configuration
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
NEXT_PUBLIC_CAMPS_SPREADSHEET_ID=your_camps_spreadsheet_id_here
NEXT_PUBLIC_ADMINS_SPREADSHEET_ID=your_admins_spreadsheet_id_here
```

Replace:
- `your_api_key_here` with your Google Sheets API key
- `your_camps_spreadsheet_id_here` with your Camps sheet ID
- `your_admins_spreadsheet_id_here` with your Admins sheet ID

## Step 7: Hosting Images

You have several options for hosting images:

### Option 1: Google Drive (Recommended)
1. Upload images to Google Drive
2. Right-click image > **Get link**
3. Change to **Anyone with the link can view**
4. Copy the link (format: `https://drive.google.com/file/d/FILE_ID/view`)
5. Convert to direct link: `https://drive.google.com/uc?export=view&id=FILE_ID`

### Option 2: Imgur
1. Go to [imgur.com](https://imgur.com)
2. Upload image
3. Right-click image > **Copy image address**
4. Use this URL in your sheet

### Option 3: Your Own Server
Upload images to your server and use the direct URL.

## Step 8: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`

3. You should see:
   - **Upcoming Blood Donation Camps** section with camp images
   - **Pranadhara Team** section with admin photos

## Troubleshooting

### Images Not Loading

1. **Check image URLs**: Make sure they are publicly accessible
2. **CORS issues**: Use Google Drive or Imgur for hosting
3. **Check browser console**: Look for error messages

### Data Not Loading

1. **Verify API key**: Make sure it's correct in `.env.local`
2. **Check spreadsheet IDs**: Ensure they match your sheets
3. **Sheet permissions**: Verify sheets are set to "Anyone with the link"
4. **API enabled**: Confirm Google Sheets API is enabled in Cloud Console

### Common Errors

**Error: "The caller does not have permission"**
- Make sure your sheets are public (Anyone with the link can view)

**Error: "API key not valid"**
- Check your API key in Google Cloud Console
- Ensure Google Sheets API is enabled

**Images show broken icon**
- Verify image URLs are direct links
- Check if images are publicly accessible
- Try using Imgur or Google Drive links

## Sample Data

### Camps Sheet Example
```
Name,Location,District,Date,Time,Description,Organizer,Contact,Image URL
Blood Donation Camp 2024,Main Campus,Guntur,15-01-2026,9:00 AM - 4:00 PM,Annual blood donation drive,NSS Vignan,9876543210,https://i.imgur.com/example1.jpg
Health Awareness Camp,Community Hall,Krishna,20-01-2026,10:00 AM - 3:00 PM,Health checkup and blood donation,Red Cross,9876543211,https://i.imgur.com/example2.jpg
```

### Admins Sheet Example
```
Name,Designation,Role,Email,Phone,Photo URL
Dr. Rajesh Kumar,NSS Coordinator,Super Admin,rajesh@vignan.ac.in,9876543210,https://i.imgur.com/profile1.jpg
Priya Sharma,Student Coordinator,Admin,priya@vignan.ac.in,9876543211,https://i.imgur.com/profile2.jpg
```

## Updating Data

To update the displayed data:
1. Edit your Google Sheets
2. The landing page will fetch fresh data on each page load
3. No need to redeploy or restart the server

## Production Deployment

When deploying to Vercel/Netlify:
1. Add environment variables in your hosting platform's dashboard
2. Use the same variable names as in `.env.local`
3. Redeploy your application

## Security Notes

- ✅ API keys are safe to expose in client-side code for read-only operations
- ✅ Restrict API key to only Google Sheets API
- ✅ Keep spreadsheets in "Viewer" mode only
- ❌ Never store sensitive data in public sheets
- ❌ Don't use this method for write operations

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure Google Sheets API is enabled
4. Test API key with a simple curl command:
   ```bash
   curl "https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID/values/Sheet1!A:I?key=YOUR_API_KEY"
   ```
