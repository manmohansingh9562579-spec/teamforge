import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { LOGIC_DATA_CHALLENGES } from "@/lib/logicDataChallenges";
import { LogicDataProgress } from "@/models/LogicDataProgress";

export const dynamic = "force-dynamic";

const answerSchema = z.object({
  challengeId: z.string().trim().min(1).max(80),
  optionId: z.string().trim().min(1).max(80),
});

type ProgressRecord = {
  dateKey: string;
  challengeId: string;
  attempts: number;
  correctAttempts: number;
  solvedAt?: Date | string | null;
};

function dateKeyInIndia(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const fields = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${fields.year}-${fields.month}-${fields.day}`;
}

function shiftDateKey(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + amount)).toISOString().slice(0, 10);
}

function summarizeProgress(records: ProgressRecord[]) {
  const solvedIds = [...new Set(records.filter((record) => record.solvedAt).map((record) => record.challengeId))];
  const solvedDays = new Set(records.filter((record) => record.solvedAt).map((record) => record.dateKey));
  const today = dateKeyInIndia(new Date());
  let currentStreak = 0;
  let streakCursor = solvedDays.has(today)
    ? today
    : solvedDays.has(shiftDateKey(today, -1))
      ? shiftDateKey(today, -1)
      : null;

  while (streakCursor && solvedDays.has(streakCursor)) {
    currentStreak += 1;
    streakCursor = shiftDateKey(streakCursor, -1);
  }

  let bestStreak = 0;
  let runningStreak = 0;
  let previousDay: string | null = null;
  for (const day of [...solvedDays].sort()) {
    runningStreak = previousDay && shiftDateKey(previousDay, 1) === day ? runningStreak + 1 : 1;
    bestStreak = Math.max(bestStreak, runningStreak);
    previousDay = day;
  }

  return {
    solvedIds,
    stats: {
      solvedCount: solvedIds.length,
      totalAttempts: records.reduce((sum, record) => sum + record.attempts, 0),
      correctAttempts: records.reduce((sum, record) => sum + record.correctAttempts, 0),
      currentStreak,
      bestStreak,
    },
  };
}

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return apiOk({ authenticated: false, solvedIds: [], stats: null });
    }

    await connectDB();
    const records = await LogicDataProgress.find({ userId: session.user.id })
      .select("dateKey challengeId attempts correctAttempts solvedAt")
      .lean();

    return apiOk({ authenticated: true, ...summarizeProgress(records) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = answerSchema.parse(await request.json());
    const challenge = LOGIC_DATA_CHALLENGES.find((item) => item.id === payload.challengeId);
    if (!challenge) return apiError("Challenge not found", 404);
    if (!challenge.options.some((option) => option.id === payload.optionId)) {
      return apiError("Choose one of the listed answers", 400);
    }

    const correct = challenge.answerId === payload.optionId;
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return apiOk({
        authenticated: false,
        correct,
        explanation: correct ? challenge.explanation : undefined,
      });
    }

    await connectDB();
    const now = new Date();
    const dateKey = dateKeyInIndia(now);
    const filter = { userId: session.user.id, dateKey, challengeId: challenge.id };
    const update = {
      $set: {
        track: challenge.track,
        difficulty: challenge.difficulty,
        lastAttemptAt: now,
      },
      $setOnInsert: { userId: session.user.id, dateKey, challengeId: challenge.id },
      $inc: { attempts: 1, correctAttempts: correct ? 1 : 0 },
      ...(correct ? { $min: { solvedAt: now } } : {}),
    };

    try {
      await LogicDataProgress.findOneAndUpdate(filter, update, {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: false,
      });
    } catch (error) {
      if (!(error && typeof error === "object" && "code" in error && (error as { code?: number }).code === 11000)) {
        throw error;
      }
      await LogicDataProgress.findOneAndUpdate(filter, update, { new: true, runValidators: true });
    }

    const records = await LogicDataProgress.find({ userId: session.user.id })
      .select("dateKey challengeId attempts correctAttempts solvedAt")
      .lean();

    return apiOk({
      authenticated: true,
      correct,
      explanation: correct ? challenge.explanation : undefined,
      ...summarizeProgress(records),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
