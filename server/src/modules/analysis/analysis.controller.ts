import { Controller, Get, Query } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('trends')
  async getTrends(@Query('period') period: string = 'week') {
    console.log('[GET /api/analysis/trends] params:', { period });
    
    // 根据时间周期返回不同的趋势数据
    const periodLabels = {
      week: '本周',
      month: '本月',
      quarter: '本季度'
    };
    
    return {
      period: periodLabels[period] || '本周',
      totalNews: 128,
      categoryDistribution: [
        { category: '政策动态', count: 32, trend: 'up', percentage: 15 },
        { category: '行业动态', count: 45, trend: 'up', percentage: 23 },
        { category: '技术进展', count: 38, trend: 'stable', percentage: 8 },
        { category: '市场分析', count: 13, trend: 'down', percentage: -5 }
      ],
      hotTopics: [
        { topic: '具身智能政策', heat: 98, trend: 'up' },
        { topic: '人形机器人', heat: 87, trend: 'up' },
        { topic: '空间计算', heat: 76, trend: 'stable' },
        { topic: '特斯拉Optimus', heat: 65, trend: 'down' },
        { topic: '机器人操作系统', heat: 54, trend: 'up' }
      ],
      insights: [
        '政策支持力度加大，产业迎来黄金发展期',
        '技术突破主要集中在感知和控制领域',
        '市场需求从工业向服务业扩展',
        '国际竞争加剧，国产化成为关键'
      ],
      recommendations: [
        '重点关注政策支持的细分领域，提前布局核心技术',
        '加强与高校、科研院所合作，培养专业人才',
        '把握产业融合机遇，拓展应用场景',
        '关注国际市场动态，制定差异化竞争策略'
      ]
    };
  }
}
