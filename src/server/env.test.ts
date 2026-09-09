import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("dotenv", () => ({
  default: { config: vi.fn() },
}));

vi.mock("node:fs", () => ({
  default: { existsSync: vi.fn() },
}));

const config = vi.mocked(dotenv.config);
const existsSync = vi.mocked(fs.existsSync);

describe("server environment loading", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("prefers .env in the current working directory", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/work/current");
    existsSync.mockImplementation((file) => String(file) === "/work/current/.env");

    await import("./env");

    expect(config).toHaveBeenCalledOnce();
    expect(config).toHaveBeenCalledWith({ path: "/work/current/.env" });
    expect(console.log).not.toHaveBeenCalled();
  });

  it("falls back to the project-relative file when launched elsewhere", async () => {
    const projectEnv = path.join(path.resolve("."), ".env");
    vi.spyOn(process, "cwd").mockReturnValue("/outside/project");
    existsSync.mockImplementation((file) => String(file) === projectEnv);

    await import("./env");

    expect(config).toHaveBeenCalledWith({ path: projectEnv });
    expect(console.log).toHaveBeenCalledWith(`[env] loading environment from ${projectEnv}`);
  });

  it("walks up from a nested working directory to find .env", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/project/apps/server/deep");
    existsSync.mockImplementation((file) => String(file) === "/project/.env");

    await import("./env");

    expect(config).toHaveBeenCalledWith({ path: "/project/.env" });
    expect(console.log).toHaveBeenCalledWith("[env] loading environment from /project/.env");
  });

  it("does not invoke dotenv when no candidate exists", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/without/env");
    existsSync.mockReturnValue(false);

    await import("./env");

    expect(config).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });
});
