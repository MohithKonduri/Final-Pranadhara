# 🔧 Your Google Sheets Configuration

## ✅ Spreadsheet IDs (Already Extracted)

Your spreadsheet IDs from the links you provided:

```env
NEXT_PUBLIC_ADMINS_SPREADSHEET_ID=1a8l9Uiotk7ENYbHqONVqb2dRbCdAqpTej9DUjDtTCdg
NEXT_PUBLIC_CAMPS_SPREADSHEET_ID=1gKzQrAQCottc6LSFlg3ExZrJsbxhY9XB-4vR9dPpHrc
```

## 📝 Next Steps

### Step 1: Get Your Google Sheets API Key

You need a Google Sheets API key. Here's how to get one:

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**:
   - Click the project dropdown at the top
   - Click "New Project" or select an existing one
   - Name it something like "NSS BloodConnect"

3. **Enable Google Sheets API**:
   - In the left sidebar, go to **APIs & Services** → **Library**
   - Search for "Google Sheets API"
   - Click on it and click **Enable**

4. **Create API Key**:
   - Go to **APIs & Services** → **Credentials**
   - Click **+ Create Credentials** → **API Key**
   - Copy the API key that appears
   - (Optional but recommended) Click **Restrict Key**:
     - Under "API restrictions", select "Restrict key"
     - Choose "Google Sheets API" from the dropdown
     - Click **Save**

### Step 2: Add to Your .env.local File

1. Open the file: `c:\Users\mohit\Downloads\nsspranadhara_1\.env.local`

2. Add these three lines (replace `YOUR_API_KEY_HERE` with the key from Step 1):

```env
# Google Sheets Configuration
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_CAMPS_SPREADSHEET_ID=1gKzQrAQCottc6LSFlg3ExZrJsbxhY9XB-4vR9dPpHrc
NEXT_PUBLIC_ADMINS_SPREADSHEET_ID=1a8l9Uiotk7ENYbHqONVqb2dRbCdAqpTej9DUjDtTCdg
```

### Step 3: Make Sure Your Sheets Are Public

For each sheet, you need to make it publicly viewable:

#### For Admins Sheet:
1. Open: https://docs.google.com/spreadsheets/d/1a8l9Uiotk7ENYbHqONVqb2dRbCdAqpTej9DUjDtTCdg/edit
2. Click **Share** button (top right)
3. Click **Change to anyone with the link**
4. Make sure it's set to **Viewer** (not Editor)
5. Click **Done**

#### For Camps Sheet:
1. Open: https://docs.google.com/spreadsheets/d/1gKzQrAQCottc6LSFlg3ExZrJsbxhY9XB-4vR9dPpHrc/edit
2. Click **Share** button (top right)
3. Click **Change to anyone with the link**
4. Make sure it's set to **Viewer** (not Editor)
5. Click **Done**

### Step 4: Verify Your Sheet Structure

Make sure your sheets have the correct column headers:

#### Camps Sheet (Sheet1) - Columns in Row 1:
```
Name | Location | District | Date | Time | Description | Organizer | Contact | Image URL
```

#### Admins Sheet (Sheet1) - Columns in Row 1:
```
Name | Designation | Role | Email | Phone | Photo URL
```

### Step 5: Test It!

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   - Go to http://localhost:3000
   - Scroll down to see:
     - "Upcoming Blood Donation Camps" section
     - "Pranadhara Team" section

3. **You should see your data!**

## 🎨 Adding Images

For the Image URL and Photo URL columns, you can use:

### Option 1: Imgur (Easiest)
1. Go to https://imgur.com
2. Upload your image
3. Right-click the image → **Copy image address**
4. Paste this URL in your sheet

### Option 2: Google Drive
1. Upload image to Google Drive
2. Right-click → **Get link** → **Anyone with the link can view**
3. Copy the link (looks like: `https://drive.google.com/file/d/FILE_ID/view`)
4. Convert to: `https://drive.google.com/uc?export=view&id=FILE_ID`
5. Use this converted URL in your sheet

## 🐛 Troubleshooting

### If you see "No upcoming camps" or "Team information will be available soon":

1. **Check API Key**: Make sure you added it to `.env.local`
2. **Check Spreadsheet IDs**: They should match exactly
3. **Check Sheet Names**: Make sure the data is in a sheet named "Sheet1"
4. **Check Permissions**: Both sheets must be public (Anyone with link can view)
5. **Restart Server**: After changing `.env.local`, restart with `npm run dev`

### If images don't load:

1. **Test the URL**: Open the image URL in a new browser tab
2. **Use Imgur**: It's the most reliable for public images
3. **Check Format**: Make sure it's a direct image link (ends in .jpg, .png, etc.)

## ✅ Quick Checklist

- [ ] Get Google Sheets API key from Cloud Console
- [ ] Add API key to `.env.local`
- [ ] Add spreadsheet IDs to `.env.local` (already provided above)
- [ ] Make both sheets public (Anyone with link can view)
- [ ] Verify column headers match the format above
- [ ] Add sample data to test
- [ ] Upload images and add URLs to sheets
- [ ] Restart dev server
- [ ] Check http://localhost:3000

## 📞 Need Help?

If you get stuck:
1. Check the browser console (F12) for errors
2. Verify all environment variables are set
3. Make sure Google Sheets API is enabled
4. Test the API key with this URL (replace with your values):
   ```
   https://sheets.googleapis.com/v4/spreadsheets/1gKzQrAQCottc6LSFlg3ExZrJsbxhY9XB-4vR9dPpHrc/values/Sheet1!A:I?key=YOUR_API_KEY
   ```

---

**You're almost there! Just get the API key and add it to `.env.local`** 🚀
