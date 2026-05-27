
### Skill 4: Icon Set Architect (`~/.agents/skills/icon-architect/SKILL.md`)

```markdown
---
name: icon-architect
description: Design and generate sets of brand icons for user interfaces and marketing materials. Trigger for "icon sets" or "app icons".
---

## Instructions

1. Clarify icon set: theme, quantity (minimum 24 icons), style (outline, filled, duotone, glyph), and format (SVG, PNG, WebP).
2. Generate SVG code for each icon with consistent:
   - ViewBox: "0 0 24 24"
   - Stroke width: 2px
   - Stroke-linecap: round
   - Stroke-linejoin: round
3. Provide usage examples:

```jsx
// React component
const Icon = ({ name, size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M..." stroke={color} strokeWidth={2} />
  </svg>
);