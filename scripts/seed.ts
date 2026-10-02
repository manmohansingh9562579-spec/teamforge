/**
 * Development-only seed script. Populates a local/dev MongoDB with sample
 * developers, teams, tasks and requests so the UI can be exercised end to
 * end. This script is NOT used by production pages — those always query
 * MongoDB directly and render real, empty states when there's no data.
 *
 * Usage:
 *   npm run seed
 *
 * Requires MONGODB_URI to be set (see .env.example). Refuses to run against
 * anything that doesn't look like a local/dev database, as a safety rail.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Team } from "../models/Team";
import { Task } from "../models/Task";
import { JoinRequest } from "../models/Request";
import { Activity } from "../models/Activity";
import { Notification } from "../models/Notification";
import { slugify } from "../lib/utils";

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local before seeding.");
    process.exit(1);
  }

  if (!process.env.SEED_ALLOW_REMOTE && !/localhost|127\.0\.0\.1|mongodb:\/\/mongo/.test(MONGODB_URI)) {
    console.error(
      "This looks like it might not be a local database.\n" +
        "If you're sure you want to seed it, re-run with SEED_ALLOW_REMOTE=1."
    );
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  console.log("Clearing existing seed-affected collections...");
  await Promise.all([
    User.deleteMany({ email: { $regex: /@seed\.teamforge\.dev$/ } }),
  ]);

  const passwordHash = await bcrypt.hash("Password123", 10);

  const seedUsers = [
    {
      name: "Priya Nair",
      username: "priyanair",
      email: "priya@seed.teamforge.dev",
      headline: "Frontend developer who loves clean UI",
      bio: "Building React apps for 3 years. Big on accessibility and design systems.",
      skills: ["React", "TypeScript", "Next.js", "Figma"],
      preferredRoles: ["Frontend Developer", "UI/UX Designer"],
      experienceLevel: "Advanced",
      interests: ["Hackathons", "Open Source"],
      availability: "Available",
      college: "IIT Bombay",
      graduationYear: 2026,
    },
    {
      name: "Diego Ruiz",
      username: "diegoruiz",
      email: "diego@seed.teamforge.dev",
      headline: "Backend engineer — Node.js and databases",
      bio: "I like building APIs that don't fall over under load.",
      skills: ["Node.js", "Express", "MongoDB", "Python"],
      preferredRoles: ["Backend Developer", "DevOps Engineer"],
      experienceLevel: "Intermediate",
      interests: ["Startup Projects", "Side Projects"],
      availability: "Available",
      college: "UC San Diego",
      graduationYear: 2027,
    },
    {
      name: "Amara Boateng",
      username: "amarab",
      email: "amara@seed.teamforge.dev",
      headline: "Product designer turned front-end tinkerer",
      bio: "Design systems, motion, and just enough React to be dangerous.",
      skills: ["Figma", "UI/UX", "React"],
      preferredRoles: ["UI/UX Designer", "Frontend Developer"],
      experienceLevel: "Advanced",
      interests: ["College Projects", "Hackathons"],
      availability: "Limited",
      college: "Parsons School of Design",
      graduationYear: 2025,
    },
    {
      name: "Wei Zhang",
      username: "weizhang",
      email: "wei@seed.teamforge.dev",
      headline: "ML engineer exploring applied NLP",
      bio: "Currently building small models that actually ship.",
      skills: ["Python", "Machine Learning", "MongoDB"],
      preferredRoles: ["ML Developer", "Backend Developer"],
      experienceLevel: "Intermediate",
      interests: ["Open Source", "Hackathons"],
      availability: "Available",
      college: "University of Toronto",
      graduationYear: 2026,
    },
  ];

  console.log("Creating seed users...");
  const users = await User.insertMany(
    seedUsers.map((u) => ({ ...u, passwordHash }))
  );
  const [priya, diego, amara, wei] = users;

  console.log("Creating seed teams...");
  const nocturne = await Team.create({
    name: "Nocturne",
    slug: slugify("Nocturne Campus Ride Share"),
    projectTitle: "Campus Ride Share",
    description:
      "A ride-sharing app for students commuting to campus. Looking for a backend developer to help build out the matching and notifications system.",
    ownerId: priya._id,
    members: [{ userId: amara._id, role: "UI/UX Designer", joinedAt: new Date() }],
    requiredRoles: ["Backend Developer"],
    requiredSkills: ["Node.js", "MongoDB"],
    techStack: ["Next.js", "MongoDB", "Node.js"],
    teamSize: 4,
    projectType: "Hackathon",
    status: "forming",
    visibility: "public",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
  });

  const habitLoop = await Team.create({
    name: "Habit Loop",
    slug: slugify("Habit Loop"),
    projectTitle: "Habit Loop — daily habit tracker",
    description:
      "An open-source habit tracker with a focus on quick logging and honest streaks (no fake gamification).",
    ownerId: diego._id,
    members: [],
    requiredRoles: ["Frontend Developer", "ML Developer"],
    requiredSkills: ["React", "Python"],
    techStack: ["React", "Python", "MongoDB"],
    teamSize: 3,
    projectType: "Open Source",
    status: "forming",
    visibility: "public",
  });

  console.log("Creating seed tasks...");
  await Task.insertMany([
    {
      teamId: nocturne._id,
      title: "Design the ride request flow",
      description: "Wireframe how a rider requests a ride and a driver accepts it.",
      status: "Done",
      priority: "High",
      assignee: amara._id,
      createdBy: priya._id,
    },
    {
      teamId: nocturne._id,
      title: "Set up MongoDB schema for rides",
      status: "In Progress",
      priority: "High",
      createdBy: priya._id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    },
    {
      teamId: nocturne._id,
      title: "Build the landing page",
      status: "To Do",
      priority: "Medium",
      createdBy: priya._id,
    },
  ]);

  console.log("Creating seed activity...");
  await Activity.insertMany([
    { teamId: nocturne._id, actorId: priya._id, action: "created the team", entityType: "team", entityId: nocturne._id },
    { teamId: nocturne._id, actorId: amara._id, action: "joined the team", entityType: "member", entityId: amara._id },
  ]);

  console.log("Creating a seed join request...");
  const request = await JoinRequest.create({
    teamId: habitLoop._id,
    senderId: wei._id,
    message: "I've worked on a couple of habit-tracking side projects and would love to help with the ML side.",
    status: "pending",
  });

  await Notification.create({
    userId: diego._id,
    type: "join_request",
    message: "Someone requested to join Habit Loop",
    relatedEntity: { kind: "request", id: request._id },
  });

  console.log("\nSeed complete.");
  console.log("Sign in with any seed account using password: Password123");
  seedUsers.forEach((u) => console.log(`  ${u.email}`));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
