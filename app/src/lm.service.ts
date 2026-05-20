import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LmService {
  private readonly baseUrl: string;
  private readonly modelName: string;
  private readonly maxLogLines = 200;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('LM_STUDIO_URL')!;
    this.modelName = this.configService.get<string>('LM_MODEL_NAME')!;
  }

  private truncateLogs(logs: string): string {
    const lines = logs.split('\n');
    if (lines.length <= this.maxLogLines) {
      return logs;
    }
    return lines.slice(-this.maxLogLines).join('\n');
  }

  async analyzeLogs(logs: string): Promise<string> {
    const shortLogs = this.truncateLogs(logs);

    const prompt = `
You are a Kubernetes / NestJS backend health analyst.

Task:
1. Decide whether the service is HEALTHY or UNHEALTHY.
2. Explain the main REASON based on the errors in the logs.
3. Provide a short FIX SUGGESTION for the developer.

Return the answer in this exact text format (no extra text):

HEALTH: HEALTHY or UNHEALTHY
REASON: <short reason>
ERROR TYPE: <short label or "UNKNOWN">
FIX SUGGESTION: <short suggestion>
`.trim();

    const body = {
      model: this.modelName,
      messages: [
        {
          role: 'system',
          content: 'You are a concise log analysis assistant.',
        },
        {
          role: 'user',
          content: `${prompt}\n\nHere are the logs:\n\n${shortLogs}`,
        },
      ],
      temperature: 0,
    };

    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer lm-studio`,
        },
        timeout: 120000,
      },
    );

    const content =
      response.data?.choices?.[0]?.message?.content ??
      JSON.stringify(response.data, null, 2);

    return content;
  }
}