import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.cwd());
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.svg':'image/svg+xml','.png':'image/png'};
createServer(async (req,res)=>{
  try {
    const url = new URL(req.url,'http://localhost');
    const path = decodeURIComponent(url.pathname);
    let file = resolve(root,`.${path}`);
    if (!file.startsWith(root+sep) && file !== root) throw new Error('Invalid path');
    if (path.split('/').some(p=>p.startsWith('.')) || path.includes('/node_modules/')) throw new Error('Private path');
    if ((await stat(file)).isDirectory()) {
      if (!path.endsWith('/')) { res.writeHead(301,{Location:encodeURI(path) + '/' + url.search}); res.end(); return; }
      file = resolve(file,'index.html');
    }
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(await readFile(file));
  } catch { res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found'); }
}).listen(Number(process.env.PORT || 4173),'127.0.0.1',()=>console.log('Atlas preview: http://127.0.0.1:4173/gameplay/'));
