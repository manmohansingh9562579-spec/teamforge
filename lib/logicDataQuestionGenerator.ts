import type { LogicDataChallenge, LogicDataDifficulty, LogicDataTrack } from "@/lib/logicDataChallenges";

export type GeneratedLogicDataChallenge = LogicDataChallenge & {
  focus: string;
  generated: true;
};

type QuestionDraft = Pick<LogicDataChallenge, "prompt" | "hint" | "explanation" | "table"> & {
  correct: string;
  distractors: string[];
};

type QuestionFamily = {
  track: LogicDataTrack;
  difficulty: LogicDataDifficulty;
  focus: string;
  title: string;
  create: (random: () => number) => QuestionDraft;
};

function randomForSeed(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function int(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function oneOf<T>(random: () => number, values: T[]): T {
  return values[int(random, 0, values.length - 1)];
}

function percent(value: number, digits = 1) {
  return `${Number(value.toFixed(digits))}%`;
}

function currency(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function optionsFor(correct: string, distractors: string[], random: () => number) {
  const labels = [...new Set([correct, ...distractors])].slice(0, 4);
  while (labels.length < 4) labels.push(`A different estimate (${labels.length + 1})`);
  for (let index = labels.length - 1; index > 0; index -= 1) {
    const swapIndex = int(random, 0, index);
    [labels[index], labels[swapIndex]] = [labels[swapIndex], labels[index]];
  }
  const options = labels.map((label, index) => ({ id: `choice-${index + 1}`, label }));
  return { options, answerId: options.find((option) => option.label === correct)?.id ?? options[0].id };
}

const families: QuestionFamily[] = [
  {
    track: "Data", difficulty: "Easy", focus: "Product analytics", title: "Read the conversion funnel",
    create(random) {
      const visitors = int(random, 12, 60) * 100;
      const signups = int(random, 5, 19) * Math.round(visitors / 100);
      const rate = (signups / visitors) * 100;
      return {
        prompt: `A product page had ${visitors.toLocaleString()} visits and ${signups.toLocaleString()} completed sign-ups. What was the sign-up conversion rate, rounded to one decimal place?`,
        table: { headers: ["Metric", "Count"], rows: [["Visits", visitors.toLocaleString()], ["Sign-ups", signups.toLocaleString()]] },
        correct: percent(rate),
        distractors: [percent(rate + 2.5), percent(rate * 10), percent(Math.max(0.1, rate - 2.5))],
        hint: "Divide sign-ups by visits, then multiply by 100.",
        explanation: `${signups.toLocaleString()} ÷ ${visitors.toLocaleString()} × 100 = ${percent(rate)}. Use the number of sign-ups as the numerator and visits as the denominator.`,
      };
    },
  },
  {
    track: "Data", difficulty: "Medium", focus: "Cohort analysis", title: "Combine two customer cohorts",
    create(random) {
      const visitorsA = int(random, 12, 50) * 100;
      let visitorsB = int(random, 12, 50) * 100;
      if (visitorsA === visitorsB) visitorsB += 700;
      const rateA = int(random, 4, 14);
      let rateB = int(random, 18, 42);
      if (rateB === rateA) rateB += 7;
      const signupsA = visitorsA * rateA / 100;
      const signupsB = visitorsB * rateB / 100;
      const combinedRate = (signupsA + signupsB) / (visitorsA + visitorsB) * 100;
      const simpleMean = (rateA + rateB) / 2;
      const reversedWeights = (visitorsA * rateB + visitorsB * rateA) / (visitorsA + visitorsB);
      return {
        prompt: `Two customer cohorts have different sizes. What is the overall sign-up rate across both cohorts?`,
        table: { headers: ["Cohort", "Visitors", "Sign-ups"], rows: [["A", visitorsA.toLocaleString(), signupsA.toLocaleString()], ["B", visitorsB.toLocaleString(), signupsB.toLocaleString()]] },
        correct: percent(combinedRate),
        distractors: [percent(simpleMean), percent(reversedWeights), percent(Math.max(rateA, rateB))],
        hint: "Add the sign-ups first and divide by the total visitors. Don’t average the two rates unless the cohorts are the same size.",
        explanation: `There are ${(signupsA + signupsB).toLocaleString()} sign-ups among ${(visitorsA + visitorsB).toLocaleString()} visitors. The weighted overall rate is ${percent(combinedRate)}.`,
      };
    },
  },
  {
    track: "Data", difficulty: "Hard", focus: "AI model evaluation", title: "Measure model precision",
    create(random) {
      const truePositive = int(random, 80, 260);
      const falsePositive = int(random, 20, 110);
      const falseNegative = int(random, 15, 100);
      const trueNegative = int(random, 400, 1400);
      const precisionValue = truePositive / (truePositive + falsePositive) * 100;
      const recallValue = truePositive / (truePositive + falseNegative) * 100;
      const accuracyValue = (truePositive + trueNegative) / (truePositive + falsePositive + falseNegative + trueNegative) * 100;
      const f1Value = 2 * precisionValue * recallValue / (precisionValue + recallValue);
      const answer = percent(precisionValue);
      const distractors = [percent(recallValue), percent(f1Value), percent(accuracyValue)];
      return {
        prompt: "A classifier produced the following outcomes. What is its precision: the share of predicted positives that were actually positive?",
        table: { headers: ["Outcome", "Count"], rows: [["True positives", String(truePositive)], ["False positives", String(falsePositive)], ["False negatives", String(falseNegative)], ["True negatives", String(trueNegative)]] },
        correct: answer,
        distractors: distractors.map((value, index) => value === answer || distractors.indexOf(value) !== index ? percent(precisionValue + (index + 1) * 7) : value),
        hint: "Precision = true positives ÷ (true positives + false positives).",
        explanation: `${truePositive} ÷ (${truePositive} + ${falsePositive}) × 100 = ${answer}. Precision focuses on the items the model predicted as positive.`,
      };
    },
  },
  {
    track: "Data", difficulty: "Advanced", focus: "Experiment analysis", title: "Unpack a segment reversal",
    create(random) {
      const highA = int(random, 80, 180) * 10;
      const lowA = int(random, 600, 1200) * 10;
      const highB = int(random, 650, 1200) * 10;
      const lowB = int(random, 80, 180) * 10;
      const highRateA = int(random, 84, 94);
      const lowRateA = int(random, 24, 38);
      const highRateB = highRateA - int(random, 2, 6);
      const lowRateB = lowRateA - int(random, 2, 6);
      const totalA = (highA * highRateA / 100 + lowA * lowRateA / 100) / (highA + lowA) * 100;
      const totalB = (highB * highRateB / 100 + lowB * lowRateB / 100) / (highB + lowB) * 100;
      return {
        prompt: "Variant A converts better inside both user segments, yet Variant B has the higher overall rate. Which explanation best fits the data?",
        table: { headers: ["Variant", "High-intent users", "Low-intent users", "Overall"], rows: [["A", `${highA} · ${highRateA}%`, `${lowA} · ${lowRateA}%`, percent(totalA)], ["B", `${highB} · ${highRateB}%`, `${lowB} · ${lowRateB}%`, percent(totalB)]] },
        correct: "B has a much larger share of high-intent users, changing the traffic mix.",
        distractors: ["B must be better inside each segment too.", "The overall rates cannot be compared because the segment sizes differ.", "A’s segment rates are lower once the user totals are weighted."],
        hint: "Compare the sizes of the two segments in each variant before comparing the overall rates.",
        explanation: `A’s within-segment rates are higher, but B has far more high-intent users. That mix can lift B’s overall rate to ${percent(totalB)} versus ${percent(totalA)} for A. Always compare like-for-like segments as well as totals.`,
      };
    },
  },
  {
    track: "Math", difficulty: "Easy", focus: "Systems math", title: "Estimate compute throughput",
    create(random) {
      const accelerators = int(random, 2, 8);
      const perMinute = oneOf(random, [120, 150, 180, 240, 300, 360]);
      const utilization = oneOf(random, [50, 60, 75, 80, 90]);
      const minutes = oneOf(random, [10, 15, 20, 25]);
      const total = accelerators * perMinute * utilization / 100 * minutes;
      return {
        prompt: `A compute cluster has ${accelerators} accelerators. Each can process ${perMinute} jobs per minute at full capacity. At ${utilization}% average utilization, about how many jobs finish in ${minutes} minutes?`,
        correct: `${total.toLocaleString()} jobs`,
        distractors: [`${(total / (utilization / 100)).toLocaleString()} jobs`, `${Math.round(total * 0.8).toLocaleString()} jobs`, `${Math.round(total * 1.2).toLocaleString()} jobs`],
        hint: "Multiply accelerators × jobs per minute × utilization × minutes.",
        explanation: `${accelerators} × ${perMinute} × ${utilization / 100} × ${minutes} = ${total.toLocaleString()} jobs. Utilization scales the full-capacity estimate.`,
      };
    },
  },
  {
    track: "Math", difficulty: "Medium", focus: "Decision science", title: "Choose by expected value",
    create(random) {
      const probability = oneOf(random, [20, 25, 40, 60, 75, 80]);
      const reward = int(random, 10, 60) * 20;
      const loss = int(random, 5, 40) * 20;
      const value = (probability * reward - (100 - probability) * loss) / 100;
      return {
        prompt: `A product experiment has a ${probability}% chance to create ${currency(reward)} in value and otherwise costs ${currency(loss)}. What is the expected net value per decision?`,
        correct: currency(value),
        distractors: [currency(probability / 100 * reward), currency((reward - loss) * probability / 100), currency(-Math.abs(value) - loss)],
        hint: "Expected value = probability of the gain × gain − probability of the loss × loss.",
        explanation: `${probability}% × ${currency(reward)} − ${100 - probability}% × ${currency(loss)} = ${currency(value)} expected net value per decision.`,
      };
    },
  },
  {
    track: "Math", difficulty: "Hard", focus: "Bayesian reasoning", title: "Interpret a positive model signal",
    create(random) {
      const prevalence = int(random, 2, 9);
      const sensitivity = int(random, 82, 96);
      const falsePositiveRate = int(random, 3, 12);
      const truePositive = prevalence * sensitivity;
      const falsePositive = (100 - prevalence) * falsePositiveRate;
      const posterior = truePositive / (truePositive + falsePositive) * 100;
      return {
        prompt: `A risk pattern affects ${prevalence}% of cases. A detector catches ${sensitivity}% of affected cases and flags ${falsePositiveRate}% of unaffected cases. About what share of positive alerts are true?`,
        correct: percent(posterior),
        distractors: [percent(sensitivity), percent(prevalence), percent(falsePositiveRate)],
        hint: "Imagine 10,000 cases. Count the true alerts and false alerts, then divide true alerts by all alerts.",
        explanation: `Out of 10,000 cases, there are ${prevalence * 100} affected. About ${truePositive} are true alerts, while ${falsePositive} unaffected cases also trigger. ${truePositive} ÷ (${truePositive} + ${falsePositive}) ≈ ${percent(posterior)}.`,
      };
    },
  },
  {
    track: "Math", difficulty: "Advanced", focus: "Probability", title: "Draw two different components",
    create(random) {
      const groupA = int(random, 4, 10);
      const groupB = int(random, 4, 10);
      const total = groupA + groupB;
      const probability = 2 * groupA * groupB / (total * (total - 1)) * 100;
      const replacementProbability = 2 * groupA * groupB / (total * total) * 100;
      const allA = groupA * (groupA - 1) / (total * (total - 1)) * 100;
      return {
        prompt: `A batch contains ${groupA} accelerator units of type A and ${groupB} of type B. Two are selected at random without replacement. What is the probability of selecting one of each type?`,
        correct: percent(probability),
        distractors: [percent(replacementProbability), percent(allA), percent((groupA / total) * 100)],
        hint: "Count both orders: A then B, or B then A. The second draw has one fewer unit available.",
        explanation: `P(A then B) + P(B then A) = (${groupA}/${total} × ${groupB}/${total - 1}) + (${groupB}/${total} × ${groupA}/${total - 1}) ≈ ${percent(probability)}.`,
      };
    },
  },
  {
    track: "Logic", difficulty: "Easy", focus: "Boolean rules", title: "Trace the alert condition",
    create(random) {
      const serviceDown = random() > 0.5;
      const latencyHigh = random() > 0.5;
      const trafficRising = random() > 0.5;
      const alert = serviceDown || (latencyHigh && trafficRising);
      return {
        prompt: `An alert fires when the service is down OR (latency is high AND traffic is rising). Here: service down = ${serviceDown ? "yes" : "no"}; latency high = ${latencyHigh ? "yes" : "no"}; traffic rising = ${trafficRising ? "yes" : "no"}. Does the alert fire?`,
        table: { headers: ["Signal", "Current value"], rows: [["Service down", serviceDown ? "Yes" : "No"], ["Latency high", latencyHigh ? "Yes" : "No"], ["Traffic rising", trafficRising ? "Yes" : "No"]] },
        correct: alert ? "Yes — at least one full alert condition is true." : "No — neither alert condition is fully true.",
        distractors: ["Yes — any one high-risk signal is enough.", "No — an alert requires all three signals to be true.", "The rule cannot be evaluated from these signals."],
        hint: "Evaluate the AND pair first, then combine it with the service-down signal using OR.",
        explanation: `serviceDown OR (latencyHigh AND trafficRising) = ${serviceDown} OR (${latencyHigh} AND ${trafficRising}) = ${alert}.`,
      };
    },
  },
  {
    track: "Logic", difficulty: "Medium", focus: "Pipeline reasoning", title: "Find the earliest completion time",
    create(random) {
      const startHour = int(random, 9, 14);
      const startMinute = oneOf(random, [0, 10, 20, 30, 40]);
      const stages = [int(random, 10, 30), int(random, 10, 35), int(random, 10, 40)];
      const totalMinutes = startHour * 60 + startMinute + stages.reduce((sum, value) => sum + value, 0);
      const finish = `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
      const shift = (amount: number) => {
        const shifted = totalMinutes + amount;
        return `${String(Math.floor(shifted / 60) % 24).padStart(2, "0")}:${String(shifted % 60).padStart(2, "0")}`;
      };
      return {
        prompt: `A data pipeline starts at ${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}. Its three steps must run in order and take ${stages[0]}, ${stages[1]}, and ${stages[2]} minutes. What is the earliest finish time?`,
        correct: finish,
        distractors: [shift(-10), shift(10), `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`],
        hint: "Add all three step durations to the start time. Convert every 60 minutes into one hour.",
        explanation: `${stages.join(" + ")} = ${stages.reduce((sum, value) => sum + value, 0)} minutes. Starting at ${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}, the pipeline finishes at ${finish}.`,
      };
    },
  },
  {
    track: "Logic", difficulty: "Hard", focus: "Parallel systems", title: "Reason about parallel jobs",
    create(random) {
      const setup = int(random, 5, 15);
      const jobA = int(random, 15, 45);
      let jobB = int(random, 20, 55);
      if (jobA === jobB) jobB += 9;
      const total = setup + Math.max(jobA, jobB);
      return {
        prompt: `A deployment has a ${setup}-minute setup. After setup, jobs A (${jobA} minutes) and B (${jobB} minutes) run in parallel. How long until both are complete?`,
        table: { headers: ["Stage", "Duration", "Dependency"], rows: [["Setup", `${setup} min`, "First"], ["Job A", `${jobA} min`, "After setup"], ["Job B", `${jobB} min`, "After setup"]] },
        correct: `${total} minutes`,
        distractors: [`${setup + jobA + jobB} minutes`, `${setup + Math.min(jobA, jobB)} minutes`, `${Math.max(jobA, jobB)} minutes`],
        hint: "Parallel jobs finish when the slower one finishes. Add the setup time before that.",
        explanation: `After setup, the jobs overlap, so the wait is max(${jobA}, ${jobB}) = ${Math.max(jobA, jobB)} minutes. Total: ${setup} + ${Math.max(jobA, jobB)} = ${total} minutes.`,
      };
    },
  },
  {
    track: "Logic", difficulty: "Advanced", focus: "Constraint solving", title: "Find a valid launch pair",
    create(random) {
      const names = ["Atlas", "Beacon", "Comet"];
      for (let index = names.length - 1; index > 0; index -= 1) {
        const swapIndex = int(random, 0, index);
        [names[index], names[swapIndex]] = [names[swapIndex], names[index]];
      }
      const [first, second, third] = names;
      const correct = `${first} + ${second}`;
      const distractors = [`${first} + ${third}`, `${second} + ${third}`, `${first} only`];
      return {
        prompt: `Choose exactly two services. ${first} must be included. ${third} cannot run with ${first} or ${second}. Which launch plan satisfies every constraint?`,
        correct,
        distractors,
        hint: `Because ${first} is required and ${third} conflicts with both other services, check the pair that includes ${first} without ${third}.`,
        explanation: `${first} is required, and ${third} conflicts with both other services. The only valid pair is ${correct}.`,
      };
    },
  },
];

export function generateLogicDataQuestions({
  seed,
  startAt,
  track = "All",
  difficulty = "All",
  count = 12,
}: {
  seed: number;
  startAt: number;
  track?: "All" | LogicDataTrack;
  difficulty?: "All" | LogicDataDifficulty;
  count?: number;
}): GeneratedLogicDataChallenge[] {
  const eligible = families.filter((family) =>
    (track === "All" || family.track === track)
      && (difficulty === "All" || family.difficulty === difficulty)
  );
  const usableFamilies = eligible.length ? eligible : families;
  const nextRandom = randomForSeed(seed);

  return Array.from({ length: count }, (_, index) => {
    const family = usableFamilies[(startAt + index) % usableFamilies.length];
    const draft = family.create(nextRandom);
    const { options, answerId } = optionsFor(draft.correct, draft.distractors, nextRandom);
    const round = startAt + index + 1;
    return {
      id: `logic-generated-${seed.toString(36)}-${index.toString(36)}`,
      title: `${family.title} · ${round}`,
      track: family.track,
      difficulty: family.difficulty,
      minutes: family.difficulty === "Easy" ? 3 : family.difficulty === "Medium" ? 5 : family.difficulty === "Hard" ? 7 : 9,
      prompt: draft.prompt,
      table: draft.table,
      options,
      answerId,
      hint: draft.hint,
      explanation: draft.explanation,
      focus: family.focus,
      generated: true,
    };
  });
}

