import dotenv from "dotenv";

// Load .env BEFORE any other server module evaluates. ES module imports are
// hoisted above the importing file's body, so without this prelude, modules
// like ./auth would read process.env (DATABASE_URL, AUTH_SECRET, ...) before
// dotenv.config() ran and cache null/fallback values forever.
// Import first in the server entry: import "./env";
dotenv.config();
