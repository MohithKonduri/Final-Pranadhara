// Test script to verify Google Sheets access
// Run this with: node test-sheets.js

const fs = require('fs');

const CAMPS_SPREADSHEET_ID = '1gKzQrAQCottc6LSFlg3ExZrJsbxhY9XB-4vR9dPpHrc'
const ADMINS_SPREADSHEET_ID = '1a8l9Uiotk7ENYbHqONVqb2dRbCdAqpTej9DUjDtTCdg'

// Your Google Sheets API Key
const API_KEY = 'AIzaSyATkIN8afpu3s-kkWExCLSAPRlVZS7glaM'

function log(message) {
    console.log(message);
    fs.appendFileSync('test-output.txt', message + '\n');
}

async function testSheet(spreadsheetId, sheetName) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:Z?key=${API_KEY}`

    try {
        log(`\n📊 Testing ${sheetName}...`)
        log(`URL: ${url}`)

        const response = await fetch(url)
        const data = await response.json()

        if (response.ok) {
            log(`✅ ${sheetName} is accessible!`)
            log(`   Rows found: ${data.values ? data.values.length : 0}`)
            if (data.values && data.values.length > 0) {
                log(`   Headers: ${data.values[0].join(', ')}`)
                log(`   Data rows: ${data.values.length - 1}`)
            }
        } else {
            log(`❌ ${sheetName} failed: ${data.error.message}`)
            log(`   Error Code: ${data.error.code}`)
            if (data.error.code === 403) {
                log(`   💡 Tip: Make sure the sheet is public (Anyone with link can view)`)
                log(`   💡 Tip: Check if Google Sheets API is enabled in your Google Cloud Console for this key`)
            }
        }
    } catch (error) {
        log(`❌ ${sheetName} error: ${error.message}`)
    }
}

async function main() {
    fs.writeFileSync('test-output.txt', ''); // Clear file
    log('� Testing Google Sheets Access')
    log('='.repeat(50))

    await testSheet(CAMPS_SPREADSHEET_ID, 'Camps Sheet')
    await testSheet(ADMINS_SPREADSHEET_ID, 'Admins Sheet')

    log('\n' + '='.repeat(50))
}

main()
