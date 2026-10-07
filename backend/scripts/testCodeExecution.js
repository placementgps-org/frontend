import { executeCodeOnTestCases } from '../services/codeExecutionService.js';

async function testRunner() {
  console.log('--- Testing Python Execution ---');
  const pythonCode = `
import sys
def main():
    lines = sys.stdin.read().split()
    if not lines:
        return
    a = int(lines[0])
    b = int(lines[1])
    print(a + b)

if __name__ == '__main__':
    main()
`;

  const testCases = [
    { input: '3 5', expectedOutput: '8' },
    { input: '10 -2', expectedOutput: '8' },
    { input: '100 250', expectedOutput: '350' }
  ];

  const pyRes = await executeCodeOnTestCases({
    language: 'python',
    code: pythonCode,
    testCases
  });

  console.log('Python Test Result:', JSON.stringify(pyRes, null, 2));

  console.log('--- Testing JavaScript Execution ---');
  const jsCode = `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (input.length >= 2) {
  const a = parseInt(input[0], 10);
  const b = parseInt(input[1], 10);
  console.log(a + b);
}
`;

  const jsRes = await executeCodeOnTestCases({
    language: 'javascript',
    code: jsCode,
    testCases
  });

  console.log('JavaScript Test Result:', JSON.stringify(jsRes, null, 2));

  console.log('--- Testing Infinite Loop Protection ---');
  const loopCode = `
while True:
    pass
`;

  const loopRes = await executeCodeOnTestCases({
    language: 'python',
    code: loopCode,
    testCases: [{ input: '1 2', expectedOutput: '3' }]
  });

  console.log('Infinite Loop Protection Result:', JSON.stringify(loopRes, null, 2));
}

testRunner();
