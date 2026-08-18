import base from './index.js';

const STORE_IDS=['walmart','amazon','target','bestbuy','ebay','homedepot','lowes','costco','samsclub','etsy','newegg','chewy','wayfair','giantfood','giantpa','kroger','albertsons','safeway','publix','aldi','wegmans','shoprite','foodlion','stopandshop','heb','meijer','sprouts','wholefoods','harristeeter','gianteagle','acme','weis','cvs','walgreens','dollargeneral','dollartree','bjs','staples','officedepot','bhphoto','microcenter','gamestop','acehardware','harborfreight','tractorsupply','menards','ikea','michaels','petco','petsmart','dicks','academy','rei','scheels','basspro','cabelas','ulta','sephora','kohls','macys','nordstrom','jcpenney','autozone','advanceauto','oreilly','riteaid','sallybeauty','fivebelow','familydollar','apple','samsung','dell','lenovo','hp','nike','adidas','underarmour','oldnavy','gap','footlocker','zappos','dsw','finishline','skechers','crocs','bathbodyworks','victoriassecret','lululemon','northerntool','grainger','fastenal','ruralking','fleetfarm','sportsmans','backcountry','llbean','patagonia','thenorthface','columbia','athome','potterybarn','westelm','cratebarrel','worldmarket','williamssonoma','surlatable','ashley','roomstogo','napa','tirerack','carparts','barnesnoble','booksamillion','boscovs','hobbylobby'];
const STORE_SET=new Set(STORE_IDS);
const HEADERS={'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','access-control-allow-headers':'content-type','access-control-allow-methods':'GET,POST,OPTIONS'};
const RULES=[
  [/\b(dog|cat|pet|puppy|kitten|pet food|litter)\b/i,'chewy'],
  [/\b(tire|brake|wiper|spark plug|oil filter|car part|auto part)\b/i,'autozone'],
  [/\b(laptop|desktop|gaming pc|computer part|ssd|graphics card|gpu|cpu|monitor)\b/i,'microcenter'],
  [/\b(iphone|ipad|macbook|apple watch|airpods)\b/i,'apple'],
  [/\b(galaxy|samsung phone|samsung tablet)\b/i,'samsung'],
  [/\b(drill|saw|socket|wrench|tool|lumber|plumbing|electrical|hardware|paint)\b/i,'homedepot'],
  [/\b(industrial|fastener|bolt|bearing|shop supply|warehouse supply)\b/i,'grainger'],
  [/\b(camp|camping|hiking|backpack|tent|kayak|fishing|outdoor|ski|snowboard)\b/i,'rei'],
  [/\b(shoe|sneaker|running shoe|boot)\b/i,'dsw'],
  [/\b(makeup|mascara|foundation|skincare|face wash|beauty|perfume)\b/i,'ulta'],
  [/\b(shampoo|conditioner|hair color|hair dye|salon)\b/i,'sallybeauty'],
  [/\b(sofa|couch|bedroom|dresser|dining table|furniture|rug|home decor)\b/i,'wayfair'],
  [/\b(pan|cookware|knife|kitchen gadget|bakeware)\b/i,'williamssonoma'],
  [/\b(book|novel|textbook|manga)\b/i,'barnesnoble'],
  [/\b(craft|yarn|scrapbook|art supplies)\b/i,'michaels'],
  [/\b(printer paper|ink cartridge|office chair|office supplies|folders)\b/i,'staples'],
  [/\b(grocery|groceries|recipe|dinner|breakfast|lunch|milk|eggs|bread|produce|meat|chicken|beef)\b/i,'walmart']
];

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS})}
export function localBestStore(text){for(const [re,id] of RULES)if(re.test(String(text||'')))return id;return 'walmart'}
function parseJson(value){const raw=typeof value==='string'?value:value?.response??value?.result??'';if(raw&&typeof raw==='object')return raw;const text=String(raw||'').trim();try{return JSON.parse(text)}catch{}const a=text.indexOf('{'),b=text.lastIndexOf('}');if(a>=0&&b>a){try{return JSON.parse(text.slice(a,b+1))}catch{}}return null}
export async function recommendStore(command,env){
  const fallback=localBestStore(command);
  if(!env?.AI)return {ok:true,retailer:fallback,source:'smart-offline',reason:'Matched by shopping category.'};
  try{
    const prompt=`You are AutoCart Best Store. Choose the single most appropriate retailer for the user's request based on retailer specialization and product fit only. Do not claim live price, inventory, shipping, rating, or availability unless the user supplied it. Return strict JSON only: {"retailer":"store_id","reason":"short reason"}. Allowed store IDs: ${STORE_IDS.join(', ')}. User request: ${String(command||'').slice(0,5000)}`;
    const result=await env.AI.run(env.AI_MODEL||'@cf/meta/llama-3.1-8b-instruct',{prompt});
    const parsed=parseJson(result);const id=String(parsed?.retailer||'').trim().toLowerCase();
    if(STORE_SET.has(id))return {ok:true,retailer:id,source:'workers-ai',reason:String(parsed?.reason||'AI matched the request to this retailer.')};
  }catch(error){console.error(JSON.stringify({event:'best_store_ai_failed',message:error?.message||String(error)}))}
  return {ok:true,retailer:fallback,source:'smart-offline',reason:'AI was unavailable, so AutoCart used category matching.'};
}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(url.pathname==='/api/store-recommendation'){
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:HEADERS});
    if(request.method!=='POST')return json({ok:false,error:'POST required'},405);
    let body;try{body=await request.json()}catch{return json({ok:false,error:'Invalid JSON'},400)}
    const command=String(body?.command||'').trim();if(!command)return json({ok:false,error:'command is required'},400);
    return json(await recommendStore(command,env));
  }
  return base.fetch(request,env,ctx);
}};