import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { apiOk, handleApiError } from "@/lib/api";
import {
  CODING_LANGUAGES,
  CODING_PROBLEMS,
  getDailyCodingProblem,
  getPublicCodingProblem,
  getUtcDateKey,
} from "@/lib/codingChallenges";
import { DailyCodingProgress } from "@/models/DailyCodingProgress";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const dateKey = getUtcDateKey();
    const dailyProblem = getDailyCodingProblem();
    const requestedSlug = new URL(request.url).searchParams.get("slug");
    const selectedProblem = CODING_PROBLEMS.find((problem) => problem.slug === requestedSlug) ?? dailyProblem;

    let todayProgress: any = null;
    let acceptedProgress: any[] = [];
    if (session?.user?.id) {
      await connectDB();
      const userId = session.user.id;
      const [selected, accepted] = await Promise.all([
        DailyCodingProgress.findOne({ userId, dateKey, problemSlug: selectedProblem.slug }).select("+sourceCode"),
        DailyCodingProgress.find({ userId, accepted: true })
          .select("dateKey problemSlug language attempts solvedAt")
          .sort({ dateKey: -1 })
          .lean(),
      ]);

      if (selected) {
        todayProgress = {
          language: selected.language,
          sourceCode: selected.sourceCode,
          attempts: selected.attempts,
          accepted: selected.accepted,
          solvedAt: selected.solvedAt?.toISOString() ?? null,
        };
      }
      acceptedProgress = accepted.map((entry: any) => ({
        dateKey: entry.dateKey,
        problemSlug: entry.problemSlug,
        language: entry.language,
        attempts: entry.attempts,
        solvedAt: entry.solvedAt?.toISOString() ?? null,
      }));
    }

    return apiOk({
      dateKey,
      dailySlug: dailyProblem.slug,
      selectedProblem: getPublicCodingProblem(selectedProblem),
      problems: CODING_PROBLEMS.map((problem) => ({
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        topic: problem.topic,
        tags: problem.tags,
      })),
      languages: CODING_LANGUAGES.map(({ id, label }) => ({ id, label })),
      isAuthenticated: Boolean(session?.user?.id),
      todayProgress,
      acceptedProgress,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
