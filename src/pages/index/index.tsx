import { View, Text } from '@tarojs/components'
import Taro, { useLoad, useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, Globe, Briefcase } from 'lucide-react-taro'
import { Network } from '@/network'
import './index.css'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  publishTime: string
  url?: string
  section: 'hot' | 'policy' | 'market'
  coreContent?: string
  bawitonAnalysis?: string
  impact?: 'positive' | 'negative' | 'neutral'
  recommendation?: string
}

interface NewsResponse {
  hot: NewsItem[]
  policy: NewsItem[]
  market: NewsItem[]
}

// 每日名言库
const dailyQuotes = [
  { quote: '具身智能是人工智能的下一个重大突破。', author: '李飞飞（斯坦福大学教授）' },
  { quote: '空间智能将改变我们理解和交互世界的方式。', author: '李飞飞（斯坦福大学教授）' },
  { quote: '人工智能的未来在于与物理世界的深度融合。', author: 'Geoffrey Hinton（图灵奖得主）' },
  { quote: '机器人是人工智能的终极载体。', author: 'Rodney Brooks（机器人专家）' },
  { quote: '具身智能将推动机器人从工具进化为伙伴。', author: '行业共识' }
]

const getDailyQuote = () => {
  const today = new Date()
  const index = today.getDate() % dailyQuotes.length
  return dailyQuotes[index]
}

const IndexPage: FC = () => {
  const [newsData, setNewsData] = useState<NewsResponse>({ hot: [], policy: [], market: [] })
  const [loading, setLoading] = useState(true)
  const [dailyQuote] = useState(getDailyQuote)
  
  // 记录上次刷新日期
  const lastRefreshDateRef = { current: '' }
  let hasCheckedToday = false

  useLoad(() => {
    console.log('Index page loaded.')
  })

  const getTodayDateStr = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }

  // 只在每天首次加载时获取数据
  useDidShow(() => {
    const today = getTodayDateStr()
    
    // 如果今天还没刷新过，则获取数据
    if (lastRefreshDateRef.current !== today && !hasCheckedToday) {
      console.log('[useDidShow] First visit today, fetching news...')
      fetchNews()
      lastRefreshDateRef.current = today
      hasCheckedToday = true
    } else {
      console.log('[useDidShow] Already checked today, skip refresh')
      setLoading(false)
    }
  })

  useShareAppMessage(() => ({
    title: '智界雷达 - 具身智能与空间智能专业资讯',
    path: '/pages/index/index',
    imageUrl: '/assets/share-cover.png'
  }))

  useShareTimeline(() => ({
    title: '智界雷达 - 具身智能与空间智能专业资讯',
    query: '',
    imageUrl: '/assets/share-cover.png'
  }))

  const fetchNews = async () => {
    try {
      setLoading(true)
      console.log('[Fetch News] Fetching latest news...')
      
      const response = await Network.request({
        url: '/api/news/list',
        method: 'GET',
      })
      
      console.log('[Fetch News] Response:', response)
      
      // 确保数据格式正确
      const data = response.data as NewsResponse
      if (data && (data.hot?.length > 0 || data.policy?.length > 0 || data.market?.length > 0)) {
        setNewsData({
          hot: data.hot || [],
          policy: data.policy || [],
          market: data.market || []
        })
        lastRefreshDateRef.current = getTodayDateStr()
      } else {
        console.warn('[Fetch News] No data in response:', response)
      }
    } catch (error) {
      console.error('[Fetch News] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewsClick = (news: NewsItem) => {
    Taro.setStorageSync('currentNews', news)
    Taro.navigateTo({
      url: `/pages/detail/index?id=${news.id}`
    })
  }

  const getTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    return `${year}年${month}月${date}日`
  }

  // 渲染资讯卡片 - 内容与启示分行显示，带小标题
  const renderNewsCard = (news: NewsItem, section: 'hot' | 'policy' | 'market') => {
    const sectionStyles = {
      hot: { 
        border: 'border-emerald-500', 
        bg: 'bg-emerald-500/10',
        icon: '💡',
        title: '行业启示'
      },
      policy: { 
        border: 'border-blue-500', 
        bg: 'bg-blue-500/10',
        icon: '📊',
        title: '战略影响'
      },
      market: { 
        border: 'border-purple-500', 
        bg: 'bg-purple-500/10',
        icon: '📈',
        title: '行业启示'
      }
    }
    const style = sectionStyles[section]
    
    return (
      <View 
        key={news.id} 
        className="mb-4 bg-neutral-900 rounded-xl overflow-hidden"
        onClick={() => handleNewsClick(news)}
      >
        {/* 标题区域 */}
        <View className="px-4 pt-4 pb-3">
          <Text className="text-white font-bold text-base leading-relaxed block">
            【{news.title}】
          </Text>
          <Text className="text-neutral-500 text-xs block mt-1">
            {news.publishTime} · {news.source}
          </Text>
        </View>
        
        {/* 内容模块 */}
        {news.coreContent && (
          <View className="px-4 pb-4 pt-1">
            <View className="flex items-center gap-2 mb-2">
              <View className="w-1 h-4 bg-neutral-500 rounded-full" />
              <Text className="text-neutral-400 text-sm font-medium">内容</Text>
            </View>
            <Text className="block text-neutral-200 text-sm leading-relaxed">
              {news.coreContent}
            </Text>
          </View>
        )}
        
        {/* 行业启示模块 - 卡片式设计 */}
        {news.bawitonAnalysis && (
          <View className="px-4 pb-4">
            <View className={`${style.bg} rounded-lg p-3 border-l-2 ${style.border}`}>
              <View className="flex items-center gap-2 mb-2">
                <Text className="text-base">{style.icon}</Text>
                <Text className="text-white text-sm font-semibold">{style.title}</Text>
              </View>
              <Text className="block text-neutral-200 text-sm leading-relaxed">
                {news.bawitonAnalysis}
              </Text>
            </View>
          </View>
        )}
        
        {/* 建议行动模块 - 卡片式设计 */}
        {news.recommendation && (
          <View className="px-4 pb-4">
            <View className="bg-amber-500/10 rounded-lg p-3 border-l-2 border-amber-500">
              <View className="flex items-center gap-2 mb-2">
                <Text className="text-base">🎯</Text>
                <Text className="text-amber-400 text-sm font-semibold">建议行动</Text>
              </View>
              <Text className="block text-neutral-200 text-sm leading-relaxed">
                {news.recommendation}
              </Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  // 渲染分组标题
  const renderSectionHeader = (title: string, subtitle: string, icon: React.ReactNode) => (
    <View className="flex items-center gap-3 mb-5 px-4">
      <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
        {icon}
      </View>
      <View className="flex flex-col gap-1">
        <Text className="text-white font-bold text-base">{title}</Text>
        <Text className="text-neutral-500 text-xs">{subtitle}</Text>
      </View>
    </View>
  )

  // 加载骨架屏
  const renderSkeleton = () => (
    <View>
      {[1, 2, 3].map((section) => (
        <View key={section} className="mb-5 px-4">
          <Skeleton className="h-6 w-32 mb-3 bg-neutral-800" />
          {[1, 2, 3].map((i) => (
            <View key={i} className="mb-3 bg-neutral-900 rounded-lg p-4">
              <Skeleton className="h-4 w-full mb-2 bg-neutral-800" />
              <Skeleton className="h-3 w-24 mb-3 bg-neutral-800" />
              <Skeleton className="h-3 w-full mb-2 bg-neutral-800" />
              <Skeleton className="h-3 w-3/4 bg-neutral-800" />
            </View>
          ))}
        </View>
      ))}
    </View>
  )

  return (
    <View className="min-h-screen bg-black pb-8">
      {/* Header */}
      <View 
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
        className="px-4 pt-10 pb-4"
      >
        <View className="flex flex-col gap-2">
          <Text className="text-white text-xl font-bold">智界雷达</Text>
          <Text className="text-neutral-500 text-sm">{getTodayDate()}</Text>
        </View>
        
        {/* 系统说明 */}
        <View className="bg-neutral-900 bg-opacity-50 rounded-lg p-3 mb-2">
          <Text className="text-neutral-400 text-xs leading-relaxed">
            每日自动抓取具身智能与空间智能领域最新资讯，AI智能分析热点、政策、市场动态，提供战略思考与决策参考。
          </Text>
        </View>
        
        {/* 每日一句 */}
        <View className="border-l-2 border-neutral-700 pl-3">
          <Text className="text-neutral-500 text-xs italic leading-relaxed">
            &ldquo;{dailyQuote.quote}&rdquo;
          </Text>
          <Text className="text-neutral-600 text-xs mt-1 block">
            —— {dailyQuote.author}
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        renderSkeleton()
      ) : (
        <View className="pt-4">
          {/* 每日热点资讯 */}
          {newsData.hot.length > 0 && (
            <View className="mb-5">
              {renderSectionHeader('每日热点', '技术突破与行业启示', <TrendingUp size={18} color="#10b981" />)}
              <View className="px-4">
                {newsData.hot.map((item) => renderNewsCard(item, 'hot'))}
              </View>
            </View>
          )}

          {/* 宏观风向 */}
          {newsData.policy.length > 0 && (
            <View className="mb-5">
              {renderSectionHeader('宏观风向', '政策解读与战略影响', <Globe size={18} color="#3b82f6" />)}
              <View className="px-4">
                {newsData.policy.map((item) => renderNewsCard(item, 'policy'))}
              </View>
            </View>
          )}

          {/* 市场微观 */}
          {newsData.market.length > 0 && (
            <View className="mb-5">
              {renderSectionHeader('市场微观', '市场动态与行动建议', <Briefcase size={18} color="#a855f7" />)}
              <View className="px-4">
                {newsData.market.map((item) => renderNewsCard(item, 'market'))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default IndexPage
