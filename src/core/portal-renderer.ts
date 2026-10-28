import { PerspectiveCamera, Plane, WebGLRenderTarget, Vector2, type WebGLRenderer, type Scene, type Group, type Mesh, type ShaderMaterial } from 'three';
import { portalMatrix, type Portal } from '../physics';
interface View {
    group: Group;
    plane: Mesh<any, ShaderMaterial>;
    target: WebGLRenderTarget;
}
/** Two visible portal generations. Unique child targets prevent framebuffer feedback. */
export class PortalRenderer {
    private children = new Map<string, WebGLRenderTarget>();
    private cameraPool = new Map<string, PerspectiveCamera>();
    private bufferSize = new Vector2();
    private lastPasses:string[]=[];
    constructor(private renderer: WebGLRenderer, private scene: Scene,
        private quality: { software: boolean; maxWidth?: number; maxHeight?: number; samples?: number } = { software: false }) { }
    private configureRoots(views: View[]) {
        if (this.quality.software) return;
        const size = this.renderer.getDrawingBufferSize(this.bufferSize);
        if (size.x <= 0 || size.y <= 0) return;
        const scale = Math.min(1, (this.quality.maxWidth ?? 1440) / size.x,
            (this.quality.maxHeight ?? 960) / size.y);
        const width = Math.max(1, Math.round(size.x * scale));
        const height = Math.max(1, Math.round(size.y * scale));
        const samples = Math.max(0, Math.min(this.quality.samples ?? 4, this.renderer.capabilities.maxSamples ?? 0));
        for (const { target } of views) {
            const changedSamples = target.samples !== samples;
            target.samples = samples;
            if (target.width !== width || target.height !== height) target.setSize(width, height);
            else if (changedSamples) target.dispose();
        }
    }
    render(camera: PerspectiveCamera, portals: [
        Portal | undefined,
        Portal | undefined
    ], views: View[]) {
        if (!portals.every(Boolean))
            return;
        this.configureRoots(views);
        this.lastPasses=[];
        const originalTarget = this.renderer.getRenderTarget(), originalClip = this.renderer.clippingPlanes, shadowAuto = this.renderer.shadowMap.autoUpdate;
        this.renderer.shadowMap.autoUpdate = false;
        const originals = views.map(v => ({ view: v.plane.material.uniforms.view.value, paired: v.plane.material.uniforms.paired.value, visible: v.group.visible }));
        const renderOne = (index: number, viewer: PerspectiveCamera, depth: number, path: string): WebGLRenderTarget => {
            const entry = portals[index]!, exit = portals[1 - index]!, basis = portalMatrix(entry, exit).multiply(viewer.matrixWorld);
            let virtual = this.cameraPool.get(path);
            if (!virtual) {
                virtual = new PerspectiveCamera();
                this.cameraPool.set(path, virtual);
            }
            basis.decompose(virtual.position, virtual.quaternion, virtual.scale);
            virtual.projectionMatrix.copy(viewer.projectionMatrix);
            virtual.projectionMatrixInverse.copy(viewer.projectionMatrixInverse);
            virtual.updateMatrixWorld(true);
            let target: WebGLRenderTarget;
            if (path.length === 1)
                target = views[index].target;
            else {
                let t = this.children.get(path);
                if (!t) {
                    t = new WebGLRenderTarget(1, 1);
                    this.children.set(path, t);
                }
                const width = Math.max(256, Math.round(views[index].target.width * .65)), height = Math.max(144, Math.round(views[index].target.height * .65));
                if (t.width !== width || t.height !== height)
                    t.setSize(width, height);
                target = t;
            }
            const child = depth > 0 ? [renderOne(0, virtual, depth - 1, path + '0'), renderOne(1, virtual, depth - 1, path + '1')] : undefined;
            for (let j = 0; j < views.length; j++) {
                views[j].group.visible = true;
                views[j].plane.material.uniforms.paired.value = !!child;
                views[j].plane.material.uniforms.view.value = child?.[j].texture ?? originals[j].view;
            }
            this.renderer.clippingPlanes = [new Plane().setFromNormalAndCoplanarPoint(exit.normal, exit.center.clone().addScaledVector(exit.normal, .035))];
            this.renderer.setRenderTarget(target);
            this.renderer.clear();
            this.renderer.render(this.scene, virtual);
            this.lastPasses.push(path);
            return target;
        };
        try {
            renderOne(0, camera, 1, '0');
            renderOne(1, camera, 1, '1');
        }
        finally {
            this.renderer.setRenderTarget(originalTarget);
            this.renderer.clippingPlanes = originalClip;
            this.renderer.shadowMap.autoUpdate = shadowAuto;
            views.forEach((v, i) => { v.group.visible = originals[i].visible; v.plane.material.uniforms.paired.value = true; v.plane.material.uniforms.view.value = v.target.texture; });
        }
    }
    diagnostics(views:View[]){const size=this.renderer.getDrawingBufferSize(this.bufferSize);return {drawingBuffer:[size.x,size.y],software:this.quality.software,maxSamples:this.renderer.capabilities.maxSamples,roots:views.map(v=>({width:v.target.width,height:v.target.height,samples:v.target.samples})),children:[...this.children].map(([path,t])=>({path,width:t.width,height:t.height,samples:t.samples})),lastPasses:[...this.lastPasses]};}
    dispose() { this.children.forEach(t => t.dispose()); this.children.clear(); this.cameraPool.clear(); this.lastPasses=[]; }
}
