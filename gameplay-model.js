export const statuses = ['Officially Confirmed', 'Verified Reporting', 'Community Discovery', 'Unconfirmed'];
export const categories = ['driving', 'combat', 'exploration', 'characters', 'missions', 'world-systems'];
export const markerTypes = ['location', 'mission', 'activity', 'vehicle', 'discovery'];
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeUrl(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : null; } catch { return null; }
}
export function matches(record, query = '', category = 'all', status = 'all') {
  return (category === 'all' || (record.categories || [record.category]).includes(category)) &&
    (status === 'all' || record.status === status) &&
    String(record.search || [record.title, record.headline, record.summary, record.topics, record.detail].filter(Boolean).join(' ')).toLowerCase().includes(query.trim().toLowerCase());
}
export function embedUrl(id, seconds = 0) {
  if (!/^[\w-]{11}$/.test(id)) throw new Error('Invalid YouTube id');
  if (!Number.isInteger(seconds) || seconds < 0) throw new Error('Invalid timestamp');
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&playsinline=1&rel=0&start=${seconds}`;
}
export function validateSubmission({ title, source, description, kind }) {
  const errors = [];
  if (!['discovery', 'correction'].includes(kind)) errors.push('Choose a discovery or correction.');
  if (title.trim().length < 5 || title.length > 120) errors.push('Use a title between 5 and 120 characters.');
  if (!safeUrl(source)) errors.push('Provide a complete HTTPS source URL without credentials.');
  if (description.trim().length < 20 || description.length > 2000) errors.push('Describe the evidence in 20–2,000 characters.');
  return errors;
}
export function validateContent(data) {
  const fail = message => { throw new Error(message); };
  const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(value).toISOString().slice(0,10) === value;
  if (data.schemaVersion !== 1 || !date(data.reviewedAt)) fail('Invalid content version/review date');
  const sources = new Map(data.sources.map(s => [s.id, s]));
  if (sources.size !== data.sources.length) fail('Duplicate source');
  const ref = id => { if (!sources.has(id)) fail(`Unknown source: ${id}`); };
  for (const s of data.sources) {
    if (!safeUrl(s.url) || !s.name || !['official','reporting','community'].includes(s.kind) || !date(s.checkedAt) || (s.publishedAt !== null && !date(s.publishedAt))) fail(`Invalid source ${s.id}`);
  }
  ref(data.release.sourceId);
  if (!date(data.release.date) || !statuses.includes(data.release.status)) fail('Invalid release');
  for (const group of ['videos','updates','mechanics','discoveries']) {
    const ids = new Set();
    for (const r of data[group]) {
      if (!/^[a-z0-9-]+$/.test(r.id) || ids.has(r.id)) fail(`Invalid/duplicate id: ${r.id}`);
      ids.add(r.id);
      if (!statuses.includes(r.status)) fail(`Invalid status: ${r.id}`);
      const refs = r.sourceIds || [r.sourceId];
      refs.forEach(ref);
      if (r.status !== 'Unconfirmed' && !refs.length) fail('Evidence required');
      if (r.status === 'Officially Confirmed' && !refs.some(id => sources.get(id).kind === 'official')) fail('Official evidence required');
      if (r.publishedAt && !date(r.publishedAt)) fail('Invalid publication date');
      if (r.publishedAt > data.reviewedAt) fail('Publication after review');
      if (['videos','updates'].includes(group) && !r.publishedAt) fail('Publication date required');
      if (group === 'updates' && (!r.headline || !r.summary || ![...categories,'release','patches'].includes(r.category))) fail('Invalid update');
      if (group === 'mechanics' && (!categories.includes(r.category) || !r.summary)) fail('Invalid mechanic');
      if (group === 'videos') {
        if (!r.title || !r.categories.length || r.categories.some(c => !categories.includes(c))) fail('Invalid video category');
        if (r.contextSourceId) ref(r.contextSourceId);
        if (r.youtubeId !== null) {
          embedUrl(r.youtubeId);
          if (new URL(sources.get(r.sourceId).url).searchParams.get('v') !== r.youtubeId) fail('Embed must match reviewed source');
        }
        for (const ch of r.chapters) {
          ref(ch.sourceId);
          if (!Number.isInteger(ch.seconds) || ch.seconds < 0 || !ch.observation || (r.durationSeconds !== null && ch.seconds >= r.durationSeconds)) fail('Invalid chapter');
        }
      }
      if (group === 'discoveries') {
        if (!markerTypes.includes(r.type) || !r.description || !safeUrl(r.media?.url)) fail('Invalid discovery');
        if (r.coordinates !== null) {
          const c = r.coordinates;
          ref(c.sourceId);
          if (r.status !== 'Officially Confirmed' || sources.get(c.sourceId).kind !== 'official' || c.system !== 'official-map-normalized' || ![c.x,c.y].every(n => Number.isFinite(n) && n >= 0 && n <= 1)) fail('Coordinates need official evidence');
        }
      }
    }
  }
  for (const c of data.corrections) {
    if (!date(c.date) || !c.recordId || !c.reason || !c.before || !c.after || !c.sourceIds.length) fail('Invalid correction');
    c.sourceIds.forEach(ref);
  }
  return true;
}
