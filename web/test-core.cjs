const assert=require('assert');
const core=require('./autocart-core.js');
const expansion=require('./store-expansion.js');
const network=require('./store-network-v2.js');

let p=core.buildOfflinePlan('Load chicken parmesan recipe to Walmart for 4 people under $40');
assert(p.ok);assert.equal(p.retailer,'walmart');assert.equal(p.servings,4);assert.equal(p.budget,40);assert(p.items.some(i=>i.searchTerm==='fresh garlic bulb'));assert(!p.items.some(i=>/cloves/.test(i.searchTerm)));
let q=core.makeQueue(p);assert(q.length===p.items.length);assert(q.every(i=>i.url.startsWith('https://www.walmart.com/search?q=')));

p=core.buildOfflinePlan('Load tacos to GIANT for 6 under $35, no sour cream, skip pantry staples');assert(p.ok);assert.equal(p.retailer,'giantpa');assert.equal(p.servings,6);assert(!p.items.some(i=>i.name==='sour cream'));q=core.makeQueue(p);assert(q.every(i=>i.url.startsWith('https://giantfoodstores.com/product-search/')));

p=core.buildListPlan(['Milk','2 Eggs','Bread | 2 loaves'],'wegmans');assert(p.ok);assert.equal(p.retailer,'wegmans');assert.equal(p.items.length,3);assert.equal(p.items[1].quantity,2);assert.equal(p.items[2].amount,'2 loaves');assert(core.handoffUrl('giantfood','bananas').includes('giantfood.com/product-search/bananas'));

assert.equal(core.RETAILERS.length,115);
assert.equal(new Set(core.RETAILERS).size,115);
assert.equal(expansion.detect('get dog food from PetSmart'),'petsmart');
assert.equal(expansion.detect('find a laptop at Micro Center'),'microcenter');
assert.equal(expansion.detect('get a drill from Harbor Freight'),'harborfreight');
assert.equal(expansion.detect('buy shampoo at Walgreens'),'walgreens');
assert.equal(expansion.detect('get brake pads at AutoZone'),'autozone');
assert.equal(expansion.detect('buy shoes at DSW'),'dsw');
assert.equal(expansion.detect('buy a couch from Ashley Furniture'),'ashley');
assert.equal(expansion.detect('get brake pads at NAPA Auto Parts'),'napa');
assert.equal(expansion.detect('buy a book from Barnes & Noble'),'barnesnoble');
assert.equal(expansion.detect('replace my air filter'),null);
assert.equal(expansion.detect('buy a giant inflatable snowman'),null);
assert.equal(expansion.detect('buy groceries at GIANT'),'giantpa');
assert.equal(expansion.detect('skip pantry staples'),null);
assert.equal(expansion.detect('buy printer paper at Staples'),'staples');
assert(core.handoffUrl('walgreens','toothpaste').startsWith('https://www.walgreens.com/q/toothpaste'));
assert(core.handoffUrl('harborfreight','cordless drill').includes('harborfreight.com/search?q=cordless%20drill'));
assert(core.handoffUrl('microcenter','gaming laptop').includes('microcenter.com/search/search_results.aspx?Ntt=gaming%20laptop'));
assert(core.handoffUrl('petco','dog food').includes('petco.com/shop/en/petcostore/search?query=dog%20food'));
assert(core.handoffUrl('rei','camping tent').includes('rei.com/search?q=camping%20tent'));
assert(core.handoffUrl('sephora','face wash').includes('sephora.com/search?keyword=face%20wash'));
assert(core.handoffUrl('oreilly','wiper blades').includes('oreillyauto.com/search?q=wiper%20blades'));
assert(core.handoffUrl('napa','brake pads').includes('napaonline.com/en/search?text=brake%20pads'));
assert(core.handoffUrl('barnesnoble','dune').includes('barnesandnoble.com/s/dune'));
assert(core.handoffUrl('sallybeauty','hair color').includes('sallybeauty.com/search-show?q=hair%20color'));
assert.equal(network.bestLocal('gaming laptop with RTX graphics'),'microcenter');
assert.equal(network.bestLocal('dog food and cat litter'),'chewy');
assert.equal(network.bestLocal('brake pads and wiper blades'),'autozone');
assert.equal(network.bestLocal('printer paper and folders'),'staples');
assert.equal(network.bestLocal('ingredients for chicken dinner'),'walmart');
const forced=expansion.setRetailerInCommand('Load chicken parmesan to Walmart for 4','petco');assert(forced.toLowerCase().includes('petco'));assert(!forced.toLowerCase().includes('walmart'));

p=core.buildOfflinePlan('Load chicken parmesan with giant breadcrumbs for 4');assert.equal(p.retailer,'walmart');
p=core.buildOfflinePlan('Load chicken alfredo for 4, skip pantry staples');assert.equal(p.retailer,'walmart');
p=core.buildOfflinePlan('Load something completely unknown to Walmart');assert(!p.ok&&p.needsAI);
console.log('AutoCart core + 115-store network tests PASS');