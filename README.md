# AutoCart

AutoCart is an AI-powered shopping assistant for **Android and PC**. It prepares shopping lists and retailer handoffs; **it never purchases, submits, or pays for an order. The consumer reviews the cart and completes checkout with the retailer.**

## Three ways to shop

1. **Say/type a request** — `Load chicken parmesan to Walmart for 4 people under $40.`
2. **Type a list** — one item per line. `2 milk` and `bread | 2 loaves` are supported.
3. **Upload a file** — photos/images, PDFs, CSV/TXT and supported spreadsheets/office documents can be converted into a shopping plan when the AutoCart AI Worker is enabled.

## Android + PC

- **Android:** native shell with voice recognition, secure local web assets, clipboard support, retailer handoffs and native file selection.
- **PC:** installable PWA for Chrome/Edge plus a Windows localhost launcher.
- Both clients use the same `web/` code so features and retailer support stay synchronized.

## 65-store network

AutoCart now exposes **65 retailer destinations** through categorized pickers and natural-language recognition.

- **Major stores & marketplaces:** Walmart, Amazon, Target, eBay, Etsy.
- **Grocery & warehouse:** GIANT, Giant Food, Wegmans, ShopRite, ACME, Weis, Kroger, Albertsons, Safeway, Publix, ALDI, Food Lion, Stop & Shop, H-E-B, Meijer, Sprouts, Whole Foods, Harris Teeter, Giant Eagle, Costco, Sam's Club, BJ's Wholesale Club.
- **Electronics, gaming & office:** Best Buy, Newegg, Staples, Office Depot, B&H Photo, Micro Center, GameStop.
- **Home, hardware & crafts:** Home Depot, Lowe's, Wayfair, Ace Hardware, Harbor Freight, Tractor Supply, Menards, IKEA, Michaels.
- **Pharmacy & value:** CVS, Walgreens, Dollar General, Dollar Tree.
- **Pet:** Chewy, Petco, PetSmart.
- **Sports & outdoors:** DICK'S Sporting Goods, Academy Sports + Outdoors, REI, SCHEELS, Bass Pro Shops, Cabela's.
- **Beauty & department:** Ulta Beauty, Sephora, Kohl's, Macy's, Nordstrom, JCPenney.
- **Auto parts:** AutoZone, Advance Auto Parts, O'Reilly Auto Parts.

The store picker can override the retailer in an AI command, and the same categorized store list is available for typed lists and file imports.

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

AutoCart 3.3.0 targets Android API 36. The default application ID is `com.autocart.app`; for an update to an existing Google Play listing, set `AUTOCART_APPLICATION_ID` to that listing's exact package ID before release signing/building.

## Privacy and checkout

AutoCart does not store retailer passwords or process retailer payment. Uploaded documents may be sent to the configured Cloudflare Worker/AI service for extraction. See `web/privacy.html` and `web/disclaimer.html` for the in-app policies.