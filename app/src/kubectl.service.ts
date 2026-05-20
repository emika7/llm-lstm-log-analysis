import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class KubectlService {
  private readonly k8sProxy: string;

  constructor(private configService: ConfigService) {
    this.k8sProxy = this.configService.get<string>('K8S_PROXY_URL')!;
  }

  async listPods(namespace = 'default'): Promise<string[]> {
    const response = await axios.get(
      `${this.k8sProxy}/api/v1/namespaces/${namespace}/pods`
    );
    const items = response.data.items ?? [];
    return items
      .map((p: any) => p.metadata?.name)
      .filter((name: string | undefined) => !!name);
  }

  async getPodLogs(
    namespace: string,
    podName: string,
    tailLines = 200,
  ): Promise<string> {
    const response = await axios.get(
      `${this.k8sProxy}/api/v1/namespaces/${namespace}/pods/${podName}/log?tailLines=${tailLines}`
    );
    return response.data;
  }

  async getRecentLogs(
    namespace: string,
    podName: string,
    minutes = 2,
  ): Promise<string> {
    const sinceSeconds = minutes * 60;
    const response = await axios.get(
      `${this.k8sProxy}/api/v1/namespaces/${namespace}/pods/${podName}/log?sinceSeconds=${sinceSeconds}`
    );
    return response.data;
  }
}