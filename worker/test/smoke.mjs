import assert from 'node:assert/strict';
import {offlinePlan,handleCommand,handleImport,parsePrefs} from '../src/index.js';

let p=offlinePlan('Load chicken parmesan recipe to Walmart for 4 people under $40');
assert.equal(p.retailer,'walmart');
assert.equal(p.servings,4);
assert.equal(p.budget,40);
assert(p.items.some(i=>i.searchTerm==='fresh garlic bulb'));
assert(!p.items.some(i=>/cloves/.test(i.searchTerm)));

p=offlinePlan('Load tacos to GIANT for 6 under $35, no sour cream, skip pantry staples');
assert.equal(p.retailer,'giantpa');
assert.equal(p.servings,6);
assert(!p.items.some(i=>i.name==='sour cream'));
assert.equal(parsePrefs('Load lasagna to Giant Food for 8').retailer,'giantfood');
assert.equal(parsePrefs('Load lasagna to Wegmans for 8').retailer,'wegmans');

const noAi=await handleCommand('Load a completely unknown recipe to Walmart',{});
assert.equal(noAi.ok,false);
assert.equal(noAi.needsAI,true);

let converted=false, extracted=false;
const mockAI={
  async toMarkdown(files){
    converted=true;
    assert.equal(files.length,1);
    return [{name:'list.pdf',mimeType:'application/pdf',format:'text',data:'Milk\nEggs\nBananas'}];
  },
  async run(){
    extracted=true;
    return {response:JSON.stringify({ok:true,title:'Imported Shopping List',retailer:'giantpa',items:[{name:'Milk',searchTerm:'whole milk',amount:'1 gallon',quantity:1},{name:'Eggs',searchTerm:'large eggs dozen',amount:'1 dozen',quantity:1},{name:'Bananas',searchTerm:'bananas',amount:'6',quantity:1}]})};
  }
};
const fd=new FormData();
fd.append('retailer','giantpa');
fd.append('file',new File([new Uint8Array([37,80,68,70])],'list.pdf',{type:'application/pdf'}));
const importReq=new Request('https://autocart.test/api/import',{method:'POST',body:fd});
const imported=await handleImport(importReq,{AI:mockAI,AI_MODEL:'mock'});
assert(converted&&extracted);
assert.equal(imported.ok,true);
assert.equal(imported.retailer,'giantpa');
assert.equal(imported.items.length,3);
assert.equal(imported.items[2].searchTerm,'bananas');

console.log('Worker smoke tests PASS');
