import fs from 'fs';
import path from 'path';

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export default class PlaywrightSonarReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile || 'e2e-results/sonar-test-execution.xml';
    this.testsByFile = new Map();
  }

  onTestEnd(test, result) {
    const filePath = test.location.file.replace(/\\/g, '/');
    const duration = Math.max(0, Math.round(result.duration || 0));
    const testCase = {
      name: test.titlePath().slice(1).join(' '),
      duration,
      status: result.status,
      error: result.error?.message || '',
      stack: result.error?.stack || ''
    };

    if (!this.testsByFile.has(filePath)) {
      this.testsByFile.set(filePath, []);
    }

    this.testsByFile.get(filePath).push(testCase);
  }

  async onEnd() {
    const filesXml = Array.from(this.testsByFile.entries()).map(([filePath, tests]) => {
      const testCasesXml = tests.map((testCase) => {
        const failureXml = testCase.status === 'passed'
          ? ''
          : `<failure message="${escapeXml(testCase.error || 'Test failed')}">${escapeXml(testCase.stack || testCase.error || 'Test failed')}</failure>`;

        return `    <testCase name="${escapeXml(testCase.name)}" duration="${testCase.duration}">${failureXml}</testCase>`;
      }).join('\n');

      return `  <file path="${escapeXml(filePath)}">\n${testCasesXml}\n  </file>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<testExecutions version="1">\n${filesXml}\n</testExecutions>\n`;

    fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
    fs.writeFileSync(this.outputFile, xml, 'utf8');
  }
}
