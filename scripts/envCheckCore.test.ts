import { describe, it, expect } from "vitest";
import {
  findDuplicateKeys,
  findLeftoverPlaceholders,
  findSecretValues,
  keySetDiff,
  parseEnvFile,
} from "./envCheckCore";

describe("parseEnvFile", () => {
  it("parses keys, quoted values and comments, ignoring blanks", () => {
    const env = parseEnvFile(
      ["# a comment", 'KEY_ONE="value one"', "", "KEY_TWO=plain"].join("\n")
    );
    expect(env.keys).toEqual(["KEY_ONE", "KEY_TWO"]);
    expect(env.values.KEY_ONE).toBe("value one");
    expect(env.values.KEY_TWO).toBe("plain");
  });

  it("handles CRLF line endings", () => {
    const env = parseEnvFile('A="1"\r\nB="2"\r\n');
    expect(env.keys).toEqual(["A", "B"]);
    expect(env.values.B).toBe("2");
  });

  it("keeps the last value for duplicate keys", () => {
    const env = parseEnvFile('K="first"\nK="second"');
    expect(env.values.K).toBe("second");
  });

  it("reports duplicated keys exactly once, in first-seen order", () => {
    const env = parseEnvFile('B="1"\nA="x"\nB="2"\nA="y"\nB="3"\nC="ok"');
    expect(findDuplicateKeys(env)).toEqual(["B", "A"]);
    expect(env.values.B).toBe("3");
    expect(env.values.A).toBe("y");
    expect(env.keys).toEqual(["B", "A", "C"]);
  });

  it("reports no duplicates for unique keys", () => {
    const env = parseEnvFile('A="1"\nB="2"');
    expect(findDuplicateKeys(env)).toEqual([]);
  });

  it("ignores malformed lines that are not KEY=value", () => {
    const env = parseEnvFile('A="1"\n=novalue\n1BAD="x"\nB="2"');
    expect(env.keys).toEqual(["A", "B"]);
  });
});

describe("findSecretValues", () => {
  it("flags Google, Resend, OpenAI-style, AWS and GitHub secrets", () => {
    const env = parseEnvFile(
      [
        "GOOGLE_CLIENT_SECRET=GOCSPX-abc123",
        "RESEND_API_KEY=re_0123456789abcdef",
        "OPENAI_API_KEY=sk-0123456789abcdef",
        "AWS_KEY=AKIA0123456789ABCDEF",
        "GH_TOKEN=ghp_0123456789abcdefghijklmn",
      ].join("\n")
    );
    const flagged = findSecretValues(env);
    expect(flagged).toEqual(
      expect.arrayContaining([
        "GOOGLE_CLIENT_SECRET",
        "RESEND_API_KEY",
        "OPENAI_API_KEY",
        "AWS_KEY",
        "GH_TOKEN",
      ])
    );
  });

  it("ignores placeholders, empties and safe defaults", () => {
    const env = parseEnvFile(
      [
        'GOOGLE_CLIENT_SECRET="<your google oauth client secret>"',
        'RESEND_API_KEY=""',
        'OPENAI_MODEL="gpt-4o"',
        'APP_URL="http://localhost:3000"',
        'RESEND_FROM="GABI <onboarding@resend.dev>"',
      ].join("\n")
    );
    expect(findSecretValues(env)).toEqual([]);
  });

  it("flags a postgres URL that embeds a password", () => {
    const env = parseEnvFile('DATABASE_URL="postgresql://user:secret@ep-1.aws.neon.tech/db"');
    expect(findSecretValues(env)).toEqual(["DATABASE_URL"]);
  });

  it("ignores a postgres URL without a password", () => {
    const env = parseEnvFile('DATABASE_URL="postgresql://user@ep-1.aws.neon.tech/db"');
    expect(findSecretValues(env)).toEqual([]);
  });
});

describe("findLeftoverPlaceholders", () => {
  it("flags <...> tokens left in .env", () => {
    const env = parseEnvFile('DATABASE_URL="<your postgresql:// connection string>"');
    expect(findLeftoverPlaceholders(env)).toEqual(["DATABASE_URL"]);
  });

  it("does not flag empty or real values", () => {
    const env = parseEnvFile(
      'DATABASE_URL="postgresql://user:pass@host/db"\nAUTH_SECRET=""'
    );
    expect(findLeftoverPlaceholders(env)).toEqual([]);
  });
});

describe("keySetDiff", () => {
  it("reports keys missing from env and extras in env", () => {
    const template = parseEnvFile('A="1"\nB="2"');
    const env = parseEnvFile('A="1"\nC="3"');
    expect(keySetDiff(template, env)).toEqual({
      missingFromEnv: ["B"],
      extraInEnv: ["C"],
    });
  });

  it("reports no divergence for identical key sets in any order", () => {
    const template = parseEnvFile('A="1"\nB="2"');
    const env = parseEnvFile('B="2"\nA="1"');
    expect(keySetDiff(template, env)).toEqual({
      missingFromEnv: [],
      extraInEnv: [],
    });
  });
});
