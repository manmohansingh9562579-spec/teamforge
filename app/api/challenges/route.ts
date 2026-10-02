import { connectDB } from "@/lib/db";
import { getCurrentBuildChallenge } from "@/lib/buildChallenges";
import { getCurrentSession } from "@/lib/session";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { ChallengeSubmission } from "@/models/ChallengeSubmission";
import { challengeSubmissionSchema } from "@/validations/challenge";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const challenge = getCurrentBuildChallenge();

    await connectDB();
    const submissions = await ChallengeSubmission.find({ challengeKey: challenge.key })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate("userId", "name username avatar")
      .lean();

    const formattedSubmissions = submissions.map((submission: any) => {
      const user = submission.userId;
      const isMine = Boolean(session?.user?.id && user?._id?.toString() === session.user.id);

      return {
        id: submission._id.toString(),
        projectName: submission.projectName,
        summary: submission.summary,
        repositoryUrl: submission.repositoryUrl,
        demoUrl: submission.demoUrl,
        updatedAt: submission.updatedAt.toISOString(),
        isMine,
        user: user
          ? {
              name: user.name,
              username: user.username,
              avatar: user.avatar,
            }
          : null,
      };
    });

    const mySubmission = formattedSubmissions.find((submission) => submission.isMine) ?? null;

    return apiOk({
      challenge,
      submissions: formattedSubmissions,
      mySubmission,
      isAuthenticated: Boolean(session?.user?.id),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Sign in to submit your build", 401);

    const data = challengeSubmissionSchema.parse(await req.json());
    const challenge = getCurrentBuildChallenge();
    if (data.challengeKey !== challenge.key) {
      return apiError("This week's challenge has changed. Refresh and try again.", 409);
    }

    await connectDB();
    const filter = { challengeKey: challenge.key, userId: session.user.id };
    const update = {
      $set: {
        projectName: data.projectName,
        summary: data.summary,
        repositoryUrl: data.repositoryUrl,
        demoUrl: data.demoUrl,
      },
    };

    let submission;
    try {
      submission = await ChallengeSubmission.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      });
    } catch (err) {
      // A simultaneous first submission may win the unique index race; retry it as an update.
      if (err && typeof err === "object" && "code" in err && (err as any).code === 11000) {
        submission = await ChallengeSubmission.findOneAndUpdate(filter, update, {
          new: true,
          runValidators: true,
        });
      } else {
        throw err;
      }
    }

    if (!submission) return apiError("Could not save your build. Please try again.", 500);
    return apiOk({ id: submission._id.toString() });
  } catch (err) {
    return handleApiError(err);
  }
}
