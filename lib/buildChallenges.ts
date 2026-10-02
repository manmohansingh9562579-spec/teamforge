const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const challengePrompts = [
  {
    slug: "campus-event-finder",
    title: "Campus Event Finder",
    summary: "Make it easier to find hackathons, meetups, and tech events around campus.",
    brief: "Build a searchable event board where organizers can post an event and students can discover what is coming up.",
    skills: ["Next.js", "UI/UX", "MongoDB"],
  },
  {
    slug: "study-group-matchmaker",
    title: "Study Group Matchmaker",
    summary: "Help students find a small group studying the same subject at a similar pace.",
    brief: "Let people post a subject, available time, and experience level, then browse groups that fit.",
    skills: ["React", "Product design", "Matching"],
  },
  {
    slug: "good-first-issue-finder",
    title: "Good First Issue Finder",
    summary: "Help new contributors discover open-source issues that match their skills.",
    brief: "Create a focused directory of beginner-friendly issues with language, project, and difficulty filters.",
    skills: ["GitHub", "JavaScript", "Search"],
  },
  {
    slug: "project-deadline-buddy",
    title: "Project Deadline Buddy",
    summary: "Turn a project deadline into clear, manageable milestones for a small team.",
    brief: "Build a simple timeline where teammates can add milestones, owners, and due dates.",
    skills: ["Full stack", "Teamwork", "Planning"],
  },
  {
    slug: "skill-swap-board",
    title: "Skill Swap Board",
    summary: "Connect people who can teach one skill with people who want to learn it.",
    brief: "Let users offer a skill, request another, and find a useful one-to-one learning match.",
    skills: ["Profiles", "Matching", "UI/UX"],
  },
  {
    slug: "bug-bash-tracker",
    title: "Bug Bash Tracker",
    summary: "Give a team one simple place to report, sort, and fix bugs before a demo.",
    brief: "Build a lightweight bug board with severity, owner, status, and a clear list of what is fixed.",
    skills: ["React", "Node.js", "Testing"],
  },
  {
    slug: "hackathon-role-finder",
    title: "Hackathon Role Finder",
    summary: "Help a hackathon team quickly see which roles and skills are still missing.",
    brief: "Create a team card with open roles and a clear way for developers to request a spot.",
    skills: ["Team building", "Profiles", "Matching"],
  },
  {
    slug: "volunteer-tech-match",
    title: "Volunteer Tech Match",
    summary: "Match local community projects with developers who have time to help.",
    brief: "Let a community group describe a small need and let builders find a project they can contribute to.",
    skills: ["Community", "Full stack", "Accessibility"],
  },
] as const;

export function getCurrentBuildChallenge(now = new Date()) {
  const utcDay = now.getUTCDay();
  const daysSinceMonday = (utcDay + 6) % 7;
  const weekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday)
  );
  const weekNumber = Math.floor(weekStart.getTime() / WEEK_MS);
  const promptIndex = ((weekNumber % challengePrompts.length) + challengePrompts.length) % challengePrompts.length;
  const prompt = challengePrompts[promptIndex];
  const endsAt = new Date(weekStart.getTime() + WEEK_MS);

  return {
    key: weekStart.toISOString().slice(0, 10),
    title: prompt.title,
    summary: prompt.summary,
    brief: prompt.brief,
    skills: [...prompt.skills],
    startsAt: weekStart.toISOString(),
    endsAt: endsAt.toISOString(),
  };
}
