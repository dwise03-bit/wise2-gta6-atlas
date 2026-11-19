#!/usr/bin/env python3
"""Safely import approved CARTOOLS reference pack from private server inbox."""
import hashlib,json,pathlib,zipfile,shutil,sys
root=pathlib.Path(__file__).resolve().parent
src=pathlib.Path('/home/dwise/wise2-asset-inbox/cartools/wise2_cartools_reference_pack.zip')
dest=root/'assets'/'references'
if not src.is_file():
 print('WAITING_FOR_ASSET_PACK:',src);sys.exit(0)
if src.stat().st_size>60_000_000:sys.exit('REJECTED: archive too large')
with zipfile.ZipFile(src) as z:
 names=z.namelist()
 allowed={'01-game-main-menu.jpeg','02-soundlabs-tradegang.jpeg','03-command-dashboard.jpeg','04-game-launcher.jpeg','05-command-dashboard-repeat.jpeg','manifest.json','README.md'}
 if len(names)!=len(set(names)) or not set(names).issubset(allowed):sys.exit('REJECTED: unexpected archive entries')
 if sum(x.file_size for x in z.infolist())>80_000_000:sys.exit('REJECTED: expanded size')
 for entry in z.infolist():
  if entry.is_dir() or entry.filename.startswith('/') or '..' in pathlib.PurePosixPath(entry.filename).parts:sys.exit('REJECTED: unsafe path')
 manifest=json.loads(z.read('manifest.json'))
 for name in names:
  if name.endswith('.jpeg'):
   data=z.read(name)
   if not data.startswith(b'\xff\xd8\xff'):sys.exit('REJECTED: invalid JPEG '+name)
   (dest/name).write_bytes(data)
  elif name in ('manifest.json','README.md'):
   (dest/name).write_bytes(z.read(name))
print('ASSETS_IMPORTED',len([x for x in names if x.endswith('.jpeg')]))
for p in sorted(dest.glob('*.jpeg')):print(hashlib.sha256(p.read_bytes()).hexdigest(),p.name)
