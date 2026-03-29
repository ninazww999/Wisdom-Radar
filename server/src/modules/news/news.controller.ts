import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { SearchClient, Config, LLMClient } from 'coze-coding-dev-sdk';

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
      publishTime: item.publish_time || new Date().toISOString().split('T')[0],
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
  async getNewsDetail(
    @Query('id') id: string,
    @Query('title') title?: string,
    @Query('summary') summary?: string,
  ) {
    console.log('[GET /api/news/detail] params:', { id, title, summary });
    
    // 如果有标题，使用 LLM 生成详细内容
    if (title) {
      try {
        const llmClient = new LLMClient(new Config());
        
        const messages = [
          {
            role: 'system' as const,
            content: `你是一位专业的具身智能和空间智能领域分析师。请根据提供的资讯标题和摘要，生成详细的内容分析。

输出格式要求：
1. 内容：详细解读该资讯，包含背景、主要内容和影响分析（200-300字）
2. 不要使用 Markdown 格式，直接输出纯文本
3. 语言要专业、客观`
          },
          {
            role: 'user' as const,
            content: `标题：${title}
摘要：${summary || '暂无摘要'}

请生成详细内容分析：`
          }
        ];
        
        const response = await llmClient.invoke(messages, { temperature: 0.7 });
        
        const relatedNews = await this.getRelatedNews(title);
        
        return {
          id,
          title,
          source: '行业资讯',
          publishTime: new Date().toISOString().split('T')[0],
          category: 'policy',
          summary: summary || '',
          content: response.content,
          relatedNews
        };
      } catch (error) {
        console.error('LLM invoke error:', error);
      }
    }
    
    // 默认返回（兜底）
    return {
      id,
      title: title || '资讯详情',
      source: '行业资讯',
      publishTime: new Date().toISOString().split('T')[0],
      category: 'policy',
      summary: summary || '暂无摘要',
      content: summary || '暂无详细内容',
      relatedNews: []
    };
  }

  private async getRelatedNews(currentTitle: string): Promise<Array<{ id: string; title: string; source: string; publishTime: string }>> {
    try {
      const searchClient = new SearchClient(new Config());
      const searchResult = await searchClient.webSearch('具身智能 最新动态', 3);
      
      return (searchResult.web_items || [])
        .filter(item => item.title !== currentTitle)
        .slice(0, 3)
        .map((item, idx) => ({
          id: `related-${Date.now()}-${idx}`,
          title: item.title,
          source: item.site_name || '未知来源',
          publishTime: item.publish_time || new Date().toISOString().split('T')[0]
        }));
    } catch (error) {
      console.error('Get related news error:', error);
      return [];
    }
  }

  @Post('analyze')
  async analyzeNews(@Body() body: { newsId: string; title: string; content: string }) {
    console.log('[POST /api/news/analyze] body:', { newsId: body.newsId, title: body.title });
    
    try {
      const llmClient = new LLMClient(new Config());
      
      const messages = [
        {
          role: 'system' as const,
          content: `你是一位专业的行业分析师，擅长分析具身智能和空间智能领域的政策、技术和市场动态。
请从以下维度分析资讯内容：
1. 关键要点（3-5个，数组格式）
2. 行业影响分析
3. 给企业决策者的建议

请用简洁专业的语言进行分析，输出 JSON 格式：
{
  "keyPoints": ["要点1", "要点2", "要点3"],
  "impact": "影响分析内容",
  "recommendation": "决策建议内容"
}`
        },
        {
          role: 'user' as const,
          content: `请分析以下资讯：

标题：${body.title}

内容：
${body.content}

请提供 JSON 格式的分析结果：`
        }
      ];
      
      const response = await llmClient.invoke(messages, { temperature: 0.7 });
      
      // 尝试解析 JSON
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }
      
      // 解析失败，返回默认结构
      return {
        keyPoints: [
          '行业动态值得关注',
          '技术发展持续演进',
          '市场机遇逐步显现'
        ],
        impact: '该资讯反映了具身智能领域的最新发展动态，值得关注后续进展。',
        recommendation: '建议持续关注相关领域的政策变化和技术突破。'
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        keyPoints: ['分析生成失败，请稍后重试'],
        impact: '暂时无法生成影响分析',
        recommendation: '请稍后重试'
      };
    }
  }
}
