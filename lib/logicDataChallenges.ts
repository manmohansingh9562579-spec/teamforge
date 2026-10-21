export type LogicDataTrack = "Data" | "Math" | "Logic";
export type LogicDataDifficulty = "Easy" | "Medium" | "Hard" | "Advanced";

export type LogicDataChallenge = {
  id: string;
  title: string;
  track: LogicDataTrack;
  difficulty: LogicDataDifficulty;
  minutes: number;
  prompt: string;
  table?: { headers: string[]; rows: string[][] };
  options: { id: string; label: string }[];
  answerId: string;
  hint: string;
  explanation: string;
};

// Original TeamForge practice prompts built around common reasoning concepts.
export const LOGIC_DATA_CHALLENGES: LogicDataChallenge[] = [
  {
    id: "typical-delivery-time",
    title: "Ignore the outlier",
    track: "Data",
    difficulty: "Easy",
    minutes: 3,
    prompt: "A delivery app records these five delivery times, in minutes. One delivery was delayed by a road closure. Which value best represents a typical day?",
    table: { headers: ["Delivery times (min)"], rows: [["18"], ["19"], ["20"], ["22"], ["71"]] },
    options: [
      { id: "mean", label: "Mean: 30 minutes" },
      { id: "median", label: "Median: 20 minutes" },
      { id: "max", label: "Maximum: 71 minutes" },
    ],
    answerId: "median",
    hint: "Sort the values and look for the middle one. The delayed trip pulls the mean upward.",
    explanation: "The median is 20 minutes, the middle value after sorting. The mean is 30 because the 71-minute outlier has a large effect, so the median better describes a typical delivery here.",
  },
  {
    id: "signup-conversion",
    title: "Find the conversion rate",
    track: "Math",
    difficulty: "Easy",
    minutes: 2,
    prompt: "A landing page had 1,200 visits and 84 sign-ups. What was its sign-up conversion rate?",
    options: [
      { id: "point7", label: "0.7%" },
      { id: "seven", label: "7%" },
      { id: "seventy", label: "70%" },
    ],
    answerId: "seven",
    hint: "Divide sign-ups by visits, then multiply by 100.",
    explanation: "84 ÷ 1,200 = 0.07. Multiplying by 100 gives a 7% conversion rate.",
  },
  {
    id: "more-signups-lower-rate",
    title: "More sign-ups, weaker conversion?",
    track: "Logic",
    difficulty: "Medium",
    minutes: 4,
    prompt: "A campaign brought in more sign-ups, but did it convert visitors better? Compare rates instead of raw totals.",
    table: {
      headers: ["Period", "Visitors", "Sign-ups"],
      rows: [["Before", "1,000", "50"], ["After", "2,000", "70"]],
    },
    options: [
      { id: "better", label: "Conversion improved because sign-ups rose by 40%." },
      { id: "worse", label: "Sign-ups rose, but conversion fell from 5% to 3.5%." },
      { id: "same", label: "Conversion stayed the same because visitors doubled." },
    ],
    answerId: "worse",
    hint: "Calculate sign-ups ÷ visitors for each period.",
    explanation: "Before: 50 ÷ 1,000 = 5%. After: 70 ÷ 2,000 = 3.5%. Total sign-ups increased, but each visitor was less likely to sign up. More traffic alone does not mean better conversion.",
  },
  {
    id: "boolean-alert-rule",
    title: "Trace the alert rule",
    track: "Logic",
    difficulty: "Easy",
    minutes: 3,
    prompt: "A monitor raises an alert when either a service is down, or both latency is high and the request volume is rising. The service is up, latency is high, and request volume is steady. What happens?",
    options: [
      { id: "alert", label: "An alert is raised because latency is high." },
      { id: "quiet", label: "No alert: neither condition is fully true." },
      { id: "unknown", label: "The rule cannot decide without request counts." },
    ],
    answerId: "quiet",
    hint: "Write it as: serviceDown OR (highLatency AND volumeRising). Check each part.",
    explanation: "The first condition is false because the service is up. The second is also false because volume is not rising. High latency by itself is not enough under this rule.",
  },
  {
    id: "ab-test-next-step",
    title: "Read the A/B result carefully",
    track: "Data",
    difficulty: "Medium",
    minutes: 5,
    prompt: "Two variants were tested on equal-sized groups. Variant B has a slightly higher observed conversion. What is the best next step before declaring a winner?",
    table: {
      headers: ["Variant", "Visitors", "Sign-ups"],
      rows: [["A", "4,000", "200"], ["B", "4,000", "216"]],
    },
    options: [
      { id: "ship", label: "Ship B immediately; any increase proves it is better." },
      { id: "check", label: "Check uncertainty and the experiment plan before deciding." },
      { id: "discard", label: "Discard the test because the groups had different sign-ups." },
    ],
    answerId: "check",
    hint: "B is 5.4% and A is 5%. The observed difference is 0.4 percentage points; ask whether noise could explain it.",
    explanation: "B's observed rate is 5.4% versus A's 5%, a 0.4 percentage-point difference. That alone does not establish a reliable effect. Check uncertainty, sample-size assumptions, and whether the experiment was run as planned before making a product decision.",
  },
  {
    id: "positive-test-probability",
    title: "A positive test is not certainty",
    track: "Math",
    difficulty: "Hard",
    minutes: 6,
    prompt: "A condition affects 1% of users. A test detects 90% of affected users and incorrectly flags 5% of unaffected users. About what fraction of positive results are true positives?",
    options: [
      { id: "fifteen", label: "About 15%" },
      { id: "fifty", label: "About 50%" },
      { id: "ninety", label: "About 90%" },
    ],
    answerId: "fifteen",
    hint: "Imagine 10,000 users: 100 are affected. Count true positives and false positives separately.",
    explanation: "Out of 10,000 users, about 100 are affected and 90 test positive. Of the 9,900 unaffected users, 5% (495) also test positive. So about 90 ÷ (90 + 495) ≈ 15.4% of positive results are true positives.",
  },
  {
    id: "segment-mix-reversal",
    title: "When the overall rate misleads",
    track: "Data",
    difficulty: "Hard",
    minutes: 7,
    prompt: "Campaign B has a higher overall conversion, yet Campaign A converts better within both user groups. What best explains the apparent contradiction?",
    table: {
      headers: ["Campaign", "New users", "Returning users", "Overall"],
      rows: [
        ["A", "90 / 100 (90%)", "20 / 100 (20%)", "110 / 200 (55%)"],
        ["B", "800 / 900 (88.9%)", "2 / 20 (10%)", "802 / 920 (87.2%)"],
      ],
    },
    options: [
      { id: "mix", label: "B had a much larger share of new users, who convert more often." },
      { id: "math", label: "The overall rates are impossible, so one row must be wrong." },
      { id: "quality", label: "B is better for every user because its overall rate is higher." },
    ],
    answerId: "mix",
    hint: "Compare the group sizes: almost all of B's users are new, while A has a 50/50 mix.",
    explanation: "Campaign B's traffic is mostly new users, the high-conversion group. Its user mix hides lower conversion inside each group. Compare like-for-like segments before deciding which campaign performs better. This is a form of Simpson's paradox.",
  },
  {
    id: "expected-value-feature",
    title: "Decide with expected value",
    track: "Math",
    difficulty: "Advanced",
    minutes: 6,
    prompt: "A feature experiment has a 25% chance of adding $400 in revenue and a 75% chance of adding $0. It costs $80 either way. What is its expected net value?",
    options: [
      { id: "minus80", label: "−$80" },
      { id: "plus20", label: "+$20" },
      { id: "plus100", label: "+$100" },
    ],
    answerId: "plus20",
    hint: "Expected revenue is probability × outcome. Then subtract the cost that always occurs.",
    explanation: "Expected revenue is 0.25 × $400 + 0.75 × $0 = $100. Subtract the $80 cost to get an expected net value of +$20. This is an average across repeated decisions, not a guarantee for one experiment.",
  },
];
