# 🎉 Google Sheets Integration - Complete Guide

## ✅ What's Been Done

### Changes Made
1. ✅ **Removed from Admin Panel**:
   - Camps and Pranadhara Admins links removed from admin sidebar
   - Stats cards removed from admin dashboard
   
2. ✅ **Added to Landing Page**:
   - "Upcoming Blood Donation Camps" section with images
   - "Pranadhara Team" section with profile photos
   - Both sections fetch data from Google Sheets
   
3. ✅ **Google Sheets Integration**:
   - Created utility functions to fetch data
   - Support for images (camps) and photos (admins)
   - Automatic fallback messages when no data

### Current State
- Landing page shows fallback messages (no Google Sheets configured yet)
- Ready to display data once you set up Google Sheets
- All code is working and tested

## 🚀 Quick Start Guide

### Step 1: Create Your Google Sheets

#### Camps Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new sheet named "Blood Donation Camps"
3. Add these column headers in **Row 1**:
   ```
   Name | Location | District | Date | Time | Description | Organizer | Contact | Image URL
   ```
4. Add your camp data in rows below

**Example Data:**
```
Blood Donation Camp 2024 | Main Campus | Guntur | 15-01-2026 | 9:00 AM - 4:00 PM | Annual blood donation drive | NSS Vignan | 9876543210 | https://i.imgur.com/example.jpg
```

#### Admins Sheet
1. Create another new sheet named "Pranadhara Team"
2. Add these column headers in **Row 1**:
   ```
   Name | Designation | Role | Email | Phone | Photo URL
   ```
3. Add your team data in rows below

**Example Data:**
```
Dr. Rajesh Kumar | NSS Coordinator | Super Admin | rajesh@vignan.ac.in | 9876543210 | https://i.imgur.com/profile.jpg
```

### Step 2: Make Sheets Public
For **each sheet**:
1. Click **Share** button (top right)
2. Click **Change to anyone with the link**
3. Set to **Viewer** (not Editor!)
4. Click **Done**

### Step 3: Get Spreadsheet IDs
The ID is in the URL:
```
https://docs.google.com/spreadsheets/d/1ABC123XYZ456.../edit
                                      ↑ This is your ID ↑
```
Copy the ID for both sheets.

### Step 4: Set Up Google Cloud

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/

2. **Create/Select Project**:
   - Create new project or use existing
   - Name it something like "NSS BloodConnect"

3. **Enable Google Sheets API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Sheets API"
   - Click **Enable**

4. **Create API Key**:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy the API key
   - (Optional) Click **Restrict Key**:
     - Under "API restrictions", select "Google Sheets API"
     - Click **Save**

### Step 5: Configure Environment Variables

1. Open your `.env.local` file (create if doesn't exist)
2. Add these lines:
   ```env
   NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
   NEXT_PUBLIC_CAMPS_SPREADSHEET_ID=your_camps_sheet_id_here
   NEXT_PUBLIC_ADMINS_SPREADSHEET_ID=your_admins_sheet_id_here
   ```
3. Replace the placeholder values with your actual values
4. Save the file

### Step 6: Upload Images

#### Option A: Using Imgur (Easiest)
1. Go to https://imgur.com
2. Click **New post**
3. Upload your image
4. Right-click the uploaded image → **Copy image address**
5. Paste this URL in your Google Sheet

#### Option B: Using Google Drive
1. Upload image to Google Drive
2. Right-click → **Get link**
3. Change to **Anyone with the link can view**
4. Copy the link (looks like: `https://drive.google.com/file/d/FILE_ID/view`)
5. Convert to direct link:
   ```
   https://drive.google.com/uc?export=view&id=FILE_ID
   ```
   (Replace FILE_ID with the ID from step 4)
6. Use this converted URL in your Google Sheet

#### Option C: Using Your Server
1. Put images in `public/images/` folder
2. Use path like: `/images/camp1.jpg`

### Step 7: Test It!

1. **Restart your dev server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Open your browser**:
   - Go to http://localhost:3000
   - Scroll down to see the new sections

3. **You should see**:
   - Camps section with your camp data and images
   - Team section with admin photos and info

## 📋 Sheet Templates

### Camps Sheet Template
Copy this to your Google Sheet:

| Name | Location | District | Date | Time | Description | Organizer | Contact | Image URL |
|------|----------|----------|------|------|-------------|-----------|---------|-----------|
| Blood Donation Camp 2024 | Main Campus, Block A | Guntur | 15-01-2026 | 9:00 AM - 4:00 PM | Annual blood donation drive organized by NSS | NSS Vignan | 9876543210 | https://i.imgur.com/example1.jpg |
| Health Awareness Camp | Community Hall | Krishna | 20-01-2026 | 10:00 AM - 3:00 PM | Health checkup and blood donation camp | Red Cross Society | 9876543211 | https://i.imgur.com/example2.jpg |

### Admins Sheet Template
Copy this to your Google Sheet:

| Name | Designation | Role | Email | Phone | Photo URL |
|------|-------------|------|-------|-------|-----------|
| Dr. Rajesh Kumar | NSS Coordinator | Super Admin | rajesh@vignan.ac.in | 9876543210 | https://i.imgur.com/profile1.jpg |
| Priya Sharma | Student Coordinator | Admin | priya@vignan.ac.in | 9876543211 | https://i.imgur.com/profile2.jpg |
| Amit Patel | Volunteer Lead | Moderator | amit@vignan.ac.in | 9876543212 | https://i.imgur.com/profile3.jpg |

## 🎨 Image Guidelines

### For Camps
- **Size**: 1200x600px recommended
- **Format**: JPG or PNG
- **Content**: Show the camp venue, volunteers, or blood donation activity
- **Quality**: High quality, well-lit photos

### For Admins
- **Size**: 400x400px recommended (square)
- **Format**: JPG or PNG
- **Content**: Professional headshot or profile photo
- **Background**: Plain or blurred background works best

## 🔧 Troubleshooting

### Problem: "No upcoming camps" message shows
**Solution:**
- Check if Google Sheets API key is correct in `.env.local`
- Verify spreadsheet ID is correct
- Make sure sheet is public (Anyone with link can view)
- Restart dev server after changing `.env.local`

### Problem: Images not loading
**Solution:**
- Verify image URLs are publicly accessible
- Try opening the URL in a new browser tab
- Use Imgur or Google Drive direct links
- Check browser console for errors (F12)

### Problem: "Permission denied" error
**Solution:**
- Make sure sheets are public (not private)
- Enable Google Sheets API in Cloud Console
- Check API key is correct

### Problem: Data not updating
**Solution:**
- Refresh the page (browser caches data)
- Clear browser cache
- Check if you edited the correct sheet
- Verify sheet name is "Sheet1" or update the range in code

## 📱 How to Update Data

### Adding a New Camp
1. Open your Camps Google Sheet
2. Add a new row with camp details
3. Upload camp image to Imgur/Drive
4. Add image URL to the sheet
5. Refresh your website - new camp appears!

### Adding a New Team Member
1. Open your Admins Google Sheet
2. Add a new row with person's details
3. Upload profile photo to Imgur/Drive
4. Add photo URL to the sheet
5. Refresh your website - new member appears!

### Removing/Editing Data
1. Edit or delete rows in Google Sheets
2. Refresh your website
3. Changes appear immediately!

## 🌟 Pro Tips

1. **Keep images consistent**: Use same dimensions for all camp images, same for all profile photos
2. **Optimize images**: Compress images before uploading (use tinypng.com)
3. **Use descriptive names**: Make camp names clear and informative
4. **Update regularly**: Keep upcoming camps current, remove past camps
5. **Test on mobile**: Check how it looks on phone screens

## 📊 What Gets Displayed

### Camps Section
- ✅ Camp image (full width)
- ✅ Camp name (heading)
- ✅ Location and district
- ✅ Date and time
- ✅ Description
- ✅ Organizer name
- ✅ Contact number

### Team Section
- ✅ Circular profile photo
- ✅ Name (bold)
- ✅ Designation (highlighted)
- ✅ Role
- ✅ Email address
- ✅ Phone number

## 🎯 Next Steps

1. ✅ Create your Google Sheets
2. ✅ Add sample data
3. ✅ Upload images
4. ✅ Configure environment variables
5. ✅ Test on localhost
6. ✅ Add real data
7. ✅ Deploy to production

## 📚 Additional Resources

- **Google Sheets Setup**: See `GOOGLE_SHEETS_SETUP.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Environment Template**: See `ENV_TEMPLATE.md`

## 🎉 You're All Set!

Once you complete these steps, your landing page will beautifully display:
- 📅 Upcoming blood donation camps with images
- 👥 Your Pranadhara team with photos
- 🔄 Easy updates via Google Sheets (no coding needed!)

**Need help?** Check the troubleshooting section or the detailed setup guide in `GOOGLE_SHEETS_SETUP.md`

---

**Happy organizing! 🩸💙**
