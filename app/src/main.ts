import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const K8S_PROXY = process.env.K8S_PROXY_URL || 'http://127.0.0.1:8001';
  const NAMESPACE = process.env.NAMESPACE || 'default';
  const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || '120000');

  let podName = 'unknown';

  try {
    const response = await axios.get(
      `${K8S_PROXY}/api/v1/namespaces/${NAMESPACE}/pods`
    );
    podName = response.data.items[0]?.metadata?.name || 'unknown';
    console.log('Detected pod:', podName);
  } catch (err) {
    console.error('Failed to detect pod:', err);
  }

  await app.listen(3000);

  console.log('===============================');
  console.log(' Service is running!');
  console.log('-------------------------------');
  console.log(`Pods:     http://localhost:3000/k8s/pods`);
  console.log(`Logs:     http://localhost:3000/k8s/logs?pod=${podName}`);
  console.log(`Health:   http://localhost:3000/k8s/health?pod=${podName}`);
  console.log(`Security: http://localhost:3000/k8s/security?pod=${podName}`);
  console.log('===============================');

  setInterval(async () => {
    if (podName === 'unknown') return;

    try {
      const health = await axios.get(
        `http://localhost:3000/k8s/health?namespace=${NAMESPACE}&pod=${podName}`
      );
      console.log('[Health]', new Date().toISOString(), health.data.healthSummary);

      const security = await axios.get(
        `http://localhost:3000/k8s/security/recent?namespace=${NAMESPACE}&pod=${podName}&minutes=2`
      );
      console.log('[Security]', new Date().toISOString(), security.data.securityAnalysis);

    } catch (err: any) {
      console.error('[Periodic check] Failed:', err?.message);
    }
  }, INTERVAL_MS);
}

bootstrap();