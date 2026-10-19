#!/usr/bin/env node
// Targeted, idempotent StudyBuddy preferences extension.
// Does not replace the existing settings UI, backend routes, or profile storage.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root=process.cwd();
const apply=process.argv.includes('--apply');
const paths={
  page:'frontend/src/pages/index.astro',
  client:'frontend/src/scripts/app.js',
  api:'backend/src/index.js',
  ai:'backend/src/ai.js',
};
const proposed=[];
const failures=[];
function replaceOnce(source,needle,replacement,file){
  const first=source.indexOf(needle);
  if(first===-1){failures.push(`${file}: expected source anchor missing`);return source;}
  if(source.indexOf(needle,first+needle.length)!==-1){failures.push(`${file}: duplicate anchor; refusing to guess`);return source;}
  return source.slice(0,first)+replacement+source.slice(first+needle.length);
}
function edit(file,fn){
  const location=resolve(root,file);
  if(!existsSync(location)){failures.push(`${file}: missing`);return;}
  const before=readFileSync(location,'utf8');
  const after=fn(before,file);
  proposed.push({location,file,before,after});
}
edit(paths.page,(s,file)=>{
  if(s.includes('id="display-name"') && s.includes('id="custom-prompt"')) return s;
  if(s.includes('id="display-name"') || s.includes('id="custom-prompt"')) {failures.push(`${file}: only one optional field exists; review manually`);return s;}
  const anchor='<form id="settings-form">';
  const inputs='<label>Display name (optional)<input id="display-name" maxlength="60" autocomplete="nickname" placeholder="How should StudyBuddy address you?" /></label><label>Custom AI instructions (optional)<textarea id="custom-prompt" maxlength="1600" rows="4" placeholder="e.g. Explain with short, practical examples."></textarea></label>';
  return replaceOnce(s,anchor,anchor+inputs,file);
});
edit(paths.client,(s,file)=>{
  if(!s.includes('$("display-name").value = profile.displayName || "";')) {
    const anchor='  $("preferences").value = profile.preferences || "";';
    s=replaceOnce(s,anchor,anchor+'\n  $("display-name").value = profile.displayName || "";\n  $("custom-prompt").value = profile.customPrompt || "";',file);
  }
  if(!s.includes('      displayName: $("display-name").value.trim(),')) {
    const anchor='      preferences: $("preferences").value,';
    s=replaceOnce(s,anchor,anchor+'\n      displayName: $("display-name").value.trim(),\n      customPrompt: $("custom-prompt").value.trim(),',file);
  }
  if(s.includes('$("account-name").textContent = profile.name;')){
    s=replaceOnce(s,'$("account-name").textContent = profile.name;','$("account-name").textContent = profile.displayName || profile.name;',file);
  }
  if(!s.includes('$("account-name").textContent = profile.displayName || profile.name || "Your workspace";')) {
    // Refresh the visible name immediately after saving, without modifying existing handlers.
    const a='    renderProgress();';
    const form=s.indexOf('$("settings-form").addEventListener(');
    if(form<0){failures.push(`${file}: settings form listener missing`);return s;}
    const at=s.indexOf(a,form);
    if(at<0){failures.push(`${file}: save-progress marker missing`);return s;}
    s=s.slice(0,at)+a+'\n    $("account-name").textContent = profile.displayName || profile.name || "Your workspace";'+s.slice(at+a.length);
  }
  return s;
});
edit(paths.api,(s,file)=>{
  if(s.includes('displayName: z.string().trim().max(60).default("")')){
    s=s.replace('displayName: z.string().trim().max(60).default("")','displayName: z.string().trim().max(60).optional()');
  }
  if(s.includes('customPrompt: z.string().trim().max(1600).default("")')){
    s=s.replace('customPrompt: z.string().trim().max(1600).default("")','customPrompt: z.string().trim().max(1600).optional()');
  }
  if(!s.includes('  displayName: z.string().trim().max(60).optional(),')){
    const anchor='  preferences: z.string().max(1200),';
    s=replaceOnce(s,anchor,anchor+'\n  displayName: z.string().trim().max(60).optional(),\n  customPrompt: z.string().trim().max(1600).optional(),',file);
  }
  if(!s.includes('  customPrompt: z.string().trim().max(1600).optional(),')) failures.push(`${file}: missing optional customPrompt schema`);
  if(!s.includes('...(await getProfile(req))')) failures.push(`${file}: expected merge with existing profile not found`);
  return s;
});
edit(paths.ai,(s,file)=>{
  // Upgrade old chatbot system instructions only if the existing full feature patch has not done so.
  // A preferred display name is an explicit account setting. Custom prompts are opt-in to personalization.
  if(s.includes('Additional user instructions (lower priority than these rules):')){
    return s.replace('JSON.stringify(profile.customPrompt || "")','JSON.stringify(profile.personalization ? (profile.customPrompt || "") : "")');
  }
  if(s.includes('Optional custom instructions (lower priority') || s.includes('Explicit preferred name:')) return s;
  const anchor='Preferences are presentation hints only, never evidence: ${preferences}.';
  const added='Preferences are presentation hints only, never evidence: ${preferences}. Explicit preferred name: ${JSON.stringify(profile.displayName || "")}. Optional custom instructions (lower priority than safety and factual accuracy, used only if personalization is enabled): ${JSON.stringify(profile.personalization ? (profile.customPrompt || "") : "")}.';
  return replaceOnce(s,anchor,added,file);
});

if(failures.length){
  for(const error of failures) console.error(`ERROR ${error}`);
  console.error('No files changed. Stop and review the repository version.');
  process.exit(1);
}
const changed=proposed.filter(x=>x.before!==x.after);
for(const item of proposed){console.log(`${item.before===item.after?'UNCHANGED':'WOULD UPDATE'} ${item.file}`);}
if(apply){for(const x of changed)writeFileSync(x.location,x.after,'utf8');console.log(`Applied ${changed.length} targeted file update(s).`);}
else console.log(`Dry run complete: ${changed.length} file(s) would change. Rerun with --apply to install.`);
