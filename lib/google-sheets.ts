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
 * Works for both:
 * 1. https://drive.google.com/file/d/ID/view
 * 2. https://drive.google.com/open?id=ID
 * 3. Direct IDs or other formats
 */
export function formatGoogleDriveUrl(url: string | undefined): string {
    if (!url) return "";

    // If it's already a direct link or placeholder, return it
    if (url.startsWith("/") || url.startsWith("data:")) return url;

    try {
        let id = "";

        if (url.includes("drive.google.com")) {
            if (url.includes("/file/d/")) {
                id = url.split("/file/d/")[1].split("/")[0];
            } else if (url.includes("?id=")) {
                const params = new URL(url).searchParams;
                id = params.get("id") || "";
            }
        } else if (url.includes("docs.google.com/uc")) {
            const params = new URL(url).searchParams;
            id = params.get("id") || "";
        }

        if (id) {
            // using thumbnail link is often more reliable for images and avoids some redirects/virus scan warnings
            return `https://drive.google.com/thumbnail?id=${id}&sz=s1000`;
        }
    } catch (e) {
        console.warn("Error parsing Google Drive URL:", url);
    }

    return url;
}

/**
 * Parse camps data from Google Sheets
 * Supports both Horizontal and Vertical formats
 */
export function parseCampsData(rows: any[][]): any[] {
    if (rows.length === 0) return []

    const hasLink = (cell: any) =>
        typeof cell === 'string' && (cell.includes('drive.google.com') || cell.includes('http'));

    // Improved detection: 
    // Vertical sheets usually have links in the same column across rows.
    // Horizontal sheets have MANY links in a single row.
    const row0Links = rows[0].filter(hasLink).length;
    const row1Links = rows[1] ? rows[1].filter(hasLink).length : 0;

    // It's horizontal if Row 2 has link(s) and Row 1 has none (titles/names row)
    const isHorizontal = row1Links >= 1 && row0Links === 0;

    if (isHorizontal) {
        const names = rows[0];
        const photos = rows[1];
        const dates = rows[2] || [];
        const locations = rows[3] || [];

        return names.map((name: string, index: number) => ({
            id: `camp-h-${index}`,
            name: name || "Camp",
            location: locations[index] || "Location TBD",
            district: "",
            date: dates[index] || "Coming Soon",
            time: "TBA",
            description: "",
            organizer: "NSS Pranadhara",
            contact: "",
            imageUrl: formatGoogleDriveUrl(photos[index]) || "/placeholder-camp.svg",
            status: "upcoming"
        })).filter(camp => camp.name && camp.name.trim() !== "" && !hasLink(camp.name));
    }

    // Default Vertical Format (Standard)
    const startRow = (rows[0][0] === "Name") ? 1 : 0;
    const dataRows = rows.slice(startRow);

    return dataRows.map((row, index) => ({
        id: `camp-v-${index}`,
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
    })).filter(camp => camp.name && camp.name.trim() !== "" && !hasLink(camp.name))
}

/**
 * Parse management team data from Google Sheets
 * Supports Horizontal format (Names in Row 1, Links in Row 2)
 */
export function parseManagementData(rows: any[][]): any[] {
    if (rows.length === 0) return []

    const hasLink = (cell: any) =>
        typeof cell === 'string' && (cell.includes('drive.google.com') || cell.includes('http'));

    const row0Links = rows[0].filter(hasLink).length;
    const row1Links = rows[1] ? rows[1].filter(hasLink).length : 0;

    // It's horizontal if Row 2 has link(s) and Row 1 has none (roles/titles row)
    const isHorizontal = row1Links >= 1 && row0Links === 0;

    // Use horizontal logic if detected
    if (isHorizontal) {
        const roles = rows[0];     // Row 1 (Chairman, CEO, etc.)
        const photos = rows[1];    // Row 2 (Photos)
        const names = rows[2] || []; // Row 3 (Actual Names)

        return roles.map((role: string, index: number) => ({
            id: `mgmt-h-${index}`,
            name: role || "Member",          // Role as Main Title (Bold)
            designation: names[index] || "", // Person Name as Subtitle
            role: "",                        // Optional extra role field
            photoUrl: formatGoogleDriveUrl(photos[index]) || "/placeholder-avatar.svg",
        })).filter(item => item.name && item.name.trim() !== "" && !hasLink(item.name));
    }

    // Standard Vertical Format (Name, Role, ..., Designation, Photo)
    return rows.map((row, index) => ({
        id: `mgmt-v-${index}`,
        name: row[0] || "",
        role: row[1] || "",        // Column B
        designation: row[3] || "", // Column D
        photoUrl: formatGoogleDriveUrl(row[4]) || "/placeholder-avatar.svg", // Column E
    })).filter(item =>
        item.name &&
        item.name.trim() !== "" &&
        !hasLink(item.name) &&
        item.name !== "Name"
    )
}
