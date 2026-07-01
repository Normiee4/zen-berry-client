# Shipping Protocol

## Command
`/ship <feature>: <description>`

The feature name maps directly to `docs/features/<feature>/`. Use kebab-case for feature names.

## Agent Roles

| Agent | Mode | Permissions | Responsibility |
|-------|------|-------------|----------------|
| Planner | subagent | edit: allow | Create/update `docs/features/<name>/SPEC.md` |
| Builder | subagent | edit: allow | Implement code from SPEC.md, follow RULES.md |
| Tester | subagent | edit: allow | Create `docs/features/<name>/TEST-SPEC.md` + test files |
| Reviewer | subagent | edit: **deny** | Read-only audit, produce review report |

## Pipeline

```
/ship auth: fix login redirects
        │
        ▼
┌──────────┐
 │ Planner  │ → docs/features/auth/SPEC.md (new or updated)
└────┬─────┘
     │ spec path
     ▼
┌──────────┐
│ Builder  │ → implements code from spec
└────┬─────┘
     │ code files
     ▼
┌───────────┐
│ Reviewer  │ → Stage 1: code audit against spec
│ (code)    │
└───┬───┬───┘
pass│   │fail
    ▼   ▼
    │  ┌──────────┐
    │  │ Builder  │ → rework based on review
    │  └────┬─────┘
    │       │ (max 3 loops)
    │       ▼
    │  ┌───────────┐
    └──│ Reviewer  │ → re-audit
       │ (code)    │
       └───┬───┬───┘
      pass│   │fail → surface to user
           ▼
     ┌──────────┐
     │ Tester   │ → docs/features/auth/TEST-SPEC.md + tests/
     └────┬─────┘
          │ test files
          ▼
     ┌───────────┐
     │ Reviewer  │ → Stage 2: test audit against spec + AC
     │ (tests)   │
     └───┬───┬───┘
    pass│   │fail
        ▼   ▼
       │   ┌──────────┐
       │   │ Tester   │ → rework based on review
       │   └────┬─────┘
       │        │ (max 3 loops)
       │        ▼
       │   ┌───────────┐
       └───│ Reviewer  │ → re-audit
           │ (tests)   │
           └───┬───┬───┘
          pass│   │fail → surface to user
               ▼
            Result
```

## Context Passing
Each subagent receives from the orchestrator:
- Feature name (before colon)
- Feature description (after colon)
- Spec path (from planner onward)
- File list (from builder onward)

## Review Loops

### Stage 1 — Code Review
After Builder finishes, Reviewer audits code against the SPEC.md. On FAIL, the orchestrator loops back to Builder with the review report. Builder reworks, then Reviewer re-audits. Max 3 loops per stage before surfacing to the user.

### Stage 2 — Test Review
After Tester finishes, Reviewer audits tests against SPEC.md + acceptance criteria. On FAIL, the orchestrator loops back to Tester with the review report. Tester reworks, then Reviewer re-audits. Max 3 loops per stage before surfacing to the user.

## Spec Conventions
- `docs/features/<name>/SPEC.md` — feature spec, created/updated by planner
- `docs/features/<name>/TEST-SPEC.md` — test spec, created by tester
- Feature names are kebab-case, e.g., `analytics-dashboard`, `user-profile`
