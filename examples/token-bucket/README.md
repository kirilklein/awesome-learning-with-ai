# One concept, three ways: a token bucket

A token bucket rate limiter is small enough to check by hand, which makes it a fair test of what a tool adds. The same request went to plain Claude and to the HTML Explainer skill. The third exhibit is the Anatomy author's own figure of the same idea.

## The request

> Build an interactive explanation of a token bucket rate limiter as one self-contained HTML file I can open in a browser.
>
> - The bucket holds 10 tokens and refills at 2 tokens per second.
> - Each request takes one token. A request is rejected when the bucket is empty.
> - Let me change the request rate and see what happens.
> - The reader is a developer who is new to rate limiting.
> - Include a short quiz at the end.
> - Light background.

Run on 11 October 2026 in Claude Code with Claude Opus 5.5. Each build ran in a fresh agent that had not seen the other.

## Results

| | Plain Claude | HTML Explainer |
| --- | --- | --- |
| Output | [plain-claude.html](plain-claude.html) | [html-explainer.html](html-explainer.html) |
| Time | 8 min | 23 min |
| Tokens used | about 113k | about 256k |
| Page length at 1200 px wide | 3,800 px | 7,200 px |
| Demos | one live simulator | a step-by-hand bucket, a live simulator, capacity and refill sliders |
| Quiz | 4 questions | 4 questions |
| Sources cited | none | three |
| Self-contained | yes | no: loads IBM Plex from Google Fonts |
| Hand calculations (below) | all pass | all pass |

GitHub shows HTML files as source. Download them and open them in a browser.

| Plain Claude | HTML Explainer |
| --- | --- |
| ![Plain Claude simulator](plain-claude.png) | ![HTML Explainer simulator](html-explainer.png) |

## The check

Three cases, worked out by hand before looking at either page, then run against each page's own simulation code.

| Case | Expected | Plain Claude | HTML Explainer |
| --- | --- | --- | --- |
| 15 requests at once, full bucket | 10 accepted, 5 rejected | 10 and 5 | 10 and 5 |
| Steady 1 request/s for two minutes | no rejections | none | none |
| Steady 4 requests/s from full | empty after about 5 s, then 2 accepted per second | first rejection at 5.00 s, then 2.00/s | first rejection at 4.75 s or 5.00 s, then 2.00/s |

The third case caught the checker, not the pages. "Empty after 5 s" is the smooth approximation, 10 ÷ (4 − 2). With whole requests the first rejection lands at 4.75 s if a request arrives at t = 0, and at 5.00 s if the first one arrives a quarter second later. Both pages compute this correctly.

## What the skill added

- **Depth.** Two more demos, a "common misreading" note about what "2 per second" allows in a single second, and a section comparing other limiters.
- **Design.** A consistent type and colour system, and one meaning per colour throughout.
- **A review loop.** It rendered the page five times and fixed what the screenshots showed, mostly mobile layout.

It did not add correctness. The plain build also tested its own simulation and opened the page in a headless browser, without being asked.

## What went wrong

- **HTML Explainer:** the page depends on Google Fonts, although the request said self-contained. Two steps of the skill were skipped in this run: its review overlay, and a fresh-eyes pass by a second agent.
- **Plain Claude:** request dots overlap at 320 px wide, and it added a code section nobody asked for.

## Anatomy

No Anatomy figure was built for this comparison. Its author already publishes one made with the skill from a one-line prompt: [Token bucket, No. 27](https://skills.wheresryan.sh/anatomy/collection/rate-limiter). A pump fills a tank at two tokens a second, and each press of a punch spends one.

It is a different kind of thing. You punch requests by hand, there is no rate control and no quiz, and the capacity is 8, not 10. It is a figure to put inside a lesson. The skill's instructions budget 30 to 90 minutes for a figure of this size.

## Verdict

For learning the concept yourself, the plain page is enough, and it took a third of the time. For a lesson you would hand to other people, the skill's page is closer to finished. Either way, working out a few cases by hand first is what told us the pages were right.
