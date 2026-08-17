'use strict';

(function(){
  const $=id=>document.getElementById(id);
  const listBox=$('manualList');
  const retailer=$('listRetailer');
  const fileInput=$('importFile');
  const importRetailer=$('importRetailer');
  const fileStatus=$('fileStatus');

  function fillRetailers(){
    const preferred=['walmart','giantpa','wegmans','shoprite','acme','weis','target','costco','samsclub','giantfood'];
    const grocery=Array.isArray(AutoCartCore.GROCERY_RETAILERS)?AutoCartCore.GROCERY_RETAILERS:[];
    const all=Array.isArray(AutoCartCore.RETAILERS)?AutoCartCore.RETAILERS:[];
    const ordered=[...new Set([...preferred,...grocery,...all])].filter(id=>AutoCartCore.RETAILER_META?.[id]);
    document.querySelectorAll('[data-retailer-select]').forEach(select=>{
      select.innerHTML='';
      const groceryGroup=document.createElement('optgroup');
      groceryGroup.label='Grocery & major stores';
      const otherGroup=document.createElement('optgroup');
      otherGroup.label='Other retailers';
      ordered.forEach(id=>{
        const option=document.createElement('option');
        option.value=id;
        option.textContent=AutoCartCore.retailerLabel(id);
        if(id==='walmart') option.selected=true;
        (grocery.includes(id)?groceryGroup:otherGroup).appendChild(option);
      });
      select.appendChild(groceryGroup);
      if(otherGroup.children.length) select.appendChild(otherGroup);
    });
  }
  fillRetailers();

  function cleanLines(text){return String(text||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean)}

  function buildManual(){
    const lines=cleanLines(listBox.value);
    if(!lines.length){window.AutoCartUI?.setStatus?.('Enter at least one item.','warn');return}
    window.AutoCartUI?.render?.(AutoCartCore.buildListPlan(lines,retailer.value));
  }

  listBox.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey)e.stopPropagation()});
  $('buildList').addEventListener('click',buildManual);
  $('clearList').addEventListener('click',()=>{listBox.value='';listBox.focus()});

  async function localTextImport(file){
    const ext=(file.name.split('.').pop()||'').toLowerCase();
    if(!['txt','csv','tsv'].includes(ext))return null;
    const text=await file.text();
    let lines=cleanLines(text);
    if(ext==='csv'||ext==='tsv'){
      const sep=ext==='tsv'?'\t':',';
      lines=lines.map(row=>row.split(sep).map(v=>v.replace(/^"|"$/g,'').trim()).filter(Boolean)[0]).filter(Boolean);
    }
    return AutoCartCore.buildListPlan(lines,importRetailer.value,'file-local');
  }

  async function importFile(){
    const file=fileInput.files?.[0];
    if(!file){fileStatus.textContent='Choose a file first.';return}
    fileStatus.textContent='Reading '+file.name+'…';
    const local=await localTextImport(file);
    if(local){window.AutoCartUI?.render?.(local);fileStatus.textContent='Imported locally. Review the list before opening retailer results.';return}
    const api=window.AutoCartUI?.activeApi?.();
    if(!api){fileStatus.textContent='PDF, image and spreadsheet imports need the AutoCart AI Worker. TXT/CSV imports work offline.';return}
    const form=new FormData();
    form.append('file',file,file.name);
    form.append('retailer',importRetailer.value);
    try{
      const r=await fetch(api+'/api/import',{method:'POST',body:form});
      const d=await r.json();
      if(!r.ok||!d.ok)throw new Error(d.error||'Import failed');
      window.AutoCartUI?.render?.(AutoCartCore.normalizeImportedPlan(d,importRetailer.value));
      fileStatus.textContent='Imported '+file.name+'. Review every item before retailer handoff.';
    }catch(e){fileStatus.textContent='Import failed: '+e.message}
  }
  $('importBtn').addEventListener('click',importFile);
  fileInput.addEventListener('change',()=>{fileStatus.textContent=fileInput.files?.[0]?fileInput.files[0].name+' selected.':'No file selected.'});
})();
