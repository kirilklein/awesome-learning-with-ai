# Check that you understand a mechanism: predict, build, compare

**Goal:** find out whether you can predict what a mechanism does, using an interactive model as the referee.

**Use:** a coding agent. Optionally [HTML Explainer](https://github.com/ds-vibe/html-explainer) for a fuller lesson, or [Anatomy](https://github.com/wheresryan22/anatomy) for a figure worth publishing.

**Worked example:** [a token bucket, built two ways](../examples/token-bucket/README.md).

## 1. Write the rules and the numbers

Pick a mechanism with a few rules and real quantities. State them before you ask for anything.

Example: a bucket holds 10 tokens and refills at 2 per second. Each request takes one token. A request is rejected when the bucket is empty.

## 2. Predict three cases by hand

Choose cases that pull in different directions, and write your answers down.

1. 15 requests arrive at once. How many are accepted?
2. Requests arrive at a steady 1 per second. When is the first one rejected?
3. Requests arrive at a steady 4 per second. When is the first one rejected, and how many get through per second after that?

## 3. Build the model

Give the agent your rules and ask for a single HTML file with a control for the quantity you want to vary. Pick the tool by how much time you have.

| Tool | Time | You get |
| --- | --- | --- |
| Plain prompt | 8 min in the worked example | one simulator and a quiz |
| HTML Explainer | 23 min in the worked example | a full lesson with three demos |
| Anatomy | 30 to 90 min by its own estimate | a detailed figure, without a lesson around it |

## 4. Compare

Run your three cases. Where the page and your prediction disagree, one of you is wrong. Find out which by reading the simulation code or by working the case step by step.

In the worked example, case 3 exposed the prediction. "Empty after 5 seconds" is a smooth approximation; with whole requests the first rejection comes at 4.75 s or 5.00 s, depending on when the first request arrives.

## 5. Name what the model leaves out

Real traffic is not evenly spaced, and a real limiter keeps one bucket per client across several servers. Write two sentences on what your model ignores.

## Keep

- Your three predictions and the observed results.
- The HTML file and the rules you gave.
- One disagreement and what resolved it.
- What the model leaves out.
