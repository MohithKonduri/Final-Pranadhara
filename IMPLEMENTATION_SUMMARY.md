# Camps & Admins - Google Sheets Integration Summary

## ✅ What Was Changed

### 1. **Removed from Admin Dashboard**
- ❌ Removed "Camps" navigation link from admin sidebar
- ❌ Removed "Pranadhara Admins" navigation link from admin sidebar  
- ❌ Removed "Upcoming Camps" and "Active Admins" stat cards from dashboard
- ✅ Admin dashboard now shows only: Donors, Emergency Requests, and Availability Rate

### 2. **Added to Landing Page**
- ✅ **Upcoming Blood Donation Camps** section with camp images
- ✅ **Pranadhara Team** section with admin photos
- ✅ Both sections fetch data from Google Sheets
- ✅ Beautiful card-based layouts with images

### 3. **Google Sheets Integration**
- ✅ Created `lib/google-sheets.ts` utility for fetching data
- ✅ Support for camp images and admin photos
- ✅ Automatic fallback to placeholder images if URLs fail
- ✅ Real-time data updates (fetches on page load)

## 📁 Files Created/Modified

### New Files
1. `lib/google-sheets.ts` - Google Sheets integration utility
2. `GOOGLE_SHEETS_SETUP.md` - Complete setup guide
3. `ENV_TEMPLATE.md` - Environment variables template

### Modified Files
1. `app/page.tsx` - Landing page with Camps and Admins sections
2. `lib/types.ts` - Added `imageUrl` and `photoUrl` fields
3. `components/admin-sidebar.tsx` - Removed Camps and Admins links
4. `app/admin/dashboard/page.tsx` - Removed Camps and Admins stats

### Existing Admin Pages (Kept for Future Use)
- `app/admin/camps/page.tsx` - Still exists but not linked
- `app/admin/admins/page.tsx` - Still exists but not linked

## 🎨 Landing Page Features

### Camps Section
- **Location**: After "How It Works" section
- **Display**: Grid of cards (3 columns on desktop)
- **Each card shows**:
  - Camp image (full width at top)
  - Camp name
  - Location and district
  - Date and time
  - Description
  - Organizer and contact info

### Pranadhara Team Section
- **Location**: After Camps section
- **Display**: Grid of cards (4 columns on desktop)
- **Each card shows**:
  - Circular profile photo
  - Name
  - Designation
  - Role
  - Email and phone

## 📊 Google Sheets Format

### Camps Sheet Columns (in order)
1. Name
2. Location
3. District
4. Date
5. Time
6. Description
7. Organizer
8. Contact
9. **Image URL** ← Direct link to camp image

### Admins Sheet Columns (in order)
1. Name
2. Designation
3. Role
4. Email
5. Phone
6. **Photo URL** ← Direct link to profile photo

## 🔧 Setup Steps

### Quick Start
1. **Create Google Sheets** (see `GOOGLE_SHEETS_SETUP.md`)
2. **Enable Google Sheets API** in Google Cloud Console
3. **Get API Key** from Google Cloud Console
4. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key
   NEXT_PUBLIC_CAMPS_SPREADSHEET_ID=your_camps_sheet_id
   NEXT_PUBLIC_ADMINS_SPREADSHEET_ID=your_admins_sheet_id
   ```
5. **Restart dev server**: `npm run dev`

### Image Hosting Options
1. **Google Drive** (Recommended)
   - Upload image → Share → Get link
   - Convert to: `https://drive.google.com/uc?export=view&id=FILE_ID`

2. **Imgur**
   - Upload → Copy image address
   - Use direct URL

3. **Your Server**
   - Upload to `/public` folder
   - Use relative path: `/images/camp1.jpg`

## 🎯 How It Works

1. **Page Load**: Landing page fetches data from Google Sheets
2. **Data Parsing**: Utility functions parse rows into structured data
3. **Image Display**: Next.js Image component loads images with fallback
4. **Error Handling**: If image fails, shows placeholder
5. **Responsive**: Adapts to mobile, tablet, and desktop

## 📱 Responsive Design

- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 
  - Camps: 3 columns
  - Admins: 4 columns

## 🔄 Updating Data

To update camps or admins:
1. Edit your Google Sheet
2. Refresh the landing page
3. Changes appear immediately (no deployment needed!)

## 🎨 Styling

- Uses existing Card components
- Consistent with site theme
- Hover effects on cards
- Smooth transitions
- Icons from lucide-react

## 🚀 Next Steps

1. **Set up Google Sheets** (follow `GOOGLE_SHEETS_SETUP.md`)
2. **Add sample data** to test
3. **Upload images** to Google Drive or Imgur
4. **Configure environment variables**
5. **Test on landing page**

## 📝 Sample Data

### Camps Sheet Example
```
Blood Donation Camp 2024 | Main Campus | Guntur | 15-01-2026 | 9:00 AM - 4:00 PM | Annual drive | NSS Vignan | 9876543210 | https://i.imgur.com/camp1.jpg
```

### Admins Sheet Example
```
Dr. Rajesh Kumar | NSS Coordinator | Super Admin | rajesh@vignan.ac.in | 9876543210 | https://i.imgur.com/profile1.jpg
```

## ⚠️ Important Notes

- ✅ Sheets must be public (Anyone with link can view)
- ✅ Image URLs must be direct links (not Google Drive preview links)
- ✅ API key is safe to expose for read-only operations
- ✅ Data updates automatically on page refresh
- ❌ Don't store sensitive data in public sheets
- ❌ Don't use for write operations

## 🐛 Troubleshooting

**Images not loading?**
- Check if URLs are publicly accessible
- Try Imgur or Google Drive direct links
- Check browser console for errors

**Data not showing?**
- Verify API key in `.env.local`
- Check spreadsheet IDs are correct
- Ensure sheets are public
- Restart dev server after env changes

**"Permission denied" error?**
- Make sheets public (Anyone with link)
- Enable Google Sheets API in Cloud Console

## 📚 Documentation

- **Setup Guide**: `GOOGLE_SHEETS_SETUP.md`
- **Environment Template**: `ENV_TEMPLATE.md`
- **Original Features Doc**: `CAMPS_AND_ADMINS_FEATURES.md`

## 🎉 Benefits

1. **Easy Updates**: Edit Google Sheets, no code changes needed
2. **No Database**: No Firestore costs for public data
3. **Collaborative**: Multiple people can edit sheets
4. **Visual**: Images make it more engaging
5. **Fast**: Cached by browser, loads quickly

---

**Ready to go!** Follow the setup guide and your landing page will display beautiful camps and team sections with images from Google Sheets! 🚀
