
// Mock of the formatGoogleDriveUrl function
function formatGoogleDriveUrl(url) {
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

// Mock of parseAdminsData based on the update in lib/google-sheets.ts
function parseAdminsData(rows) {
    if (rows.length === 0) return []

    // User is submitting data starting from Row 1, so we do NOT skip the header.
    // We map generic columns to our data structure.
    return rows.map((row, index) => ({
        id: `admin-${index}`,
        name: row[0] || "", // Column A
        designation: row[1] || "", // Column B (ID)
        role: "Member",
        email: "",
        phone: "",
        photoUrl: formatGoogleDriveUrl(row[4]) || "/placeholder-avatar.svg", // Column E
    })).filter(item => item.name && item.name.trim() !== "") // Filter out empty rows
}

// Sample data mimicking the user's Google Sheet screenshot
const sampleRows = [
    ["Yugendhar", "23891A1259", "", "", "https://drive.google.com/file/d/1IKwq_C4A-zzktrL5iv-VAav0A5sfVVRt/view?usp=sharing"],
    ["mohith", "", "", "", "https://drive.google.com/file/d/1IKwq_C4A-zzktrL5iv-VAav0A5sfVVRt/view?usp=sharing"],
    ["Admin3", "", "", "", ""],
    ["Admin4", "", "", "", ""],
    ["Admin5", "", "", "", ""]
];

console.log("Testing parseAdminsData with sample data:");
const result = parseAdminsData(sampleRows);
console.log(JSON.stringify(result, null, 2));

if (result[0].name === "Yugendhar" && result[0].photoUrl.includes("drive.google.com/uc?export=view")) {
    console.log("SUCCESS: Data parsed correctly!");
} else {
    console.log("FAILURE: Parsing failed.");
}
