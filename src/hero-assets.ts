import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type HeroKind = 'projector' | 'cargo';
type Phase = 'idle' | 'fetching' | 'decoding' | 'ready' | 'error';
type Entry = { url: string; sha256: string | null; task: string; phase: Phase; promise?: Promise<void>; template?: T.Group; alignment?: T.Matrix4; info?: Record<string, unknown>; error?: string; live: number };
export type HeroInstance = { root: T.Group; materials: T.Material[]; dispose(): void };

// Resident originals are deliberately outside every room's geometry/material/texture sets.
const entries: Record<HeroKind, Entry> = {
  projector: { url: './models/hero-projector.glb', sha256: '2215cbd530dd2e7b84b16dbc54efa69b9a57b38d92e19b26ef689287cfbde087', task: '5c64d549-c131-4da2-8688-38d6a22ce0a6', phase: 'idle', live: 0 },
  // Byte-identical existing GLB export; original is retained outside the repository.
  cargo: { url: './models/hero-weighted-cargo.glb', sha256: '143129e2a3439cf4b074f57d9b22b9b52b8e008078e1975647a50e88fdf90053', task: 'b4902fc0-bae7-42b6-8452-fc9b6876ca40', phase: 'idle', live: 0 },
};
const kinds: HeroKind[] = ['projector', 'cargo'];
let preloadPromise: Promise<void> | undefined;
const gunMuzzle = new T.Vector3(-.320448, .29, 0);
const gunAxis = new T.Vector3(-1, 0, 0);

function disposeTemplate(root: T.Group) {
  const geometries = new Set<T.BufferGeometry>(), materials = new Set<T.Material>(), textures = new Set<T.Texture>();
  root.traverse(o => { if (o instanceof T.Mesh) { geometries.add(o.geometry); for (const m of Array.isArray(o.material) ? o.material : [o.material]) { materials.add(m); for (const v of Object.values(m)) if (v instanceof T.Texture) textures.add(v); } } });
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => { t.dispose(); (t.image as { close?: () => void } | undefined)?.close?.(); });
}

function checkEmbedded(data: ArrayBuffer) {
  const view = new DataView(data);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2) throw Error('Invalid hero GLB');
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(data, 20, view.getUint32(12, true))));
  for (const item of [...(json.buffers ?? []), ...(json.images ?? [])]) if (item.uri && !String(item.uri).startsWith('data:')) throw Error('Hero GLB has unexpected external resources');
  return json;
}

async function load(kind: HeroKind) {
  const entry = entries[kind];
  if (entry.phase === 'ready') return;
  if (entry.promise) return entry.promise;
  entry.promise = (async () => {
    // Assign the shared promise before any synchronous intake/URL failure can clear it.
    await Promise.resolve();
    let parsed: T.Group | undefined;
    try {
      if (!entry.sha256) throw Error('Hero cargo intake is still pending');
      entry.phase = 'fetching'; entry.error = undefined;
      const url = new URL(entry.url, document.baseURI), response = await fetch(url);
      if (!response.ok) throw Error(`Hero asset request failed (${response.status})`);
      const data = await response.arrayBuffer(), digest = await crypto.subtle.digest('SHA-256', data), actual = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      if (actual !== entry.sha256) throw Error('Hero asset hash mismatch');
      const manifest = checkEmbedded(data); entry.phase = 'decoding';
      parsed = (await new GLTFLoader().parseAsync(data, new URL('.', url).href)).scene;
      parsed.updateMatrixWorld(true);
      const bounds = new T.Box3().setFromObject(parsed), size = bounds.getSize(new T.Vector3()), centre = bounds.getCenter(new T.Vector3());
      if (!Number.isFinite(size.length()) || Math.min(size.x, size.y, size.z) <= 0) throw Error('Hero asset has invalid bounds');
      let meshes = 0, triangles = 0, vertices = 0, maskVertices = 0;
      const materials = new Set<T.Material>(), textures = new Set<T.Texture>();
      parsed.traverse(o => {
        if (!(o instanceof T.Mesh)) return;
        meshes++; vertices += o.geometry.getAttribute('position').count; triangles += (o.geometry.index?.count ?? o.geometry.getAttribute('position').count) / 3;
        o.userData.originalTripoMesh = o.name; o.userData.heroAsset = kind; o.userData.sharedAsset = true;
        if (kind === 'projector') {
          const position = o.geometry.getAttribute('position'), normal = o.geometry.getAttribute('normal'), mask = new Float32Array(position.count);
          for (let i = 0; i < position.count; i++) {
            const radius = Math.hypot(position.getY(i) - gunMuzzle.y, position.getZ(i));
            if (position.getX(i) > -.34 && position.getX(i) < -.30 && radius < .055 && (!normal || normal.getX(i) < -.35)) { mask[i] = 1; maskVertices++; }
          }
          o.geometry.setAttribute('heroGunLensMask', new T.BufferAttribute(mask, 1));
        }
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) { materials.add(m); for (const value of Object.values(m)) if (value instanceof T.Texture) textures.add(value); }
      });
      if (!meshes) throw Error('Hero GLB contains no visible mesh');
      // GLTFLoader can warn and continue when an image decode fails. Such a hero is not ready.
      const decodedImages = new Set(Array.from(textures, t => t.image).filter(image => image && image.width > 0 && image.height > 0));
      if (decodedImages.size < (manifest.images?.length ?? 0)) throw Error('Hero embedded texture decoding is incomplete');
      entry.alignment = kind === 'projector'
        ? new T.Matrix4().makeRotationY(-Math.PI / 2).multiply(new T.Matrix4().makeTranslation(-.14, -.22, 0))
        : new T.Matrix4().makeScale(1 / size.x, 1 / size.y, 1 / size.z).multiply(new T.Matrix4().makeTranslation(-centre.x, -centre.y, -centre.z));
      const normalized = bounds.clone().applyMatrix4(entry.alignment);
      entry.info = { bytes: data.byteLength, verifiedSHA256: actual, meshes, vertices, triangles, materials: materials.size, textures: textures.size, sourceBounds: { min: bounds.min.toArray(), max: bounds.max.toArray() }, normalizedBounds: { min: normalized.min.toArray(), max: normalized.max.toArray() }, alignment: entry.alignment.toArray(), fitPolicy: kind === 'cargo' ? 'Per-axis canonical cube for six-face native contact; original GLB unchanged' : 'Rigid rotation/translation; uniform view scale', lensMaskVertices: maskVertices,
        ...(kind === 'projector' ? { muzzleSource: gunMuzzle.toArray(), axisSource: gunAxis.toArray(), muzzleLocal: gunMuzzle.clone().applyMatrix4(entry.alignment).toArray(), axisLocal: gunAxis.clone().transformDirection(entry.alignment).toArray() } : {}) };
      entry.template = parsed; entry.phase = 'ready';
    } catch (error) {
      if (parsed) disposeTemplate(parsed);
      entry.phase = 'error'; entry.error = String(error); throw error;
    } finally { entry.promise = undefined; }
  })();
  return entry.promise;
}

/** Both original GLBs and their embedded images must decode before any Scene is constructed. */
export function preloadHeroAssets(): Promise<void> {
  if (kinds.every(k => entries[k].phase === 'ready')) return Promise.resolve();
  if (!preloadPromise) preloadPromise = Promise.all(kinds.map(load)).then(() => undefined).finally(() => { preloadPromise = undefined; });
  return preloadPromise;
}

export function heroAssetStatus() {
  return JSON.parse(JSON.stringify({ ready: kinds.every(k => entries[k].phase === 'ready'), assets: Object.fromEntries(kinds.map(kind => { const e = entries[kind]; return [kind, { phase: e.phase, url: e.url, expectedSHA256: e.sha256, task: e.task, error: e.error, liveInstances: e.live, resident: !!e.template, ...e.info }]; })) }));
}

export function requireHeroAssets() { if (!kinds.every(k => entries[k].phase === 'ready')) throw Error('Hero assets must preload before scene construction'); }
export function heroBounds(kind: HeroKind) { const info = entries[kind].info?.normalizedBounds as { min: number[]; max: number[] } | undefined; if (!info) throw Error('Hero asset is not ready'); return new T.Box3(new T.Vector3(...info.min as [number, number, number]), new T.Vector3(...info.max as [number, number, number])); }

export function cloneHeroMaterial(material: T.Material, kind: HeroKind) {
  const copy = material.clone(); copy.clipShadows = true;
  if (kind === 'projector' && copy instanceof T.MeshStandardMaterial) {
    copy.onBeforeCompile = shader => { shader.vertexShader = 'attribute float heroGunLensMask; varying float vHeroGunLensMask;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vHeroGunLensMask = heroGunLensMask;'); shader.fragmentShader = 'varying float vHeroGunLensMask;\n' + shader.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance *= vHeroGunLensMask;'); };
    copy.customProgramCacheKey = () => 'actual-tripo-gun-lens-v1';
  }
  return copy;
}

export function instantiateHero(kind: HeroKind): HeroInstance {
  requireHeroAssets(); const entry = entries[kind], root = new T.Group(), fit = new T.Group(), raw = entry.template!.clone(true), materials: T.Material[] = [], copies = new Map<T.Material, T.Material>();
  root.name = 'actual-tripo-' + kind; fit.matrix.copy(entry.alignment!); fit.matrixAutoUpdate = false; fit.add(raw); root.add(fit);
  raw.traverse(o => { if (o instanceof T.Mesh) { o.castShadow = o.receiveShadow = true; o.userData.sharedAsset = true; o.userData.heroAsset = kind; const clone = (m: T.Material) => { let copy = copies.get(m); if (!copy) { copy = cloneHeroMaterial(m, kind); copies.set(m, copy); materials.push(copy); } return copy; }; o.material = Array.isArray(o.material) ? o.material.map(clone) : clone(o.material); } });
  entry.live++; let disposed = false;
  return { root, materials, dispose() { if (disposed) return; disposed = true; root.removeFromParent(); materials.forEach(m => m.dispose()); entry.live--; } };
}

/** Final application teardown only, after all live source/view instances have been released. */
export function disposeHeroAssets() { if (kinds.some(k => entries[k].live > 0 || entries[k].promise)) throw Error('Hero assets still have live users'); for (const kind of kinds) { const e = entries[kind]; if (e.template) disposeTemplate(e.template); e.template = undefined; e.info = undefined; e.alignment = undefined; e.phase = 'idle'; e.error = undefined; } }
