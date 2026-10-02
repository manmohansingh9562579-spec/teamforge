import type { ROLES } from "@/lib/constants";

export const TEAM_MATCH_CONFIG = {
  weights: {
    skill: 0.45,
    role: 0.20,
    project: 0.15,
    experience: 0.10,
    availability: 0.10,
  },
  defaultResultLimit: 10,
  maxCandidates: 500,
  maxProjectHistory: 5000,
} as const;

export const EXISTING_TEAM_COMPATIBILITY_WEIGHTS = {
  skill: 0.45,
  role: 0.25,
  interest: 0.15,
  availability: 0.15,
} as const;

export const SKILL_ALIASES: Readonly<Record<string, string>> = {
  js: "JavaScript",
  javascript: "JavaScript",
  reactjs: "React",
  "react.js": "React",
  node: "Node.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  ts: "TypeScript",
  typescript: "TypeScript",
  next: "Next.js",
  nextjs: "Next.js",
  "next.js": "Next.js",
  ml: "Machine Learning",
  machinelearning: "Machine Learning",
  mongo: "MongoDB",
  mongodb: "MongoDB",
  py: "Python",
  "ui/ux": "UI/UX",
  uiux: "UI/UX",
  api: "APIs",
  rest: "APIs",
  database: "Databases",
  db: "Databases",
  security: "Cybersecurity",
  infosec: "Cybersecurity",
  "cyber security": "Cybersecurity",
  "machine learning": "Machine Learning",
  "deep learning": "Deep Learning",
};

export const ROLE_ALIASES: Readonly<Record<string, string>> = {
  "machine learning engineer": "ML Engineer",
  "ml developer": "ML Engineer",
  "machine learning developer": "ML Engineer",
  "cyber security engineer": "Security Engineer",
  "cybersecurity specialist": "Security Engineer",
};

export const ROLE_SKILL_MAP: Readonly<Record<string, readonly string[]>> = {
  "Frontend Developer": ["React", "Next.js", "JavaScript", "TypeScript", "CSS"],
  "Backend Developer": ["Node.js", "Express", "Python", "Java", "Databases", "APIs", "SQL"],
  "Full Stack Developer": ["React", "Next.js", "Node.js", "Express", "Databases", "APIs"],
  "Mobile Developer": ["Flutter", "React Native", "Java", "JavaScript"],
  "ML Engineer": ["Python", "Machine Learning", "Deep Learning", "NLP"],
  "ML Developer": ["Python", "Machine Learning", "Deep Learning", "NLP"],
  "Security Engineer": ["Cybersecurity", "Python", "SQL", "APIs"],
  "UI/UX Designer": ["UI/UX", "Figma"],
  "DevOps Engineer": ["DevOps", "Docker", "AWS", "Linux"],
  "Product/Project Lead": ["Project Management", "Communication"],
  Other: [],
} satisfies Partial<Record<(typeof ROLES)[number], readonly string[]>>;
