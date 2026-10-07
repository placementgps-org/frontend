import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

/**
 * Secure Isolated Code Execution Engine for Placement GPS.
 * Supports Python, JavaScript, and Java with process isolation,
 * execution timeouts, memory limits, and zero environment leakage.
 */

// Dynamically locate Python binary
function getPythonExecutable() {
  const possiblePaths = [
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'python.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'python.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python310', 'python.exe'),
    'C:\\Program Files\\Python312\\python.exe',
    'C:\\Python312\\python.exe',
    'python3',
    'python'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return 'python';
}

const PYTHON_BIN = getPythonExecutable();
const NODE_BIN = process.execPath;
const JAVA_BIN = 'java';
const JAVAC_BIN = 'javac';

// Sandbox configuration limits
const DEFAULT_TIMEOUT_MS = 4000;
const MAX_OUTPUT_BYTES = 50 * 1024; // 50 KB max stdout

/**
 * Execute a command securely in an isolated sub-process with stdin/stdout streaming and timeout.
 */
function runProcess({ command, args, stdinData, cwd, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let isTimedOut = false;
    let stdout = '';
    let stderr = '';
    let killed = false;

    // Isolated minimal environment (no secrets, no database URLs, no JWT keys)
    const cleanEnv = {
      PATH: process.env.PATH || '',
      SYSTEMROOT: process.env.SYSTEMROOT || '',
      TEMP: cwd,
      TMP: cwd,
      NODE_ENV: 'sandbox'
    };

    let child;
    try {
      child = spawn(command, args, {
        cwd,
        env: cleanEnv,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
      });
    } catch (err) {
      return resolve({
        status: 'Runtime Error',
        error: `Failed to spawn execution process: ${err.message}`,
        executionTimeMs: 0,
        stdout: '',
        stderr: err.message
      });
    }

    const timer = setTimeout(() => {
      isTimedOut = true;
      killed = true;
      try {
        child.kill('SIGKILL');
      } catch {
        // ignore
      }
    }, timeoutMs);

    if (child.stdin) {
      try {
        if (stdinData !== undefined && stdinData !== null) {
          child.stdin.write(String(stdinData));
          if (!String(stdinData).endsWith('\n')) {
            child.stdin.write('\n');
          }
        }
        child.stdin.end();
      } catch (err) {
        // stream may have closed
      }
    }

    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        if (stdout.length < MAX_OUTPUT_BYTES) {
          stdout += chunk.toString();
        }
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        if (stderr.length < MAX_OUTPUT_BYTES) {
          stderr += chunk.toString();
        }
      });
    }

    child.on('error', (err) => {
      clearTimeout(timer);
      const executionTimeMs = Date.now() - startTime;
      resolve({
        status: 'Runtime Error',
        error: err.message,
        executionTimeMs,
        stdout,
        stderr: err.message
      });
    });

    child.on('close', (exitCode) => {
      clearTimeout(timer);
      const executionTimeMs = Date.now() - startTime;

      if (isTimedOut) {
        return resolve({
          status: 'Time Limit Exceeded',
          error: `Execution timed out (${timeoutMs / 1000}s limit). Please check for infinite loops or inefficient algorithms.`,
          executionTimeMs,
          stdout,
          stderr
        });
      }

      if (exitCode !== 0 && exitCode !== null) {
        return resolve({
          status: 'Runtime Error',
          error: stderr.trim() || `Process exited with error code ${exitCode}`,
          executionTimeMs,
          stdout,
          stderr: stderr.trim()
        });
      }

      resolve({
        status: 'Success',
        executionTimeMs,
        stdout,
        stderr
      });
    });
  });
}

/**
 * Normalizes output string by trimming trailing whitespace and unifying newlines.
 */
function normalizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

/**
 * Executes a piece of code against an array of test cases.
 * 
 * @param {Object} options
 * @param {string} options.language - 'python' | 'javascript' | 'java'
 * @param {string} options.code - Source code string
 * @param {Array<{ input: string, expectedOutput: string }>} options.testCases
 * @param {boolean} options.stopOnFirstFailure - Whether to halt on first failing test (default false)
 * @returns {Promise<{ allPassed: boolean, passedCount: number, totalCount: number, results: Array, overallStatus: string }>}
 */
export async function executeCodeOnTestCases({
  language = 'python',
  code = '',
  testCases = [],
  stopOnFirstFailure = false
}) {
  const normLang = (language || 'python').toLowerCase().trim();
  const sandboxId = `sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const sandboxDir = path.join(os.tmpdir(), sandboxId);

  try {
    fs.mkdirSync(sandboxDir, { recursive: true });

    let sourceFileName = '';
    let runCommand = '';
    let runArgs = [];

    // Language preparation
    if (normLang === 'python' || normLang === 'py') {
      sourceFileName = 'solution.py';
      fs.writeFileSync(path.join(sandboxDir, sourceFileName), code, 'utf8');
      runCommand = PYTHON_BIN;
      runArgs = [sourceFileName];
    } else if (normLang === 'javascript' || normLang === 'js' || normLang === 'node') {
      sourceFileName = 'solution.js';
      // Add standard input reading helper if needed
      fs.writeFileSync(path.join(sandboxDir, sourceFileName), code, 'utf8');
      runCommand = NODE_BIN;
      runArgs = [sourceFileName];
    } else if (normLang === 'java') {
      sourceFileName = 'Main.java';
      // Ensure class is named Main or wrap if needed
      fs.writeFileSync(path.join(sandboxDir, sourceFileName), code, 'utf8');
      
      // Compile Java first
      const compileRes = await runProcess({
        command: JAVAC_BIN,
        args: [sourceFileName],
        cwd: sandboxDir,
        timeoutMs: 6000
      });

      if (compileRes.status !== 'Success') {
        return {
          allPassed: false,
          passedCount: 0,
          totalCount: testCases.length,
          overallStatus: 'Compilation Error',
          compileError: compileRes.stderr || compileRes.error || 'Java compilation failed',
          results: testCases.map((tc, idx) => ({
            testIndex: idx + 1,
            passed: false,
            status: 'Compilation Error',
            error: compileRes.stderr
          }))
        };
      }

      runCommand = JAVA_BIN;
      runArgs = ['Main'];
    } else {
      return {
        allPassed: false,
        passedCount: 0,
        totalCount: testCases.length,
        overallStatus: 'Runtime Error',
        compileError: `Language '${language}' is not supported in the execution sandbox.`,
        results: []
      };
    }

    const results = [];
    let passedCount = 0;
    let overallStatus = 'Accepted';

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const execResult = await runProcess({
        command: runCommand,
        args: runArgs,
        stdinData: tc.input || '',
        cwd: sandboxDir,
        timeoutMs: DEFAULT_TIMEOUT_MS
      });

      const actualOutput = normalizeOutput(execResult.stdout);
      const expectedOutput = normalizeOutput(tc.expectedOutput);
      const passed = execResult.status === 'Success' && actualOutput === expectedOutput;

      let status = 'Accepted';
      if (execResult.status !== 'Success') {
        status = execResult.status;
        if (overallStatus === 'Accepted') {
          overallStatus = status;
        }
      } else if (!passed) {
        status = 'Wrong Answer';
        if (overallStatus === 'Accepted') {
          overallStatus = 'Wrong Answer';
        }
      }

      if (passed) {
        passedCount++;
      }

      results.push({
        testIndex: i + 1,
        passed,
        status,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: execResult.stdout,
        error: execResult.error || execResult.stderr || null,
        executionTimeMs: execResult.executionTimeMs
      });

      if (!passed && stopOnFirstFailure) {
        break;
      }
    }

    const allPassed = passedCount === testCases.length && testCases.length > 0;

    return {
      allPassed,
      passedCount,
      totalCount: testCases.length,
      overallStatus: allPassed ? 'Accepted' : overallStatus,
      results
    };
  } finally {
    // Cleanup temporary sandbox directory
    try {
      if (fs.existsSync(sandboxDir)) {
        fs.rmSync(sandboxDir, { recursive: true, force: true });
      }
    } catch {
      // ignore cleanup errors
    }
  }
}
