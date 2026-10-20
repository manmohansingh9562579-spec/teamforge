export type CodingLanguage = "python" | "javascript" | "typescript" | "java" | "cpp" | "go" | "c";
export type CodingDifficulty = "Easy" | "Medium" | "Hard";

export const CODING_LANGUAGES: { id: CodingLanguage; label: string; judgePattern: RegExp; preferred: string }[] = [
  { id: "python", label: "Python 3", judgePattern: /^Python \(3\./, preferred: "Python (3.12" },
  { id: "javascript", label: "JavaScript", judgePattern: /^JavaScript \(Node\.js /, preferred: "JavaScript (Node.js 22" },
  { id: "typescript", label: "TypeScript", judgePattern: /^TypeScript \(/, preferred: "TypeScript (5.6" },
  { id: "java", label: "Java", judgePattern: /^Java \(/, preferred: "Java (JDK 17" },
  { id: "cpp", label: "C++", judgePattern: /^C\+\+ \(GCC /, preferred: "C++ (GCC 14" },
  { id: "go", label: "Go", judgePattern: /^Go \(/, preferred: "Go (1.23" },
  { id: "c", label: "C", judgePattern: /^C \(GCC /, preferred: "C (GCC 14" },
];

export const CODE_TEMPLATES: Record<CodingLanguage, string> = {
  python: `import sys\n\ndata = sys.stdin.read().strip().split()\n# Parse the input, solve the problem, and print the result.\n`,
  javascript: `const fs = require("fs");\nconst data = fs.readFileSync(0, "utf8").trim().split(/\\s+/);\n// Parse the input, solve the problem, and print the result.\n`,
  typescript: `declare const require: any;\nconst fs = require("fs");\nconst data: string[] = fs.readFileSync(0, "utf8").trim().split(/\\s+/);\n// Parse the input, solve the problem, and print the result.\n`,
  java: `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    Scanner in = new Scanner(System.in);\n    // Parse the input, solve the problem, and print the result.\n  }\n}\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n  // Parse the input, solve the problem, and print the result.\n  return 0;\n}\n`,
  go: `package main\n\nimport (\n  "bufio"\n  "fmt"\n  "os"\n)\n\nfunc main() {\n  in := bufio.NewReader(os.Stdin)\n  _ = in\n  // Parse the input, solve the problem, and print the result.\n  fmt.Print("")\n}\n`,
  c: `#include <stdio.h>\n\nint main(void) {\n  // Parse the input, solve the problem, and print the result.\n  return 0;\n}\n`,
};
