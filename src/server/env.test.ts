import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { dotenvConfig, existsSync } = vi.hoisted(() => ({
  dotenvConfig: vi.fn(),
  existsSync: vi.fn(),
}));

vi.mock("dotenv", () => ({
  default: { config: dotenvConfig },
}));

vi.mock("node:fs", () => ({
  default: { existsSync },
}));

describe("server environment file discovery", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads .env from the current working directory first", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/workspace/project");
    existsSync.mockImplementation((candidate) => candidate === "/workspace/project/.env");
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await import("./env");

    expect(dotenvConfig).toHaveBeenCalledOnce();
    expect(dotenvConfig).toHaveBeenCalledWith({ path: "/workspace/project/.env" });
    expect(existsSync).toHaveBeenCalledWith("/workspace/project/.env");
    expect(log).not.toHaveBeenCalled();
  });

  it("walks up parent directories when the working directory has no .env", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/workspace/project/apps/web");
    existsSync.mockImplementation((candidate) => candidate === "/workspace/project/.env");
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await import("./env");

    expect(dotenvConfig).toHaveBeenCalledOnce();
    expect(dotenvConfig).toHaveBeenCalledWith({ path: "/workspace/project/.env" });
    expect(log).toHaveBeenCalledWith(
      "[env] loading environment from /workspace/project/.env"
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
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await import("./env");

    expect(dotenvConfig).toHaveBeenCalledWith({ path: projectEnv });
    expect(log).toHaveBeenCalledWith(`[env] loading environment from ${projectEnv}`);
  });

  it("does not invoke dotenv when no candidate exists", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/workspace/project/apps/web");
    existsSync.mockReturnValue(false);

    await import("./env");

    expect(config).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });
});
