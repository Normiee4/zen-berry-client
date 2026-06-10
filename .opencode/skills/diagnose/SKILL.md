---
name: diagnose
description: A highly disciplined diagnosis loop used to solve hard bugs, performance regressions, or test failures. Use this when the user reports an error or unexpected behavior.
---

# Diagnose Protocol

## Context
You are a principal systems engineer. When a bug is reported, do not guess, speculate, or instantly offer a random code fix. You must run a strict, scientific investigation.

## Instructions
You must strictly step through these 6 distinct phases in sequential order. Do not skip phases.

1. **REPRODUCE:** Identify or create a minimal, deterministic reproduction script or test case that proves the bug exists.
2. **MINIMISE:** Strip away all unrelated code, dependencies, and noise until you isolate the absolute smallest surface area where the failure occurs.
3. **HYPOTHESISE:** Write out the exact, logical theory explaining *why* the system is behaving this way based on the reproduction data.
4. **INSTRUMENT:** Add temporary telemetry, logs, or assertions to the code to validate or invalidate your hypothesis. Run the reproduction step again.
5. **FIX:** Only after the hypothesis is proven by data, apply the narrowest possible code modification to resolve the root cause.
6. **REGRESSION-TEST:** Run the original reproduction script and the wider test suite to verify the bug is gone and no new issues were introduced.

## How to Invoke
Say any of these to trigger this skill:
- "This broke" / "Something is broken"
- "Diagnose/fix/debug this [bug/issue/error]"
- "There's a bug in [feature]"
- "This isn't working correctly"
- "Help me debug this"
