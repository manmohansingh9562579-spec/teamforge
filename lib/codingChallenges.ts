import "server-only";
import type { CodingDifficulty, CodingLanguage } from "@/lib/codingLanguages";

export { CODING_LANGUAGES, CODE_TEMPLATES } from "@/lib/codingLanguages";
export type { CodingDifficulty, CodingLanguage } from "@/lib/codingLanguages";

export type CodingTestCase = {
  input: string;
  expectedOutput: string;
  hidden: boolean;
};

export type CodingProblem = {
  slug: string;
  title: string;
  difficulty: CodingDifficulty;
  topic: string;
  tags: string[];
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: { input: string; output: string; explanation: string }[];
  hints: string[];
  testCases: CodingTestCase[];
};

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Hash map",
    tags: ["Array", "Hash map"],
    statement: "Given an integer array and a target, find the two distinct indices whose values add up to the target. Every input has exactly one solution. Return the smaller index first.",
    inputFormat: "The first line contains n. The second line contains n integers. The third line contains target.",
    outputFormat: "Print the two zero-based indices separated by one space.",
    constraints: ["2 ≤ n ≤ 100,000", "Each value and target is between -1,000,000,000 and 1,000,000,000", "Exactly one valid pair exists"],
    examples: [
      { input: "4\n2 7 11 15\n9", output: "0 1", explanation: "2 + 7 = 9, at indices 0 and 1." },
      { input: "3\n3 2 4\n6", output: "1 2", explanation: "2 + 4 = 6." },
    ],
    hints: ["A hash map can store values you have already seen.", "For each value x, look for target - x before storing x."],
    testCases: [
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", hidden: false },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2", hidden: false },
      { input: "2\n3 3\n6", expectedOutput: "0 1", hidden: true },
      { input: "5\n-1 -2 -3 4 7\n2", expectedOutput: "1 3", hidden: true },
      { input: "6\n8 1 6 4 10 3\n7", expectedOutput: "1 2", hidden: true },
    ],
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    topic: "Dynamic programming",
    tags: ["Array", "Kadane's algorithm"],
    statement: "Find the largest possible sum of a non-empty contiguous subarray.",
    inputFormat: "The first line contains n. The second line contains n integers.",
    outputFormat: "Print the maximum subarray sum.",
    constraints: ["1 ≤ n ≤ 200,000", "-10,000 ≤ values[i] ≤ 10,000"],
    examples: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6", explanation: "The subarray [4, -1, 2, 1] has sum 6." },
      { input: "5\n1 2 3 4 5", output: "15", explanation: "The whole array has the largest sum." },
    ],
    hints: ["At each position, either extend the previous subarray or start a new one.", "Track the best sum seen so far; all values may be negative."],
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", hidden: false },
      { input: "5\n1 2 3 4 5", expectedOutput: "15", hidden: false },
      { input: "5\n-8 -3 -6 -2 -5", expectedOutput: "-2", hidden: true },
      { input: "8\n5 4 -1 7 8 -20 3 4", expectedOutput: "23", hidden: true },
      { input: "1\n-1", expectedOutput: "-1", hidden: true },
    ],
  },
  {
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topic: "Two pointers",
    tags: ["Array", "Two pointers", "Prefix maximum"],
    statement: "Given the elevation map where each bar has width 1, calculate how much rainwater can be trapped after raining.",
    inputFormat: "The first line contains n. The second line contains n non-negative heights.",
    outputFormat: "Print the total units of trapped water.",
    constraints: ["1 ≤ n ≤ 200,000", "0 ≤ heights[i] ≤ 100,000"],
    examples: [
      { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6", explanation: "The bars trap 6 units of water in total." },
      { input: "6\n4 2 0 3 2 5", output: "9", explanation: "The elevation map traps 9 units." },
    ],
    hints: ["Water above a bar is limited by the shorter of its highest left and right walls.", "Two pointers let you process the side with the smaller maximum in O(n) time."],
    testCases: [
      { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6", hidden: false },
      { input: "6\n4 2 0 3 2 5", expectedOutput: "9", hidden: false },
      { input: "5\n3 0 2 0 4", expectedOutput: "7", hidden: true },
      { input: "4\n1 2 3 4", expectedOutput: "0", hidden: true },
      { input: "7\n5 2 1 2 1 5 0", expectedOutput: "14", hidden: true },
    ],
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    tags: ["String", "Stack"],
    statement: "A string containing only '(', ')', '{', '}', '[' and ']' is valid when every opening bracket is closed by the same type and in the correct order. Decide whether the string is valid.",
    inputFormat: "One line containing the bracket string. The string is non-empty.",
    outputFormat: "Print true if valid, otherwise false.",
    constraints: ["1 ≤ string length ≤ 100,000", "The string contains only bracket characters"],
    examples: [
      { input: "()[]{}", output: "true", explanation: "Every bracket closes in the correct order." },
      { input: "([)]", output: "false", explanation: "The closing brackets are in the wrong order." },
    ],
    hints: ["When an opening bracket appears, remember which closing bracket it needs.", "A stack naturally checks the most recently opened bracket first."],
    testCases: [
      { input: "()[]{}", expectedOutput: "true", hidden: false },
      { input: "([)]", expectedOutput: "false", hidden: false },
      { input: "{[]}", expectedOutput: "true", hidden: true },
      { input: "(((((", expectedOutput: "false", hidden: true },
      { input: "(]", expectedOutput: "false", hidden: true },
    ],
  },
  {
    slug: "product-except-self",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    topic: "Prefix and suffix",
    tags: ["Array", "Prefix product"],
    statement: "Return an array where each position contains the product of every input value except the value at that position. Do not use division.",
    inputFormat: "The first line contains n. The second line contains n integers.",
    outputFormat: "Print n space-separated products in the original order.",
    constraints: ["2 ≤ n ≤ 100,000", "-30 ≤ values[i] ≤ 30", "Every output fits in a signed 32-bit integer"],
    examples: [
      { input: "4\n1 2 3 4", output: "24 12 8 6", explanation: "Each answer is the product of the other three values." },
      { input: "5\n-1 1 0 -3 3", output: "0 0 9 0 0", explanation: "The single zero makes most products zero." },
    ],
    hints: ["The product to the left and the product to the right can be computed separately.", "You can keep one running suffix product and store prefixes in the result."],
    testCases: [
      { input: "4\n1 2 3 4", expectedOutput: "24 12 8 6", hidden: false },
      { input: "5\n-1 1 0 -3 3", expectedOutput: "0 0 9 0 0", hidden: false },
      { input: "3\n2 3 4", expectedOutput: "12 8 6", hidden: true },
      { input: "4\n0 0 2 3", expectedOutput: "0 0 0 0", hidden: true },
      { input: "2\n-5 7", expectedOutput: "7 -5", hidden: true },
    ],
  },
  {
    slug: "coin-change",
    title: "Coin Change",
    difficulty: "Hard",
    topic: "Dynamic programming",
    tags: ["Array", "Dynamic programming", "Breadth-first search"],
    statement: "You have unlimited coins of the given denominations. Return the fewest coins needed to make the amount, or -1 if it cannot be made.",
    inputFormat: "The first line contains n and amount. The second line contains n positive coin values.",
    outputFormat: "Print the minimum number of coins, or -1 when impossible.",
    constraints: ["1 ≤ n ≤ 20", "1 ≤ coins[i] ≤ 10,000", "0 ≤ amount ≤ 10,000"],
    examples: [
      { input: "3 11\n1 2 5", output: "3", explanation: "11 = 5 + 5 + 1." },
      { input: "1 3\n2", output: "-1", explanation: "No combination of 2-value coins makes 3." },
    ],
    hints: ["Let dp[x] be the fewest coins needed to make amount x.", "For every amount, try each coin that does not exceed it."],
    testCases: [
      { input: "3 11\n1 2 5", expectedOutput: "3", hidden: false },
      { input: "1 3\n2", expectedOutput: "-1", hidden: false },
      { input: "3 0\n1 2 5", expectedOutput: "0", hidden: true },
      { input: "3 6\n1 3 4", expectedOutput: "2", hidden: true },
      { input: "2 7\n2 4", expectedOutput: "-1", hidden: true },
    ],
  },
  {
    slug: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "Easy",
    topic: "Math",
    tags: ["Math", "Number"],
    statement: "Determine whether the given integer reads the same from left to right and right to left. Negative numbers are not palindromes.",
    inputFormat: "One line containing integer x.",
    outputFormat: "Print true or false.",
    constraints: ["-2^31 ≤ x ≤ 2^31 - 1"],
    examples: [
      { input: "121", output: "true", explanation: "121 reads the same in both directions." },
      { input: "-121", output: "false", explanation: "The minus sign has no matching character at the end." },
    ],
    hints: ["A negative number cannot be a palindrome.", "You can compare the digits as text, or reverse only half of the number."],
    testCases: [
      { input: "121", expectedOutput: "true", hidden: false },
      { input: "-121", expectedOutput: "false", hidden: false },
      { input: "10", expectedOutput: "false", hidden: true },
      { input: "0", expectedOutput: "true", hidden: true },
      { input: "1221", expectedOutput: "true", hidden: true },
    ],
  },
  {
    slug: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "Sliding window",
    tags: ["String", "Hash map", "Sliding window"],
    statement: "Find the length of the longest contiguous substring that contains no repeated character.",
    inputFormat: "One line containing a non-empty ASCII string without spaces.",
    outputFormat: "Print the maximum length.",
    constraints: ["1 ≤ string length ≤ 200,000", "The input contains visible ASCII characters"],
    examples: [
      { input: "abcabcbb", output: "3", explanation: "The answer is 'abc', with length 3." },
      { input: "pwwkew", output: "3", explanation: "The answer is 'wke', with length 3." },
    ],
    hints: ["Keep a sliding window with no duplicate characters.", "A map of each character's last position can move the left edge forward."],
    testCases: [
      { input: "abcabcbb", expectedOutput: "3", hidden: false },
      { input: "pwwkew", expectedOutput: "3", hidden: false },
      { input: "bbbbb", expectedOutput: "1", hidden: true },
      { input: "dvdf", expectedOutput: "3", hidden: true },
      { input: "abcdef", expectedOutput: "6", hidden: true },
    ],
  },
  {
    slug: "largest-rectangle",
    title: "Largest Rectangle in Histogram",
    difficulty: "Hard",
    topic: "Monotonic stack",
    tags: ["Array", "Stack", "Monotonic stack"],
    statement: "Given the heights of adjacent histogram bars, find the area of the largest rectangle that can be formed.",
    inputFormat: "The first line contains n. The second line contains n non-negative heights.",
    outputFormat: "Print the largest rectangle area.",
    constraints: ["1 ≤ n ≤ 200,000", "0 ≤ heights[i] ≤ 100,000"],
    examples: [
      { input: "6\n2 1 5 6 2 3", output: "10", explanation: "Bars with heights 5 and 6 form a rectangle of area 10." },
      { input: "2\n2 4", output: "4", explanation: "The bar of height 4 forms the largest area." },
    ],
    hints: ["For each bar, find the nearest shorter bar to its left and right.", "A monotonic increasing stack can find those boundaries in linear time."],
    testCases: [
      { input: "6\n2 1 5 6 2 3", expectedOutput: "10", hidden: false },
      { input: "2\n2 4", expectedOutput: "4", hidden: false },
      { input: "5\n2 2 2 2 2", expectedOutput: "10", hidden: true },
      { input: "5\n5 4 3 2 1", expectedOutput: "9", hidden: true },
      { input: "4\n0 0 0 0", expectedOutput: "0", hidden: true },
    ],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function getUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getDailyCodingProblem(date = new Date()) {
  const dayNumber = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / DAY_MS);
  const index = ((dayNumber % CODING_PROBLEMS.length) + CODING_PROBLEMS.length) % CODING_PROBLEMS.length;
  return CODING_PROBLEMS[index];
}

export function getPublicCodingProblem(problem: CodingProblem) {
  return {
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    topic: problem.topic,
    tags: problem.tags,
    statement: problem.statement,
    inputFormat: problem.inputFormat,
    outputFormat: problem.outputFormat,
    constraints: problem.constraints,
    examples: problem.examples,
    hints: problem.hints,
  };
}
