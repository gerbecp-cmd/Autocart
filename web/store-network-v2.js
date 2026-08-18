(function(root,factory){
  const core=(typeof module==='object'&&module.exports)?require('./autocart-core.js'):root.AutoCartCore;
  const expansion=(typeof module==='object'&&module.exports)?require('./store-expansion.js'):root.AutoCartStoreExpansion;
  const api=factory(core,expansion,typeof document!=='undefined'?document:null);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.AutoCartStoreNetwork=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(core,expansion,doc){
  'use strict';
  if(!core)throw new Error('AutoCartCore is required');

  const ADDITIONS={
    riteaid:{label:'Rite Aid',aliases:['rite aid','riteaid'],base:'https://www.riteaid.com/shop/catalogsearch/result/?q=',mode:'query'},
    sallybeauty:{label:'Sally Beauty',aliases:['sally beauty','sallybeauty'],base:'https://www.sallybeauty.com/search-show?q=',mode:'query'},
    fivebelow:{label:'Five Below',aliases:['five below'],base:'https://www.fivebelow.com/search?q=',mode:'query'},
    familydollar:{label:'Family Dollar',aliases:['family dollar'],base:'https://www.familydollar.com/searchresults?Ntt=',mode:'query'},
    apple:{label:'Apple Store',aliases:['apple store'],base:'https://www.apple.com/us/search/',mode:'path'},
    samsung:{label:'Samsung',aliases:['samsung'],base:'https://www.samsung.com/us/search/searchMain/?searchTerm=',mode:'query'},
    dell:{label:'Dell',aliases:['dell'],base:'https://www.dell.com/en-us/search/',mode:'path'},
    lenovo:{label:'Lenovo',aliases:['lenovo'],base:'https://www.lenovo.com/us/en/search?text=',mode:'query'},
    hp:{label:'HP',aliases:['hp store','hewlett packard'],base:'https://www.hp.com/us-en/shop/sitesearch?keyword=',mode:'query'},
    nike:{label:'Nike',aliases:['nike'],base:'https://www.nike.com/w?q=',mode:'query'},
    adidas:{label:'adidas',aliases:['adidas'],base:'https://www.adidas.com/us/search?q=',mode:'query'},
    underarmour:{label:'Under Armour',aliases:['under armour','underarmour'],base:'https://www.underarmour.com/en-us/search?q=',mode:'query'},
    oldnavy:{label:'Old Navy',aliases:['old navy'],base:'https://oldnavy.gap.com/browse/search.do?searchText=',mode:'query'},
    gap:{label:'Gap',aliases:['gap store'],base:'https://www.gap.com/browse/search.do?searchText=',mode:'query'},
    footlocker:{label:'Foot Locker',aliases:['foot locker','footlocker'],base:'https://www.footlocker.com/search?query=',mode:'query'},
    zappos:{label:'Zappos',aliases:['zappos'],base:'https://www.zappos.com/search?term=',mode:'query'},
    dsw:{label:'DSW',aliases:['dsw designer shoe warehouse','dsw'],base:'https://www.dsw.com/search?query=',mode:'query'},
    finishline:{label:'Finish Line',aliases:['finish line'],base:'https://www.finishline.com/store/_/N-/Ntt-',mode:'path'},
    skechers:{label:'Skechers',aliases:['skechers'],base:'https://www.skechers.com/search/?q=',mode:'query'},
    crocs:{label:'Crocs',aliases:['crocs'],base:'https://www.crocs.com/search?q=',mode:'query'},
    bathbodyworks:{label:'Bath & Body Works',aliases:['bath & body works','bath and body works'],base:'https://www.bathandbodyworks.com/s?q=',mode:'query'},
    victoriassecret:{label:"Victoria's Secret",aliases:["victoria's secret",'victorias secret'],base:'https://www.victoriassecret.com/us/search?q=',mode:'query'},
    lululemon:{label:'lululemon',aliases:['lululemon'],base:'https://shop.lululemon.com/search?Ntt=',mode:'query'},
    northerntool:{label:'Northern Tool + Equipment',aliases:['northern tool and equipment','northern tool'],base:'https://www.northerntool.com/products?keyword=',mode:'query'},
    grainger:{label:'Grainger',aliases:['grainger'],base:'https://www.grainger.com/search?searchQuery=',mode:'query'},
    fastenal:{label:'Fastenal',aliases:['fastenal'],base:'https://www.fastenal.com/product?query=',mode:'query'},
    ruralking:{label:'Rural King',aliases:['rural king'],base:'https://www.ruralking.com/catalogsearch/result/?q=',mode:'query'},
    fleetfarm:{label:'Fleet Farm',aliases:['fleet farm'],base:'https://www.fleetfarm.com/search?Ntt=',mode:'query'},
    sportsmans:{label:"Sportsman's Warehouse",aliases:["sportsman's warehouse",'sportsmans warehouse'],base:'https://www.sportsmans.com/search/?text=',mode:'query'},
    backcountry:{label:'Backcountry',aliases:['backcountry'],base:'https://www.backcountry.com/search?s=u&q=',mode:'query'},
    llbean:{label:'L.L.Bean',aliases:['l.l.bean','ll bean','llbean'],base:'https://www.llbean.com/llb/search/?freeText=',mode:'query'},
    patagonia:{label:'Patagonia',aliases:['patagonia'],base:'https://www.patagonia.com/search/?q=',mode:'query'},
    thenorthface:{label:'The North Face',aliases:['the north face','north face'],base:'https://www.thenorthface.com/en-us/search/product?q=',mode:'query'},
    columbia:{label:'Columbia Sportswear',aliases:['columbia sportswear','columbia'],base:'https://www.columbia.com/search?q=',mode:'query'},
    athome:{label:'At Home',aliases:['at home store'],base:'https://www.athome.com/search/?q=',mode:'query'},
    potterybarn:{label:'Pottery Barn',aliases:['pottery barn'],base:'https://www.potterybarn.com/search/results.html?words=',mode:'query'},
    westelm:{label:'West Elm',aliases:['west elm'],base:'https://www.westelm.com/search/results.html?words=',mode:'query'},
    cratebarrel:{label:'Crate & Barrel',aliases:['crate & barrel','crate and barrel'],base:'https://www.crateandbarrel.com/search?query=',mode:'query'},
    worldmarket:{label:'World Market',aliases:['world market','cost plus world market'],base:'https://www.worldmarket.com/search?q=',mode:'query'},
    williamssonoma:{label:'Williams Sonoma',aliases:['williams sonoma','williams-sonoma'],base:'https://www.williams-sonoma.com/search/results.html?words=',mode:'query'},
    surlatable:{label:'Sur La Table',aliases:['sur la table'],base:'https://www.surlatable.com/search?q=',mode:'query'},
    ashley:{label:'Ashley',aliases:['ashley furniture','ashley'],base:'https://www.ashleyfurniture.com/search/?q=',mode:'query'},
    roomstogo:{label:'Rooms To Go',aliases:['rooms to go'],base:'https://www.roomstogo.com/search?q=',mode:'query'},
    napa:{label:'NAPA Auto Parts',aliases:['napa auto parts','napa'],base:'https://www.napaonline.com/en/search?text=',mode:'query'},
    tirerack:{label:'Tire Rack',aliases:['tire rack','tirerack'],base:'https://www.tirerack.com/search.jsp?search=',mode:'query'},
    carparts:{label:'CarParts.com',aliases:['carparts.com','car parts dot com'],base:'https://www.carparts.com/search?q=',mode:'query'},
    barnesnoble:{label:'Barnes & Noble',aliases:['barnes & noble','barnes and noble'],base:'https://www.barnesandnoble.com/s/',mode:'path'},
    booksamillion:{label:'Books-A-Million',aliases:['books-a-million','books a million'],base:'https://www.booksamillion.com/search?query=',mode:'query'},
    boscovs:{label:"Boscov's",aliases:["boscov's",'boscovs'],base:'https://www.boscovs.com/search?q=',mode:'query'},
    hobbylobby:{label:'Hobby Lobby',aliases:['hobby lobby'],base:'https://www.hobbylobby.com/search/?text=',mode:'query'}
  };

  Object.entries(ADDITIONS).forEach(([id,meta])=>{core.RETAILER_META[id]=meta;if(!core.RETAILERS.includes(id))core.RETAILERS.push(id)});

  const groups=core.RETAILER_GROUPS||(core.RETAILER_GROUPS={});
  groups['Pharmacy & value']=[...new Set([...(groups['Pharmacy & value']||[]),'riteaid','fivebelow','familydollar'])];
  groups['Computers, mobile & electronics']=['apple','samsung','dell','lenovo','hp','bestbuy','newegg','bhphoto','microcenter','gamestop'];
  groups['Clothing, shoes & activewear']=['nike','adidas','underarmour','oldnavy','gap','footlocker','zappos','dsw','finishline','skechers','crocs','lululemon'];
  groups['Beauty & personal care']=['ulta','sephora','sallybeauty','bathbodyworks','victoriassecret'];
  groups['Tools, industrial & farm']=['homedepot','lowes','acehardware','harborfreight','northerntool','grainger','fastenal','tractorsupply','ruralking','fleetfarm','menards'];
  groups['Outdoor & adventure']=['rei','dicks','academy','scheels','basspro','cabelas','sportsmans','backcountry','llbean','patagonia','thenorthface','columbia'];
  groups['Home, furniture & kitchen']=['wayfair','ikea','athome','potterybarn','westelm','cratebarrel','worldmarket','williamssonoma','surlatable','ashley','roomstogo'];
  groups['Auto parts & tires']=['autozone','advanceauto','oreilly','napa','tirerack','carparts'];
  groups['Books, crafts & gifts']=['barnesnoble','booksamillion','michaels','hobbylobby','etsy'];
  groups['Department stores']=['kohls','macys','nordstrom','jcpenney','boscovs'];

  const FAVORITES_KEY='autocartFavoriteStoresV1',RECENTS_KEY='autocartRecentStoresV1';
  function loadArray(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
  function saveArray(key,v){try{localStorage.setItem(key,JSON.stringify(v))}catch{}}
  function favorites(){return loadArray(FAVORITES_KEY).filter(id=>core.RETAILER_META[id])}
  function recents(){return loadArray(RECENTS_KEY).filter(id=>core.RETAILER_META[id]).slice(0,8)}
  function toggleFavorite(id){let list=favorites();list=list.includes(id)?list.filter(x=>x!==id):[id,...list];saveArray(FAVORITES_KEY,list);renderDirectory();return list.includes(id)}
  function recordRecent(id){if(!core.RETAILER_META[id])return;const list=[id,...recents().filter(x=>x!==id)].slice(0,8);saveArray(RECENTS_KEY,list);if(doc)renderDirectory()}

  const CATEGORY_RULES=[
    {re:/\b(dog|cat|pet|puppy|kitten|aquarium|bird food|pet food|litter)\b/i,stores:['chewy','petsmart','petco']},
    {re:/\b(tire|brake|wiper|spark plug|oil filter|car part|auto part|battery for my car)\b/i,stores:['autozone','napa','oreilly']},
    {re:/\b(laptop|desktop|gaming pc|computer part|ssd|graphics card|gpu|cpu|monitor|router)\b/i,stores:['microcenter','bestbuy','newegg']},
    {re:/\b(iphone|ipad|macbook|apple watch|airpods)\b/i,stores:['apple','bestbuy']},
    {re:/\b(galaxy|samsung phone|samsung tablet)\b/i,stores:['samsung','bestbuy']},
    {re:/\b(drill|saw|socket|wrench|tool|lumber|plumbing|electrical|hardware|paint)\b/i,stores:['homedepot','lowes','harborfreight']},
    {re:/\b(industry|industrial|fastener|bolt|bearing|shop supply|warehouse supply)\b/i,stores:['grainger','fastenal','northerntool']},
    {re:/\b(camp|camping|hiking|backpack|tent|kayak|fishing|outdoor|ski|snowboard)\b/i,stores:['rei','cabelas','sportsmans']},
    {re:/\b(shoe|sneaker|running shoe|boot)\b/i,stores:['dsw','zappos','footlocker']},
    {re:/\b(nike|jordan)\b/i,stores:['nike','footlocker']},
    {re:/\b(makeup|mascara|foundation|skincare|face wash|beauty|perfume)\b/i,stores:['ulta','sephora']},
    {re:/\b(shampoo|conditioner|hair color|hair dye|salon)\b/i,stores:['sallybeauty','ulta']},
    {re:/\b(sofa|couch|bedroom|dresser|dining table|furniture|rug|home decor)\b/i,stores:['wayfair','athome','ashley']},
    {re:/\b(pan|cookware|knife|kitchen gadget|bakeware)\b/i,stores:['williamssonoma','surlatable','target']},
    {re:/\b(book|novel|textbook|manga)\b/i,stores:['barnesnoble','booksamillion','amazon']},
    {re:/\b(craft|yarn|paint brush|scrapbook|art supplies)\b/i,stores:['michaels','hobbylobby']},
    {re:/\b(printer paper|ink cartridge|office chair|office supplies|folders|notebook)\b/i,stores:['staples','officedepot']},
    {re:/\b(grocery|groceries|recipe|dinner|breakfast|lunch|milk|eggs|bread|produce|meat|chicken|beef)\b/i,stores:['walmart','giantpa','wegmans']}
  ];
  function bestLocal(text){for(const rule of CATEGORY_RULES){if(rule.re.test(String(text||'')))return rule.stores.find(id=>core.RETAILER_META[id])||'walmart'}return 'walmart'}

  async function recommendStore(text,api){
    const fallback=bestLocal(text);if(!api)return {retailer:fallback,source:'smart-offline'};
    try{const r=await fetch(String(api).replace(/\/$/,'')+'/api/store-recommendation',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({command:String(text||'')})});const d=await r.json();if(r.ok&&d?.ok&&core.RETAILER_META[d.retailer])return {retailer:d.retailer,source:d.source||'ai'};}catch(e){}
    return {retailer:fallback,source:'smart-offline'};
  }

  function setRetailerInCommand(text,id){return expansion?.setRetailerInCommand?expansion.setRetailerInCommand(text,id):(String(text||'').trim()+' at '+core.retailerLabel(id)).trim()}
  async function prepareCommand(text,selected,api){
    if(selected==='__best__'){const picked=await recommendStore(text,api);recordRecent(picked.retailer);return {command:setRetailerInCommand(text,picked.retailer),retailer:picked.retailer,source:picked.source,best:true}}
    if(core.RETAILER_META[selected]){recordRecent(selected);return {command:setRetailerInCommand(text,selected),retailer:selected,source:'selected',best:false}}
    if(/\b(?:at|from|to)\s+apple\b/i.test(String(text||''))){recordRecent('apple');return {command:setRetailerInCommand(text,'apple'),retailer:'apple',source:'command',best:false}}
    const detected=expansion?.detect?.(text);if(detected)recordRecent(detected);return {command:String(text||''),retailer:detected||null,source:'command',best:false};
  }

  function orderedGroups(){const seen=new Set();return Object.entries(groups).map(([name,ids])=>[name,[...new Set(ids)].filter(id=>core.RETAILER_META[id]&&!seen.has(id)&&(seen.add(id),true))]).filter(([,ids])=>ids.length)}
  function fillCommandPicker(){
    if(!doc)return;const select=doc.getElementById('commandRetailer');if(!select)return;const current=select.value;
    select.innerHTML='<option value="">Use store named in command (default Walmart)</option><option value="__best__">✨ Best Store — AutoCart chooses</option>';
    orderedGroups().forEach(([name,ids])=>{if(!ids.length)return;const group=doc.createElement('optgroup');group.label=name;ids.forEach(id=>{const o=doc.createElement('option');o.value=id;o.textContent=core.retailerLabel(id);group.appendChild(o)});select.appendChild(group)});
    if([...select.options].some(o=>o.value===current))select.value=current;
  }

  let directoryMode='all';
  function renderDirectory(){
    if(!doc)return;const directory=doc.getElementById('storeDirectory');if(!directory)return;const search=doc.getElementById('storeSearch');const query=String(search?.value||'').trim().toLowerCase();const fav=new Set(favorites()),recent=recents();let ids=core.RETAILERS.filter(id=>core.RETAILER_META[id]);
    if(directoryMode==='favorites')ids=ids.filter(id=>fav.has(id));if(directoryMode==='recent')ids=recent;
    if(query)ids=ids.filter(id=>{const m=core.RETAILER_META[id];return m.label.toLowerCase().includes(query)||m.aliases.some(a=>a.toLowerCase().includes(query))});
    ids.sort((a,b)=>core.retailerLabel(a).localeCompare(core.retailerLabel(b)));
    if(!ids.length){directory.innerHTML='<div class="store-group">No stores match this view.</div>';return}
    directory.innerHTML=ids.map(id=>`<div class="store-row"><button class="store-pick" data-pick-store="${id}">${core.retailerLabel(id)}</button><button class="store-star" data-fav-store="${id}" aria-label="Favorite ${core.retailerLabel(id)}">${fav.has(id)?'★':'☆'}</button></div>`).join('');
    directory.querySelectorAll('[data-pick-store]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.pickStore;const select=doc.getElementById('commandRetailer');if(select)select.value=id;const box=doc.getElementById('command');if(box)box.value=setRetailerInCommand(box.value,id);recordRecent(id);box?.focus()}));
    directory.querySelectorAll('[data-fav-store]').forEach(b=>b.addEventListener('click',()=>{toggleFavorite(b.dataset.favStore)}));
  }

  function installTools(){
    if(!doc)return;fillCommandPicker();const count=doc.getElementById('storeCount');if(count)count.textContent=String(core.RETAILERS.length);const countText=doc.getElementById('storeCountText');if(countText)countText.textContent=core.RETAILERS.length+'-store network';
    const directory=doc.getElementById('storeDirectory');if(directory&&!doc.getElementById('storeSearch')){const tools=doc.createElement('div');tools.className='store-tools';tools.innerHTML='<input id="storeSearch" type="search" placeholder="Search stores…" aria-label="Search stores"><div class="store-view-buttons"><button class="chip" data-store-view="all">All</button><button class="chip" data-store-view="favorites">★ Favorites</button><button class="chip" data-store-view="recent">Recent</button></div>';directory.parentNode.insertBefore(tools,directory);tools.querySelector('#storeSearch').addEventListener('input',renderDirectory);tools.querySelectorAll('[data-store-view]').forEach(b=>b.addEventListener('click',()=>{directoryMode=b.dataset.storeView;tools.querySelectorAll('[data-store-view]').forEach(x=>x.classList.toggle('active',x===b));renderDirectory()}));}
    renderDirectory();
  }
  if(doc){if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',installTools);else installTools()}

  return {ADDITIONS,bestLocal,recommendStore,prepareCommand,recordRecent,favorites,recents,toggleFavorite,renderDirectory,fillCommandPicker};
});