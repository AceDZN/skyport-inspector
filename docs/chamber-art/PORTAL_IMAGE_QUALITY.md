# Close portal image quality · offline review and proposal

Status: proposal only. No runtime source, frozen dist, GPU/browser, physics, portal placement, clipping or colour-space change was made for this review. `src/chamber-scene.ts` remains 100,088 B, SHA-256 `43e0cf98a277a38836ff75955fcf812f7167a969f3a49b6f22e59b359975be70`.

## Actual frames inspected

Read-only parent captures, both 1440×900:

- `/Users/acedzn/idea-plotter/reports/rift-core-parent-release7/continuation-22/017-25-partial-held-return-at-actual-aperture.png`
- `/Users/acedzn/idea-plotter/reports/rift-core-parent-release7/continuation-22/018-25-reverse-held-seam-inspection.png`

The linked ceiling light strips, thin dark ceiling members and inner cyan portal edge show conspicuous pixel steps. The direct foreground projector has appreciably finer edges. In018 the cube's front recess/diamond remains clean; this finding is separate from the repaired coplanar cube-face defect. Static frames do not prove that every visible edge artifact has the same cause, nor establish temporal stability or all-angle clipping quality.

## Source evidence

`src/scene.ts:33` creates both root `WebGLRenderTarget`s without sample options. Its resize at40 fixes hardware width to 900 and preserves viewport aspect. At this capture aspect that is 900×563. `src/core/portal-renderer.ts:39–43` creates four unique second-generation targets without sample options, at .65 of root dimensions:585×366. The renderer has two visible generations/six scene passes; this review proposes no additional generation/pass.

The installed Three 0.180 `src/core/RenderTarget.js` explicitly defaults `samples` to 0, min/mag filters to linear and mipmaps off. `src/renderers/webgl/WebGLTextures.js` clamps requested samples to `renderer.capabilities.maxSamples`, allocates multisample renderbuffers when applicable and resolves them at the end of each render into a non-null target. The main canvas's `antialias:true` does not give these independent targets MSAA. Linear texture filtering smooths enlarged texels but cannot recover absent detail or antialias the original geometry coverage.

The portal shader uses full-screen projected coordinates, so a900-wide target sampled in a1440-wide screenshot has 1.6 screen pixels per source texel, even when only part of that texture appears inside the portal. The nested view has another resolution reduction. These settings are a concrete, plausible contributor to the inspected coarse edges. They are not a measured GPU diagnosis of all aliasing.

## Bounded change proposed to Root

There is no existing PortalRenderer quality option. Root owns that file; this review does not silently override it from the Scene. A concrete unapplied candidate is `PORTAL_QUALITY_PROPOSAL.diff` beside this note.

For hardware rendering only, size the two root targets from the actual drawing buffer, preserving aspect and capping width 1440/height 960. Never upscale a smaller drawing buffer. Use up to 4× MSAA on those two root targets, clamped to the reported capability; retain0 samples on all four child targets. Retain child scale .65, six unique targets, the two-generation limit, existing exit clip offset .035, shader colour-space/tone handling, shadow-update suppression and the software 480-wide/every-third-frame path. The already-correct paused/resize dirty refresh remains unchanged.

At1440×900 the roots become 1440×900 and children 936×585. This removes the 1.6× first-generation enlargement for a1440×900 drawing buffer; MSAA addresses geometry edge coverage within those roots. A nested portal can still be visibly softer, and MSAA does not eliminate material/specular/texture aliasing or create smoother underlying polygon geometry. Do not describe it as universal antialiasing or add global blur/sharpening to conceal remaining defects.

Only resize/reconfigure when dimensions or sample count change. If only samples change, dispose the old target GPU allocation before reuse; assigning `.samples` to an already allocated target alone is insufficient. Keep target objects/textures and the unique child pool ownership intact; existing room build disposes root targets and PortalRenderer disposes children.

## Cost and acceptance boundary

At1440×900, the summed six target areas rise from 1,869,840 to 4,782,240 pixels (2.558×); draw/pass count remains six. This is a raster-area estimate, not a frame-time prediction. Assuming4-byte colour and4-byte depth, current single-sample attachments are roughly 14.3MiB. Proposed roots with separate4× colour/depth buffers plus resolved colour/depth and the single-sample children are roughly 115.6MiB. Actual storage/resolve behaviour depends on the driver/extension, so this is an allocation estimate, not measured VRAM. MSAA and resolution are deliberately bounded; do not multisample all four recursive children by default.

Before acceptance, Root should capture the same close front/oblique portal and actual held straddle/reverse on the next frozen build, and compare direct versus linked thin edges at the same viewport. Record drawing-buffer dimensions, target dimensions, requested sample counts/capability, actual WebGL backend, framebuffer/shader errors and full-frame timing including all six passes. Check paused resize, narrow viewport, software fallback, linked colour continuity, source/exit clipping and room-change target cleanup. If hardware frame cost is unacceptable, test a 1280-wide root cap before increasing recursion or adding a postprocess; retain the same truthful comparison and report the tradeoff.

No improvement is claimed as implemented or visually verified. This proposal must not block the current mechanics freeze. The separate owned Tripo projector actual GET/mesh/shader/beam/cleanup gate remains open.
