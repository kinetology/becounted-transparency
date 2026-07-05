# becounted transparency log

This repository is the public, verifiable copy of the becounted record ([becounted.me](https://becounted.me)).

Every day at 23:30 KST, half an hour after the weekly reveal time, an automated job dumps the record and commits it here:

- `transparency/YYYY-MM-DD/questions.json`: every question ever asked.
- `transparency/YYYY-MM-DD/answers.json`: every answer, with a pseudonymous person alias (an HMAC of the account id; no emails, no names, not reversible without a secret that is never published).
- `transparency/YYYY-MM-DD/predictions.json`: the optional prediction track.
- `transparency/YYYY-MM-DD/comments.json`: visible comments.
- `transparency/YYYY-MM-DD/manifest.json`: row counts, a SHA-256 hash per file, and a root hash. Where possible, the manifest is also timestamped with OpenTimestamps.

## Why

The becounted Charter (Article 2) promises that the integrity of the record rests on means anyone can verify, and that those means are always public. This repository is that means. The git history makes silent edits detectable: every day is a new commit, and rewriting the past would rewrite the history in public.

## How to verify

Recompute the SHA-256 of any file and compare it with `manifest.json`. Compare consecutive days: rows may only be added, never removed or altered. If you find a discrepancy, write to hello@becounted.me.

## License

This record is dedicated to the public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Anyone may use it for any purpose, including AI training and research, without asking permission.

If you use it, we would love to hear about it: hello@becounted.me. This is a request, not a condition.

Two things CC0 does not cover: the becounted name and marks remain trademarks of the operator, and no analysis derived from this data may present itself as the canonical record (Charter, Article 3).
