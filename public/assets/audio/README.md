# Call sample audio

These files power the "Hear It For Yourself" section on the home page
(`src/views/partials/call-samples.ejs`, driven by `callSamples` in
`src/models/content.ts`).

## Current state

`sample-call-1.mp3` (Mitchell County, TX - 155 acres) and `sample-call-2.mp3`
(Lake City, FL - 73 acres) are **real cold-call recordings**, wired up via
`callSamples`. The on-page captions (title / market / motivation / outcome) were
written from the call transcripts; owner names, emails, and exact addresses are
intentionally omitted. To swap a recording, replace the file (keep the filename)
or update the `src` path in `callSamples`.

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
