"use client";

import { useEffect, useMemo, useState } from "react";


type Meal = { name: string; lastPicked?: string; pickCount?: number };

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
  // Validate by creating a Date and checking it matches the input
  const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  if (
    date.getFullYear() !== parseInt(y, 10) ||
    date.getMonth() !== parseInt(m, 10) - 1 ||
    date.getDate() !== parseInt(d, 10)
  ) {
    return undefined;
  }
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
        pickCount: typeof m.pickCount === "number" && m.pickCount >= 0 ? m.pickCount : undefined,
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

  const stats = useMemo(() => {
    const totalPicks = meals.reduce((sum, m) => sum + (m.pickCount ?? 0), 0);

    // Only consider meals that have been picked at least once
    const pickedMeals = meals.filter((m) => (m.pickCount ?? 0) > 0);

    const mostPicked = pickedMeals.reduce<Meal | null>(
      (best, m) => (!best || (m.pickCount ?? 0) > (best.pickCount ?? 0) ? m : best),
      null
    );

    // Longest avoided = meal with oldest lastPicked date (among meals that have been picked)
    const longestAvoided = pickedMeals.reduce<Meal | null>((oldest, m) => {
      if (!oldest) return m;
      if (!m.lastPicked) return oldest;
      if (!oldest.lastPicked) return m;
      return m.lastPicked < oldest.lastPicked ? m : oldest;
    }, null);

    return { totalPicks, mostPicked, longestAvoided };
  }, [meals]);

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
      prev.map((m) =>
        m.name === chosen
          ? { ...m, lastPicked: today, pickCount: (m.pickCount ?? 0) + 1 }
          : m
      )
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
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
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

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={avoidRecent}
              onChange={(e) => setAvoidRecent(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
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

            <button
              className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-800 transition-colors"
              onClick={() => {
                setMeals(DEFAULT_MEALS);
                setSuggestion("");
                setMealName("");
              }}
              type="button"
            >
              Restore defaults
            </button>

            <button
              className="rounded-lg border border-red-800 text-red-400 px-4 py-2 hover:bg-red-950 transition-colors"
              onClick={() => {
                const ok = window.confirm("Clear all meals? This cannot be undone.");
                if (!ok) return;
                setMeals([]);
                setSuggestion("");
                setMealName("");
              }}
              type="button"
            >
              Clear all
            </button>
          </div>

          <div className={`rounded-lg p-4 ${suggestion ? "bg-emerald-950 border-2 border-emerald-700" : "bg-neutral-800 border border-neutral-700"}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-400">Tonight is…</div>
                <div className={`font-semibold ${suggestion ? "text-3xl text-emerald-100" : "text-2xl"}`}>
                  {suggestion || <span className="text-neutral-600">Click &quot;Suggest dinner&quot; to find out</span>}
                </div>
              </div>
              {suggestion && (
                <button
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                  onClick={() => setSuggestion("")}
                  type="button"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
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
              {sortedMeals.map((m) => {
                const isRecent = m.lastPicked && m.lastPicked >= daysAgo(7);
                return (
                  <li key={m.name} className={`flex items-center justify-between py-2 ${isRecent ? "opacity-50" : ""}`}>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {m.name}
                        {isRecent && (
                          <span className="text-xs bg-neutral-700 text-neutral-400 px-1.5 py-0.5 rounded font-normal">recent</span>
                        )}
                      </div>
                      {m.lastPicked && (
                        <div className="text-xs text-neutral-500">
                          Last picked: {m.lastPicked}
                        </div>
                      )}
                    </div>
                    <button
                      className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                      onClick={() => removeMeal(m.name)}
                      type="button"
                      aria-label={`Remove ${m.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {["Tacos", "Stir-fry", "Pasta", "Curry", "Pizza", "Burgers", "Salad", "Soup", "Sushi", "Roast chicken"]
          .filter((name) => !meals.some((m) => m.name.toLowerCase() === name.toLowerCase())).length > 0 && (
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
          </section>
        )}

        {stats.totalPicks > 0 && (
          <section className="rounded-xl border border-neutral-700 p-4">
            <h2 className="font-semibold mb-3">Stats</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold">{stats.totalPicks}</div>
                <div className="text-xs text-neutral-500">Total picks</div>
              </div>
              <div>
                <div className="text-2xl font-semibold truncate">
                  {stats.mostPicked?.name ?? "—"}
                </div>
                <div className="text-xs text-neutral-500">
                  Most picked{stats.mostPicked?.pickCount ? ` (${stats.mostPicked.pickCount})` : ""}
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold truncate">
                  {stats.longestAvoided?.name ?? "—"}
                </div>
                <div className="text-xs text-neutral-500">
                  Longest avoided
                  {stats.longestAvoided?.lastPicked && (
                    <span className="block">since {stats.longestAvoided.lastPicked}</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

              </div>
    </main>
  );
}
