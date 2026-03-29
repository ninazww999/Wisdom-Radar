import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { SearchClient, Config, LLMClient } from 'coze-coding-dev-sdk';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('stats')
  async getStats() {
    console.log('[GET /api/news/stats]');
    
    const searchClient = new SearchClient(new Config());
    
    // 获取不同分类的资讯数量
    const categories = ['policy', 'industry', 'technology', 'market'];
    const categoryCounts: Record<string, number> = {};
    
    for (const cat of categories) {
      const keywords = {
        policy: '具身智能 政策 法规 最新',
        industry: '具身智能 行业 企业 最新',
        technology: '具身智能 技术 研发 最新',
        market: '具身智能 市场 投资 最新'
      };
      
      const result = await searchClient.webSearch(keywords[cat], 10);
      categoryCounts[cat] = (result.web_items || []).length;
    }
    
    // 获取热门话题
    const hotResult = await searchClient.webSearch('具身智能 人形机器人 最新热点', 20);
    const topics: Record<string, number> = {};
    
    (hotResult.web_items || []).forEach(item => {
      const title = item.title || '';
      // 提取关键词
      const keywords = ['人形机器人', '具身智能', '空间计算', '多模态', '机器人', 'AI', '大模型', '智能制造', '自动驾驶', '数字孪生'];
      keywords.forEach(kw => {
        if (title.includes(kw)) {
          topics[kw] = (topics[kw] || 0) + 1;
        }
      });
    });
    
    const hotTopics = Object.entries(topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([topic, count]) => ({ topic, count }));
    
    // 生成趋势数据（模拟最近7天）
    const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const weeklyTrend = weekDays.map((day) => ({
      day,
      count: Math.floor(Math.random() * 30) + 20
    }));
    
    // 计算总数和百分比
    const total = Object.values(categoryCounts).reduce((a: number, b: number) => a + b, 0);
    const categoryStats = categories.map(cat => ({
      category: { policy: '政策', industry: '行业', technology: '技术', market: '市场' }[cat],
      count: categoryCounts[cat],
      percentage: total > 0 ? Math.round((categoryCounts[cat] as number / total) * 100) : 0
    }));
    
    return {
      totalNews: total,
      hotTopics,
      categoryStats,
      weeklyTrend
    };
  }

  @Get('list')
  async getNewsList(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('category') category?: string,
  ) {
    console.log('[GET /api/news/list] params:', { page, pageSize, category });
    
    const pageSizeNum = Math.min(parseInt(pageSize, 10) || 10, 20);
    
    const searchClient = new SearchClient(new Config());
    
    // 实时抓取全网最新最热门资讯 - 多维度搜索
    const searchQueries = this.getSearchQueries(category);
    
    console.log('[Search Queries]', searchQueries);
    
    // 并行执行多个搜索，获取更全面的资讯
    const searchPromises = searchQueries.map(query => 
      searchClient.webSearch(query, 15).catch(err => {
        console.error('Search error:', err);
        return { web_items: [] };
      })
    );
    
    const searchResults = await Promise.all(searchPromises);
    
    // 合并所有搜索结果
    const allItems = searchResults.flatMap(result => result.web_items || []);
    
    console.log(`[Search Results] Total items: ${allItems.length}`);
    
    // 去重（按标题）
    const seenTitles = new Set<string>();
    const uniqueItems = allItems.filter(item => {
      if (!item.title) return false;
      const normalizedTitle = item.title.trim().toLowerCase();
      if (seenTitles.has(normalizedTitle)) return false;
      seenTitles.add(normalizedTitle);
      return true;
    });
    
    console.log(`[After Dedup] Unique items: ${uniqueItems.length}`);
    
    // 过滤低质量内容和不相关内容
    const filteredItems = uniqueItems.filter(item => {
      // 先过滤低质量内容
      if (this.isLowQuality(item.title, item.snippet || '', item.site_name || '')) {
        return false;
      }
      // 再过滤不相关内容
      if (!this.isRelevantContent(item.title, item.snippet || '', item.site_name || '')) {
        return false;
      }
      return true;
    });
    
    console.log(`[After Filter] Quality items: ${filteredItems.length}`);
    
    // 处理并排序资讯列表
    const newsList = filteredItems
      .map((item, idx) => {
        // 解析发布时间
        let publishDate = new Date();
        if (item.publish_time) {
          const parsed = new Date(item.publish_time);
          if (!isNaN(parsed.getTime())) {
            publishDate = parsed;
          }
        }
        
        // 优化摘要
        const summary = this.cleanSummary(item.snippet || '');
        
        // 清理标题：去除特殊字符和箭头等
        const title = this.cleanTitle(item.title || '');
        
        // 截断来源名称，最多显示10个字
        const source = this.truncateSource(item.site_name || '行业资讯', 10);
        
        // 原文链接
        const url = item.url || '';
        
        return {
          id: `news-${Date.now()}-${idx}`,
          title,
          summary,
          source,
          url,
          publishTime: publishDate.toISOString().split('T')[0],
          publishTimestamp: publishDate.getTime(),
          category: category || this.detectCategory(item.title + ' ' + item.snippet),
          isHot: false
        };
      })
      // 按时间降序排列（最新的在前）
      .sort((a, b) => b.publishTimestamp - a.publishTimestamp)
      .slice(0, pageSizeNum);
    
    // 标记前3条为热门
    newsList.forEach((item, idx) => {
      item.isHot = idx < 3;
    });
    
    // 为热点资讯生成八维通洞察（前3条）
    const hotNews = newsList.filter(item => item.isHot);
    console.log('[News List] Generating insights for', hotNews.length, 'hot news...');
    
    try {
      const llmClient = new LLMClient(new Config());
      
      // 并行生成洞察
      const insightPromises = hotNews.map(news => 
        this.generateHotNewsInsight(llmClient, news.title, news.summary, news.category)
      );
      
      const insights = await Promise.all(insightPromises);
      
      // 将洞察添加到热点资讯
      hotNews.forEach((news, idx) => {
        if (insights[idx]) {
          (news as any).bawitonInsight = insights[idx];
        }
      });
      
      console.log('[News List] Generated insights for hot news');
    } catch (error) {
      console.error('[News List] Failed to generate insights:', error);
      // 即使洞察生成失败，也返回资讯列表
    }
    
    console.log('[News List] Top items:', newsList.slice(0, 3).map(n => ({ 
      title: n.title.slice(0, 30), 
      date: n.publishTime,
      source: n.source,
      hasInsight: !!(n as any).bawitonInsight
    })));
    
    return {
      list: newsList,
      total: newsList.length,
      hasMore: false
    };
  }

  // 为热点资讯生成简要洞察
  private async generateHotNewsInsight(
    llmClient: LLMClient, 
    title: string, 
    summary: string,
    category: string
  ): Promise<string> {
    try {
      const prompt = `你是八维通科技有限公司的行业分析师。八维通是卓越的空间智能服务商，核心业务包括城市数据资产底座、数字孪生、模拟仿真推演、智慧轨交（覆盖40+城市）。

请分析以下具身智能/空间智能领域资讯，用1句话总结核心内容，再用1句话说明对八维通的启发。

资讯标题：${title}
资讯摘要：${summary}

输出格式（JSON）：
{"core": "核心内容1句话", "insight": "对八维通的启发1句话"}`;

      const response = await llmClient.invoke([
        { role: 'user', content: prompt }
      ], { temperature: 0.7 });

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return `${result.core} | 启发：${result.insight}`;
      }
      
      return '';
    } catch (error) {
      console.error('[Generate Insight] Error:', error);
      return '';
    }
  }

  // 获取搜索关键词组合 - 确保获取最新最热的资讯
  private getSearchQueries(category?: string): string[] {
    // 当前日期，用于获取最新资讯
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // 基础搜索词 - 确保获取最新资讯，强制包含核心关键词
    const baseQueries = [
      // 热点新闻（强制包含"具身智能"或"人形机器人"）
      '具身智能 最新新闻 今日热点 2025',
      '人形机器人 最新动态 行业热点 2025',
      '空间智能 数字孪生 最新进展 2025',
      // 技术突破
      '具身智能 技术突破 最新发布',
      '人形机器人 产品发布 商业化落地',
      // 企业动态
      '特斯拉机器人 擎天柱 最新消息',
      '优必选 宇树科技 智元机器人 最新动态',
    ];
    
    // 分类搜索词 - 强制包含核心关键词
    const categoryQueries: Record<string, string[]> = {
      policy: [
        '具身智能 国家政策 法规 2025',
        '人形机器人 产业政策 指导意见',
        '人工智能 机器人 政策支持 最新',
      ],
      industry: [
        '具身智能 企业动态 产品发布',
        '人形机器人 公司融资 商业化进展',
        '机器人 智能制造 行业应用',
      ],
      technology: [
        '具身智能 技术突破 研发进展',
        '人形机器人 核心技术 专利创新',
        '空间计算 数字孪生 多模态技术',
      ],
      market: [
        '具身智能 市场趋势 投资融资',
        '人形机器人 市场规模 行业报告',
        '机器人 产业链 投资机会',
      ],
    };
    
    if (category && categoryQueries[category]) {
      return categoryQueries[category];
    }
    
    return baseQueries;
  }

  // 判断是否为低质量内容
  private isLowQuality(title: string, snippet: string, source: string): boolean {
    const text = (title + ' ' + snippet).toLowerCase();
    const sourceLower = source.toLowerCase();
    
    // 排除科普类、百科类、问答类
    const excludeKeywords = [
      '是什么', '什么是', '概念', '科普', '入门', '基础', '简介',
      '百科', '词条', 'wiki', 'baike', '知乎', '知道', '问答',
      '教程', '指南', '一文读懂', '全面了解', '小白', '初学者'
    ];
    
    if (excludeKeywords.some(k => text.includes(k) || sourceLower.includes(k))) {
      return true;
    }
    
    // 排除标题太短的
    if (title.length < 10) {
      return true;
    }
    
    return false;
  }

  // 判断内容是否与具身智能、空间智能相关
  private isRelevantContent(title: string, snippet: string, source: string): boolean {
    const text = (title + ' ' + snippet).toLowerCase();
    const sourceLower = source.toLowerCase();
    
    // 核心关键词：必须包含至少一个
    const coreKeywords = [
      '具身智能', '空间智能', '空间计算', '数字孪生',
      '人形机器人', '仿生机器人', '服务机器人', '智能机器人',
      '多模态', '视觉感知', '运动控制', '灵巧手',
      '特斯拉机器人', '擎天柱', 'Figure', 'Boston Dynamics',
      '优必选', '宇树科技', '智元机器人', '小米机器人',
      '大模型', 'AI模型', '人工智能', '机器学习',
      '智能制造', '智慧城市', '智慧轨交', '自动驾驶'
    ];
    
    // 检查是否包含核心关键词
    const hasCoreKeyword = coreKeywords.some(k => text.includes(k));
    if (!hasCoreKeyword) {
      console.log(`[过滤-不相关] ${title.slice(0, 30)}...`);
      return false;
    }
    
    // 黑名单关键词：包含则直接排除
    const blacklistKeywords = [
      // 金融股票类
      '股票', '炒股', '股民', 'A股', '港股', '美股', '涨停', '跌停',
      '金叉', '死叉', 'K线', '均线', 'MACD', 'KDJ', 'VOL',
      '技术分析', '走势分析', '行情分析', '盘面分析',
      '医药股', '医疗股', '概念股', '龙头股',
      // 医疗健康类（排除医疗资讯，但保留医疗机器人相关）
      '仟源医药', '恒瑞医药', '药明康德', '片仔癀',
      '临床实验', '药物研发', '新药审批',
      // 财经类（排除纯财经资讯）
      '理财', '基金', '期货', '外汇', '债券',
      '投资攻略', '财富管理', '资产配置',
      // 娱乐八卦类
      '明星', '八卦', '绯闻', '综艺', '电视剧',
      // 其他不相关
      '招聘', '求职', '简历', '面试技巧',
      '美食', '旅游', '房产', '汽车评测'
    ];
    
    // 检查是否包含黑名单关键词
    const hasBlacklistKeyword = blacklistKeywords.some(k => text.includes(k) || sourceLower.includes(k));
    if (hasBlacklistKeyword) {
      console.log(`[过滤-黑名单] ${title.slice(0, 30)}...`);
      return false;
    }
    
    return true;
  }

  // 清理摘要
  private cleanSummary(summary: string): string {
    if (!summary) return '';
    
    // 去除开头的残缺句子
    let cleaned = summary.replace(/^[^\u4e00-\u9fa5a-zA-Z0-9]*[。！？；：，、] */, '');
    cleaned = cleaned.replace(/^[\u4e00-\u9fa5]{1,2}[。！？；：，、] */, '');
    cleaned = cleaned.replace(/^[a-z]+\s+/, '');
    
    return cleaned.length < 10 ? summary : cleaned;
  }

  // 清理标题：去除特殊字符、箭头等
  private cleanTitle(title: string): string {
    if (!title) return '';
    
    // 去除常见的特殊字符和符号
    let cleaned = title
      .replace(/[→←↑↓↔↕↖↗↘↙]/g, '') // 去除箭头
      .replace(/[│┃┄┅┆┇┈┉┊┋]/g, '') // 去除竖线
      .replace(/[【】\[\]]/g, '') // 去除中括号
      .replace(/[…]{2,}/g, '') // 去除省略号
      .replace(/\s+/g, ' ') // 合并多余空格
      .trim();
    
    // 如果清理后为空，返回原标题
    return cleaned || title;
  }

  // 截断来源名称
  private truncateSource(source: string, maxLen: number): string {
    if (!source) return '行业资讯';
    
    // 如果来源太长，截断并添加省略号
    if (source.length > maxLen) {
      return source.slice(0, maxLen) + '...';
    }
    
    return source;
  }

  // 根据内容自动检测分类
  private detectCategory(content: string): string {
    const policyKeywords = ['政策', '法规', '意见', '通知', '规划', '工信部', '发改委', '政府', '国务院'];
    const industryKeywords = ['企业', '公司', '产品', '发布', '合作', '签约', '落地', '商业化'];
    const technologyKeywords = ['技术', '算法', '研发', '突破', '专利', '创新', '芯片', '传感器', '模型'];
    const marketKeywords = ['市场', '投资', '融资', '规模', '增长', '预测', '报告', '赛道'];
    
    if (policyKeywords.some(k => content.includes(k))) return 'policy';
    if (technologyKeywords.some(k => content.includes(k))) return 'technology';
    if (marketKeywords.some(k => content.includes(k))) return 'market';
    if (industryKeywords.some(k => content.includes(k))) return 'industry';
    
    return 'industry';
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
        
        // 先搜索获取更多实时信息
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
