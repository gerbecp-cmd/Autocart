# AutoCart

AutoCart is an AI-powered shopping command app for **Android and PC**.

Type or say:

> Load chicken parmesan to Walmart for 4 people under $40.

AutoCart turns the request into a clean ingredient/shopping plan and creates retailer handoffs without mixing culinary quantities into retailer search terms.

## Clients

- **Android:** native WebView shell with Android voice recognition, clipboard and retailer handoff bridge.
- **PC:** installable PWA for Chrome/Edge. It can be pinned and launched in its own desktop window.
- Both clients use the exact same files in `web/`, so UI and shopping logic stay synchronized.

## Retailers

Walmart, Amazon, Target, Best Buy, eBay, Home Depot, Lowe's, Costco, Sam's Club, Etsy, Newegg, Chewy and Wayfair.

## AI behavior

Known recipes work even if the network or AI binding is unavailable. The Cloudflare Worker adds Workers AI for recipes and shopping requests outside the built-in library.

The Worker also serves the PC PWA as static assets, so one deployment gives you both:

- `https://<autocart-worker>/` — PC AutoCart
- `https://<autocart-worker>/api/command` — Android/PC AI command API

## Repository layout

```text
web/       Shared PC + Android client/PWA
android/   Native Android wrapper
worker/    Cloudflare Worker + Workers AI API
scripts/   Local tests
.github/   APK and Worker CI/deploy workflows
```

## Local tests

```bash
./scripts/test-all.sh
```

## Android build

The project targets Android 16 / API 36. GitHub Actions builds a debug APK on changes to `android/` or `web/`.

The default application ID is `com.autocart.app`. For an update to an existing Google Play listing, set the repository secret `AUTOCART_APPLICATION_ID` to the existing app's package ID before building the release version.

## PC install

After the Worker is deployed, open the AutoCart URL in Edge or Chrome and choose **Install AutoCart** / **Install this site as an app**. AutoCart then launches like a normal Windows app.

## Walmart note

AutoCart prepares the shopping plan and opens retailer product searches/handoffs. Checkout stays inside Walmart. AutoCart does not store Walmart credentials and does not claim a public consumer-cart API that Walmart does not expose.
