export const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "ML Developer",
  "UI/UX Designer",
  "DevOps Engineer",
  "Product/Project Lead",
  "Other",
] as const;

export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const INTERESTS = [
  "Hackathons",
  "College Projects",
  "Open Source",
  "Side Projects",
  "Startup Projects",
] as const;

export const AVAILABILITY = ["Available", "Limited", "Not available"] as const;

export const SUGGESTED_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "MongoDB",
  "Python",
  "Java",
  "C++",
  "Flutter",
  "React Native",
  "Machine Learning",
  "UI/UX",
  "Figma",
  "DevOps",
] as const;

export const PROJECT_TYPES = [
  "Hackathon",
  "College Project",
  "Open Source",
  "Side Project",
  "Startup",
] as const;

export const TEAM_STATUS = ["forming", "active", "completed", "closed"] as const;
export const TEAM_VISIBILITY = ["public", "private"] as const;

export const REQUEST_STATUS = ["pending", "accepted", "rejected", "cancelled"] as const;

export const TASK_STATUS = ["To Do", "In Progress", "Review", "Done"] as const;
export const TASK_PRIORITY = ["Low", "Medium", "High"] as const;

export const NOTIFICATION_TYPES = [
  "join_request",
  "request_accepted",
  "request_rejected",
  "team_invitation",
  "member_joined",
  "member_removed",
  "task_assigned",
  "task_status_changed",
] as const;
