"use client";

import { useEffect, useMemo, useState } from "react";


type Meal = { name: string; lastPicked?: string };

const STORAGE_KEY = "dinner-decider:v1";

const DEFAULT_MEALS: Meal[] = [
  { name: "Tacos" },
  { name: "Stir-fry" },
  { name: "Pasta" },
  { name: "Curry" },
  { name: "Pizza" },
  { name: "Burgers" },
  { name: "Roast chicken" },
];

type StoredState = {
  meals: Meal[];
  avoidRecent: boolean;
};

function normalizeDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const match = value.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (!match) return undefined;
  const [, y, m, d] = match;
  const month = parseInt(m, 10);
  const day = parseInt(d, 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  return `${y}-${m}-${d}`;
}

function loadState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;

    if (!Array.isArray(parsed.meals) || typeof parsed.avoidRecent !== "boolean") {
      return null;
    }

    // Validate and sanitize meal entries
    const validMeals = parsed.meals
      .filter((m): m is Meal => typeof m === "object" && m !== null && typeof m.name === "string" && m.name.trim() !== "")
      .map((m) => ({
        name: m.name.trim(),
        lastPicked: normalizeDate(m.lastPicked),
      }));

    return { meals: validMeals, avoidRecent: parsed.avoidRecent };
  } catch {
    return null;
  }
}

function saveState(state: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore (storage full / blocked)
  }
}


function localDateString(date: Date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDateString(d);
}

export default function Home() {
  const [mealName, setMealName] = useState("");
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS);
  const [suggestion, setSuggestion] = useState<string>("");
  const [avoidRecent, setAvoidRecent] = useState<boolean>(true);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setMeals(saved.meals);
      setAvoidRecent(saved.avoidRecent);
    }
  }, []);

  useEffect(() => {
    saveState({ meals, avoidRecent });
  }, [meals, avoidRecent]);


  const sortedMeals = useMemo(
    () => [...meals].sort((a, b) => a.name.localeCompare(b.name)),
    [meals]
  );

  function addMeal() {
    const name = mealName.trim();
    if (!name) return;
    if (meals.some((m) => m.name.toLowerCase() === name.toLowerCase())) return;

    setMeals((prev) => [...prev, { name }]);
    setMealName("");
  }

  function removeMeal(name: string) {
    setMeals((prev) => prev.filter((m) => m.name !== name));
    if (suggestion === name) setSuggestion("");
  }

  function pickMeal() {
    if (!meals.length) return;

    const today = localDateString();
    const oneWeekAgo = daysAgo(7);

    const candidates = avoidRecent
      ? meals.filter((m) => !m.lastPicked || m.lastPicked < oneWeekAgo)
      : meals;

    const pool = candidates.length ? candidates : meals;
    const chosen = pool[Math.floor(Math.random() * pool.length)].name;

    setSuggestion(chosen);
    setMeals((prev) =>
      prev.map((m) => (m.name === chosen ? { ...m, lastPicked: today } : m))
    );
  }

  return (
    <main className="min-h-screen p-6 sm:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Dinner Decider</h1>
          <p className="text-sm text-neutral-400">
            Add meals, then let fate decide. Avoid repeats from the last week if
            you want.
          </p>
        </header>

        <section className="rounded-xl border border-neutral-700 p-4 space-y-3">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 placeholder-neutral-500"
              placeholder="Add a meal (e.g. butter chicken)"
              aria-label="Meal name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMeal()}
            />
            <button
              className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-800 transition-colors"
              onClick={addMeal}
              type="button"
            >
              Add
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={avoidRecent}
              onChange={(e) => setAvoidRecent(e.target.checked)}
            />
            Avoid meals picked in the last 7 days
          </label>

          <div className="flex gap-2 flex-wrap">
            <button
              className="rounded-lg bg-emerald-600 text-white px-6 py-3 text-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
              onClick={pickMeal}
              disabled={meals.length === 0}
              type="button"
            >
              Suggest dinner
            </button>

            {suggestion && (
              <button
                className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-800 transition-colors"
                onClick={() => setSuggestion("")}
                type="button"
              >
                Clear
              </button>
            )}

            <button
              className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-800 transition-colors"
              onClick={() => {
                const ok = window.confirm("Clear all meals? This cannot be undone.");
                if (!ok) return;
                setMeals([]);
                setSuggestion("");
              }}
              type="button"
            >
              Clear all
            </button>

            <button
              className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-800 transition-colors"
              onClick={() => {
                setMeals(DEFAULT_MEALS);
                setSuggestion("");
              }}
              type="button"
            >
              Restore defaults
            </button>
          </div>


          {suggestion && (
            <div className="rounded-lg bg-neutral-800 border border-neutral-700 p-4">
              <div className="text-sm text-neutral-400">Tonight is…</div>
              <div className="text-2xl font-semibold">{suggestion}</div>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-neutral-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Meals</h2>
            <span className="text-sm text-neutral-500">
              {meals.length} {meals.length === 1 ? "meal" : "meals"}
            </span>
          </div>
          {sortedMeals.length === 0 ? (
            <p className="text-sm text-neutral-500">No meals yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-700">
              {sortedMeals.map((m) => (
                <li key={m.name} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    {m.lastPicked && (
                      <div className="text-xs text-neutral-500">
                        Last picked: {m.lastPicked}
                      </div>
                    )}
                  </div>
                  <button
                    className="text-sm rounded-lg border border-neutral-700 px-3 py-1 hover:bg-neutral-800 transition-colors"
                    onClick={() => removeMeal(m.name)}
                    type="button"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-neutral-700 p-4">
          <h2 className="font-semibold mb-3">Quick add</h2>
          <div className="flex flex-wrap gap-2">
            {["Tacos", "Stir-fry", "Pasta", "Curry", "Pizza", "Burgers", "Salad", "Soup", "Sushi", "Roast chicken"]
              .filter((name) => !meals.some((m) => m.name.toLowerCase() === name.toLowerCase()))
              .map((name) => (
                <button
                  key={name}
                  className="rounded-full border border-neutral-600 bg-neutral-800 px-3 py-1 text-sm hover:bg-neutral-700 transition-colors"
                  onClick={() => setMeals((prev) => [...prev, { name }])}
                  type="button"
                >
                  + {name}
                </button>
              ))}
          </div>
          {meals.length > 0 &&
            ["Tacos", "Stir-fry", "Pasta", "Curry", "Pizza", "Burgers", "Salad", "Soup", "Sushi", "Roast chicken"]
              .filter((name) => !meals.some((m) => m.name.toLowerCase() === name.toLowerCase())).length === 0 && (
            <p className="text-sm text-neutral-500">All suggestions added!</p>
          )}
        </section>

        <footer className="text-xs text-neutral-500">
          v0.1
        </footer>
      </div>
    </main>
  );
}
