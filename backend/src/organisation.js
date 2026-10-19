import { randomUUID } from 'node:crypto';
import { z } from 'zod';

// Organisation is user-owned and stored alongside other RLS-protected profile settings.
// Does not require a schema migration. Limits prevent unbounded profile JSON growth.
const titleSchema = z.string().trim().min(1).max(100);
const folderInput = z.object({
  title: z.string().trim().min(1).max(60),
  color: z.enum(['#c9a7f5','#98cbc1','#ffc49e','#ffabc8','#9bbdff','#e8c877','#aab1c5']),
});
const assignmentInput = z.object({
  folderId: z.string().uuid().nullable(),
  chatIds: z.array(z.string().uuid()).min(1).max(100),
});
export function getOrganisation(profile) {
  const folders = Array.isArray(profile.chatFolders) ? profile.chatFolders.slice(0,50) : [];
  const assignments = profile.chatFolderAssignments && typeof profile.chatFolderAssignments === 'object' && !Array.isArray(profile.chatFolderAssignments)
    ? profile.chatFolderAssignments : {};
  return {folders, assignments};
}
export function mountOrganisationRoutes(app, {result,getProfile,putProfile}) {
  app.patch('/api/chats/:chat', async (req,res) => {
    // Ownership is enforced again by the existing app.param + Supabase RLS.
    const {title} = z.object({title:titleSchema}).parse(req.body);
    const chat = await result(req.db.from('chats').update({title}).eq('id',req.params.chat).select('id,title').single());
    res.json(chat);
  });
  app.get('/api/folders', async (req,res) => {
    res.json(getOrganisation(await getProfile(req)));
  });
  app.post('/api/folders', async (req,res) => {
    const value = folderInput.parse(req.body);
    const profile=await getProfile(req);
    const {folders}=getOrganisation(profile);
    if(folders.length>=50) return res.status(400).json({error:'Maximum 50 folders per account.'});
    const folder={id:randomUUID(), ...value};
    profile.chatFolders=[...folders,folder];
    await putProfile(req,profile);
    res.status(201).json(folder);
  });
  app.patch('/api/folders/:folder', async (req,res) => {
    const id=z.string().uuid().parse(req.params.folder);
    const changes=folderInput.partial().refine(v=>Object.keys(v).length>0).parse(req.body);
    const profile=await getProfile(req);
    const {folders}=getOrganisation(profile);
    const index=folders.findIndex(f=>f.id===id);
    if(index<0) return res.status(404).json({error:'Folder not found.'});
    const updated={...folders[index],...changes};
    folders[index]=updated; profile.chatFolders=folders;
    await putProfile(req,profile);res.json(updated);
  });
  app.delete('/api/folders/:folder', async (req,res) => {
    const id=z.string().uuid().parse(req.params.folder);
    const profile=await getProfile(req);
    const {folders,assignments}=getOrganisation(profile);
    if(!folders.some(f=>f.id===id))return res.status(404).json({error:'Folder not found.'});
    profile.chatFolders=folders.filter(f=>f.id!==id);
    profile.chatFolderAssignments=Object.fromEntries(Object.entries(assignments).filter(([,folder])=>folder!==id));
    await putProfile(req,profile);res.json({ok:true});
  });
  app.put('/api/folders/assign', async (req,res) => {
    const {folderId,chatIds}=assignmentInput.parse(req.body);
    const ids=[...new Set(chatIds)];
    const profile=await getProfile(req);
    const {folders,assignments}=getOrganisation(profile);
    if(folderId && !folders.some(f=>f.id===folderId)) return res.status(404).json({error:'Folder not found.'});
    const owned=await result(req.db.from('chats').select('id').eq('user_id',req.user).in('id',ids));
    if(owned.length!==ids.length)return res.status(404).json({error:'A conversation was not found.'});
    const next={...assignments};
    for(const id of ids){if(folderId)next[id]=folderId;else delete next[id];}
    // Maximum assignments protects profile size on free-tier PostgREST.
    if(Object.keys(next).length>300) return res.status(400).json({error:'Maximum 300 organised conversations.'});
    profile.chatFolderAssignments=next;
    await putProfile(req,profile);res.json({ok:true,assignments:next});
  });
}
