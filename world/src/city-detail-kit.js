// CARTOOLS original city visual kit — additive Three.js module.
// Import with: import { createCityDetailKit } from './city-detail-kit.js';
// Call after scene creation: const kit = createCityDetailKit(THREE, scene, buildings);
// Call kit.dispose() when unloading the original city.
// Buildings must be [{x,z,half,height?}]. No external assets or copyrighted models.
export function createCityDetailKit(THREE, scene, buildings, options = {}) {
  const quality = options.quality === 'low' ? 'low' : 'standard';
  const root = new THREE.Group();
  root.name = 'cartools-original-city-detail-kit';
  const ownedGeometries = [];
  const ownedMaterials = [];
  const geo = (w, h, d) => {
    const g = new THREE.BoxGeometry(w, h, d);
    ownedGeometries.push(g);
    return g;
  };
  const material = (color, emissive = 0) => {
    const m = new THREE.MeshStandardMaterial({
      color, emissive, emissiveIntensity: emissive ? 0.75 : 0,
      metalness: 0.15, roughness: 0.8
    });
    ownedMaterials.push(m);
    return m;
  };
  const stone = material(0x343b4b);
  const steel = material(0x171e2d);
  const glass = material(0x21405d, 0x0a1b31);
  const warm = material(0xffc27a, 0x8c4314);
  const cyan = material(0x43d8ef, 0x126077);
  const roadPaint = material(0xc4cbd1);
  const facadeGeo = geo(16, 1, 0.16);
  const trimGeo = geo(16.4, 0.14, 16.4);
  const windowGeo = geo(1.4, 1.7, 0.09);
  const windows = [];
  const trim = [];
  const cornices = [];
  for (const b of buildings) {
    const h = b.height ?? (9 + Math.abs(b.x * 7 + b.z * 3) % 19);
    trim.push([b.x, h - 0.15, b.z]);
    cornices.push([b.x, h - 0.55, b.z + 8.1]);
    const rows = quality === 'low' ? 1 : Math.max(1, Math.floor((h - 3) / 4));
    for (let row = 0; row < rows; row++) {
      const y = 3 + row * 4;
      for (const side of [-1, 1]) for (const offset of [-5, 0, 5]) {
        windows.push([b.x + offset, y, b.z + side * 8.08,
          (Math.abs(Math.round(b.x + b.z + offset + y)) % 5 === 0) ? 1 : 0]);
      }
    }
  }
  const temp = new THREE.Object3D();
  function instanced(name, geometry, mat, positions, rotate = false) {
    if (!positions.length) return;
    const mesh = new THREE.InstancedMesh(geometry, mat, positions.length);
    mesh.name = name;
    mesh.frustumCulled = false;
    positions.forEach((p, i) => {
      temp.position.set(p[0], p[1], p[2]);
      temp.rotation.set(0, rotate ? Math.PI / 2 : 0, 0);
      temp.updateMatrix();
      mesh.setMatrixAt(i, temp.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    root.add(mesh);
    return mesh;
  }
  instanced('roof-neon', trimGeo, cyan, trim);
  instanced('weathered-cornice', facadeGeo, stone, cornices);
  instanced('windows-lit', windowGeo, warm, windows.filter(p => p[3] === 1));
  instanced('windows-dark', windowGeo, glass, windows.filter(p => p[3] === 0));
  const stripeGeo = geo(1.2, 0.035, 1.9);
  const stripes = [];
  for (let i = -4; i <= 4; i++) {
    stripes.push([i * 2.0, 0.12, -12], [i * 2.0, 0.12, 12]);
  }
  instanced('crosswalk', stripeGeo, roadPaint, stripes);
  const binGeo = geo(0.9, 1.1, 0.8);
  const bins = [];
  for (let z = -78; z <= 78; z += quality === 'low' ? 52 : 26) {
    bins.push([-13, 0.55, z], [13, 0.55, z]);
  }
  instanced('street-bins', binGeo, steel, bins);
  scene.add(root);
  return {
    root,
    setVisible(visible) { root.visible = Boolean(visible); },
    dispose() {
      scene.remove(root);
      root.traverse(obj => { if (obj.isInstancedMesh) obj.dispose?.(); });
      ownedGeometries.forEach(g => g.dispose());
      ownedMaterials.forEach(m => m.dispose());
    }
  };
}
