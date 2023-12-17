class TestFramework {
  constructor() {
    this.testCases = [];
  }

  defineTest(description, func, expected, ...args) {
    this.testCases.push({ description, func, expected, args });
  }

  runTests() {
    const results = {
      passed: [],
      failed: []
    };

    this.testCases.forEach((testCase, index) => {
      const { description, func, expected, args } = testCase;
      try {
        const actual = func(...args);
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
          results.passed.push({ index, description, args, expected });
        } else {
          results.failed.push({ index, description, args, expected, actual });
        }
      } catch (e) {
        results.failed.push({ index, description, args, expected, exception: e.message });
      }
    });

    return results;
  }

  report() {
    const results = this.runTests();
    console.log("Test Report");
    console.log("-----------");
    console.log("PASSED TESTS:");
    results.passed.forEach(test => {
      console.log(`Test #${test.index} ["${test.description}"]: Passed. Function was called with args=${JSON.stringify(test.args)}. Expected and actual output=${JSON.stringify(test.expected)}.`);
    });

    console.log("\nFAILED TESTS:");
    results.failed.forEach(test => {
      console.log(`Test #${test.index} ["${test.description}"]: Failed. Function was called with args=${JSON.stringify(test.args)}. Expected=${JSON.stringify(test.expected)}, Actual=${JSON.stringify(test.actual)}${test.exception ? `, Exception: ${test.exception}` : ''}`);
    });
  }
}

module.exports = TestFramework;
