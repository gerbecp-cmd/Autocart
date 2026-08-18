import assert from 'node:assert/strict';
import router,{localBestStore,recommendStore} from '../src/store-router-v2.js';

assert.equal(localBestStore('gaming laptop and RTX graphics card'),'microcenter');
assert.equal(localBestStore('dog food and cat litter'),'chewy');
assert.equal(localBestStore('brake pads and wiper blades'),'autozone');
assert.equal(localBestStore('printer paper and folders'),'staples');
assert.equal(localBestStore('ingredients for chicken dinner'),'walmart');

const offline=await recommendStore('need a tent and hiking backpack',{});
assert.equal(offline.ok,true);assert.equal(offline.retailer,'rei');assert.equal(offline.source,'smart-offline');

const mockAI={async run(){return {response:JSON.stringify({retailer:'cabelas',reason:'Strong fit for fishing gear.'})}}};
const ai=await recommendStore('salmon fishing rod and waders',{AI:mockAI,AI_MODEL:'mock'});
assert.equal(ai.ok,true);assert.equal(ai.retailer,'cabelas');assert.equal(ai.source,'workers-ai');

const req=new Request('https://autocart.test/api/store-recommendation',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({command:'need a new graphics card'})});
const res=await router.fetch(req,{},{});const body=await res.json();
assert.equal(res.status,200);assert.equal(body.ok,true);assert.equal(body.retailer,'microcenter');

console.log('Best Store Worker tests PASS');