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

## 115-store smart network

AutoCart now exposes **115 retailer destinations** through natural-language recognition, categorized pickers and a searchable store directory.

Store tools include:

- **Best Store** — Workers AI chooses a retailer by product/category fit when the Worker is connected; a deterministic smart matcher is used offline.
- **Store search** — quickly filters the full retailer network.
- **Favorites** — star frequently used stores and return to them instantly.
- **Recent Stores** — remembers the most recently used retailer destinations on the device.
- **Store override** — force any supported retailer for commands, typed lists or imported files.
- **Shared Android/PC network** — the same retailer engine is packaged into both clients.

Major categories include grocery/warehouse, marketplaces, pharmacy/value, computers/mobile/electronics, clothing/shoes, beauty, tools/industrial/farm, outdoor/adventure, home/furniture/kitchen, pet, auto parts/tires, books/crafts/gifts and department stores.

The expanded network includes the original AutoCart destinations plus stores such as Rite Aid, Sally Beauty, Five Below, Family Dollar, Apple Store, Samsung, Dell, Lenovo, HP, Nike, adidas, Under Armour, Old Navy, Gap, Foot Locker, Zappos, DSW, Finish Line, Skechers, Crocs, Bath & Body Works, Victoria's Secret, lululemon, Northern Tool + Equipment, Grainger, Fastenal, Rural King, Fleet Farm, Sportsman's Warehouse, Backcountry, L.L.Bean, Patagonia, The North Face, Columbia Sportswear, At Home, Pottery Barn, West Elm, Crate & Barrel, World Market, Williams Sonoma, Sur La Table, Ashley, Rooms To Go, NAPA Auto Parts, Tire Rack, CarParts.com, Barnes & Noble, Books-A-Million, Boscov's and Hobby Lobby.

## AI and offline behavior

Built-in recipes and typed shopping lists work without the Worker. The Cloudflare Worker adds unrestricted recipe/shopping interpretation, document extraction and AI Best Store recommendations. TXT/CSV/TSV imports can be read locally; richer document formats use the configured Worker.

The Worker serves both the PC PWA and API routes:

- `/` — AutoCart PC/PWA
- `/api/command` — natural-language shopping command API
- `/api/import` — document/image/spreadsheet shopping-item extraction
- `/api/store-recommendation` — AI-assisted Best Store selection with offline fallback
- `/api/health` — service health

## Repository layout

```text
web/       Shared PC + Android client/PWA
android/   Native Android wrapper
worker/    Cloudflare Worker + Workers AI API/import/store selection
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

AutoCart 3.4.0 targets Android API 36. The default application ID is `com.autocart.app`; for an update to an existing Google Play listing, set `AUTOCART_APPLICATION_ID` to that listing's exact package ID before release signing/building.

## Privacy and checkout

AutoCart does not store retailer passwords or process retailer payment. Uploaded documents may be sent to the configured Cloudflare Worker/AI service for extraction. See `web/privacy.html` and `web/disclaimer.html` for the in-app policies.