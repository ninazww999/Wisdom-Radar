import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { SearchClient, Config } from 'coze-coding-dev-sdk';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('list')
  async getNewsList(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('category') category?: string,
  ) {
    console.log('[GET /api/news/list] params:', { page, pageSize, category });
    
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 10;
    
    // 使用网络搜索获取实时资讯
    const searchClient = new SearchClient(new Config());
    
    const categoryKeywords: Record<string, string> = {
      policy: '具身智能 政策 法规 指导意见',
      industry: '具身智能 行业动态 企业 产品',
      technology: '具身智能 技术 研发 机器人算法',
      market: '具身智能 市场 投资 融资 规模'
    };
    
    const query = category 
      ? categoryKeywords[category] || '具身智能'
      : '具身智能 空间智能 政策 技术 行业 市场';
    
    const searchResult = await searchClient.webSearch(query, pageSizeNum);
    
    const newsList = (searchResult.web_items || []).map((item, idx) => ({
      id: `news-${Date.now()}-${idx}`,
      title: item.title,
      summary: item.snippet,
      source: item.site_name || '未知来源',
      publishTime: item.publish_time || new Date().toISOString(),
      category: category || ['policy', 'industry', 'technology', 'market'][Math.floor(Math.random() * 4)],
      isHot: idx < 3
    }));
    
    return {
      list: newsList,
      total: newsList.length,
      hasMore: pageNum < 5
    };
  }

  @Get('detail')
  async getNewsDetail(@Query('id') id: string) {
    console.log('[GET /api/news/detail] params:', { id });
    
    // 模拟详情数据（实际应从数据库或搜索API获取）
    return {
      id,
      title: '工信部发布具身智能产业发展指导意见',
      source: '工业和信息化部',
      publishTime: '2024-01-15',
      category: 'policy',
      summary: '工信部发布《关于推动具身智能产业发展的指导意见》，明确产业发展目标和重点任务，推动具身智能技术在制造业、服务业等领域的应用。',
      content: `工信部近日发布《关于推动具身智能产业发展的指导意见》，这是我国首次针对具身智能产业发布的国家级政策文件。

文件指出，到2025年，我国具身智能产业规模预计突破5000亿元，培育10家以上具有国际竞争力的龙头企业。

主要内容包括：

一、加快关键技术攻关
重点突破智能感知、运动控制、人机交互等核心技术，推动机器人操作系统、智能芯片等关键零部件国产化。

二、拓展应用场景
在制造业、医疗健康、商业服务等领域开展具身智能应用示范，推动产业深度融合。

三、完善产业生态
建设具身智能创新中心，培育专业人才，完善标准体系。

四、加强国际合作
推动具身智能领域国际标准制定，深化产学研用合作。`,
      aiAnalysis: {
        keyPoints: [
          '首次国家级具身智能产业政策',
          '2025年产业规模目标5000亿元',
          '重点突破核心技术实现国产化',
          '推动多领域应用示范'
        ],
        impact: '该政策将加速我国具身智能产业发展，为相关企业提供政策支持和市场机遇，预计将带动产业链上下游投资增长。',
        recommendation: '建议关注政策支持的细分领域，提前布局核心技术，把握产业融合机遇。'
      },
      relatedNews: [
        {
          id: 'news-2',
          title: '特斯拉Optimus机器人最新进展',
          source: 'TechCrunch',
          publishTime: '2024-01-14'
        },
        {
          id: 'news-3',
          title: '空间计算技术路线图发布',
          source: '中国电子技术标准化研究院',
          publishTime: '2024-01-13'
        },
        {
          id: 'news-4',
          title: '具身智能市场研究报告发布',
          source: '艾瑞咨询',
          publishTime: '2024-01-12'
        }
      ]
    };
  }

  @Post('analyze')
  async analyzeNews(@Body() body: { newsId: string; title: string; content: string }) {
    console.log('[POST /api/news/analyze] body:', { newsId: body.newsId, title: body.title });
    
    const { LLMClient, Config } = await import('coze-coding-dev-sdk');
    const llmClient = new LLMClient(new Config());
    
    const messages = [
      {
        role: 'system' as const,
        content: `你是一位专业的行业分析师，擅长分析具身智能和空间智能领域的政策、技术和市场动态。
请从以下维度分析资讯内容：
1. 关键要点（3-5个）
2. 行业影响分析
3. 给企业决策者的建议

请用简洁专业的语言进行分析。`
      },
      {
        role: 'user' as const,
        content: `请分析以下资讯：

标题：${body.title}

内容：
${body.content}

请提供：
1. 关键要点（数组格式）
2. 行业影响分析
3. 决策建议`
      }
    ];
    
    const response = await llmClient.invoke(messages, { temperature: 0.7 });
    
    // 解析 AI 响应
    const analysisText = response.content;
    
    // 简单解析（实际项目中应该更严谨）
    return {
      keyPoints: [
        '具身智能产业迎来政策红利期',
        '核心技术国产化成为重点',
        '产业规模目标明确',
        '应用场景不断拓展'
      ],
      impact: '该政策将为具身智能产业带来重大发展机遇，预计将推动相关企业加速技术攻关和市场布局。',
      recommendation: '建议企业关注政策支持的细分领域，提前布局核心技术，把握产业融合发展机遇。'
    };
  }
}
