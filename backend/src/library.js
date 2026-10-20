/** Private, per-user StudySpace Library. No server admin key is used for library reads/writes. */
import express from 'express';
const { Router, raw } = express;
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { result } from './db.js';

export const LIBRARY_BUCKET = 'studyspace-library';
export const LIBRARY_FILE_LIMIT = 10 * 1024 * 1024;
const validCategories = ['summary', 'review', 'flashcards', 'textbook', 'slides', 'planner', 'image', 'audio', 'video', 'document', 'other'];
export const categorySchema = z.enum(validCategories);
const uuid = z.string().uuid();
const tagSchema = z.array(z.string().trim().min(1).max(24)).max(10);
export function normalizeTags(values = []) {
  return [...new Set(values.map(v => v.trim().toLowerCase()).filter(Boolean))].slice(0, 10);
}
const editSchema = z.object({
  title: z.string().trim().min(1).max(120),
  category: categorySchema,
  tags: tagSchema,
});
const mimeByExt = Object.freeze({
  pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt:'text/plain',md:'text/plain',csv:'text/csv',vtt:'text/vtt',srt:'text/plain',
  png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',
  mp3:'audio/mpeg',wav:'audio/wav',ogg:'audio/ogg',m4a:'audio/mp4',
  mp4:'video/mp4',webm:'video/webm',
});

/** Detect obvious disguised files before storing media. Other formats remain download-only. */
export function matchesMediaSignature(info, bytes) {
  if (!info || !Buffer.isBuffer(bytes)) return false;
  const prefix = bytes.subarray(0, 16);
  const starts = signature => prefix.subarray(0, signature.length).equals(Buffer.from(signature));
  switch (info.ext) {
    case 'png': return starts([137,80,78,71,13,10,26,10]);
    case 'jpg': case 'jpeg': return starts([255,216,255]);
    case 'gif': return prefix.toString('ascii',0,6) === 'GIF87a' || prefix.toString('ascii',0,6) === 'GIF89a';
    case 'webp': return prefix.toString('ascii',0,4)==='RIFF' && prefix.toString('ascii',8,12)==='WEBP';
    case 'pdf': return prefix.toString('ascii',0,5)==='%PDF-';
    default: return true; // Remaining media are never executed, and are served as attachments.
  }
}
const imageExt = new Set(['png','jpg','jpeg','webp','gif']);
const audioExt = new Set(['mp3','wav','ogg','m4a']);
const videoExt = new Set(['mp4','webm']);
export function fileInfo(name) {
  const ext = name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (!ext || !mimeByExt[ext]) return null;
  const category = imageExt.has(ext) ? 'image' : audioExt.has(ext) ? 'audio' : videoExt.has(ext) ? 'video' : 'document';
  return { ext, category, mime: mimeByExt[ext] };
}
// The generated artifact is already saved in the chat. Also index its full structured content in the Library.
export async function saveGeneratedItem(req, artifact, kind, chatId) {
  const rawJSON = JSON.stringify(artifact);
  if (Buffer.byteLength(rawJSON, 'utf8') > 480000) throw new Error('Generated item exceeds the Library size limit.');
  const category = validCategories.includes(kind) ? kind : 'other';
  const row = {
    user_id:req.user, source_chat_id:chatId,
    title:String(artifact.title || 'New learning material').slice(0,120),
    category, tags:normalizeTags(['generated', category]),
    content:artifact, mime_type:'application/json', bytes:Buffer.byteLength(rawJSON),
  };
  return result(req.db.from('library_items').insert(row).select('id,title,category,tags,created_at').single());
}
export async function removeAccountLibraryFiles(req) {
  // Supabase Auth cascade removes metadata. Storage objects must be removed separately before deleting the user.
  let offset = 0;
  for (;;) {
    const rows = await result(req.db.from('library_items').select('storage_path').eq('user_id',req.user)
      .not('storage_path','is',null).order('id').range(offset,offset + 99));
    if (!rows.length) break;
    const paths = rows.map(r => r.storage_path);
    const { error } = await req.db.storage.from(LIBRARY_BUCKET).remove(paths);
    if (error) throw Object.assign(new Error(`Library cleanup failed: ${error.message}`), { status:502 });
    offset += rows.length;
    if (rows.length < 100) break;
  }
}
export const libraryRouter = Router();

libraryRouter.get('/', async (req,res) => {
  const query = z.object({
    category:categorySchema.optional(),tag:z.string().trim().max(24).optional(),
    q:z.string().trim().max(80).optional(),
    offset:z.coerce.number().int().min(0).max(10000).default(0),
  }).parse(req.query);
  let dbQuery = req.db.from('library_items')
    .select('id,title,category,tags,mime_type,bytes,storage_path,source_chat_id,created_at',{count:'exact'})
    .eq('user_id',req.user).order('created_at',{ascending:false}).order('id',{ascending:false})
    .range(query.offset,query.offset + 39);
  if (query.category) dbQuery = dbQuery.eq('category',query.category);
  if (query.tag) dbQuery = dbQuery.contains('tags',[query.tag.toLowerCase()]);
  if (query.q) dbQuery = dbQuery.ilike('title',`%${query.q.replace(/[%,_]/g,'')}%`);
  const { data, error, count } = await dbQuery;
  if (error) throw Object.assign(new Error(error.message),{status:400});
  res.json({items:data || [],total:count || 0,offset:query.offset,nextOffset:query.offset + (data?.length || 0)});
});

libraryRouter.get('/:id',async (req,res) => {
  const id = uuid.parse(req.params.id);
  const item = await result(req.db.from('library_items').select('*').eq('id',id).eq('user_id',req.user).maybeSingle());
  if (!item) return res.status(404).json({error:'Library item not found.'});
  res.json(item);
});

libraryRouter.put('/:id',async (req,res) => {
  const id = uuid.parse(req.params.id);
  const body = req.body
  const patch = editSchema.parse(body);
  const item = await result(req.db.from('library_items')
    .update({...patch,tags:normalizeTags(patch.tags)}).eq('id',id).eq('user_id',req.user)
    .select('id,title,category,tags,created_at').maybeSingle());
  if (!item) return res.status(404).json({error:'Library item not found.'});
  res.json(item);
});

libraryRouter.post('/upload',raw({type:'application/octet-stream',limit:'10mb'}),async(req,res) => {
  let name;
  try { name = decodeURIComponent(req.get('X-File-Name') || ''); }
  catch { return res.status(400).json({error:'Invalid filename encoding.'}); }
  name = name.trim();
  const info = fileInfo(name);
  if (!info || !name || name.length > 160 || /[\x00-\x1f/\\]/.test(name))
    return res.status(400).json({error:'Unsupported file. Choose an image, audio, video, or study document.'});
  if (!Buffer.isBuffer(body) || !body.length || body.length > LIBRARY_FILE_LIMIT)
    return res.status(413).json({error:'Choose a file up to 10 MB.'});
  if (!matchesMediaSignature(info, body)) return res.status(400).json({error:'File contents do not match the selected format.'});
  const filename = `${randomUUID()}.${info.ext}`;
  const path = `${req.user}/${filename}`;
  // Only the user's authenticated Supabase client touches the private bucket; Storage RLS applies.
  const {error:uploadError} = await req.db.storage.from(LIBRARY_BUCKET).upload(path,body,{
    contentType:info.mime,upsert:false,cacheControl:'3600',
  });
  if (uploadError) throw Object.assign(new Error(uploadError.message),{status:502});
  try {
    const tags = normalizeTags([info.category,'uploaded']);
    const item = await result(req.db.from('library_items').insert({
      user_id:req.user,title:name,category:info.category,tags,
      storage_path:path,mime_type:info.mime,bytes:body.length,
    }).select('id,title,category,tags,created_at').single());
    res.status(201).json(item);
  } catch (error) {
    await req.db.storage.from(LIBRARY_BUCKET).remove([path]).catch(()=>{});
    throw error;
  }
});

libraryRouter.get('/:id/download',async (req,res) => {
  const id = uuid.parse(req.params.id);
  const item = await result(req.db.from('library_items')
    .select('title,storage_path,mime_type').eq('id',id).eq('user_id',req.user).maybeSingle());
  if (!item) return res.status(404).json({error:'Library item not found.'});
  if (!item.storage_path) return res.status(400).json({error:'Use the preview and export tools for generated learning material.'});
  const {data,error} = await req.db.storage.from(LIBRARY_BUCKET).download(item.storage_path);
  if (error) throw Object.assign(new Error(error.message),{status:502});
  const encoded = encodeURIComponent(item.title).replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  res.set({
    'Content-Type':item.mime_type || 'application/octet-stream',
    'Content-Disposition':`attachment; filename="StudySpace-file"; filename*=UTF-8''${encoded}`,
    'Cache-Control':'private, no-store',
    'X-Content-Type-Options':'nosniff',
  });
  res.send(Buffer.from(await data.arrayBuffer()));
});

libraryRouter.delete('/:id',async (req,res) => {
  const id = uuid.parse(req.params.id);
  const row = await result(req.db.from('library_items').select('storage_path').eq('id',id).eq('user_id',req.user).maybeSingle());
  if (!row) return res.status(404).json({error:'Library item not found.'});
  if (row.storage_path) {
    const {error} = await req.db.storage.from(LIBRARY_BUCKET).remove([row.storage_path]);
    if (error) throw Object.assign(new Error(error.message),{status:502});
  }
  await result(req.db.from('library_items').delete().eq('id',id).eq('user_id',req.user));
  res.json({ok:true});
});

// Persist exported PDF/Word bytes as a private asset without losing the original structured artifact.
export async function saveExportItem(req, artifact, format, output) {
  const name = String(artifact.title || 'StudySpace export').slice(0, 105);
  const storagePath = `${req.user}/${randomUUID()}.${format}`;
  const {error:uploadError} = await req.db.storage.from(LIBRARY_BUCKET).upload(storagePath,output.buffer,{
    contentType:output.mime,upsert:false,cacheControl:'3600',
  });
  if (uploadError) throw new Error(uploadError.message);
  try {
    return await result(req.db.from('library_items').insert({
      user_id:req.user,title:`${name}.${format}`,category:format==='pptx'?'slides':'document',
      tags:normalizeTags(['generated','export',format]),storage_path:storagePath,
      mime_type:output.mime,bytes:output.buffer.length,
    }).select('id').single());
  } catch(error) {
    await req.db.storage.from(LIBRARY_BUCKET).remove([storagePath]).catch(()=>{});
    throw error;
  }
}
