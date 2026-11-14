import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { load } from 'cheerio';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { safeUrl } from '../gameplay-model.js';

const hash = value => createHash('sha256').update(value).digest('hex');
const text = value => load(String(value || '')).text().replace(/\s+/g,' ').trim();
const array = value => value == null ? [] : Array.isArray(value) ? value : [value];
const relevant = value => /\b(?:gta\s*(?:6|vi)|grand theft auto\s*(?:6|vi))\b/i.test(value);
export function canonicalUrl(value) {
  if (!safeUrl(value)) throw new Error('Unsafe source URL');
  const u = new URL(value);
  u.hash = '';
  for (const key of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|pubDate)/i.test(key)) u.searchParams.delete(key);
  u.hostname = u.hostname.replace(/^www\./,'');
  const article = u.pathname.match(/^\/newswire\/article\/([a-z0-9]+)/i);
  if (article) u.pathname = `/newswire/article/${article[1]}`;
  u.pathname = u.pathname.replace(/\/$/,'') || '/';
  u.searchParams.sort();
  return u.href;
}
function publication(value) {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}
function item(title, url, publishedAt, evidence, source) {
  if (!safeUrl(url) || !source.allowedHosts.includes(new URL(url).hostname)) return null;
  const canonical = canonicalUrl(url);
  return { id:hash(canonical).slice(0,24), url, canonicalUrl:canonical, headline:text(title).slice(0,240), publishedAt:publication(publishedAt), evidenceHash:hash(text(evidence)), sourceId:source.id, sourceName:source.name, sourceKind:source.kind };
}
export function parseFeed(body, source) {
  if (/<!DOCTYPE|<!ENTITY/i.test(body)) throw new Error('External entities/DOCTYPE are not accepted');
  if (XMLValidator.validate(body) !== true) throw new Error('Malformed source feed');
  const doc = new XMLParser({ignoreAttributes:false,processEntities:false}).parse(body);
  if (!doc.rss?.channel && !doc.feed) throw new Error('Expected RSS or Atom; received an unsupported response');
  const rows = doc.feed ? array(doc.feed.entry) : array(doc.rss.channel.item);
  return rows.filter(r=>relevant(text(r.title))).slice(0,100).map(r=>{
    const links = array(r.link);
    const url = typeof r.link === 'string' ? r.link : links.find(l=>!l['@_rel'] || l['@_rel']==='alternate')?.['@_href'];
    return item(r.title, url, r.pubDate || r.published || r['dc:date'], r.description || r.summary || r['media:group']?.['media:description'] || r.title,source);
  }).filter(Boolean);
}
export function parsePage(body, source) {
  const $ = load(body);
  $('script,style,nav,header,footer').remove();
  const main = $('main').length ? $('main') : $('body');
  const records = [];
  main.find('a[href*="/newswire/article/"]').each((_,el)=>{
    const title = $(el).text().trim();
    if (!relevant(title)) return;
    const url = new URL($(el).attr('href'),source.url).href;
    const r = item(title,url,$(el).find('time').attr('datetime') || null,title,source);
    if (r) records.push(r);
  });
  const semantic = main.find('h1,h2,h3,h4,h5,p,time').map((_,el)=>$(el).text()).get().join(' ');
  if (text(semantic).length < 80 || !/Grand Theft Auto|Leonida|Trailer/i.test(semantic)) throw new Error('Official page is blocked, client-rendered or has changed structure; manual review required');
  records.push(item('Official GTA VI page snapshot — review for changes',source.url,null,semantic,source));
  return records.filter(Boolean);
}
export function reconcile(previous, candidates, history, records, checkedAt) {
  const state = structuredClone(previous);
  const queue = structuredClone(candidates);
  const changes = structuredClone(history);
  let count = 0;
  for (const r of records) {
    const fingerprint = hash(JSON.stringify([r.headline,r.publishedAt,r.evidenceHash]));
    const old = state.items[r.id];
    if (old?.fingerprint === fingerprint) continue;
    const next = {...r,fingerprint};
    state.items[r.id] = next;
    const draft = {...r, firstSeenAt:old?.firstSeenAt || checkedAt, lastChangedAt:checkedAt, status:'Unconfirmed', reviewState:'pending', category:/patch|update|fix/i.test(r.headline)?'patches':'research', summary:'Source candidate only. An editor must read the original and write a supported summary before publication.', reviewReasons:[...(!r.publishedAt?['Publication date unavailable; do not substitute discovery date.']:[]),'Confirm relevance, evidence, licensing and classification before publishing.']};
    state.items[r.id].firstSeenAt = draft.firstSeenAt;
    const at = queue.findIndex(c=>c.id===r.id);
    if (at < 0) queue.push(draft); else queue[at] = draft;
    changes.push({id:r.id,at:checkedAt,reason:old?'source-content-changed':'new-source-record',before:old || null,after:next});
    count++;
  }
  return {state,candidates:queue,history:changes,count};
}
export async function fetchSource(source, fetcher = fetch) {
  let url = source.url;
  for (let redirect=0;redirect<4;redirect++) {
    if (!safeUrl(url) || !source.allowedHosts.includes(new URL(url).hostname)) throw new Error('Unapproved source redirect');
    const response = await fetcher(url,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'WISE2-Atlas-Research/1.0 (public metadata; editorial review)','Accept':'text/html,application/rss+xml,application/atom+xml,application/xml'}});
    if (response.status>=300 && response.status<400) { url = new URL(response.headers.get('location'),url).href; continue; }
    if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
    let size = 0;
    const chunks = [];
    for await (const chunk of response.body) { size += chunk.byteLength; if (size > 3_000_000) throw new Error('Source exceeds metadata size limit'); chunks.push(chunk); }
    return Buffer.concat(chunks).toString('utf8');
  }
  throw new Error('Too many source redirects');
}
export async function runResearch({root=fileURLToPath(new URL('../',import.meta.url)),fetcher=fetch,now=new Date().toISOString()} = {}) {
  const json = async path => JSON.parse(await readFile(resolve(root,path),'utf8'));
  const [sources,state,queue,history] = await Promise.all(['data/research-sources.json','research/state.json','research/candidates.json','research/history.json'].map(json));
  const results = await Promise.all(sources.map(async source=>{
    try { const body = await fetchSource(source,fetcher); return {sourceId:source.id,status:'ok',records:source.type==='feed'?parseFeed(body,source):parsePage(body,source)}; }
    catch(error) { return {sourceId:source.id,status:'failed',error:error.message,records:[]}; }
  }));
  const next = reconcile(state,queue,history,results.flatMap(r=>r.records),now);
  if (next.count) for (const [file,value] of [['state',next.state],['candidates',next.candidates],['history',next.history]]) await writeFile(resolve(root,`research/${file}.json`),JSON.stringify(value,null,2)+'\n');
  const report = {checkedAt:now,changedRecords:next.count,publication:'Nothing auto-published',sources:results.map(({records,...r})=>({...r,records:records.length}))};
  await mkdir(resolve(root,'.research-run'),{recursive:true});
  await writeFile(resolve(root,'.research-run/report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  return report;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await runResearch();
  if (report.sources.some(s=>s.status==='failed')) process.exitCode = 2;
}
