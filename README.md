# AutoCart

AutoCart is an AI-powered shopping assistant for **Android and PC**. It prepares shopping lists and retailer handoffs; **it never purchases, submits, or pays for an order. The consumer reviews the cart and completes checkout with the retailer.**

## Three ways to shop

1. **Say/type a request** — `Load chicken parmesan to GIANT for 4 people under $40.`
2. **Type a list** — one item per line. Press Enter for the next item. `2 milk` and `bread | 2 loaves` are supported.
3. **Upload a file** — photos/images, PDFs, CSV/TXT and supported spreadsheets/office documents can be converted into an editable shopping plan when the AutoCart AI Worker is enabled.

## Android + PC

- **Android:** native shell with voice recognition, secure WebViewAssetLoader local assets, clipboard support, retailer handoffs and native file selection.
- **PC:** installable PWA for Chrome/Edge plus a Windows localhost launcher.
- Both clients use the same `web/` code so the feature set stays synchronized.

## Grocery chains

AutoCart includes **GIANT (The GIANT Company)** and keeps it separate from **Giant Food**. Grocery destinations also include Wegmans, ShopRite, ACME Markets, Weis Markets, Kroger, Albertsons, Safeway, Publix, ALDI, Food Lion, Stop & Shop, H-E-B, Meijer, Sprouts, Whole Foods, Harris Teeter and Giant Eagle, plus Walmart, Target, Costco and Sam's Club.

## Other retailers

Amazon, Best Buy, eBay, Home Depot, Lowe's, Etsy, Newegg, Chewy and Wayfair remain supported as retailer handoffs.

## AI and offline behavior

Built-in recipes and typed shopping lists work without the Worker. The Cloudflare Worker adds unrestricted recipe/shopping interpretation and document extraction. TXT/CSV/TSV imports can be read locally; richer document formats use the configured Worker.

The Worker serves both the PC PWA and API routes:

- `/` — AutoCart PC/PWA
- `/api/command` — natural-language shopping command API
- `/api/import` — document/image/spreadsheet shopping-item extraction
- `/api/health` — service health

## Repository layout

```text
web/       Shared PC + Android client/PWA
android/   Native Android wrapper
worker/    Cloudflare Worker + Workers AI API/import
scripts/   Local tests
.github/   APK and Worker CI/deploy workflows
desktop/   Windows local launcher
```

## Test

```bash
./scripts/test-all.sh
```

GitHub Actions also validates the Worker/PWA and builds the Android APK.

## Android release

AutoCart 3.2.0 targets Android API 36. The default application ID is `com.autocart.app`; for an update to an existing Google Play listing, set `AUTOCART_APPLICATION_ID` to that listing's exact package ID before release signing/building.

## Privacy and checkout

AutoCart does not store retailer passwords or process retailer payment. Uploaded documents may be sent to the configured Cloudflare Worker/AI service for extraction. See `web/privacy.html` and `web/disclaimer.html` for the in-app policies.
