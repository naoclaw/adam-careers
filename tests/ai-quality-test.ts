#!/usr/bin/env npx tsx

/**
 * AI Quality Validation Tests for Adam Careers
 * Tests CV generation, chat, and job extraction accuracy
 */

interface TestResult {
  name: string;
  passed: boolean;
  score?: number;
  details: string;
  timestamp: string;
}

interface AIResponse {
  content: string;
  model: string;
  latency: number;
}

class AIQualityTester {
  private results: TestResult[] = [];
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async testCVGenerationAccuracy(): Promise<TestResult> {
    const start = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/cv/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobUrl: 'https://example.com/job',
          userProfile: {
            name: 'John Doe',
            email: 'john@example.com',
            experience: [
              {
                company: 'Tech Corp',
                title: 'Senior Developer',
                years: 5
              }
            ],
            skills: ['JavaScript', 'TypeScript', 'React', 'Node.js']
          }
        })
      });

      const latency = Date.now() - start;
      const data = await response.json();

      if (!response.ok) {
        return {
          name: 'cv-generation',
          passed: false,
          details: `API error: ${data.error || response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }

      // Evaluate CV quality
      const scores = this.evaluateCVQuality(data.cv || '');

      return {
        name: 'cv-generation',
        passed: scores.totalScore >= 70,
        score: scores.totalScore,
        details: `ATS Score: ${scores.atsScore}, Keywords: ${scores.keywordScore}, Format: ${scores.formatScore} (${latency}ms)`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'cv-generation',
        passed: false,
        details: `Error: ${error instanceof Error ? 'Connection failed' : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testChatResponseQuality(): Promise<TestResult> {
    const testPrompts = [
      'How should I structure my resume for a software engineering role?',
      'What are the most important skills for a full-stack developer?',
      'How can I improve my chances of getting hired at a FAANG company?'
    ];

    const scores: number[] = [];

    for (const prompt of testPrompts) {
      try {
        const start = Date.now();
        const response = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt })
        });

        if (!response.ok) {
          scores.push(0);
          continue;
        }

        const data = await response.json();
        const latency = Date.now() - start;
        const content = data.message || '';

        // Evaluate response quality
        const score = this.evaluateChatResponse(prompt, content);
        scores.push(score);
      } catch (error) {
        scores.push(0);
      }
    }

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      name: 'chat-quality',
      passed: avgScore >= 75,
      score: avgScore,
      details: `Average relevance score: ${avgScore.toFixed(1)}/100 (${testPrompts.length} prompts tested)`,
      timestamp: new Date().toISOString()
    };
  }

  async testJobExtractionAccuracy(): Promise<TestResult> {
    const testUrls = [
      'https://www.linkedin.com/jobs/view/123456789',
      'https://example.com/careers/software-engineer',
      'https://indeed.com/viewjob?jk=123456789'
    ];

    let successes = 0;
    const results: unknown[] = [];

    for (const url of testUrls) {
      try {
        const response = await fetch(`${this.baseUrl}/api/jobs/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const job = data.job;

        if (job && job.title && job.description) {
          successes++;
          results.push({ url, success: true });
        } else {
          results.push({ url, success: false, reason: 'Missing fields' });
        }
      } catch (error) {
        results.push({ url, success: false, reason: 'Connection failed' });
      }
    }

    const accuracy = (successes / testUrls.length) * 100;

    return {
      name: 'job-extraction',
      passed: accuracy >= 80,
      score: accuracy,
      details: `${successes}/${testUrls.length} URLs parsed successfully (avg score: ${accuracy.toFixed(1)}%)`,
      timestamp: new Date().toISOString()
    };
  }

  private evaluateCVQuality(cvText: string): unknown {
    let atsScore = 0;
    let keywordScore = 0;
    let formatScore = 0;

    // ATS parsing score
    if (cvText.includes('John Doe')) atsScore += 20;
    if (cvText.includes('Tech Corp')) atsScore += 20;
    if (cvText.includes('Senior Developer')) atsScore += 20;
    if (cvText.includes('john@example.com')) atsScore += 20;
    if (cvText.includes('Software Engineer') || cvText.includes('Developer')) atsScore += 20;

    // Keyword matching
    const keywords = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Full Stack'];
    const foundKeywords = keywords.filter(k => cvText.includes(k));
    keywordScore = (foundKeywords.length / keywords.length) * 100;

    // Format consistency
    if (cvText.includes('Experience')) formatScore += 33;
    if (cvText.includes('Skills')) formatScore += 33;
    if (cvText.includes('Contact') || cvText.includes('Email')) formatScore += 34;

    return {
      atsScore,
      keywordScore,
      formatScore,
      totalScore: Math.round((atsScore + keywordScore + formatScore) / 3)
    };
  }

  private evaluateChatResponse(prompt: string, response: string): number {
    let score = 50; // Base score for any response

    // Length check
    if (response.length > 50 && response.length < 500) score += 10;

    // Keyword relevance based on prompt
    const promptLower = prompt.toLowerCase();
    const responseLower = response.toLowerCase();

    if (promptLower.includes('resume') || promptLower.includes('cv')) {
      if (responseLower.includes('resume') || responseLower.includes('cv')) score += 20;
    }
    if (promptLower.includes('skill')) {
      if (responseLower.includes('skill')) score += 20;
    }
    if (promptLower.includes('faang') || promptLower.includes('hired')) {
      if (responseLower.includes('experience') || responseLower.includes('portfolio')) score += 20;
    }

    return Math.min(score, 100);
  }

  async runAllTests(): Promise<void> {
    console.log('Running AI Quality Tests...\n');

    const tests = [
      this.testCVGenerationAccuracy(),
      this.testChatResponseQuality(),
      this.testJobExtractionAccuracy()
    ];

    this.results = await Promise.all(tests);

    this.printResults();
    this.saveResults();
  }

  private printResults(): void {
    console.log('AI Quality Test Results:');
    console.log('='.repeat(70));
    console.log('| Test Name           | Passed | Score | Details                     |');
    console.log('|---------------------|--------|-------|-----------------------------|');

    for (const result of this.results) {
      const passed = result.passed ? '✓' : '✗';
      const score = result.score !== undefined ? result.score.toFixed(0) + '%' : 'N/A';
      console.log(`| ${result.name.padEnd(20)} | ${passed.padEnd(6)} | ${score.padEnd(5)} | ${result.details.substring(0, 27).padEnd(27)} |`);
    }

    console.log('='.repeat(70));

    const allPassed = this.results.every(r => r.passed);
    console.log(`\nOverall: ${allPassed ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗'}`);
  }

  private saveResults(): void {
    const resultsDir = '/opt/adam-careers/tests/results';
    const filePath = `${resultsDir}/ai-quality-results.json`;

    const data = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      results: this.results
    };

    import fs from 'fs';
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`\nResults saved to: ${filePath}`);
  }
}

// CLI execution
const url = process.argv[2] || 'http://localhost:3000';
const tester = new AIQualityTester(url);
tester.runAllTests().catch(console.error);
