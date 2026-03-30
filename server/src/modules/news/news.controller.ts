import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { SearchClient, Config, LLMClient } from 'coze-coding-dev-sdk';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishTime: string;
  publishTimestamp: number;
  url: string;
  section: 'hot' | 'policy' | 'market';
  coreContent?: string;
  bawitonAnalysis?: string;
  impact?: 'positive' | 'negative' | 'neutral';
  recommendation?: string;
}

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('list')
  async getNewsList() {
    console.log('[GET /api/news/list] Fetching news...');
    
    const searchClient = new SearchClient(new Config());
    const llmClient = new LLMClient(new Config());
    
    // 三个维度的搜索关键词 - 强制包含具身智能/空间智能核心词
    const searchQueries = {
      hot: [
        '具身智能 最新突破 发布 2025',
        '人形机器人 产品发布 最新动态',
        '空间智能 数字孪生 最新应用',
      ],
      policy: [
        '具身智能 国家政策 法规 2025',
        '人形机器人 产业政策 指导意见',
        '人工智能 空间智能 政策支持',
      ],
      market: [
        '具身智能 市场融资 投资 2025',
        '人形机器人 商业化落地 应用',
        '空间智能 智慧城市 项目落地',
      ],
    };
    
    // 并行搜索三个维度
    const [hotResults, policyResults, marketResults] = await Promise.all([
      this.searchAndProcess(searchClient, searchQueries.hot, 'hot'),
      this.searchAndProcess(searchClient, searchQueries.policy, 'policy'),
      this.searchAndProcess(searchClient, searchQueries.market, 'market'),
    ]);
    
    console.log(`[Search Results] Hot: ${hotResults.length}, Policy: ${policyResults.length}, Market: ${marketResults.length}`);
    
    // 为每个维度生成分析（每个维度取前3条）
    const hotNews = await this.generateAnalysis(llmClient, hotResults.slice(0, 3), 'hot');
    const policyNews = await this.generateAnalysis(llmClient, policyResults.slice(0, 3), 'policy');
    const marketNews = await this.generateAnalysis(llmClient, marketResults.slice(0, 3), 'market');
    
    return {
      hot: hotNews,
      policy: policyNews,
      market: marketNews,
    };
  }
  
  // 搜索并处理资讯
  private async searchAndProcess(
    searchClient: SearchClient,
    queries: string[],
    section: string
  ): Promise<NewsItem[]> {
    const searchPromises = queries.map(query =>
      searchClient.webSearch(query, 10).catch(err => {
        console.error('Search error:', err);
        return { web_items: [] };
      })
    );
    
    const results = await Promise.all(searchPromises);
    const allItems = results.flatMap(r => r.web_items || []);
    
    // 去重
    const seenTitles = new Set<string>();
    const uniqueItems = allItems.filter(item => {
      if (!item.title) return false;
      const normalized = item.title.trim().toLowerCase();
      if (seenTitles.has(normalized)) return false;
      seenTitles.add(normalized);
      return true;
    });
    
    // 过滤相关性和质量
    const filteredItems = uniqueItems.filter(item =>
      this.isRelevantContent(item.title, item.snippet || '', item.site_name || '') &&
      !this.isLowQuality(item.title, item.snippet || '', item.site_name || '')
    );
    
    // 转换为NewsItem
    return filteredItems.slice(0, 5).map((item, idx) => {
      let publishDate = new Date();
      if (item.publish_time) {
        const parsed = new Date(item.publish_time);
        if (!isNaN(parsed.getTime())) publishDate = parsed;
      }
      
      return {
        id: `news-${section}-${Date.now()}-${idx}`,
        title: this.cleanTitle(item.title || ''),
        summary: this.cleanSummary(item.snippet || ''),
        source: this.truncateSource(item.site_name || '行业资讯', 10),
        url: item.url || '',
        publishTime: publishDate.toISOString().split('T')[0],
        publishTimestamp: publishDate.getTime(),
        section: section as 'hot' | 'policy' | 'market',
      };
    });
  }
  
  // 为资讯生成分析
  private async generateAnalysis(
    llmClient: LLMClient,
    newsList: NewsItem[],
    section: 'hot' | 'policy' | 'market'
  ): Promise<NewsItem[]> {
    if (newsList.length === 0) return [];
    
    const analysisPromises = newsList.map(news =>
      this.analyzeSingleNews(llmClient, news, section)
    );
    
    const results = await Promise.all(analysisPromises);
    
    return newsList.map((news, idx) => ({
      ...news,
      ...results[idx],
    }));
  }
  
  // 分析单条资讯
  private async analyzeSingleNews(
    llmClient: LLMClient,
    news: NewsItem,
    section: 'hot' | 'policy' | 'market'
  ): Promise<Partial<NewsItem>> {
    const prompts = {
      hot: `你是八维通科技有限公司的首席战略官。八维通是卓越的空间智能服务商，核心业务包括城市数据资产底座、数字孪生、模拟仿真推演、智慧轨交（覆盖40+城市）。

分析以下具身智能/空间智能热点资讯，从战略高度输出思考：

标题：${news.title}
摘要：${news.summary}

输出JSON格式：
{
  "coreContent": "核心内容提炼（30-50字，说明事件本身）",
  "bawitonAnalysis": "战略启示（40-60字，对空间智能和具身智能下一步战略方向的深度思考，包括技术路线、市场机会、竞争态势等）"
}`,
      policy: `你是八维通科技有限公司的首席战略官。八维通是卓越的空间智能服务商，核心业务包括城市数据资产底座、数字孪生、模拟仿真推演、智慧轨交（覆盖40+城市）。

分析以下具身智能/空间智能政策资讯，从战略高度输出影响：

标题：${news.title}
摘要：${news.summary}

输出JSON格式：
{
  "coreContent": "核心内容提炼（30-50字，说明政策要点）",
  "impact": "positive/negative/neutral",
  "bawitonAnalysis": "战略影响（40-60字，对八维通战略方向的影响，包括政策红利、合规要求、行业格局变化等）"
}`,
      market: `你是八维通科技有限公司的首席战略官。八维通是卓越的空间智能服务商，核心业务包括城市数据资产底座、数字孪生、模拟仿真推演、智慧轨交（覆盖40+城市）。

分析以下具身智能/空间智能市场资讯，从战略高度输出建议：

标题：${news.title}
摘要：${news.summary}

输出JSON格式：
{
  "coreContent": "核心内容提炼（30-50字，说明市场动态）",
  "impact": "positive/negative/neutral",
  "bawitonAnalysis": "战略影响（40-60字，对八维通市场战略的影响）",
  "recommendation": "战略建议（30-50字，从技术布局、市场拓展、合作策略等维度给出具体建议）"
}`,
    };
    
    try {
      const response = await llmClient.invoke([
        { role: 'user', content: prompts[section] }
      ], { temperature: 0.7 });
      
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('[Analyze Error]', error);
    }
    
    // 返回默认值
    return {
      coreContent: news.summary.slice(0, 50),
      bawitonAnalysis: '点击查看详细分析',
      impact: 'neutral',
    };
  }
  
  // 判断是否与具身智能/空间智能相关
  private isRelevantContent(title: string, snippet: string, source: string): boolean {
    const text = (title + ' ' + snippet).toLowerCase();
    
    // 核心关键词
    const coreKeywords = [
      '具身智能', '空间智能', '空间计算', '数字孪生',
      '人形机器人', '仿生机器人', '服务机器人', '智能机器人',
      '多模态', '视觉感知', '运动控制', '灵巧手',
      '特斯拉机器人', '擎天柱', 'Figure', 'Boston Dynamics',
      '优必选', '宇树科技', '智元机器人', '小米机器人',
      '智慧城市', '智慧轨交', '数字城市', '城市大脑',
      '模拟仿真', '参数建模', '几何建模',
    ];
    
    const hasCoreKeyword = coreKeywords.some(k => text.includes(k));
    if (!hasCoreKeyword) return false;
    
    // 黑名单
    const blacklist = [
      '股票', '炒股', '金叉', '死叉', 'K线', '均线',
      '医药股', '医疗股', '概念股',
    ];
    
    return !blacklist.some(k => text.includes(k));
  }
  
  // 判断是否低质量
  private isLowQuality(title: string, snippet: string, source: string): boolean {
    const text = (title + ' ' + snippet).toLowerCase();
    const excludeKeywords = [
      '是什么', '什么是', '概念', '科普', '入门', '基础',
      '百科', '词条', 'wiki', '知乎', '知道', '问答',
    ];
    return excludeKeywords.some(k => text.includes(k)) || title.length < 10;
  }
  
  // 清理标题
  private cleanTitle(title: string): string {
    return title
      .replace(/[→←↑↓↔↕]/g, '')
      .replace(/[【】\[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim() || title;
  }
  
  // 清理摘要
  private cleanSummary(summary: string): string {
    return summary.replace(/^[^\u4e00-\u9fa5a-zA-Z0-9]*[。！？；：，、] */, '').trim();
  }
  
  // 截断来源
  private truncateSource(source: string, maxLen: number): string {
    return source.length > maxLen ? source.slice(0, maxLen) + '...' : source;
  }

  @Get('detail')
  async getNewsDetail(
    @Query('id') id: string,
    @Query('title') title?: string,
    @Query('summary') summary?: string,
    @Query('category') category?: string,
  ) {
    console.log('[GET /api/news/detail] params:', { id, title, summary, category });
    
    if (title) {
      try {
        const llmClient = new LLMClient(new Config());
        
        const searchClient = new SearchClient(new Config());
        const searchResult = await searchClient.webSearch(title, 3);
        const realContent = searchResult.web_items?.[0]?.snippet || '';
        
        const systemPrompt = `你是一位专业的具身智能和空间智能领域分析师。
请根据资讯标题和搜索到的实时信息，生成详细的内容解读（200-300字）。

输出要求：
1. 直接输出内容，不要添加任何标题或前缀
2. 包含背景、主要内容和行业影响分析
3. 专业、客观，不要使用Markdown格式
4. 不要包含标题、来源、时间、作者等元信息
5. 重点关注与空间智能、数字孪生、智慧城市等相关的内容`;
        
        const response = await llmClient.invoke([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `标题：${title}\n\n相关信息：${realContent}` }
        ], { temperature: 0.7 });
        
        const llmContent = response.content || summary || '';
        
        const relatedNews = await this.getRelatedNews(title);
        
        return {
          id,
          title,
          source: '行业资讯',
          publishTime: new Date().toISOString().split('T')[0],
          category: category || 'policy',
          summary: summary || '',
          content: llmContent,
          relatedNews
        };
      } catch (error) {
        console.error('LLM invoke error:', error);
      }
    }
    
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

  private async getRelatedNews(currentTitle: string): Promise<Array<{ id: string; title: string; source: string; publishTime: string }>> {
    try {
      const searchClient = new SearchClient(new Config());
      const searchResult = await searchClient.webSearch('具身智能 人形机器人 最新动态', 5);
      
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
      
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }
      
      const category = body.category || 'policy';
      return this.getDefaultAnalysis(category);
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.getDefaultAnalysis(body.category || 'policy');
    }
  }

  private getAnalysisPrompt(category: string): string {
    const basePrompt = `你是一位专业的行业分析师，服务于八维通科技有限公司。

【八维通公司背景】
八维通是卓越的空间智能服务商，核心业务包括：
- 核心技术：城市数据资产底座、国产化参数几何建模内核、模拟仿真推演、数字孪生
- 业务领域：智慧轨交（覆盖40+城市）、空间智能（覆盖100+城市）
- 应用场景：300+业务场景、3000+数字化项目、150000+累计建模
- 公司定位：人工智能+场景创新联合体重点培育企业，专注城市数字化和空间智能领域

请结合八维通的业务特点，从以下维度分析资讯内容：
1. 关键要点（3-5个，数组格式）
2. 行业影响分析
3. 结合八维通业务的具体建议

请用简洁专业的语言进行分析，输出 JSON 格式：`;

    if (category === 'policy') {
      return `${basePrompt}
{
  "keyPoints": ["要点1", "要点2", "要点3"],
  "impact": "行业影响分析内容",
  "bawitonImpact": "对八维通的具体影响，需结合公司核心业务（空间智能、数字孪生、智慧轨交）分析机遇与挑战",
  "recommendation": "给八维通的决策建议，需具体可执行"
}`;
    } else {
      return `${basePrompt}
{
  "keyPoints": ["要点1", "要点2", "要点3"],
  "impact": "行业影响分析内容",
  "bawitonInspiration": "对八维通的启发，需结合公司核心业务（空间智能、数字孪生、智慧轨交）分析技术、产品、市场机会",
  "recommendation": "给八维通的决策建议，需具体可执行"
}`;
    }
  }

  private getDefaultAnalysis(category: string) {
    if (category === 'policy') {
      return {
        keyPoints: [
          '政策导向明确，行业发展迎来新机遇',
          '技术创新成为核心驱动力',
          '产业融合发展趋势显著'
        ],
        impact: '该政策将推动具身智能和空间智能产业快速发展，为企业提供政策支持和市场机遇。',
        bawitonImpact: '八维通应抓住政策红利，发挥空间智能和数字孪生技术优势，深化智慧轨交和城市数字化领域的应用，积极参与行业标准制定。',
        recommendation: '建议密切关注政策动态，提前布局关键技术，加强与产业链上下游合作，拓展更多城市数字化应用场景。'
      };
    } else {
      return {
        keyPoints: [
          '行业动态值得关注',
          '技术发展持续演进',
          '市场机遇逐步显现'
        ],
        impact: '该资讯反映了具身智能和空间智能领域的最新发展动态，值得关注后续进展。',
        bawitonInspiration: '八维通可从中获得启发，结合自身在空间智能、数字孪生、模拟仿真方面的技术积累，探索新的应用场景和商业模式。',
        recommendation: '建议持续关注相关领域动态，积极探索技术创新和场景落地机会，发挥城市数据资产底座优势。'
      };
    }
  }
}
