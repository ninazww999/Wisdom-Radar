import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { NewsModule } from '@/modules/news/news.module';
import { AnalysisModule } from '@/modules/analysis/analysis.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [NewsModule, AnalysisModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
