# Physical Science App — Google Apps Script Backend

This folder contains the Google Apps Script backend for the Physical Science
Online Modular App. It syncs student assessment records to a Google Sheet.

## 📁 Files

| File | Purpose |
|------|---------|
| `Code.gs` | The main backend script (deploy as Web App) |
| `README.md` | This file |

## 🚀 Setup

### 1. Create the Google Sheet

1. Go to [sheets.new](https://sheets.new) to create a new Google Sheet.
2. Rename it **Physical Science App — Records**.
3. Create 3 tabs (rename the default `Sheet1` and add 2 more):
   - `Records`
   - `Codes`
   - `SyncLog`

> **Note:** Headers are auto-created by the script — you don't need to add them manually.

### 2. Open Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**.
2. Delete any default code in `Code.gs`.
3. Paste the entire contents of `Code.gs` from this folder.
4. Click **Save** (💾).

### 3. Configure Secrets

In `Code.gs`, update these two constants near the top:

```javascript
const TEACHER_TOKEN_HASH = '01d58c1ac3df6d023d869e50bf78e2f9185332c281f665fd53f6dbd7592df45e';
const HMAC_SECRET        = 'PS-APP-2026-DEPED-SECRET-KEY-v1';
