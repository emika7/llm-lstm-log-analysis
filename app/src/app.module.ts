import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KubectlController } from './kubectl.controller';
import { KubectlService } from './kubectl.service';
import { LmService } from './lm.service';
import { LstmService } from './lstm.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, KubectlController],
  providers: [AppService, LmService, KubectlService, LstmService],
})
export class AppModule {}