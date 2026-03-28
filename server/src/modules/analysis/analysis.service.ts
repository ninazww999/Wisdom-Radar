import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalysisService {
  async getTrends(period: string) {
    return {
      period,
      totalNews: 0,
      categoryDistribution: [],
      hotTopics: [],
      insights: [],
      recommendations: []
    };
  }
}
