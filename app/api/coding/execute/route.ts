import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { CODING_PROBLEMS, getUtcDateKey } from "@/lib/codingChallenges";
import { getJudge0LanguageIds, judge0Fetch } from "@/lib/judge0";
import { DailyCodingProgress } from "@/models/DailyCodingProgress";
import { codingExecutionSchema } from "@/validations/coding";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Sign in to run and submit code", 401);

    const data = codingExecutionSchema.parse(await request.json());
    const problem = CODING_PROBLEMS.find((item) => item.slug === data.problemSlug);
    if (!problem) return apiError("This coding question is no longer available", 404);

    await connectDB();
    const dateKey = getUtcDateKey();
    const userId = session.user.id;
    const now = new Date();
    const existingToday = await DailyCodingProgress.find({ userId, dateKey })
      .select("attempts lastAttemptAt +runStatus +runStartedAt")
      .lean();
    const attemptsToday = existingToday.reduce((total: number, item: any) => total + item.attempts, 0);
    if (attemptsToday >= 30) return apiError("Daily run limit reached. Come back tomorrow for another set of attempts.", 429);

    const latestAttempt = existingToday.reduce<any>((latest, item) =>
      !latest || item.lastAttemptAt > latest.lastAttemptAt ? item : latest, null);
    if (latestAttempt && now.getTime() - new Date(latestAttempt.lastAttemptAt).getTime() < 2000) {
      return apiError("Give the code runner a moment before starting another run.", 429);
    }
    const activeRun = existingToday.find((item: any) =>
      ["preparing", "queued", "running"].includes(item.runStatus) &&
      item.runStartedAt && now.getTime() - new Date(item.runStartedAt).getTime() < 90_000
    );
    if (activeRun) return apiError("Your previous run is still processing. Wait for its result first.", 409);

    let progress;
    try {
      progress = await DailyCodingProgress.findOneAndUpdate(
        { userId, dateKey, problemSlug: problem.slug },
        {
          $set: {
            language: data.language,
            sourceCode: data.sourceCode,
            lastAttemptAt: now,
            judgeTokens: [],
            judgeMode: data.mode,
            runStatus: "preparing",
            runStartedAt: now,
            lastResults: [],
          },
          $inc: { attempts: 1 },
          $setOnInsert: { accepted: false },
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && (err as any).code === 11000) {
        progress = await DailyCodingProgress.findOneAndUpdate(
          { userId, dateKey, problemSlug: problem.slug },
          {
            $set: {
              language: data.language,
              sourceCode: data.sourceCode,
              lastAttemptAt: now,
              judgeTokens: [],
              judgeMode: data.mode,
              runStatus: "preparing",
              runStartedAt: now,
              lastResults: [],
            },
            $inc: { attempts: 1 },
          },
          { new: true, runValidators: true }
        );
      } else {
        throw err;
      }
    }
    if (!progress) return apiError("Could not save this run. Please try again.", 500);

    try {
      const languageIds = await getJudge0LanguageIds();
      const languageId = languageIds[data.language as keyof typeof languageIds];
      if (!languageId) throw new Error("Selected language is unavailable in Judge0");
      const selectedCases = data.mode === "run"
        ? problem.testCases.filter((testCase) => !testCase.hidden)
        : problem.testCases;

      const response = await judge0Fetch("/submissions/batch?base64_encoded=false", {
        method: "POST",
        body: JSON.stringify({
          submissions: selectedCases.map((testCase) => ({
            language_id: languageId,
            source_code: data.sourceCode,
            stdin: testCase.input,
            expected_output: testCase.expectedOutput,
            cpu_time_limit: 3,
            wall_time_limit: 8,
            memory_limit: 128000,
            enable_network: false,
            max_processes_and_or_threads: 20,
            max_file_size: 1024,
          })),
        }),
      });

      if (!response.ok) throw new Error(`Judge0 returned ${response.status}`);
      const created = (await response.json()) as { token?: string }[];
      if (!Array.isArray(created) || created.length !== selectedCases.length || created.some((item) => !item.token)) {
        throw new Error("Judge0 did not queue every test case");
      }
      const tokens = created.map((item) => item.token as string);
      await DailyCodingProgress.findByIdAndUpdate(progress._id, {
        $set: { judgeTokens: tokens, runStatus: "queued" },
      });

      return apiOk({
        runId: progress._id.toString(),
        mode: data.mode,
        testCaseCount: selectedCases.length,
      }, 202);
    } catch (err) {
      await DailyCodingProgress.findByIdAndUpdate(progress._id, { $set: { runStatus: "failed" } });
      console.error("Daily coding runner unavailable", err);
      return apiError("The code runner is busy right now. Please try again in a moment.", 503);
    }
  } catch (err) {
    return handleApiError(err);
  }
}
