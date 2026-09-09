import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

const existsSync = vi.mocked(fs.existsSync);
const readFileSync = vi.mocked(fs.readFileSync);

describe("env:check command", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(process, "cwd").mockReturnValue("/project");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null) => {
      throw new Error(`process.exit:${code}`);
    }) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  function provideFiles(template: string, env?: string) {
    existsSync.mockImplementation((file) => {
      const path = String(file);
      return path === "/project/.env.example" || (env !== undefined && path === "/project/.env");
    });
    readFileSync.mockImplementation((file) => {
      if (String(file) === "/project/.env.example") return template;
      if (String(file) === "/project/.env" && env !== undefined) return env;
      throw new Error(`Unexpected read: ${String(file)}`);
    });
  }

  it("fails fast with a useful error when the template is missing", async () => {
    existsSync.mockReturnValue(false);

    await expect(import("./envCheck")).rejects.toThrow("process.exit:1");
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(
      "[env:check] .env.example not found — run from the repo root (npm run env:check)."
    );
    expect(readFileSync).not.toHaveBeenCalled();
  });

  it("allows a scrubbed template when no local environment file exists", async () => {
    provideFiles('API_KEY="<your key>"\nAPP_URL="http://localhost:3000"');

    await import("./envCheck");

    expect(process.exit).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      "[env:check] warn no .env found — copy the template and fill in real values: cp .env.example .env"
    );
    expect(console.log).toHaveBeenCalledWith(
      "[env:check] OK — .env.example is scrubbed (no .env present)."
    );
  });

  it("accepts matching key sets and warns once for duplicate definitions", async () => {
    provideFiles('A="<replace>"\nB="safe"\nB="safe-last"', 'B="real"\nA="real"\nA="last"');

    await import("./envCheck");

    expect(process.exit).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledTimes(2);
    expect(console.warn).toHaveBeenCalledWith(
      "[env:check] warn .env.example defines keys more than once (only the last value applies): B"
    );
    expect(console.warn).toHaveBeenCalledWith(
      "[env:check] warn .env defines keys more than once (only the last value applies): A"
    );
    expect(console.log).toHaveBeenCalledWith(
      "[env:check] OK — .env.example is scrubbed and .env matches the template."
    );
  });

  it("aggregates leaks, key-set divergence, and placeholders without printing values", async () => {
    const leakedValue = "sk-0123456789abcdef";
    provideFiles(`API_KEY=${leakedValue}\nA="<replace>"`, 'A="<replace>"\nEXTRA="private"');

    await expect(import("./envCheck")).rejects.toThrow("process.exit:1");

    expect(console.error).toHaveBeenCalledWith("[env:check] 4 problem(s) found.");
    expect(process.exit).toHaveBeenCalledOnce();
    const output = [
      ...vi.mocked(console.error).mock.calls,
      ...vi.mocked(console.warn).mock.calls,
      ...vi.mocked(console.log).mock.calls,
    ]
      .flat()
      .join("\n");
    expect(output).toContain("API_KEY");
    expect(output).toContain("EXTRA");
    expect(output).not.toContain(leakedValue);
    expect(output).not.toContain("private");
  });
});
