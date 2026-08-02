import type { ScreenBlueprint } from '../../blueprint/schema';

export const getUiPrompt = (screen: ScreenBlueprint) => `
You are a UI Planner. For this screen:
- Screen Name: ${screen.name}
- Type: ${screen.type}
- Title: ${screen.title}

Map it to structural layout components.
Return ONLY valid JSON:
{
  "layout": "dashboard" | "list" | "form" | "split",
  "components": [
    { "type": "Button" | "Card" | "List" | "Calendar" | "Chart" | "Maps" | "Profile" | "Payment" | "Chat" | "Video", "label": "Label", "props": {} }
  ]
}
`.trim();
