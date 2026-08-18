(function(root,factory){
  const core=(typeof module==='object'&&module.exports)?require('./autocart-core.js'):root.AutoCartCore;
  const api=factory(core,typeof document!=='undefined'?document:null);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.AutoCartStoreExpansion=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(core,doc){
  'use strict';
  if(!core)throw new Error('AutoCartCore is required');

  const ADDITIONS={
    cvs:{label:'CVS',aliases:['cvs pharmacy','cvs'],base:'https://www.cvs.com/search?searchTerm=',mode:'query'},
    walgreens:{label:'Walgreens',aliases:['walgreens'],base:'https://www.walgreens.com/q/',mode:'path'},
    dollargeneral:{label:'Dollar General',aliases:['dollar general'],base:'https://www.dollargeneral.com/search?q=',mode:'query'},
    dollartree:{label:'Dollar Tree',aliases:['dollar tree'],base:'https://www.dollartree.com/searchresults?Ntt=',mode:'query'},
    bjs:{label:"BJ's Wholesale Club",aliases:["bj's wholesale club",'bjs wholesale','bjs'],base:'https://www.bjs.com/search/',mode:'path'},
    staples:{label:'Staples',aliases:['staples'],base:'https://www.staples.com/search?query=',mode:'query'},
    officedepot:{label:'Office Depot',aliases:['office depot','officedepot'],base:'https://www.officedepot.com/a/search/?q=',mode:'query'},
    bhphoto:{label:'B&H Photo',aliases:['b&h photo video','b&h photo','bh photo','b and h'],base:'https://www.bhphotovideo.com/c/search?Ntt=',mode:'query'},
    microcenter:{label:'Micro Center',aliases:['micro center','microcenter'],base:'https://www.microcenter.com/search/search_results.aspx?Ntt=',mode:'query'},
    gamestop:{label:'GameStop',aliases:['gamestop','game stop'],base:'https://www.gamestop.com/search/?q=',mode:'query'},
    acehardware:{label:'Ace Hardware',aliases:['ace hardware'],base:'https://www.acehardware.com/search?query=',mode:'query'},
    harborfreight:{label:'Harbor Freight',aliases:['harbor freight'],base:'https://www.harborfreight.com/search?q=',mode:'query'},
    tractorsupply:{label:'Tractor Supply',aliases:['tractor supply company','tractor supply','tsc'],base:'https://www.tractorsupply.com/tsc/search/',mode:'path'},
    menards:{label:'Menards',aliases:['menards'],base:'https://www.menards.com/main/search.html?search=',mode:'query'},
    ikea:{label:'IKEA',aliases:['ikea'],base:'https://www.ikea.com/us/en/search/?q=',mode:'query'},
    michaels:{label:'Michaels',aliases:['michaels craft','michaels'],base:'https://www.michaels.com/search?q=',mode:'query'},
    petco:{label:'Petco',aliases:['petco'],base:'https://www.petco.com/shop/en/petcostore/search?query=',mode:'query'},
    petsmart:{label:'PetSmart',aliases:['petsmart','pet smart'],base:'https://www.petsmart.com/search/?q=',mode:'query'},
    dicks:{label:"DICK'S Sporting Goods",aliases:["dick's sporting goods",'dicks sporting goods','dicks'],base:'https://www.dickssportinggoods.com/search/SearchDisplay?searchTerm=',mode:'query'},
    academy:{label:'Academy Sports + Outdoors',aliases:['academy sports and outdoors','academy sports + outdoors','academy sports'],base:'https://www.academy.com/search?searchTerm=',mode:'query'},
    rei:{label:'REI',aliases:['rei co-op','rei'],base:'https://www.rei.com/search?q=',mode:'query'},
    scheels:{label:'SCHEELS',aliases:['scheels'],base:'https://www.scheels.com/search?q=',mode:'query'},
    basspro:{label:'Bass Pro Shops',aliases:['bass pro shops','bass pro'],base:'https://www.basspro.com/l/search?q=',mode:'query'},
    cabelas:{label:"Cabela's",aliases:["cabela's",'cabelas'],base:'https://www.cabelas.com/l/search?q=',mode:'query'},
    ulta:{label:'Ulta Beauty',aliases:['ulta beauty','ulta'],base:'https://www.ulta.com/search?search=',mode:'query'},
    sephora:{label:'Sephora',aliases:['sephora'],base:'https://www.sephora.com/search?keyword=',mode:'query'},
    kohls:{label:"Kohl's",aliases:["kohl's",'kohls'],base:'https://www.kohls.com/search.jsp?search=',mode:'query'},
    macys:{label:"Macy's",aliases:["macy's",'macys'],base:'https://www.macys.com/shop/featured/',mode:'path'},
    nordstrom:{label:'Nordstrom',aliases:['nordstrom'],base:'https://www.nordstrom.com/sr?origin=keywordsearch&keyword=',mode:'query'},
    jcpenney:{label:'JCPenney',aliases:['jcpenney','jc penney','jcp'],base:'https://www.jcpenney.com/s?searchTerm=',mode:'query'},
    autozone:{label:'AutoZone',aliases:['autozone','auto zone'],base:'https://www.autozone.com/searchresult?searchText=',mode:'query'},
    advanceauto:{label:'Advance Auto Parts',aliases:['advance auto parts','advance auto'],base:'https://shop.advanceautoparts.com/web/SearchResults?searchTerm=',mode:'query'},
    oreilly:{label:"O'Reilly Auto Parts",aliases:["o'reilly auto parts",'oreilly auto parts',"o'reilly",'oreilly'],base:'https://www.oreillyauto.com/search?q=',mode:'query'}
  };

  Object.entries(ADDITIONS).forEach(([id,meta])=>{core.RETAILER_META[id]=meta;if(!core.RETAILERS.includes(id))core.RETAILERS.push(id)});

  const GROUPS={
    'Major stores & marketplaces':['walmart','amazon','target','ebay','etsy'],
    'Grocery & warehouse':['giantpa','giantfood','wegmans','shoprite','acme','weis','kroger','albertsons','safeway','publix','aldi','foodlion','stopandshop','heb','meijer','sprouts','wholefoods','harristeeter','gianteagle','costco','samsclub','bjs'],
    'Electronics, gaming & office':['bestbuy','newegg','staples','officedepot','bhphoto','microcenter','gamestop'],
    'Home, hardware & crafts':['homedepot','lowes','wayfair','acehardware','harborfreight','tractorsupply','menards','ikea','michaels'],
    'Pharmacy & value':['cvs','walgreens','dollargeneral','dollartree'],
    'Pet':['chewy','petco','petsmart'],
    'Sports & outdoors':['dicks','academy','rei','scheels','basspro','cabelas'],
    'Beauty & department stores':['ulta','sephora','kohls','macys','nordstrom','jcpenney'],
    'Auto parts':['autozone','advanceauto','oreilly']
  };
  core.RETAILER_GROUPS=GROUPS;

  function escapeRegExp(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
  function aliasMatch(text,alias){return new RegExp('(^|[^a-z0-9])'+escapeRegExp(alias)+'(?=$|[^a-z0-9])','i').test(text)}
  function detect(text){
    const original=String(text||'');const t=original.toLowerCase().replace(/[’']/g,"'");const matches=[];
    Object.entries(core.RETAILER_META).forEach(([id,meta])=>meta.aliases.forEach(a=>{
      const alias=String(a).toLowerCase();
      if(id==='giantpa'&&alias==='giant'){
        if(/\b(?:at|from|to)\s+giant\b/i.test(original)||/\bGIANT\b/.test(original))matches.push({id,len:alias.length});
      }else if(aliasMatch(t,alias))matches.push({id,len:alias.length});
    }));
    matches.sort((a,b)=>b.len-a.len);return matches[0]?.id||null;
  }
  function setRetailerInCommand(text,id){
    if(!core.RETAILER_META[id])return String(text||'');let out=String(text||'').trim();const aliases=[];
    Object.values(core.RETAILER_META).forEach(m=>m.aliases.forEach(a=>aliases.push(a)));
    aliases.sort((a,b)=>b.length-a.length).forEach(a=>{out=out.replace(new RegExp('(^|[^a-z0-9])(?:at|from|to)?\\s*'+escapeRegExp(a)+'(?=$|[^a-z0-9])','ig'),' ').replace(/\s+/g,' ').trim()});
    return (out+' at '+core.retailerLabel(id)).trim();
  }

  const oldParseCommand=core.parseCommand;
  core.parseCommand=function(text){const p=oldParseCommand(text);p.retailer=detect(text)||'walmart';return p};
  const oldBuildOffline=core.buildOfflinePlan;
  core.buildOfflinePlan=function(text){const plan=oldBuildOffline(text);if(plan?.ok){plan.retailer=detect(text)||'walmart';if(plan.preferences)plan.preferences.retailer=plan.retailer}return plan};
  const oldNormalizeRemote=core.normalizeRemote;
  core.normalizeRemote=function(data,text){const plan=oldNormalizeRemote(data,text);const explicit=detect(text);if(plan?.ok&&explicit)plan.retailer=explicit;return plan};
  const oldNormalizeImported=core.normalizeImportedPlan;
  core.normalizeImportedPlan=function(data,retailer){const plan=oldNormalizeImported(data,retailer);if(plan?.ok&&core.RETAILER_META[retailer])plan.retailer=retailer;return plan};

  function populateCommandPicker(){
    if(!doc)return;const select=doc.getElementById('commandRetailer');
    if(select){
      select.innerHTML='<option value="">Use store named in command (default Walmart)</option>';
      Object.entries(GROUPS).forEach(([name,ids])=>{const group=doc.createElement('optgroup');group.label=name;ids.filter(id=>core.RETAILER_META[id]).forEach(id=>{const o=doc.createElement('option');o.value=id;o.textContent=core.retailerLabel(id);group.appendChild(o)});select.appendChild(group)});
      select.addEventListener('change',()=>{if(!select.value)return;const box=doc.getElementById('command');if(box)box.value=setRetailerInCommand(box.value,select.value)});
    }
    const count=doc.getElementById('storeCount');if(count)count.textContent=String(core.RETAILERS.length);
    const countText=doc.getElementById('storeCountText');if(countText)countText.textContent=core.RETAILERS.length+'-store network';
    const directory=doc.getElementById('storeDirectory');if(directory)directory.innerHTML=Object.entries(GROUPS).map(([name,ids])=>`<div class="store-group"><strong>${name}</strong><div>${ids.filter(id=>core.RETAILER_META[id]).map(id=>core.retailerLabel(id)).join(' · ')}</div></div>`).join('');
  }
  if(doc){if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',populateCommandPicker);else populateCommandPicker()}

  return {ADDITIONS,GROUPS,detect,setRetailerInCommand};
});