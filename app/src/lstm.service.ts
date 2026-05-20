import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LstmService {
  private readonly lstmUrl: string;

  constructor(private configService: ConfigService) {
    this.lstmUrl = this.configService.get<string>('LSTM_API_URL')!;
  }

  async analyzeLogs(logs: string): Promise<any> {
    try {
      const response = await axios.post(this.lstmUrl, { logs });
      return response.data;
    } catch (error) {
      return { result: 'ERROR', error: 'LSTM service unavailable' };
    }
  }
}