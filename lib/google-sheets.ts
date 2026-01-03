// Google Sheets integration utility
// This file provides functions to fetch data from Google Sheets

export interface GoogleSheetsConfig {
    spreadsheetId: string
    apiKey: string
    range: string
}

/**
 * Fetch data from a Google Sheet
 * @param config - Configuration object with spreadsheetId, apiKey, and range
 * @returns Array of rows from the sheet
 */
export async function fetchGoogleSheetData(config: GoogleSheetsConfig): Promise<any[][]> {
    const { spreadsheetId, apiKey, range } = config

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Failed to fetch Google Sheets data: ${response.statusText}`)
        }

        const data = await response.json()
        return data.values || []
    } catch (error) {
        console.error("Error fetching Google Sheets data:", error)
        return []
    }
}

/**
 * Helper to convert Google Drive view links to direct image links
 */
function formatGoogleDriveUrl(url: string | undefined): string {
    if (!url) return "";
    if (url.includes("drive.google.com") && url.includes("/file/d/")) {
        try {
            const id = url.split("/file/d/")[1].split("/")[0];
            return `https://drive.google.com/uc?export=view&id=${id}`;
        } catch (e) {
            return url;
        }
    }
    return url;
}

/**
 * Parse camps data from Google Sheets
 * Expected columns: Name, Location, District, Date, Time, Description, Organizer, Contact, Image URL
 */
/**
 * Parse camps data from Google Sheets
 * Supports both Vertical (Standard) and Horizontal (Column-based) formats
 */
export function parseCampsData(rows: any[][]): any[] {
    if (rows.length === 0) return []

    // CHECK FOR HORIZONTAL FORMAT (User Case: Names in Row 1, Images in Row 2)
    // If Row 1 has multiple items and Row 2 has a link, assume horizontal
    const isHorizontal = rows[0].length > 1 && rows[1] && rows[1].some((cell: string) => cell.includes('http'));

    if (isHorizontal) {
        // Transpose: Each Column is a Camp
        const campNames = rows[0];
        const campImages = rows[1] || [];
        const campDates = rows[2] || [];
        const campLocations = rows[3] || [];

        return campNames.map((name: string, index: number) => ({
            id: `camp-h-${index}`,
            name: name || "Untitled Camp",
            location: campLocations[index] || "Location TBD",
            district: "",
            date: campDates[index] || "Coming Soon",
            time: "TBA",
            description: "",
            organizer: "NSS Pranadhara",
            contact: "",
            imageUrl: formatGoogleDriveUrl(campImages[index]) || "/placeholder-camp.svg",
            status: "upcoming"
        })).filter((camp: any) => camp.name && camp.name.trim() !== "");
    }

    // VERTICAL FORMAT (Standard)
    // Row 1 assumed to be data if it doesn't look like a header, OR we skip header if standard
    // Let's assume user might start at Row 1 just like Admins
    const startRow = (rows[0][0] === "Name") ? 1 : 0;
    const dataRows = rows.slice(startRow);

    return dataRows.map((row, index) => ({
        id: `camp-${index}`,
        name: row[0] || "",
        location: row[1] || "",
        district: row[2] || "",
        date: row[3] || "",
        time: row[4] || "",
        description: row[5] || "",
        organizer: row[6] || "",
        contact: row[7] || "",
        imageUrl: formatGoogleDriveUrl(row[8]) || "/placeholder-camp.svg",
        status: "upcoming"
    })).filter(camp => camp.name && camp.name.trim() !== "")
}

/**
 * Parse management team data from Google Sheets
 * Supports Horizontal format (Names/Designations in Row 1, Photos in Row 2)
 */
export function parseManagementData(rows: any[][]): any[] {
    if (rows.length === 0) return []

    // Check for Horizontal Format (Image links in Row 2)
    const isHorizontal = rows[0].length > 1 && rows[1] && rows[1].some((cell: any) => typeof cell === 'string' && (cell.includes('http') || cell.includes('drive.google.com')));

    if (isHorizontal) {
        const titles = rows[0];
        const photos = rows[1] || [];

        return titles.map((title: string, index: number) => ({
            id: `member-${index}`,
            name: title || "Management",
            designation: "",
            role: "",
            photoUrl: formatGoogleDriveUrl(photos[index]) || "/placeholder-avatar.svg",
        })).filter((item: any) => item.name && item.name.trim() !== "");
    }

    // Standard Vertical Format
    return rows.map((row, index) => ({
        id: `mgmt-${index}`,
        name: row[0] || "",
        designation: row[1] || "",
        role: row[3] || "",
        photoUrl: formatGoogleDriveUrl(row[4]) || "/placeholder-avatar.svg",
    })).filter(item => item.name && item.name.trim() !== "")
}
