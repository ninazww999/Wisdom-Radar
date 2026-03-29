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
    const pageSizeNum = Math.min(parseInt(pageSize, 10) || 10, 10); // 最多10条
    
    // 使用网络搜索获取实时资讯
    const searchClient = new SearchClient(new Config());
    
    const categoryKeywords: Record<string, string> = {
      policy: '具身智能 政策 法规 指导意见 2024 2025',
      industry: '具身智能 行业动态 企业 产品 最新',
      technology: '具身智能 技术 研发 机器人算法 突破',
      market: '具身智能 市场 投资 融资 规模 趋势'
    };
    
    const query = category 
      ? categoryKeywords[category] || '具身智能'
      : '具身智能 空间智能 政策 技术 行业 市场 最新 2024 2025';
    
    // 搜索更多结果以便排序
    const searchResult = await searchClient.webSearch(query, 20);
    
    // 处理并排序资讯列表
    let newsList = (searchResult.web_items || [])
      .map((item, idx) => {
        // 解析发布时间
        let publishDate = new Date();
        if (item.publish_time) {
          const parsed = new Date(item.publish_time);
          if (!isNaN(parsed.getTime())) {
            publishDate = parsed;
          }
        }
        
        return {
          id: `news-${Date.now()}-${idx}`,
          title: item.title,
          summary: item.snippet,
          source: item.site_name || '未知来源',
          publishTime: publishDate.toISOString().split('T')[0],
          publishTimestamp: publishDate.getTime(), // 用于排序
          category: category || this.detectCategory(item.title + ' ' + item.snippet),
          isHot: false
        };
      })
      // 按时间降序排列（最近的在前）
      .sort((a, b) => b.publishTimestamp - a.publishTimestamp)
      // 每个分类只保留10条
      .slice(0, pageSizeNum);
    
    // 标记前3条为热门（最新的）
    newsList = newsList.map((item, idx) => ({
      ...item,
      isHot: idx < 3
    }));
    
    console.log('[News List] Sorted by date, newest first:', newsList.map(n => ({ title: n.title, date: n.publishTime })));
    
    return {
      list: newsList,
      total: newsList.length,
      hasMore: false // 每个分类最多10条
    };
  }

  // 根据内容自动检测分类
  private detectCategory(content: string): string {
    const policyKeywords = ['政策', '法规', '意见', '通知', '规划', '工信部', '发改委', '政府'];
    const industryKeywords = ['企业', '公司', '产品', '发布', '合作', '签约', '落地'];
    const technologyKeywords = ['技术', '算法', '研发', '突破', '专利', '创新', '芯片', '传感器'];
    const marketKeywords = ['市场', '投资', '融资', '规模', '增长', '预测', '报告'];
    
    if (policyKeywords.some(k => content.includes(k))) return 'policy';
    if (technologyKeywords.some(k => content.includes(k))) return 'technology';
    if (marketKeywords.some(k => content.includes(k))) return 'market';
    if (industryKeywords.some(k => content.includes(k))) return 'industry';
    
    return 'industry'; // 默认行业
  }

  @Get('detail')
  async getNewsDetail(
    @Query('id') id: string,
    @Query('title') title?: string,
    @Query('summary') summary?: string,
    @Query('category') category?: string,
  ) {
    console.log('[GET /api/news/detail] params:', { id, title, summary, category });
    
    // 如果有标题，使用 LLM 生成详细内容
    if (title) {
      try {
        const llmClient = new LLMClient(new Config());
        
        // 根据分类生成不同的内容
        const systemPrompt = this.getSystemPrompt(category || 'policy');
        
        const messages = [
          {
            role: 'system' as const,
            content: systemPrompt
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
          category: category || 'policy',
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
      category: category || 'policy',
      summary: summary || '暂无摘要',
      content: summary || '暂无详细内容',
      relatedNews: []
    };
  }

  // 根据分类获取不同的系统提示词
  private getSystemPrompt(category: string): string {
    const basePrompt = `你是一位专业的具身智能和空间智能领域分析师，服务于八维通科技有限公司。
请根据提供的资讯标题和摘要，生成详细的内容分析。

输出格式要求：
1. 内容：详细解读该资讯，包含背景、主要内容和分析（200-300字）
2. 不要使用 Markdown 格式，直接输出纯文本
3. 语言要专业、客观`;

    if (category === 'policy') {
      return `${basePrompt}

特别要求：必须在分析中包含"对八维通科技有限公司的影响"部分，分析该政策对公司发展的机遇、挑战和应对建议。`;
    } else {
      return `${basePrompt}

特别要求：必须在分析中包含"对八维通的启发"部分，分析该资讯对八维通科技有限公司在技术创新、产品研发、市场拓展等方面的启发和参考价值。`;
    }
  }

  private async getRelatedNews(currentTitle: string): Promise<Array<{ id: string; title: string; source: string; publishTime: string }>> {
    try {
      const searchClient = new SearchClient(new Config());
      const searchResult = await searchClient.webSearch('具身智能 最新动态 2024', 5);
      
      const now = Date.now();
      return (searchResult.web_items || [])
        .filter(item => item.title !== currentTitle)
        .slice(0, 3)
        .map((item, idx) => {
          let publishDate = new Date().toISOString().split('T')[0];
          if (item.publish_time) {
            const parsed = new Date(item.publish_time);
            if (!isNaN(parsed.getTime())) {
              publishDate = parsed.toISOString().split('T')[0];
            }
          }
          return {
            id: `related-${now}-${idx}`,
            title: item.title,
            source: item.site_name || '未知来源',
            publishTime: publishDate
          };
        });
    } catch (error) {
      console.error('Get related news error:', error);
      return [];
    }
  }

  @Post('analyze')
  async analyzeNews(@Body() body: { newsId: string; title: string; content: string; category?: string }) {
    console.log('[POST /api/news/analyze] body:', { newsId: body.newsId, title: body.title, category: body.category });
    
    try {
      const llmClient = new LLMClient(new Config());
      
      // 根据分类使用不同的分析模板
      const systemPrompt = this.getAnalysisPrompt(body.category || 'policy');
      
      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt
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
      const category = body.category || 'policy';
      return this.getDefaultAnalysis(category);
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.getDefaultAnalysis(body.category || 'policy');
    }
  }

  // 获取分析提示词
  private getAnalysisPrompt(category: string): string {
    const basePrompt = `你是一位专业的行业分析师，擅长分析具身智能和空间智能领域的政策、技术和市场动态，服务于八维通科技有限公司。
请从以下维度分析资讯内容：
1. 关键要点（3-5个，数组格式）
2. 行业影响分析
3. 企业决策建议

请用简洁专业的语言进行分析，输出 JSON 格式：`;

    if (category === 'policy') {
      return `${basePrompt}
{
  "keyPoints": ["要点1", "要点2", "要点3"],
  "impact": "行业影响分析内容",
  "bawitonImpact": "对八维通科技有限公司的具体影响分析，包括机遇、挑战和应对策略",
  "recommendation": "给八维通科技有限公司的决策建议"
}`;
    } else {
      return `${basePrompt}
{
  "keyPoints": ["要点1", "要点2", "要点3"],
  "impact": "行业影响分析内容",
  "bawitonInspiration": "对八维通的启发，包括技术、产品、市场等方面的参考价值",
  "recommendation": "给八维通科技有限公司的决策建议"
}`;
    }
  }

  // 获取默认分析结果
  private getDefaultAnalysis(category: string) {
    if (category === 'policy') {
      return {
        keyPoints: [
          '政策导向明确，行业发展迎来新机遇',
          '技术创新成为核心驱动力',
          '产业融合发展趋势显著'
        ],
        impact: '该政策将推动具身智能产业快速发展，为企业提供政策支持和市场机遇。',
        bawitonImpact: '八维通科技有限公司应抓住政策红利，加大研发投入，积极参与行业标准制定，提升核心竞争力。',
        recommendation: '建议八维通密切关注政策动态，提前布局关键技术，加强与产业链上下游的合作。'
      };
    } else {
      return {
        keyPoints: [
          '行业动态值得关注',
          '技术发展持续演进',
          '市场机遇逐步显现'
        ],
        impact: '该资讯反映了具身智能领域的最新发展动态，值得关注后续进展。',
        bawitonInspiration: '八维通可从中获得技术路线、产品创新和市场拓展方面的启发，结合自身优势寻找差异化竞争策略。',
        recommendation: '建议八维通持续关注相关领域的动态，积极探索技术创新和商业模式创新。'
      };
    }
  }
}
