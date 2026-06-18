# Call sample audio

These files power the "Hear It For Yourself" section on the home page
(`src/views/partials/call-samples.ejs`, driven by `callSamples` in
`src/models/content.ts`).

## Current state

`sample-warm-lead-1.mp3` and `sample-warm-lead-2.mp3` are **placeholder silent
audio**. Replace them with real recordings (keep the same filenames and no code
changes are needed), or update the `src` paths in `callSamples`.

## Requirements for the real recordings

- **Format:** MP3 (`audio/mpeg`), CBR is fine.
- **Length:** trim to the strongest 60-150 seconds of the call.
- **Size:** keep each file under ~2 MB so the page stays fast.
- **Consent & privacy:** only use calls you have consent to share. Redact the
  owner's name, exact address, and any other PII (bleep or trim). Update the
  `motivation` / `outcome` captions in `content.ts` to match.
- **Quality:** normalize levels; remove long dead air at the start/end.

After replacing a file, hard-refresh and confirm the player shows the correct
duration and plays.
