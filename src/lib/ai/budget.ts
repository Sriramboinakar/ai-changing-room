import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Daily real-AI budget.
 *
 * The free IDM-VTON Space runs on Hugging Face ZeroGPU, which is capped at a
 * small daily GPU-time quota per account. Once that quota is burned, the
 * Space starts erroring — so we keep our own counter and stop sending real
 * jobs for the rest of the day, returning demo results instead.
 *
 * Configuration:
 *   AI_DAILY_LIMIT         max real generations per day (default 5; 0 = unlimited)
 *   AI_DAILY_BUDGET_FILE   custom counter path (default: <os.tmpdir()>/ai-changing-room-ai-budget.json)
 *
 * Persistence is a small JSON file, which is stable on a long-running dev
 * server. On Vercel it's best-effort per serverless instance — a soft limiter;
 * Hugging Face still enforces the real quota.
 */

export interface AiBudgetStatus {
  enabled: boolean;
  limit: number;
  used: number;
  remaining: number;
  /** UTC date (YYYY-MM-DD) the counter belongs to. */
  resetDate: string;
  exhausted: boolean;
}

interface StoredBudget {
  date: string;
  used: number;
}

const memoryBudget: Map<string, number> = new Map();
const DEFAULT_LIMIT = 5;

function todayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function dailyLimit(): number {
  const raw = process.env.AI_DAILY_LIMIT?.trim();
  if (!raw) return DEFAULT_LIMIT;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : DEFAULT_LIMIT;
}

function budgetFile(): string {
  return (
    process.env.AI_DAILY_BUDGET_FILE?.trim() ||
    path.join(os.tmpdir(), "ai-changing-room-ai-budget.json")
  );
}

function readStored(): StoredBudget {
  const today = todayKey();
  try {
    const parsed = JSON.parse(readFileSync(budgetFile(), "utf8")) as StoredBudget;
    if (parsed && typeof parsed.used === "number") {
      if (parsed.date === today) {
        return { date: today, used: Math.max(0, Math.floor(parsed.used)) };
      }
      return { date: today, used: 0 };
    }
  } catch {
    // first run or unwritable dir — fall through to in-memory
  }
  return { date: today, used: memoryBudget.get(today) ?? 0 };
}

function writeStored(used: number): void {
  const today = todayKey();
  memoryBudget.set(today, used);
  try {
    mkdirSync(path.dirname(budgetFile()), { recursive: true });
    writeFileSync(budgetFile(), JSON.stringify({ date: today, used }), "utf8");
  } catch {
    // best-effort; the in-memory map still tracks usage this process
  }
}

export function getAiBudgetStatus(): AiBudgetStatus {
  const limit = dailyLimit();
  const { used } = readStored();
  const remaining = Math.max(0, limit - used);
  return {
    enabled: limit > 0,
    limit,
    used,
    remaining,
    resetDate: todayKey(),
    exhausted: remaining <= 0,
  };
}

/**
 * Counts one real-AI attempt. Returns false (without counting) when the
 * daily allowance is already used up, or true when the attempt is allowed.
 * A limit of 0 means unlimited.
 */
export function tryConsumeAiBudget(): boolean {
  const limit = dailyLimit();
  if (limit <= 0) return true;
  const stored = readStored();
  if (stored.used >= limit) return false;
  writeStored(stored.used + 1);
  return true;
}
