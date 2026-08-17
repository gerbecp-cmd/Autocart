(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.AutoCartCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const RETAILER_META={
    walmart:{label:'Walmart',aliases:['walmart','wal mart'],base:'https://www.walmart.com/search?q=',mode:'query'},
    amazon:{label:'Amazon',aliases:['amazon'],base:'https://www.amazon.com/s?k=',mode:'query'},
    target:{label:'Target',aliases:['target'],base:'https://www.target.com/s?searchTerm=',mode:'query'},
    bestbuy:{label:'Best Buy',aliases:['best buy','bestbuy'],base:'https://www.bestbuy.com/site/searchpage.jsp?st=',mode:'query'},
    ebay:{label:'eBay',aliases:['ebay'],base:'https://www.ebay.com/sch/i.html?_nkw=',mode:'query'},
    homedepot:{label:'Home Depot',aliases:['home depot'],base:'https://www.homedepot.com/s/',mode:'path'},
    lowes:{label:"Lowe's",aliases:["lowe's",'lowes'],base:'https://www.lowes.com/search?searchTerm=',mode:'query'},
    costco:{label:'Costco',aliases:['costco'],base:'https://www.costco.com/CatalogSearch?keyword=',mode:'query'},
    samsclub:{label:"Sam's Club",aliases:["sam's club",'sams club'],base:'https://www.samsclub.com/s/',mode:'path'},
    etsy:{label:'Etsy',aliases:['etsy'],base:'https://www.etsy.com/search?q=',mode:'query'},
    newegg:{label:'Newegg',aliases:['newegg'],base:'https://www.newegg.com/p/pl?d=',mode:'query'},
    chewy:{label:'Chewy',aliases:['chewy'],base:'https://www.chewy.com/s?query=',mode:'query'},
    wayfair:{label:'Wayfair',aliases:['wayfair'],base:'https://www.wayfair.com/keyword.php?keyword=',mode:'query'},

    giantfood:{label:'Giant Food',aliases:['giant food maryland','giant food dc','giant food'],base:'https://giantfood.com/product-search/',mode:'path'},
    giantpa:{label:'GIANT',aliases:['giant foods','giant food stores','the giant company','giant pa','giant'],base:'https://giantfoodstores.com/product-search/',mode:'path'},
    kroger:{label:'Kroger',aliases:['kroger'],base:'https://www.kroger.com/search?query=',mode:'query'},
    albertsons:{label:'Albertsons',aliases:['albertsons'],base:'https://www.albertsons.com/shop/search-results.html?q=',mode:'query'},
    safeway:{label:'Safeway',aliases:['safeway'],base:'https://www.safeway.com/shop/search-results.html?q=',mode:'query'},
    publix:{label:'Publix',aliases:['publix'],base:'https://www.publix.com/search?searchTerm=',mode:'query'},
    aldi:{label:'ALDI',aliases:['aldi'],base:'https://www.aldi.us/results?q=',mode:'query'},
    wegmans:{label:'Wegmans',aliases:['wegmans'],base:'https://shop.wegmans.com/search?search_term=',mode:'query'},
    shoprite:{label:'ShopRite',aliases:['shoprite','shop rite'],base:'https://www.shoprite.com/sm/pickup/rsid/3000/results?q=',mode:'query'},
    foodlion:{label:'Food Lion',aliases:['food lion'],base:'https://www.foodlion.com/groceries/search?searchTerm=',mode:'query'},
    stopandshop:{label:'Stop & Shop',aliases:['stop & shop','stop and shop'],base:'https://stopandshop.com/product-search/',mode:'path'},
    heb:{label:'H-E-B',aliases:['h-e-b','heb'],base:'https://www.heb.com/search/?q=',mode:'query'},
    meijer:{label:'Meijer',aliases:['meijer'],base:'https://www.meijer.com/shopping/search.html?text=',mode:'query'},
    sprouts:{label:'Sprouts',aliases:['sprouts'],base:'https://shop.sprouts.com/search?search_term=',mode:'query'},
    wholefoods:{label:'Whole Foods',aliases:['whole foods market','whole foods'],base:'https://www.wholefoodsmarket.com/search?text=',mode:'query'},
    harristeeter:{label:'Harris Teeter',aliases:['harris teeter'],base:'https://www.harristeeter.com/search?query=',mode:'query'},
    gianteagle:{label:'Giant Eagle',aliases:['giant eagle'],base:'https://www.gianteagle.com/grocery/search?text=',mode:'query'},
    acme:{label:'ACME Markets',aliases:['acme markets','acme'],base:'https://www.acmemarkets.com/shop/search-results.html?q=',mode:'query'},
    weis:{label:'Weis Markets',aliases:['weis markets','weis'],base:'https://shop.weismarkets.com/search?search_term=',mode:'query'}
  };
  const RETAILERS=Object.keys(RETAILER_META);
  const GROCERY_RETAILERS=['giantpa','giantfood','wegmans','shoprite','acme','weis','kroger','albertsons','safeway','publix','aldi','foodlion','stopandshop','heb','meijer','sprouts','wholefoods','harristeeter','gianteagle','walmart','target','costco','samsclub'];
  const PANTRY=new Set(['salt','black pepper','pepper','olive oil','vegetable oil','cooking oil','water']);

  const RECIPES={
    'chicken parmesan':{aliases:['chicken parm','chicken parmesan'],items:[['boneless skinless chicken breasts','chicken breast family pack','1.5 lb'],['eggs','large eggs dozen','2'],['italian breadcrumbs','italian seasoned breadcrumbs','1.5 cups'],['parmesan cheese','grated parmesan cheese','0.75 cup'],['marinara sauce','marinara pasta sauce 24 oz','24 oz'],['mozzarella cheese','shredded mozzarella cheese 8 oz','8 oz'],['spaghetti','spaghetti pasta 16 oz','16 oz'],['olive oil','olive oil','2 tbsp'],['garlic','fresh garlic bulb','2 cloves'],['basil','fresh basil','optional']]},
    'beef tacos':{aliases:['tacos','beef tacos'],items:[['ground beef','ground beef 80 20 1 lb','1.5 lb'],['taco seasoning','taco seasoning packet','1 packet'],['tortillas','soft flour tortillas 10 count','10'],['shredded cheese','mexican blend shredded cheese 8 oz','8 oz'],['lettuce','shredded lettuce','1 bag'],['tomatoes','roma tomatoes','2'],['sour cream','sour cream 16 oz','8 oz'],['salsa','medium salsa 16 oz','1 jar']]},
    'chicken alfredo':{aliases:['chicken alfredo','alfredo'],items:[['boneless skinless chicken breasts','chicken breast family pack','1.5 lb'],['fettuccine','fettuccine pasta 16 oz','16 oz'],['alfredo sauce','alfredo pasta sauce 15 oz','2 jars'],['parmesan cheese','grated parmesan cheese','0.5 cup'],['broccoli','fresh broccoli crowns','1 lb'],['garlic','fresh garlic bulb','2 cloves']]},
    'lasagna':{aliases:['lasagna','lasagne'],items:[['ground beef','ground beef 80 20 1 lb','1 lb'],['lasagna noodles','lasagna pasta noodles 16 oz','16 oz'],['marinara sauce','marinara pasta sauce 24 oz','2 jars'],['ricotta cheese','whole milk ricotta cheese 15 oz','15 oz'],['mozzarella cheese','shredded mozzarella cheese 16 oz','16 oz'],['parmesan cheese','grated parmesan cheese','0.5 cup'],['eggs','large eggs dozen','1']]},
    'smash burgers':{aliases:['smash burgers','smashburger','smash burger'],items:[['ground beef','ground beef 80 20 2 lb','2 lb'],['burger buns','hamburger buns 8 count','8'],['american cheese','american cheese slices','8 slices'],['onion','yellow onion','1'],['pickles','hamburger dill pickle chips','1 jar'],['ketchup','ketchup','1 bottle'],['mustard','yellow mustard','1 bottle']]},
    'beef chili':{aliases:['beef chili','chili'],items:[['ground beef','ground beef 80 20 2 lb','2 lb'],['kidney beans','kidney beans 15 oz can','2 cans'],['diced tomatoes','diced tomatoes 14.5 oz can','2 cans'],['tomato sauce','tomato sauce 15 oz can','1 can'],['chili seasoning','chili seasoning packet','1 packet'],['onion','yellow onion','1'],['shredded cheese','cheddar shredded cheese 8 oz','8 oz']]},
    'meatloaf':{aliases:['meatloaf'],items:[['ground beef','ground beef 80 20 2 lb','2 lb'],['eggs','large eggs dozen','2'],['breadcrumbs','plain breadcrumbs','1 cup'],['milk','whole milk half gallon','0.5 cup'],['ketchup','ketchup','1 bottle'],['onion','yellow onion','1']]},
    'baked ziti':{aliases:['baked ziti','ziti'],items:[['ziti pasta','ziti pasta 16 oz','16 oz'],['ground beef','ground beef 80 20 1 lb','1 lb'],['marinara sauce','marinara pasta sauce 24 oz','2 jars'],['ricotta cheese','whole milk ricotta cheese 15 oz','15 oz'],['mozzarella cheese','shredded mozzarella cheese 16 oz','16 oz'],['parmesan cheese','grated parmesan cheese','0.5 cup']]}
  };

  function norm(s){return String(s||'').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim()}
  function retailerLabel(id){return RETAILER_META[id]?.label||id}
  function retailerFrom(text){const t=norm(text);const ids=RETAILERS.slice().sort((a,b)=>Math.max(...RETAILER_META[b].aliases.map(x=>x.length))-Math.max(...RETAILER_META[a].aliases.map(x=>x.length)));for(const id of ids){if(RETAILER_META[id].aliases.some(a=>t.includes(a)))return id}return 'walmart'}
  function parseNumber(re,text,fallback){const m=norm(text).match(re);return m?Number(m[1]):fallback}
  function parseExclusions(text){const t=norm(text),out=[];const re=/(?:\bno\b|\bwithout\b)\s+([^,.;]+?)(?=\s+(?:and|under|for|at|from|to|skip|cheapest|name brand)\b|[,.;]|$)/g;let m;while((m=re.exec(t)))out.push(m[1].trim());return out}
  function parseCommand(text){const t=norm(text);return {raw:String(text||''),retailer:retailerFrom(t),servings:parseNumber(/\bfor\s+(\d{1,2})(?:\s+(?:people|persons|guests|adults|kids))?\b/,t,4),budget:parseNumber(/\b(?:under|max(?:imum)?|budget(?: of)?)\s*\$?\s*(\d+(?:\.\d{1,2})?)/,t,null),skipPantry:/\bskip\s+(?:the\s+)?pantry(?:\s+staples)?\b|\bno\s+pantry\s+staples\b/.test(t),cheapest:/\bcheapest\b|\blowest price\b|\bbudget\b/.test(t),nameBrand:/\bname[- ]brand\b|\bname brand only\b/.test(t),exclusions:parseExclusions(t)} }
  function recipeFrom(text){const t=norm(text);for(const [key,r] of Object.entries(RECIPES)){if(r.aliases.some(a=>t.includes(a)))return key}return null}
  function excluded(name,exclusions){const n=norm(name);return exclusions.some(x=>n.includes(norm(x))||norm(x).includes(n))}
  function buildOfflinePlan(text){const prefs=parseCommand(text),key=recipeFrom(text);if(!key)return {ok:false,needsAI:true,error:'This recipe is outside the offline library. Connect the AutoCart AI Worker and try again.',prefs};const recipe=RECIPES[key];let items=recipe.items.map(([name,searchTerm,amount])=>({name,searchTerm,amount,quantity:1}));items=items.filter(i=>!excluded(i.name,prefs.exclusions));if(prefs.skipPantry)items=items.filter(i=>!PANTRY.has(norm(i.name)));return {ok:true,source:'offline',title:key.replace(/\b\w/g,c=>c.toUpperCase()),servings:prefs.servings,budget:prefs.budget,retailer:prefs.retailer,preferences:prefs,items}}

  function parseListItem(raw){
    let text=String(raw||'').replace(/^[-*•]\s*/,'').trim();
    if(!text)return null;
    let quantity=1,amount='1 item';
    const lead=text.match(/^(\d+(?:\.\d+)?)\s*(?:x|×)?\s+(.+)$/i);
    if(lead){quantity=Math.max(1,Number(lead[1])||1);text=lead[2].trim();amount=String(quantity)}
    const pipe=text.split(/\s*[|;]\s*/);
    if(pipe.length>1){text=pipe[0].trim();amount=pipe.slice(1).join(' ').trim()||amount}
    return {name:text,searchTerm:text,amount,quantity};
  }
  function buildListPlan(lines,retailer='walmart',source='manual-list'){
    const id=RETAILERS.includes(retailer)?retailer:'walmart';
    const items=(Array.isArray(lines)?lines:String(lines||'').split(/\r?\n/)).map(parseListItem).filter(Boolean);
    return items.length?{ok:true,source,title:'Shopping List',servings:1,budget:null,retailer:id,preferences:{},items}:{ok:false,error:'Add at least one shopping-list item.'};
  }

  function handoffUrl(retailer,term){const id=RETAILERS.includes(retailer)?retailer:'walmart',meta=RETAILER_META[id],q=encodeURIComponent(String(term||'').trim());return meta.base+(meta.mode==='path'?q:q)}
  function normalizeRemote(data,text){if(!data||typeof data!=='object')return buildOfflinePlan(text);const prefs=parseCommand(text);const items=Array.isArray(data.items)?data.items.map(i=>({name:String(i.name||i.ingredient||i.searchTerm||'Item'),searchTerm:String(i.searchTerm||i.search_term||i.name||i.ingredient||'').replace(/\s+/g,' ').trim(),amount:String(i.amount||i.requiredAmount||''),quantity:Number(i.quantity||1)||1})).filter(i=>i.searchTerm):[];if(!items.length)return buildOfflinePlan(text);return {ok:true,source:data.source||'ai',title:data.title||data.recipe||'AutoCart Plan',servings:Number(data.servings||prefs.servings)||prefs.servings,budget:data.budget??prefs.budget,retailer:RETAILERS.includes(data.retailer)?data.retailer:prefs.retailer,preferences:prefs,items:items.filter(i=>!excluded(i.name,prefs.exclusions)).filter(i=>!(prefs.skipPantry&&PANTRY.has(norm(i.name))))}}
  function normalizeImportedPlan(data,retailer='walmart'){const id=RETAILERS.includes(data?.retailer)?data.retailer:(RETAILERS.includes(retailer)?retailer:'walmart');const items=Array.isArray(data?.items)?data.items.map(i=>({name:String(i.name||i.searchTerm||'Item').trim(),searchTerm:String(i.searchTerm||i.name||'').trim(),amount:String(i.amount||'1 item'),quantity:Number(i.quantity||1)||1})).filter(i=>i.searchTerm):[];return items.length?{ok:true,source:data.source||'file-import',title:data.title||'Imported Shopping List',servings:1,budget:null,retailer:id,preferences:{},items}:{ok:false,error:data?.error||'No shopping items were found in that file.'}}
  function makeQueue(plan){return (plan.items||[]).map((item,index)=>({...item,index,retailer:plan.retailer,url:handoffUrl(plan.retailer,item.searchTerm)}))}

  return {RETAILERS,RETAILER_META,GROCERY_RETAILERS,RECIPES,retailerLabel,parseCommand,recipeFrom,buildOfflinePlan,buildListPlan,handoffUrl,normalizeRemote,normalizeImportedPlan,makeQueue};
});
