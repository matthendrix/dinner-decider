# Project Context

## What is Dinner Decider?

A simple meal planning helper that randomly suggests what to cook for dinner from a user-curated list of meals. Helps avoid decision fatigue and optionally prevents repeating meals too frequently.

## Current State

- Single-page app, fully client-side
- No backend/database - all data stored in localStorage
- Default meals: Tacos, Stir-fry, Bolognese

## Key Features

1. **Meal Management** - Add/remove meals from personal list
2. **Random Selection** - Pick a random meal with one click
3. **Recency Tracking** - Each meal stores its `lastPicked` date
4. **7-Day Avoidance** - Optional toggle to exclude recently picked meals from selection pool
5. **Reset** - Clear all data and restore defaults

## Data Structure

```typescript
type Meal = { name: string; lastPicked?: string };  // lastPicked is ISO date string
type StoredState = { meals: Meal[]; avoidRecent: boolean };
```

localStorage key: `dinner-decider:v1`

## Potential Future Enhancements

- Supabase integration for cloud sync (mentioned in footer)
- Categories/tags for meals
- Meal history view
- Share meal lists
