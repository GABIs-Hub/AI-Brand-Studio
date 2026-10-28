import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { dotenvConfig, existsSync } = vi.hoisted(() => ({
  dotenvConfig: vi.fn(),
  existsSync: vi.fn(),
}));

vi.mock("dotenv", () => ({
  default: { config: (...args: Parameters<typeof dotenvConfig>) => dotenvConfig(...args) },
}));
vi.mock("node:fs", () => ({
  default: { existsSync: (...args: Parameters<typeof existsSync>) => existsSync(...args) },
}));

describe("server environment file discovery", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads .env from the current working directory first", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/workspace/project");
    const cwdEnv = path.join("/workspace/project", ".env");
    existsSync.mockImplementation((candidate) => candidate === cwdEnv);
    const log = vi.mocked(console.log);

    await import("./env");

    expect(dotenvConfig).toHaveBeenCalledOnce();
    expect(dotenvConfig).toHaveBeenCalledWith({ path: cwdEnv });
    expect(existsSync).toHaveBeenCalledWith(cwdEnv);
    expect(log).not.toHaveBeenCalled();
  });

  it("walks up parent directories when the working directory has no .env", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/workspace/project/apps/web");
    const parentEnv = path.join("/workspace/project", ".env");
    existsSync.mockImplementation((candidate) => candidate === parentEnv);
    const log = vi.mocked(console.log);

    await import("./env");

    expect(dotenvConfig).toHaveBeenCalledOnce();
    expect(dotenvConfig).toHaveBeenCalledWith({ path: parentEnv });
    expect(log).toHaveBeenCalledWith(
      `[env] loading environment from ${parentEnv}`
    );
  });

  it("loads the source-module-relative project .env when started elsewhere", async () => {
    const projectEnv = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      ".env"
    );
    vi.spyOn(process, "cwd").mockReturnValue("/outside/launch-directory");
    existsSync.mockImplementation((candidate) => candidate === projectEnv);
    const log = vi.mocked(console.log);

    await import("./env");

    expect(dotenvConfig).toHaveBeenCalledWith({ path: projectEnv });
    expect(log).toHaveBeenCalledWith(`[env] loading environment from ${projectEnv}`);
  });

  it("does not invoke dotenv when no candidate exists", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/workspace/project/apps/web");
    existsSync.mockReturnValue(false);

    await import("./env");

    expect(dotenvConfig).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });
});
