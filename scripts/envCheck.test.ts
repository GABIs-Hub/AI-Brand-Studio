import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { EnvCheckIo, runEnvCheck } from './envCheckRunner';

function makeIo(template?: string, env?: string) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const logs: string[] = [];
  const io: EnvCheckIo = {
    cwd: () => '/project',
    existsSync: (file) => (template !== undefined && file === path.join('/project', '.env.example')) || (file === path.join('/project', '.env') && env !== undefined),
    readFileSync: (file) => {
      if (file === path.join('/project', '.env.example') && template !== undefined) return template;
      if (file === path.join('/project', '.env') && env !== undefined) return env;
      throw new Error(`Unexpected read: ${file}`);
    },
    error: (message) => errors.push(message),
    warn: (message) => warnings.push(message),
    log: (message) => logs.push(message),
    exit: ((code: number) => { throw new Error(`process.exit:${code}`); }) as never,
  };
  return { io, errors, warnings, logs };
}

describe('env:check command', () => {
  it('fails fast with a useful error when the template is missing', () => {
    const { io, errors } = makeIo();
    expect(() => runEnvCheck(io)).toThrow('process.exit:1');
    expect(errors).toEqual(['[env:check] .env.example not found — run from the repo root (npm run env:check).']);
  });

  it('allows a scrubbed template when no local environment file exists', () => {
    const { io, errors, warnings, logs } = makeIo('API_KEY="<your key>"\nAPP_URL="http://localhost:3000"');
    runEnvCheck(io);
    expect(errors).toEqual([]);
    expect(warnings).toEqual(['[env:check] warn no .env found — copy the template and fill in real values: cp .env.example .env']);
    expect(logs).toEqual(['[env:check] OK — .env.example is scrubbed (no .env present).']);
  });

  it('accepts matching key sets and warns once for duplicate definitions', () => {
    const { io, errors, warnings, logs } = makeIo('A="<replace>"\nB="safe"\nB="safe-last"', 'B="real"\nA="real"\nA="last"');
    runEnvCheck(io);
    expect(errors).toEqual([]);
    expect(warnings).toEqual([
      '[env:check] warn .env.example defines keys more than once (only the last value applies): B',
      '[env:check] warn .env defines keys more than once (only the last value applies): A',
    ]);
    expect(logs).toEqual(['[env:check] OK — .env.example is scrubbed and .env matches the template.']);
  });

  it('aggregates leaks, key-set divergence, and placeholders without printing values', () => {
    const leakedValue = 'sk-0123456789abcdef';
    const { io, errors, warnings, logs } = makeIo(`API_KEY=${leakedValue}\nA="<replace>"`, 'A="<replace>"\nEXTRA="private"');
    expect(() => runEnvCheck(io)).toThrow('process.exit:1');
    expect(errors).toContain('[env:check] 4 problem(s) found.');
    const output = [...errors, ...warnings, ...logs].join('\n');
    expect(output).toContain('API_KEY');
    expect(output).toContain('EXTRA');
    expect(output).not.toContain(leakedValue);
    expect(output).not.toContain('private');
  });
});
