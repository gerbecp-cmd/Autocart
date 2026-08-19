package com.jandj.warroomcompanion;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.Color;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.database.Cursor;
import android.view.*;
import android.webkit.*;
import android.widget.*;
import android.text.InputType;
import android.util.Base64;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER = 4041;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private String serverUrl;
    private SharedPreferences prefs;
    private TextView status;

    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        prefs = getSharedPreferences("jj_companion", MODE_PRIVATE);
        serverUrl = prefs.getString("server_url", "");
        buildUi();
        handleIncomingShare(getIntent());
        if (serverUrl.isEmpty()) showServerDialog(true); else openWarRoom();
    }

    private int dp(int n){ return (int)(n*getResources().getDisplayMetrics().density+.5f); }

    private TextView makeBtn(String text) {
        TextView v = new TextView(this);
        v.setText(text); v.setTextColor(Color.WHITE); v.setTextSize(12); v.setGravity(Gravity.CENTER);
        v.setPadding(dp(8),dp(10),dp(8),dp(10)); v.setBackgroundColor(Color.rgb(23,33,58));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(44), 1); lp.setMargins(dp(2),0,dp(2),0); v.setLayoutParams(lp);
        return v;
    }

    private void buildUi() {
        LinearLayout root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(Color.rgb(11,16,32));
        LinearLayout bar = new LinearLayout(this); bar.setOrientation(LinearLayout.HORIZONTAL); bar.setPadding(dp(4),dp(4),dp(4),dp(4)); bar.setBackgroundColor(Color.rgb(11,16,32));
        TextView war = makeBtn("WAR ROOM"), ar = makeBtn("J&J AR"), scan = makeBtn("SCAN AR"), set = makeBtn("SETTINGS");
        bar.addView(war); bar.addView(ar); bar.addView(scan); bar.addView(set); root.addView(bar);
        status = new TextView(this); status.setTextColor(Color.rgb(170,185,214)); status.setTextSize(11); status.setPadding(dp(10),dp(5),dp(10),dp(5)); status.setText("Ready"); root.addView(status);
        web = new WebView(this); web.setLayoutParams(new LinearLayout.LayoutParams(-1,0,1)); root.addView(web); setContentView(root);

        WebSettings s = web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(true); s.setAllowContentAccess(true); s.setLoadWithOverviewMode(true); s.setUseWideViewPort(true); s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        CookieManager.getInstance().setAcceptCookie(true); CookieManager.getInstance().setAcceptThirdPartyCookies(web,true);
        web.setWebViewClient(new WebViewClient(){ @Override public void onPageFinished(WebView v,String url){ status.setText(url); } });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> cb, FileChooserParams p){
                if(fileCallback!=null) fileCallback.onReceiveValue(null); fileCallback=cb;
                Intent i = p.createIntent(); i.addCategory(Intent.CATEGORY_OPENABLE); i.setType("*/*");
                i.putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"image/*","application/pdf","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel","text/csv","text/plain"});
                try{ startActivityForResult(i,FILE_CHOOSER); return true; }catch(Exception e){ fileCallback=null; Toast.makeText(MainActivity.this,"No file picker available",Toast.LENGTH_LONG).show(); return false; }
            }
        });
        war.setOnClickListener(v->openWarRoom());
        ar.setOnClickListener(v->web.loadUrl("https://jandj.pages.dev/"));
        scan.setOnClickListener(v->scanArTable());
        set.setOnClickListener(v->showServerDialog(false));
    }

    private String normalizedServer(){ String u=serverUrl.trim(); if(!u.startsWith("http://")&&!u.startsWith("https://")) u="http://"+u; return u.replaceAll("/$",""); }

    private void openWarRoom(){ if(serverUrl.isEmpty()){ showServerDialog(true); return; } String u=normalizedServer(); web.loadUrl(u); status.setText("Connecting to "+u); }

    private void showServerDialog(boolean required){
        EditText e=new EditText(this); e.setHint("http://192.168.1.42:3000"); e.setSingleLine(true); e.setText(serverUrl); e.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_URI); e.setSelectAllOnFocus(true);
        AlertDialog d=new AlertDialog.Builder(this).setTitle("War Room server address").setMessage("On the PC running J&J War Room, use the 'Phone same Wi-Fi' address shown in the black server window.").setView(e)
            .setPositiveButton("SAVE & CONNECT",(x,w)->{ serverUrl=e.getText().toString().trim().replaceAll("/$",""); prefs.edit().putString("server_url",serverUrl).apply(); openWarRoom(); })
            .setNegativeButton(required?"J&J SITE":"CANCEL",(x,w)->{ if(required) web.loadUrl("https://jandj.pages.dev/"); }).create();
        d.setCanceledOnTouchOutside(!required); d.show();
    }

    private void scanArTable(){
        String js="(function(){function c(s){return (s||'').replace(/\\s+/g,' ').trim()}var rows=[],seen={};function add(cells){cells=cells.map(c);if(cells.length<2)return;var owner=cells[0]||'';var resource=cells[1]||'';if(!resource)return;var k=(owner+'|'+resource).toLowerCase();if(seen[k])return;seen[k]=1;rows.push({owner:owner,resource:resource,status:owner?'Owned':'Available'})}document.querySelectorAll('table tr').forEach(function(tr){add(Array.from(tr.querySelectorAll(':scope>td,:scope>th')).map(function(x){return x.innerText}))});document.querySelectorAll('[role=row]').forEach(function(r){add(Array.from(r.querySelectorAll('[role=gridcell],[role=cell]')).map(function(x){return x.innerText}))});return JSON.stringify(rows)})()";
        web.evaluateJavascript(js,value->{
            String out=value;
            if(out==null||out.equals("null")||out.equals("\"[]\"")){ Toast.makeText(this,"No AR table rows found. Open the AR Resource table first.",Toast.LENGTH_LONG).show(); return; }
            if(out.startsWith("\"")&&out.endsWith("\"")) out=out.substring(1,out.length()-1).replace("\\\"","\"").replace("\\\\","\\");
            final String snapshot=out;
            new AlertDialog.Builder(this).setTitle("AR scan complete").setMessage("Captured the visible J&J resource rows. Copy the snapshot into ChatGPT for owned/available analysis.")
                .setPositiveButton("COPY",(d,w)->{ ClipboardManager cm=(ClipboardManager)getSystemService(CLIPBOARD_SERVICE); cm.setPrimaryClip(ClipData.newPlainText("J&J AR Snapshot",snapshot)); Toast.makeText(this,"AR snapshot copied",Toast.LENGTH_SHORT).show(); })
                .setNeutralButton("WAR ROOM",(d,w)->openWarRoom()).setNegativeButton("CLOSE",null).show();
        });
    }

    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);
        if(request==FILE_CHOOSER){ Uri[] uris=null; if(result==RESULT_OK&&data!=null){ if(data.getClipData()!=null){ int n=data.getClipData().getItemCount(); uris=new Uri[n]; for(int i=0;i<n;i++) uris[i]=data.getClipData().getItemAt(i).getUri(); } else if(data.getData()!=null) uris=new Uri[]{data.getData()}; } if(fileCallback!=null){ fileCallback.onReceiveValue(uris); fileCallback=null; } }
    }

    @Override protected void onNewIntent(Intent intent){ super.onNewIntent(intent); setIntent(intent); handleIncomingShare(intent); }

    private void handleIncomingShare(Intent intent){
        if(intent==null) return; String action=intent.getAction();
        if(Intent.ACTION_SEND.equals(action)){ Uri u=intent.getParcelableExtra(Intent.EXTRA_STREAM); if(u!=null) confirmShareUpload(Collections.singletonList(u)); }
        else if(Intent.ACTION_SEND_MULTIPLE.equals(action)){ ArrayList<Uri> us=intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM); if(us!=null&&!us.isEmpty()) confirmShareUpload(us); }
    }

    private void confirmShareUpload(List<Uri> uris){
        if(serverUrl.isEmpty()){ Toast.makeText(this,"Set the War Room server address first, then share again.",Toast.LENGTH_LONG).show(); showServerDialog(true); return; }
        new AlertDialog.Builder(this).setTitle("Send to Trade Center?").setMessage("Upload "+uris.size()+" shared file"+(uris.size()==1?"":"s")+" directly into the Trade Center?")
            .setPositiveButton("UPLOAD",(d,w)->uploadUris(uris)).setNegativeButton("CANCEL",null).show();
    }

    private void uploadUris(List<Uri> uris){
        status.setText("Uploading to Trade Center…");
        new Thread(()->{ int ok=0; String err=""; for(Uri uri:uris){ try{ uploadOne(uri); ok++; }catch(Exception e){ err=e.getMessage(); } } int count=ok; String error=err; runOnUiThread(()->{ status.setText("Trade upload: "+count+"/"+uris.size()+" complete"); Toast.makeText(this,count+" file(s) uploaded"+(error.isEmpty()?"":" — "+error),Toast.LENGTH_LONG).show(); openWarRoom(); }); }).start();
    }

    private void uploadOne(Uri uri) throws Exception {
        byte[] bytes=readAll(uri,25*1024*1024); String name=getName(uri); String mime=getContentResolver().getType(uri); if(mime==null)mime=guessMime(name);
        String b64=Base64.encodeToString(bytes,Base64.NO_WRAP); String json="{\"name\":\""+jsonEsc(name)+"\",\"mime\":\""+jsonEsc(mime)+"\",\"data\":\""+b64+"\"}";
        URL url=new URL(normalizedServer()+"/api/trade-files"); HttpURLConnection c=(HttpURLConnection)url.openConnection(); c.setConnectTimeout(8000); c.setReadTimeout(30000); c.setRequestMethod("POST"); c.setDoOutput(true); c.setRequestProperty("Content-Type","application/json; charset=utf-8"); byte[] body=json.getBytes(StandardCharsets.UTF_8); c.setFixedLengthStreamingMode(body.length); try(OutputStream os=c.getOutputStream()){ os.write(body); } int code=c.getResponseCode(); c.disconnect(); if(code<200||code>=300) throw new IOException("Server returned "+code);
    }

    private byte[] readAll(Uri uri,int max) throws Exception { try(InputStream in=getContentResolver().openInputStream(uri); ByteArrayOutputStream out=new ByteArrayOutputStream()){ byte[] b=new byte[8192]; int n,total=0; while((n=in.read(b))!=-1){ total+=n; if(total>max) throw new IOException("File exceeds 25 MB"); out.write(b,0,n); } return out.toByteArray(); } }
    private String getName(Uri uri){ String name="shared-file"; Cursor cur=getContentResolver().query(uri,null,null,null,null); if(cur!=null){ try{ int i=cur.getColumnIndex(OpenableColumns.DISPLAY_NAME); if(i>=0&&cur.moveToFirst()) name=cur.getString(i); } finally{ cur.close(); } } return name==null?"shared-file":name; }
    private String guessMime(String n){ String s=n.toLowerCase(); if(s.endsWith(".pdf"))return "application/pdf"; if(s.endsWith(".xlsx"))return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; if(s.endsWith(".xls"))return "application/vnd.ms-excel"; if(s.endsWith(".csv"))return "text/csv"; if(s.endsWith(".png"))return "image/png"; if(s.endsWith(".webp"))return "image/webp"; return "image/jpeg"; }
    private String jsonEsc(String s){ return s.replace("\\","\\\\").replace("\"","\\\""); }

    @Override public void onBackPressed(){ if(web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}
