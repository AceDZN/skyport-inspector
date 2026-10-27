# Native core machinery art contract

The new Rapier core owns collision, pressure, controls and motion. Shared `ChamberScene` reads real `DeviceState`; it must not reintroduce the rejected campaign controller. New enclosed-family targets from the6–10 author are required before materially new visual work. This document records integration choices, not a claim that those rooms or visuals are implemented.

- A deck/body is centered on `d.position` and fits `d.spec.size`; the visible top agrees with the native collider top. A moving platform must visibly occupy its actual stop, with actual motion/arrival state.
- Lift controls ride at `d.position + controlOffset`. Other controls stay at `spec.position + controlOffset`. Visible switches/panels and contextual E aim must agree. Do not render a fixed base panel while native interaction travels with the lift, or vice versa.
- Use compact mounted metal/ceramic control panels, an actual lever and neutral actual-state lamps. No floating device IDs or always-correct green glow. Names, stop labels and direction arrows derive from the fixture's actual labels/states.
- Machinery reuses the original ceramic/graphite/aluminum/rubber kit, bevels, local grip/roughness detail and practical light. Deck edges and drive/guide detail must leave the authored boarding/landing envelope clear. Large apparent guardrails require corresponding authored solids; decorative thin rails must not imply an invisible walkable bridge.
- Conveyor surface animation/arrows follow actual direction/reversal and stop when its circuit is off. The visible belt top stays at the collider top.
- Optical emitters/receivers are neutral mechanical fixtures. Draw beam segments from `CoreWorld.beams` only; a receiver glows only when its real receiver flag is powered. A blocked segment ends at the actual collision point; never draw through an opaque wall or substitute a decorative line that claims a circuit connection.
- All meshes, local maps, displays and beam pools must be cleaned on room rebuild and stay in the main world so linked views render them coherently. The handheld projector remains a separate main-view overlay.

First two chamber fixtures and their proven behavior remain regression references. Shared source changes stay out of the frozen public bundle until the lead's next coordinated release.
