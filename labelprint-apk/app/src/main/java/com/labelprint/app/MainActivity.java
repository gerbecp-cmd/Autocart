package com.labelprint.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.OutputStream;
import java.util.Base64;

public class MainActivity extends Activity {
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingPdfBase64;
    private static final int FILE_CHOOSER = 1001;
    private static final int SAVE_PDF = 1002;

    @SuppressLint({"SetJavaScriptEnabled","JavascriptInterface"})
    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        webView = new WebView(this);
        setContentView(webView);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.addJavascriptInterface(new Bridge(this), "Android");
        webView.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req){ return false; }
        });
        webView.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView wv, ValueCallback<Uri[]> cb, FileChooserParams params){
                if(fileCallback!=null) fileCallback.onReceiveValue(null);
                fileCallback=cb;
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("application/pdf");
                startActivityForResult(i, FILE_CHOOSER);
                return true;
            }
        });
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data){
        super.onActivityResult(requestCode,resultCode,data);
        if(requestCode==FILE_CHOOSER){
            Uri[] result=null;
            if(resultCode==RESULT_OK && data!=null && data.getData()!=null) result=new Uri[]{data.getData()};
            if(fileCallback!=null){ fileCallback.onReceiveValue(result); fileCallback=null; }
        } else if(requestCode==SAVE_PDF && resultCode==RESULT_OK && data!=null && data.getData()!=null && pendingPdfBase64!=null){
            try(OutputStream os=getContentResolver().openOutputStream(data.getData())){
                byte[] bytes=Base64.getDecoder().decode(pendingPdfBase64);
                os.write(bytes);
            } catch(Exception ignored){}
            pendingPdfBase64=null;
        }
    }

    public class Bridge {
        Context ctx;
        Bridge(Context c){ctx=c;}

        @JavascriptInterface public void savePdf(String base64){
            pendingPdfBase64=base64;
            runOnUiThread(()->{
                Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("application/pdf");
                i.putExtra(Intent.EXTRA_TITLE,"corrected_label.pdf");
                startActivityForResult(i,SAVE_PDF);
            });
        }

        @JavascriptInterface public void printHtml(String html, String jobName){
            runOnUiThread(()->{
                WebView printView=new WebView(MainActivity.this);
                printView.getSettings().setJavaScriptEnabled(true);
                printView.setWebViewClient(new WebViewClient(){
                    @Override public void onPageFinished(WebView view,String url){
                        PrintManager pm=(PrintManager)getSystemService(Context.PRINT_SERVICE);
                        pm.print(jobName, view.createPrintDocumentAdapter(jobName), new PrintAttributes.Builder().build());
                    }
                });
                printView.loadDataWithBaseURL(null,html,"text/html","UTF-8",null);
            });
        }
    }
}
