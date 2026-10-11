# Understand attention: lesson, live model, your own code

**Goal:** explain how queries, keys, values and the causal mask produce one attention output, and show it in code you wrote.

**Use:** two lessons from [AI Engineering from Scratch](https://github.com/rohitg00/ai-engineering-from-scratch) and [Transformer Explainer](https://poloclub.github.io/transformer-explainer/). Any chat model can play the examiner in step 4.

**Time:** about three hours. This is a manual recipe; nothing connects the tools for you.

## 1. Read one lesson

Work through [Self-Attention from Scratch](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/07-transformers-deep-dive/02-self-attention-from-scratch) (phase 07, lesson 02). It builds scaled dot-product attention in NumPy and estimates 90 minutes.

Before you start, write down what you think Q, K and V are for. Keep the note.

## 2. Watch a real model do it

Open Transformer Explainer and type a sentence of five or six words.

- Open the attention view for one head. Find a token that attends strongly to an earlier token.
- Step through to the masked attention matrix. Say why its upper triangle is blank.
- Change the temperature. Note what changes: the attention weights, or only the final choice of token?

Write one sentence for each.

## 3. Write it yourself

Close the lesson. Write single-head attention for a sequence of four tokens with small dimensions you can print: the input, the three projections, the scores, the weights and the output.

Then add a causal mask. The lesson 02 code has none; [GPT: Causal Language Modeling](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/07-transformers-deep-dive/07-gpt-causal-language-modeling) (lesson 07) implements one if you get stuck.

Change the sequence length to six. Predict the shape of every array before you run it.

## 4. Get examined

Paste your code into a chat model with this prompt:

> Quiz me on this implementation. First ask me to explain every array shape without hints. Then show me a version with a broken mask and ask me to find the bug. Then ask what changes when I add a second head. Wait for my answer each time before you give feedback.

## Keep

- Your implementation.
- One worked example with the shapes written out.
- Your note from step 1, corrected.
- Two mistakes you made and what fixed them.
