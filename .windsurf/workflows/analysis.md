---
description: Analyze code structure and behavior
---

## Usage
@[/analysis] <path-or-component>

## Steps
1. Identify responsibilities of each part.
2. Trace data flow and dependencies.
3. Detect:
   - duplication
   - unclear structure
   - misplaced logic
4. Do not modify code.
5. Provide findings and improvements.

## Example
@[/analysis] src/lib/store/animeStore.ts