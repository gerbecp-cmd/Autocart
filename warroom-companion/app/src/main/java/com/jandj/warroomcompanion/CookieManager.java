package com.jandj.warroomcompanion;

/** Disambiguates Android WebView CookieManager from java.net.CookieManager. */
final class CookieManager {
    private CookieManager() {}
    static android.webkit.CookieManager getInstance() {
        return android.webkit.CookieManager.getInstance();
    }
}
