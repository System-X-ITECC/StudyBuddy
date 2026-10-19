import DOMPurify from 'dompurify';

const $ = (id) => document.getElementById(id);
const FOLDER_COLORS=['#c9a7f5','#98cbc1','#ffc49e','#ffabc8','#9bbdff','#e8c877','#aab1c5'];
const wordSafe=(html)=>DOMPurify.sanitize(html,{USE_PROFILES:{html:true}});
const escape=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const download=(blob,name)=>{const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);};
const filename=(title)=>String(title||'studybuddy').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').slice(0,90)||'studybuddy';
let docShiftPromise;
function loadDocShift(){
  if(window.docshift?.toDocx)return Promise.resolve(window.docshift);
  if(!docShiftPromise)docShiftPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    // Version-pinned browser bundle; no API key and no server-side upload.
    script.src='https://cdn.jsdelivr.net/npm/docshift@0.0.73/dist/docshift.min.js';
    script.crossOrigin='anonymous';
    script.onload=()=>window.docshift?.toDocx?resolve(window.docshift):reject(new Error('DocShift library did not initialise.'));
    script.onerror=()=>reject(new Error('DocShift could not load. Check your connection and try again.'));
    document.head.append(script);
  }).catch(error=>{docShiftPromise=null;throw error;});
  return docShiftPromise;
}
function printWord(html,title){
  const frame=document.createElement('iframe');frame.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;opacity:0;pointer-events:none;';
  frame.title='Print-ready StudyBuddy document';
  frame.sandbox='allow-same-origin allow-modals';
  frame.srcdoc=`<!doctype html><html><head><meta charset="utf-8"><title>${escape(title)}</title><style>@page{size:A4;margin:18mm}body{font:11pt/1.55 Georgia,serif;color:#263239}h1,h2,h3{font-family:Arial,sans-serif;break-after:avoid}img{max-width:100%}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px}a{color:#155e75}</style></head><body>${wordSafe(html)}</body></html>`;
  frame.addEventListener('load',()=>{try {frame.contentWindow.focus();frame.contentWindow.print();} catch(err){console.error(err);} setTimeout(()=>frame.remove(),60000);},{once:true});
  document.body.append(frame);
}
const uuid=()=>crypto.randomUUID();

export function initStudyBuddyStudio({api,generate,toast,ensureChat,changeTab,getChats,getCurrentChatId,getToken,refreshChats,toHtml}) {
  const withErrors=(job)=>()=>Promise.resolve().then(job).catch(e=>toast(e.message||String(e)));
  let currentKind='';
  let deck=[];let cardIndex=0;let flipped=false;let known=new Set();let missed=new Set();
  let slideSections=[];let slideIndex=0;

  const showSlide=()=>{
    const current=slideSections[slideIndex]||{heading:'Start with a presentation',body:'Generate a few slides with StudyBuddy.'};
    $('slide-inner').replaceChildren();
    const label=document.createElement('span');label.className='slide-kicker';label.textContent='STUDYBUDDY • PRESENTATION';
    const heading=document.createElement('h2');heading.textContent=current.heading;
    const body=document.createElement('div');body.className='slide-body';body.innerHTML=wordSafe(toHtml(current.body));
    $('slide-inner').append(label,heading,body);
    $('slide-counter').textContent=`${slideIndex+1} / ${Math.max(slideSections.length,1)}`;
    $('slide-prev').disabled=slideIndex===0;
    $('slide-next').disabled=slideIndex>=slideSections.length-1;
  };
  const showCard=()=>{
    const card=deck[cardIndex];
    $('practice-face').textContent=card ? (flipped?card.back:card.front) : 'Create flashcards to start a practice session.';
    $('practice-hint').textContent=card ? (flipped?'ANSWER • TAP TO RETURN':'QUESTION • TAP TO REVEAL') : 'NO DECK YET';
    $('practice-card').setAttribute('aria-pressed',String(flipped));
    $('cards-progress').textContent=deck.length?`${cardIndex+1} / ${deck.length} • ${known.size} known • ${missed.size} to practise`:'No deck loaded';
    $('cards-prev').disabled=!deck.length||cardIndex===0;
    $('cards-next').disabled=!deck.length||cardIndex===deck.length-1;
    $('cards-known').disabled=!deck.length;
    $('cards-missed').disabled=!deck.length;
  };
  function openArtifact(artifact,kind){
    if(!artifact || !Array.isArray(artifact.sections))return false;
    currentKind=kind;
    if(kind==='slides'){
      slideSections=artifact.sections.map(s=>({heading:s.heading||'Slide',body:s.body||''}));
      slideIndex=0;showSlide();changeTab('slides');return true;
    }
    if(kind==='flashcards' && artifact.cards?.length){
      deck=artifact.cards.map(c=>({front:c.front,back:c.back}));cardIndex=0;flipped=false;known=new Set();missed=new Set();showCard();changeTab('flashcards');return true;
    }
    if(['summary','review','textbook','planner','document'].includes(kind)){
      $('word-title').value=artifact.title||'StudyBuddy notes';
      $('word-editor').innerHTML=wordSafe(`<h1>${escape(artifact.title||'StudyBuddy notes')}</h1>`+artifact.sections.map(s=>`<h2>${escape(s.heading)}</h2>${toHtml(s.body||'')}`).join(''));
      changeTab('word');return true;
    }
    return false;
  }
  window.studybuddyOpenArtifact=openArtifact;

  for(const b of document.querySelectorAll('[data-format]')) b.addEventListener('click',()=>{
    $('word-editor').focus();
    document.execCommand(b.dataset.format,false,b.dataset.value||undefined);
  });
  $('word-ai').addEventListener('click',withErrors(async()=>{
    const topic=prompt('What should StudyBuddy write about?', $('word-title').value);
    if(topic?.trim())await generate('textbook',`Create a polished, well-organised Word document about: ${topic.trim()}`);
  }));
  $('slides-ai').addEventListener('click',withErrors(async()=>{
    const topic=prompt('What is your presentation topic?');
    if(topic?.trim())await generate('slides',`Generate a clear, readable presentation for a 16:9 slide deck about ${topic.trim()}`);
  }));
  $('cards-ai').addEventListener('click',withErrors(async()=>{
    const topic=prompt('What would you like to practise?');
    if(topic?.trim())await generate('flashcards',`Create useful active-recall flashcards about ${topic.trim()}`);
  }));
  $('word-export-docx').addEventListener('click',withErrors(async()=>{
    const docshift=await loadDocShift();
    const html=wordSafe($('word-editor').innerHTML);
    const blob=await docshift.toDocx(html);
    download(blob,`${filename($('word-title').value)}.docx`);
    toast('Your editable Word document is ready.');
  }));
  $('word-export-pdf').addEventListener('click',()=>printWord($('word-editor').innerHTML,$('word-title').value));
  $('slides-fullscreen').addEventListener('click',withErrors(async()=>{
    if(document.fullscreenElement)await document.exitFullscreen();
    else if($('slide-stage').requestFullscreen)await $('slide-stage').requestFullscreen();
    else toast('Fullscreen is not supported in this browser. Rotate your phone to landscape.');
  }));
  $('slide-prev').addEventListener('click',()=>{slideIndex=Math.max(0,slideIndex-1);showSlide();});
  $('slide-next').addEventListener('click',()=>{slideIndex=Math.min(slideSections.length-1,slideIndex+1);showSlide();});
  $('slide-stage').addEventListener('keydown',e=>{if(e.key==='ArrowRight')$('slide-next').click();if(e.key==='ArrowLeft')$('slide-prev').click();});
  const flip=()=>{if(!deck.length)return;flipped=!flipped;showCard();};
  $('practice-card').addEventListener('click',flip);
  $('cards-prev').addEventListener('click',()=>{cardIndex=Math.max(0,cardIndex-1);flipped=false;showCard();});
  $('cards-next').addEventListener('click',()=>{cardIndex=Math.min(deck.length-1,cardIndex+1);flipped=false;showCard();});
  $('cards-known').addEventListener('click',()=>{known.add(cardIndex);missed.delete(cardIndex);if(cardIndex<deck.length-1){cardIndex++;flipped=false;}showCard();});
  $('cards-missed').addEventListener('click',()=>{missed.add(cardIndex);known.delete(cardIndex);if(cardIndex<deck.length-1){cardIndex++;flipped=false;}showCard();});
  $('cards-shuffle').addEventListener('click',()=>{for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}cardIndex=0;flipped=false;known.clear();missed.clear();showCard();});
  showSlide();showCard();

  let organisation={folders:[],assignments:{}};
  let selecting=false; const selected=new Set();
  const folderDialog=document.createElement('dialog');folderDialog.id='folder-dialog';folderDialog.className='folder-dialog';
  folderDialog.innerHTML=`<form method="dialog" class="dialog-head"><h2>Organise conversations</h2><button class="icon-button" aria-label="Close">×</button></form><form id="folder-form"><label>Folder name<input id="folder-title" maxlength="60" required placeholder="e.g. Networking revision"></label><label>Folder colour<select id="folder-color">${FOLDER_COLORS.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></label><div class="folder-dialog-actions"><button id="folder-save" type="submit" class="primary">Save folder</button><button id="folder-remove" type="button" class="danger">Delete folder</button></div></form>`;
  document.body.append(folderDialog);
  let editingFolderId=null;
  $('folder-create').addEventListener('click',()=>{if(!getToken())return toast('Sign in to organise conversations.');editingFolderId=null;$('folder-title').value='';$('folder-color').value=FOLDER_COLORS[0];$('folder-remove').hidden=true;folderDialog.showModal();});
  $('folder-form').addEventListener('submit',e=>{e.preventDefault();void (async()=>{
    const body={title:$('folder-title').value.trim(),color:$('folder-color').value};
    if(!body.title)return;
    if(editingFolderId)await api(`/folders/${editingFolderId}`,{method:'PATCH',body:JSON.stringify(body)});
    else await api('/folders',{method:'POST',body:JSON.stringify(body)});
    folderDialog.close();await loadFolders();toast('Folder saved.');
  })().catch(err=>toast(err.message));});
  $('folder-remove').addEventListener('click',withErrors(async()=>{
    if(!editingFolderId || !confirm('Delete this folder? Your conversations will be kept.'))return;
    await api(`/folders/${editingFolderId}`,{method:'DELETE'});folderDialog.close();await loadFolders();
  }));
  $('folder-select-mode').addEventListener('click',()=>{selecting=!selecting;selected.clear();$('folder-select-mode').textContent=selecting?'Cancel':'Select';drawFolders();decorateChats();});
  async function loadFolders(){
    if(!getToken()){organisation={folders:[],assignments:{}};drawFolders();return;}
    organisation=await api('/folders');if(currentFilter && !organisation.folders.some(f=>f.id===currentFilter))currentFilter=null;drawFolders();decorateChats();
  }
  function drawFolders(){
    const box=$('folder-list');box.replaceChildren();
    const unfiled=document.createElement('button');unfiled.type='button';unfiled.className='folder-chip';unfiled.textContent='All conversations';unfiled.onclick=()=>{currentFilter=null;decorateChats();};box.append(unfiled);
    for(const folder of organisation.folders){
      const chip=document.createElement('div');chip.className='folder-chip-group';
      const show=document.createElement('button');show.type='button';show.className='folder-chip';show.style.setProperty('--folder-color',folder.color);show.textContent='● '+folder.title;show.onclick=()=>{currentFilter=folder.id;decorateChats();};
      const edit=document.createElement('button');edit.type='button';edit.textContent='⋯';edit.title='Rename or change colour';edit.className='folder-edit';edit.onclick=()=>{editingFolderId=folder.id;$('folder-title').value=folder.title;$('folder-color').value=folder.color;$('folder-remove').hidden=false;folderDialog.showModal();};
      chip.append(show,edit);box.append(chip);
    }
    if(selecting && selected.size){
      const row=document.createElement('div');row.className='folder-assign-tools';
      const choose=document.createElement('select');choose.setAttribute('aria-label','Move selected chats to folder');
      choose.append(new Option('Unfiled',''));
      for(const f of organisation.folders)choose.append(new Option(f.title,f.id));
      const apply=document.createElement('button');apply.type='button';apply.textContent=`Move ${selected.size} selected`;
      apply.onclick=withErrors(async()=>{
        await api('/folders/assign',{method:'PUT',body:JSON.stringify({chatIds:[...selected],folderId:choose.value||null})});
        selecting=false;selected.clear();$('folder-select-mode').textContent='Select';await loadFolders();toast('Conversations organised.');
      });row.append(choose,apply);box.append(row);
    }
  }
  let currentFilter=null;
  function decorateChats(){
    const list=$('chat-list');
    if(!list)return;
    // Buttons are created by legacy renderChats; wrap only direct child conversation buttons.
    for(const chat of getChats()){
      let wrapper=list.querySelector(`[data-chat-row="${chat.id}"]`);
      if(!wrapper){
        const siblings=[...list.children].filter(el=>el.tagName==='BUTTON');
        const index=getChats().indexOf(chat);
        const button=siblings[0];
        if(!button)continue;
        wrapper=document.createElement('div');wrapper.className='chat-row';wrapper.dataset.chatRow=chat.id;button.parentNode.insertBefore(wrapper,button);wrapper.append(button);
        const edit=document.createElement('button');edit.className='chat-rename';edit.type='button';edit.title='Rename conversation';edit.textContent='✎';
        edit.addEventListener('click',withErrors(async()=>{
          const title=prompt('New conversation title',chat.title);
          if(title===null || !title.trim() || title.trim()===chat.title)return;
          await api(`/chats/${chat.id}`,{method:'PATCH',body:JSON.stringify({title:title.trim()})});await refreshChats();toast('Conversation renamed.');
        }));wrapper.append(edit);
        const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.className='chat-select';checkbox.setAttribute('aria-label',`Select ${chat.title}`);
        checkbox.checked=selected.has(chat.id);checkbox.onchange=()=>{checkbox.checked?selected.add(chat.id):selected.delete(chat.id);drawFolders();};wrapper.append(checkbox);
      }
      const folderId=organisation.assignments[chat.id];
      wrapper.hidden=!!currentFilter && folderId!==currentFilter;
      wrapper.classList.toggle('selecting',selecting);
      const checkbox=wrapper.querySelector('.chat-select');if(checkbox)checkbox.checked=selected.has(chat.id);
      const badge=wrapper.querySelector('.chat-folder-dot')||document.createElement('span');
      badge.className='chat-folder-dot';
      const folder=organisation.folders.find(f=>f.id===folderId);
      badge.style.background=folder?.color||'transparent';badge.title=folder?.title||'Unfiled';
      if(!badge.parentNode)wrapper.append(badge);
    }
  }
  window.addEventListener('studybuddy:chats-rendered',()=>decorateChats());
  window.addEventListener('studybuddy:chats-updated',()=>void loadFolders().catch(()=>{}));
  void loadFolders().catch(()=>{});
  return {openArtifact,loadFolders};
}
