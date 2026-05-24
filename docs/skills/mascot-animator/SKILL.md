---
name: mascot-animator
description: Create and export brand mascot animations in Lottie JSON format. Trigger for animated mascots or characters.
---

## Instructions

1. Determine mascot use case: website hero, onboarding flow, error state, idle animation, or interactive chatbot.
2. Define animation style: bounce, wave, idle, walk cycle, or custom sequence.
3. Generate Lottie JSON structure:

```json
{
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 90,
  "w": 512,
  "h": 512,
  "assets": [],
  "layers": [
    {
      "ty": 4,
      "nm": "Mascot Body",
      "ks": {
        "p": { "a": 0, "k": [256, 256] },
        "s": { "a": 1, "k": [{ "t": 0, "s": [100, 100] }, { "t": 30, "s": [110, 110] }, { "t": 60, "s": [100, 100] }] }
      }
    }
  ]
}