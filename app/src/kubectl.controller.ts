import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { KubectlService } from './kubectl.service';
import { LmService } from './lm.service';
import { LstmService } from './lstm.service';

@Controller('k8s')
export class KubectlController {
  constructor(
    private readonly kubectlService: KubectlService,
    private readonly lmService: LmService,
    private readonly lstmService: LstmService,
  ) {}

  @Get('pods')
  async getPods(@Query('namespace') namespace = 'default') {
    const pods = await this.kubectlService.listPods(namespace);
    return { namespace, pods };
  }

  @Get('logs')
  async getLogs(
    @Query('namespace') namespace = 'default',
    @Query('pod') pod: string,
    @Query('tail') tail = 10,
  ) {
    if (!pod) {
      throw new BadRequestException('Missing "pod"');
    }

    const logs = await this.kubectlService.getPodLogs(namespace, pod, tail);

    return {
      namespace,
      podName: pod,
      tailLines: tail,
      logs,
    };
  }

  @Get('health')
  async getHealth(
    @Query('namespace') namespace = 'default',
    @Query('pod') pod: string,
    @Query('tail') tail = 10,
  ) {
    if (!pod) {
      throw new BadRequestException('Missing "pod"');
    }

    const logs = await this.kubectlService.getPodLogs(namespace, pod, tail);
    const analysis = await this.lmService.analyzeLogs(logs);

    return {
      namespace,
      podName: pod,
      healthSummary: analysis,
    };
  }

  @Get('security')
  async getSecurity(
    @Query('namespace') namespace = 'default',
    @Query('pod') pod: string,
    @Query('tail') tail = 50,
  ) {
    if (!pod) {
      throw new BadRequestException('Missing "pod"');
    }

    const logs = await this.kubectlService.getPodLogs(namespace, pod, tail);
    const analysis = await this.lstmService.analyzeLogs(logs);

    return {
      namespace,
      podName: pod,
      securityAnalysis: analysis,
    };
  }
  @Get('security/recent')
  async getSecurityRecent(
    @Query('namespace') namespace = 'default',
    @Query('pod') pod: string,
    @Query('minutes') minutes = 2,
    )   {
    if (!pod) {
      throw new BadRequestException('Missing "pod"');
    }

    const logs = await this.kubectlService.getRecentLogs(namespace, pod, minutes);
    const analysis = await this.lstmService.analyzeLogs(logs);

    return {
      namespace,
      podName: pod,
      minutes,
      securityAnalysis: analysis,
    };
  }
}