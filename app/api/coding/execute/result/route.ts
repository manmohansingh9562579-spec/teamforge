import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { CODING_PROBLEMS, getUtcDateKey } from "@/lib/codingChallenges";
import { judge0Fetch } from "@/lib/judge0";
import { DailyCodingProgress } from "@/models/DailyCodingProgress";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<number, string> = {
  1: "In queue",
  2: "Running",
  3: "Accepted",
  4: "Wrong answer",
  5: "Time limit exceeded",
  6: "Compile error",
  7: "Runtime error",
  8: "File limit exceeded",
  9: "Floating point error",
  10: "Aborted",
  11: "Runtime error",
  12: "Runtime error",
  13: "Runner error",
  14: "Exec format error",
};

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Sign in to view your run", 401);
    const runId = new URL(request.url).searchParams.get("runId");
    if (!runId || !isValidObjectId(runId)) return apiError("Run not found", 404);

    await connectDB();
    const progress: any = await DailyCodingProgress.findOne({
      _id: runId,
      userId: session.user.id,
      dateKey: getUtcDateKey(),
    }).select("+judgeTokens +judgeMode +runStatus +lastResults");
    if (!progress) return apiError("Run not found", 404);

    if (progress.runStatus === "failed") return apiError("The code runner could not start this run. Try again.", 503);
    if (progress.runStatus === "finished") {
      const latestRunAccepted = progress.judgeMode === "submit" &&
        progress.lastResults.length > 0 &&
        progress.lastResults.every((result: any) => result.statusId === 3);
      return apiOk({
        state: "finished",
        mode: progress.judgeMode,
        accepted: latestRunAccepted,
        results: progress.lastResults,
      });
    }
    if (!progress.judgeTokens?.length) return apiOk({ state: "running", mode: progress.judgeMode, results: [] });

    const response = await judge0Fetch(
      `/submissions/batch?tokens=${encodeURIComponent(progress.judgeTokens.join(","))}&base64_encoded=false&fields=token,status_id,status,stdout,stderr,compile_output,time,memory`
    );
    if (!response.ok) {
      console.error("Judge0 result poll failed", response.status);
      return apiError("Could not read the code runner result yet. Try again shortly.", 503);
    }

    const batch = (await response.json()) as {
      submissions?: {
        token?: string;
        status_id?: number;
        status?: { id?: number; description?: string };
        stdout?: string | null;
        stderr?: string | null;
        compile_output?: string | null;
        time?: string | null;
        memory?: number | null;
      }[];
    };
    const submissions = Array.isArray(batch) ? batch : batch.submissions ?? [];
    const byToken = new Map(submissions.map((submission) => [submission.token, submission]));
    const problem = CODING_PROBLEMS.find((item) => item.slug === progress.problemSlug);
    if (!problem) return apiError("Problem not found", 404);
    const tests = progress.judgeMode === "run"
      ? problem.testCases.filter((testCase) => !testCase.hidden)
      : problem.testCases;

    const normalized = progress.judgeTokens.map((token: string, index: number) => {
      const result = byToken.get(token) ?? submissions[index];
      const statusId = result?.status_id ?? result?.status?.id ?? 1;
      const hidden = Boolean(tests[index]?.hidden);
      const responseItem: Record<string, unknown> = {
        caseNumber: index + 1,
        hidden,
        statusId,
        verdict: result?.status?.description || STATUS_LABELS[statusId] || "Processing",
        time: result?.time ?? null,
        memory: result?.memory ?? null,
      };
      if (!hidden) {
        responseItem.output = result?.stdout ?? "";
        responseItem.error = result?.compile_output || result?.stderr || "";
      } else if (![1, 2, 3].includes(statusId)) {
        responseItem.error = "Hidden test failed. Review your edge cases and try again.";
      }
      return responseItem;
    });

    const isPending = normalized.some((result: any) => result.statusId === 1 || result.statusId === 2);
    if (isPending) {
      await DailyCodingProgress.findByIdAndUpdate(progress._id, { $set: { runStatus: "running" } });
      return apiOk({ state: "running", mode: progress.judgeMode, results: normalized });
    }

    const allAccepted = normalized.length === tests.length && normalized.every((result: any) => result.statusId === 3);
    const finishedAt = new Date();
    const update: Record<string, unknown> = {
      runStatus: "finished",
      lastResults: normalized,
    };
    if (progress.judgeMode === "submit" && allAccepted && !progress.accepted) {
      update.accepted = true;
      update.solvedAt = finishedAt;
    }
    await DailyCodingProgress.findByIdAndUpdate(progress._id, { $set: update });

    return apiOk({
      state: "finished",
      mode: progress.judgeMode,
      accepted: progress.judgeMode === "submit" && allAccepted,
      results: normalized,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
