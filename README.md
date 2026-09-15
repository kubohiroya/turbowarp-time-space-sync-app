# TurboWarp Time-Space Sync App

**English** | [日本語](README.ja.md)

An app for verifying the optical time correspondence and placement calibration of the time-space-sync extension against real cameras and real displays.

## Where this fits

This is the verification app for the `kubohiroya/turbowarp-time-space-sync` extension. The end-to-end venue setup procedure lives in a single SB3 owned by the consuming apps (realtime-motion-capture-app and photogrammetry-app in cluster mode). This app does not supply that procedure to them.

Adjacent steps belong to separate repositories.

- Lens calibration (intrinsics): `turbowarp-camera-calibration-app`. This app only reads the profile that repository produces, as a file; it contains no calibration procedure and no OpenCV.
- QR-carried WebRTC pairing: `turbowarp-webrtc-qrcode-pairing`. Used in multi-PC mode.

A paired connection cannot be handed over between apps. Opening a different SB3 recreates the WebRTC extension instance, and the existing connection becomes unreachable from blocks. Single-PC mode is therefore the primary target, and multi-PC mode will be added once the pairing extension is available.

## What's included

This is the initial scaffold generated from turbowarp-app-template. Use-case-specific features are not implemented.

- Mode selection, guidance, and error display built on the shared app-shell.
- Unpacked SB3 sources plus a startup-check script that updates a state variable when the green flag is clicked.
- Builds for the SB3 and the distribution page, SHA-256 recording, and CI.

The distribution page does not embed the TurboWarp player; it offers the startup-check SB3 for download. Run `build:sb3` before downloading from the dev server.

## Planned

- Assign multiple cameraIds and display the unified reference surface (the time-code panel and a dimensional reference of known size) full screen.
- Guide decoder level calibration and observation gathering, showing decode rate, contrast, and observation count.
- Estimate and present relative latency between cameras. Show display latency, clock offset, and the undetermined component separately, and state explicitly that absolute latency cannot be derived.
- Enter and record the real-world dimensions of the reference surface and the projection conditions. Distinguish estimates from measurements, and prompt for re-confirmation when display settings change.
- Solve placement against the common reference, and show the reprojection error together with independent validation using observations not used in the solve.
- Load the intrinsic calibration profile from a file. Reject profiles that do not match the capture conditions, or whose match cannot be determined, before they are applied.
- Export and import results. Treat an imported placement result as unverified until it passes re-confirmation, and never as final before that.

## Modes

- **Single PC**: Handles multiple cameras attached to one PC. Requires no WebRTC pairing. The primary target.
- **Multi PC**: To be added once the QR-carried pairing extension is available. OFF by default.

## Dependencies and responsibilities

- time-space-sync: estimation of optical time correspondence, and the placement solve against a fixed rig or common reference. The subject of this app's verification.
- camera-source: camera acquisition, lease, and capture conditions, plus the contract for the intrinsic calibration profile.
- camera-calibration-app: produces the intrinsic calibration profile. This app only receives it as a file and contains no calibration procedure and no OpenCV.
- webrtc-qrcode-pairing / webrtc: used in multi-PC mode. Unused in single-PC mode.

The only actual dependency is turbowarp-app-shell 0.2.0 in package.json. The use-case-specific connections above are planned, and do not rely on any unreleased early extension. When one is added, its exact version, artifact hash, API manifest, and evaluation order will be pinned.

## Layout and development

Node.js >=22.18.0, pnpm 11.11.0.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm dev
```

- `config/app.json`: name, modes, description, and planned work.
- `config/feature-flags.ts`: experimental feature flags, fixed at startup and OFF by default.
- `scripts/project.ts`: the source of truth for the startup-check SB3.
- `apps/main/source`: the generated unpacked SB3 sources.
- `src`: the distribution page built on the shared shell.
- `public/downloads`: the generated SB3 and release.json.
- `dist`: build output for the distribution page and downloads.

After changing `project.ts` or the title, run `pnpm source:update` to regenerate the sources. Generated SB3 files and `dist` are not tracked by Git. Archives are produced with sb3-toolchain.

## Staged rollout and acceptance criteria

1. In the related GitHub Issue, settle what to extract from the existing implementation, its dependencies, the DoD, and the rollback path.
2. Add the use-case-specific path behind a flag that is OFF by default, and replace the existing path with delegation.
3. Record error, latency, stalls, and recovery in hardware integration testing.
4. Do not reimplement the core extension's algorithms inside the app.

The DoD for the initial scaffold is: `pnpm check` passes, the SB3 updates its state on the green flag, and the distribution page shows the description, mode selection, and SB3 download. Real-device verification of camera-based features has not been performed.

## Rollback and task management

New paths are stopped by turning their flag OFF in `config/feature-flags.ts`, and compatibility reads for the old app path are kept during migration. Turning the initial flags ON does not implement any use-case-specific feature.

GitHub Issues are the source of truth for progress, recording start/done/blocked. The scope and the reasoning behind the design decisions are in [Issue #1](https://github.com/kubohiroya/turbowarp-time-space-sync-app/issues/1).

## Origin

The shared structure is extracted from the kamishibai (picture-story) app and realtime-motion-capture-app. See the [extraction notes](docs/extraction.md) (Japanese) for details.

## License

MPL-2.0. The package is private in its initial state.
