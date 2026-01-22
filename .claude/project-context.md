# Project Context

## What is Dinner Decider?

A simple meal planning helper that randomly suggests what to cook for dinner from a user-curated list of meals. Helps avoid decision fatigue and optionally prevents repeating meals too frequently.

## Current State

- Single-page app, fully client-side
- No backend/database - all data stored in localStorage
- 7 default meals: Tacos, Stir-fry, Pasta, Curry, Pizza, Burgers, Roast chicken
- Dark mode UI

## Deployment

- **Hosting:** Vercel (auto-deploy on push to master)
- **GitHub repo:** matthendrix/dinner-decider
- **Production branch:** master
- **Node.js version:** 24.x
- **Env vars:** none configured
- **Pre-deploy check:** ensure `npm run build` succeeds locally

## Key Features

1. **Meal Management** - Add/remove meals from personal list
2. **Random Selection** - Pick a random meal with one click
3. **Recency Tracking** - Each meal stores its `lastPicked` date
4. **7-Day Avoidance** - Optional toggle to exclude recently picked meals from selection pool
5. **Quick Add** - Clickable suggestion chips to quickly add common meals
6. **Clear All / Restore Defaults** - Separate buttons for clearing vs restoring

## Data Structure

```typescript
type Meal = { name: string; lastPicked?: string };  // lastPicked is YYYY-MM-DD local date
type StoredState = { meals: Meal[]; avoidRecent: boolean };
```

localStorage key: `dinner-decider:v1`

## Feature Ideas

### Quick & Fun
- **"Not this one" button** - Reject a suggestion and get another without marking it as picked
- **Spin animation** - Slot machine or wheel effect when picking a meal
- **Meal stats** - Show most picked meal, longest avoided, total picks

### Medium Scope
- **Categories/tags** - Tag meals as "quick", "healthy", "fancy" and filter suggestions by mood
- **Weekly planner** - Plan all 7 days at once with drag-and-drop
- **Meal history** - See what you ate each day in a calendar view

### Bigger Projects
- **Shareable lists** - Encode meals in a URL so you can share with friends/family
- **Recipe links** - Attach a URL to each meal, click to open the recipe
- **PWA + notifications** - Make it installable, send a "time to decide dinner" reminder at 4pm

### Ambitious
- **AI suggestions** - "I'm in the mood for something quick and healthy" → Claude suggests meals
- **Ingredient tracking** - Add ingredients to meals, generate shopping lists
- **Supabase integration** - Cloud sync so meals persist across devices
