const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const testDirectory = path.join(__dirname, '..', 'test');
const interpreter = path.join(__dirname, '..', 'dist', 'lox.js');
const testFiles = fs
  .readdirSync(testDirectory)
  .filter((file) => file.endsWith('.lox'))
  .sort();

let failed = 0;

for (const file of testFiles) {
  const testPath = path.join(testDirectory, file);
  const expectedExitCode = file === 'errors.lox' ? 65 : 0;

  console.log(`\n--- ${file} ---`);
  const result = spawnSync(process.execPath, [interpreter, testPath], {
    stdio: 'inherit',
  });
  const actualExitCode = result.status ?? 1;

  if (actualExitCode !== expectedExitCode) {
    console.error(
      `${file} failed: expected exit code ${expectedExitCode}, got ${actualExitCode}.`,
    );
    failed++;
  }
}

console.log(
  `\n${testFiles.length - failed}/${testFiles.length} test files passed.`,
);
process.exitCode = failed === 0 ? 0 : 1;
