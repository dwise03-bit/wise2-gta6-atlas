import { matches, embedUrl, validateSubmission } from './gameplay-model.js';

document.querySelectorAll('[data-filter-group]').forEach(group => {
  const form = group.querySelector('form');
  const records = [...group.querySelectorAll('[data-record]')];
  const filter = () => {
    const fields = new FormData(form);
    const category = fields.get('category') || 'all';
    let count = 0;
    records.forEach(node => {
      const visible = matches({ search: node.dataset.search, categories:node.dataset.categories.split(','), status:node.dataset.status }, fields.get('query') || '', category, fields.get('status') || 'all');
      node.hidden = !visible;
      if (visible) count++;
    });
    group.querySelector('.result-count').textContent = `${count} of ${records.length} records shown`;
    group.querySelector('.empty-state').hidden = count > 0;
    group.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.category === category)));
  };
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input',filter);
  form.addEventListener('change',filter);
  form.addEventListener('reset',()=>setTimeout(filter,0));
  group.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click',()=>{ form.elements.category.value = button.dataset.category; filter(); }));
});

function loadPlayer(player, seconds = 0) {
  if (!player?.dataset.youtube) return;
  const frame = document.createElement('iframe');
  frame.src = embedUrl(player.dataset.youtube,seconds);
  frame.title = `${player.dataset.title} — official Rockstar Games video`;
  frame.allow = 'encrypted-media; fullscreen; picture-in-picture';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  player.replaceChildren(frame);
  frame.focus();
}
document.querySelectorAll('[data-load-player]').forEach(button => button.addEventListener('click',()=>loadPlayer(button.closest('[data-player]'))));
document.querySelectorAll('[data-seek]').forEach(button => button.addEventListener('click',()=>loadPlayer(document.querySelector('[data-player]'), Number(button.dataset.seek))));
document.getElementById('seek-button')?.addEventListener('click', event => {
  const value = document.getElementById('seek-time').value.trim();
  const parts = /^(\d+):([0-5]\d)$/.exec(value);
  const seconds = parts ? Number(parts[1])*60+Number(parts[2]) : NaN;
  const duration = Number(event.currentTarget.dataset.duration);
  const status = document.getElementById('seek-status');
  if (!Number.isSafeInteger(seconds) || seconds < 0 || (duration && seconds >= duration)) { status.textContent = 'Enter a timestamp within this video, using m:ss.'; return; }
  loadPlayer(document.querySelector('[data-player]'),seconds);
  status.textContent = `Player loaded at ${value}. Press play to begin. This is a navigation bookmark, not a verified observation.`;
});

const regionButtons = [...document.querySelectorAll('[data-discovery]')];
function selectDiscovery(id) {
  regionButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.discovery === id)));
  document.querySelectorAll('[data-discovery-panel]').forEach(panel=>{panel.hidden = panel.dataset.discoveryPanel !== id;});
}
regionButtons.forEach(button=>button.addEventListener('click',()=>selectDiscovery(button.dataset.discovery)));
document.getElementById('marker-type')?.addEventListener('change',event=>{
  const visible = regionButtons.filter(button=>{ button.hidden = event.target.value !== 'all' && button.dataset.type !== event.target.value; return !button.hidden; });
  selectDiscovery(visible[0]?.dataset.discovery || '');
  document.getElementById('map-empty').hidden = visible.length > 0;
});

const form = document.getElementById('discovery-form');
form?.addEventListener('submit',event=>{
  event.preventDefault();
  const fields = Object.fromEntries(new FormData(form));
  const errors = validateSubmission(fields);
  const status = document.getElementById('submission-status');
  const preview = document.getElementById('draft-preview');
  if (errors.length) { status.textContent = errors.join(' '); preview.hidden = true; return; }
  document.getElementById('draft-text').value = `WISE² review draft — NOT SUBMITTED\nType: ${fields.kind}\nTitle: ${fields.title.trim()}\nSource: ${fields.source.trim()}\nEvidence: ${fields.description.trim()}\nProposed status: Unconfirmed\nModeration: Editorial review required\nThis prototype has not sent or stored this draft.`;
  preview.hidden = false;
  status.textContent = 'Draft prepared in this page only. Nothing has been submitted or stored.';
});
form?.addEventListener('input',()=>{ document.getElementById('draft-preview').hidden = true; document.getElementById('submission-status').textContent = ''; });
document.getElementById('copy-draft')?.addEventListener('click',async()=>{
  const text = document.getElementById('draft-text');
  const status = document.getElementById('submission-status');
  try { await navigator.clipboard.writeText(text.value); status.textContent = 'Draft copied. It has not been submitted.'; }
  catch { text.focus(); text.select(); status.textContent = 'Select and copy the draft manually. It has not been submitted.'; }
});

const featureDialog = document.querySelector('.feature-dialog');
const featureButton = document.getElementById('open-feature');
featureButton?.addEventListener('click', () => {
  featureDialog.showModal();
  loadPlayer(featureDialog.querySelector('[data-player]'));
});
document.getElementById('close-feature')?.addEventListener('click', () => featureDialog.close());
featureDialog?.addEventListener('close', () => {
  const frame = featureDialog.querySelector('iframe');
  if (frame) frame.remove();
  featureButton.focus();
});

const heroVideo = document.querySelector('.hero-video');
const motionButton = document.getElementById('hero-motion');
if (heroVideo && motionButton) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  const start = async () => {
    if (reduced.matches || userPaused || document.hidden) return;
    if (!heroVideo.src) heroVideo.src = heroVideo.dataset.src;
    try { await heroVideo.play(); heroVideo.classList.add('playing'); motionButton.hidden = false; motionButton.textContent = 'PAUSE BACKGROUND MOTION'; }
    catch { heroVideo.classList.remove('playing'); motionButton.hidden = true; }
  };
  motionButton.addEventListener('click', () => {
    userPaused = !userPaused;
    if (userPaused) { heroVideo.pause(); motionButton.textContent = 'PLAY BACKGROUND MOTION'; }
    else start();
  });
  reduced.addEventListener('change', () => { if (reduced.matches) { heroVideo.pause(); heroVideo.classList.remove('playing'); motionButton.hidden = true; } else start(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) heroVideo.pause(); else start(); });
  start();
}
