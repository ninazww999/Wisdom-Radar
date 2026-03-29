import { View, Text } from '@tarojs/components'
import Taro, { useLoad, useDidShow, usePullDownRefresh, useReachBottom, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useState, useRef } from 'react'
import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  FileText, 
  RefreshCw,
  Flame,
  Globe,
  Target
} from 'lucide-react-taro'
import { Network } from '@/network'
import './index.css'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  publishTime: string
  category: 'policy' | 'industry' | 'technology' | 'market'
  isHot?: boolean
  bawitonInsight?: string
  url?: string
}

interface NewsResponse {
  list: NewsItem[]
  total: number
  hasMore: boolean
}

const categoryLabels = {
  policy: '政策',
  industry: '行业',
  technology: '技术',
  market: '市场'
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
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [dailyQuote] = useState(getDailyQuote)
  
  // 记录上次刷新时间，避免频繁刷新
  const lastRefreshTimeRef = useRef<number>(0)

  useLoad(() => {
    console.log('Index page loaded.')
  })

  // 每次页面显示时自动刷新资讯
  useDidShow(() => {
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current
    
    // 如果距离上次刷新超过 30 秒，才重新获取数据
    // 这样可以避免从详情页返回时立即刷新，但又确保每次打开小程序都能获取最新资讯
    if (timeSinceLastRefresh > 30000 || lastRefreshTimeRef.current === 0) {
      console.log('[useDidShow] Refreshing news data...')
      fetchNews()
      lastRefreshTimeRef.current = now
    } else {
      console.log('[useDidShow] Skip refresh, last refresh was', Math.floor(timeSinceLastRefresh / 1000), 'seconds ago')
    }
  })

  // 分享给朋友
  useShareAppMessage(() => ({
    title: '智界雷达 - 具身智能与空间智能专业资讯',
    path: '/pages/index/index',
    imageUrl: '/assets/share-cover.png'
  }))

  // 分享到朋友圈
  useShareTimeline(() => ({
    title: '智界雷达 - 具身智能与空间智能专业资讯',
    query: '',
    imageUrl: '/assets/share-cover.png'
  }))

  usePullDownRefresh(async () => {
    await handleRefresh()
    Taro.stopPullDownRefresh()
  })

  useReachBottom(() => {
    if (hasMore && !loading) {
      loadMore()
    }
  })

  const fetchNews = async (pageNum: number = 1, category?: string) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      }
      
      console.log('[Fetch News] Fetching latest news, page:', pageNum, 'category:', category)
      
      const response = await Network.request({
        url: '/api/news/list',
        method: 'GET',
        data: { 
          page: pageNum, 
          pageSize: 10,
          category: category || undefined
        }
      })
      
      console.log('[Fetch News] Response:', response)
      
      if (response.data) {
        const data = response.data as NewsResponse
        if (pageNum === 1) {
          setNewsList(data.list)
          // 更新刷新时间
          lastRefreshTimeRef.current = Date.now()
        } else {
          setNewsList(prev => [...prev, ...data.list])
        }
        setHasMore(data.hasMore)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('[Fetch News] Error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    lastRefreshTimeRef.current = Date.now()
    await fetchNews(1, activeCategory || undefined)
  }

  const loadMore = () => {
    fetchNews(page + 1, activeCategory || undefined)
  }

  const handleCategoryClick = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null)
      fetchNews(1, undefined)
    } else {
      setActiveCategory(category)
      fetchNews(1, category)
    }
  }

  const handleNewsClick = (news: NewsItem) => {
    Taro.setStorageSync('currentNews', news)
    Taro.navigateTo({
      url: `/pages/detail/index?id=${news.id}`
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours}小时前`
    
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}天前`
    
    return dateStr
  }

  const getTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    return `${year}年${month}月${date}日`
  }

  // 按分类分组资讯
  const getGroupedNews = () => {
    const hotNews = newsList.filter(item => item.isHot || item.category === 'technology').slice(0, 3)
    const policyNews = newsList.filter(item => item.category === 'policy').slice(0, 5)
    const marketNews = newsList.filter(item => item.category === 'industry' || item.category === 'market').slice(0, 5)
    
    return { hotNews, policyNews, marketNews }
  }

  const { hotNews, policyNews, marketNews } = getGroupedNews()

  // 渲染资讯卡片
  const renderNewsCard = (news: NewsItem, showInsight: boolean = false) => (
    <Card 
      key={news.id} 
      className="mb-3 bg-neutral-900 border-neutral-800 overflow-hidden"
      onClick={() => handleNewsClick(news)}
    >
      <CardContent className="py-4 px-4">
        {/* 标题 */}
        <Text className="text-white font-medium text-base mb-2 leading-relaxed block">
          {news.title}
        </Text>
        
        {/* 元信息 */}
        <View className="flex items-center gap-2 mb-3">
          <Badge className="bg-neutral-800 text-neutral-300 text-xs px-2 py-1 rounded border-0">
            {categoryLabels[news.category]}
          </Badge>
          <Text className="text-neutral-600 text-xs">{news.source}</Text>
          <Text className="text-neutral-700 text-xs">·</Text>
          <Text className="text-neutral-600 text-xs">{formatDate(news.publishTime)}</Text>
        </View>
        
        {/* 内容摘要 */}
        <Text className="text-neutral-400 text-sm leading-relaxed block">
          {news.summary.slice(0, 80)}...
        </Text>
        
        {/* 八维通洞察 */}
        {showInsight && (
          <View className="bg-neutral-800 bg-opacity-50 rounded-lg p-3 mt-3">
            <Text className="text-neutral-300 text-sm leading-relaxed">
              💡 {news.bawitonInsight || '点击查看八维通洞察分析'}
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  )

  return (
    <View className="min-h-screen bg-black">
      {/* Header - Glass Style */}
      <View 
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
        className="px-4 pt-8 pb-5"
      >
        <View className="flex items-center justify-between mb-3">
          <View>
            <Text className="text-white text-lg font-bold">智界雷达 · 每日行业决策参考</Text>
            <Text className="text-neutral-500 text-sm mt-1">{getTodayDate()}</Text>
          </View>
          <View 
            className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center"
            onClick={handleRefresh}
          >
            <RefreshCw size={18} color="#a3a3a3" className={refreshing ? 'animate-spin' : ''} />
          </View>
        </View>
        
        {/* 系统功能说明 */}
        <View className="bg-neutral-900 bg-opacity-50 rounded-lg p-3 mb-3">
          <Text className="text-neutral-400 text-xs leading-relaxed">
            📌 系统功能：每日自动抓取具身智能与空间智能领域信息，AI智能筛选热点资讯、政策风向、市场动态，为您提供决策参考。
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
      <View className="px-4">
        {/* Category Tabs */}
        <View className="flex gap-2 mb-4 overflow-x-auto py-2">
          {[null, 'policy', 'industry', 'technology', 'market'].map((cat) => {
            const isActive = activeCategory === cat
            return (
              <View
                key={cat || 'all'}
                className={`px-4 py-2 rounded-full flex-shrink-0 ${isActive ? 'bg-white' : 'bg-neutral-900'}`}
                onClick={() => handleCategoryClick(cat as string)}
              >
                <Text className={`text-sm ${isActive ? 'text-black font-medium' : 'text-neutral-400'}`}>
                  {cat ? categoryLabels[cat as keyof typeof categoryLabels] : '全部'}
                </Text>
              </View>
            )
          })}
        </View>

        {/* News List - 分类展示 */}
        {loading && newsList.length === 0 ? (
          <View>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="mb-3 bg-neutral-900 border-neutral-800">
                <CardContent className="py-4">
                  <Skeleton className="h-4 w-3/4 mb-3 bg-neutral-800" />
                  <Skeleton className="h-3 w-full mb-2 bg-neutral-800" />
                  <Skeleton className="h-3 w-1/2 bg-neutral-800" />
                </CardContent>
              </Card>
            ))}
          </View>
        ) : newsList.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
              <FileText size={32} color="#525252" />
            </View>
            <Text className="text-neutral-500 text-sm">暂无资讯</Text>
          </View>
        ) : activeCategory ? (
          /* 单分类模式 */
          <View>
            {newsList.map((news) => (
              <Card 
                key={news.id} 
                className="mb-3 bg-neutral-900 border-neutral-800 overflow-hidden"
                onClick={() => handleNewsClick(news)}
              >
                <CardContent className="py-4 px-4">
                  <Text className="text-white font-medium text-base mb-3 leading-relaxed">
                    {news.title}
                  </Text>
                  <View className="flex items-center justify-between">
                    <View className="flex items-center gap-2">
                      <Badge className="bg-neutral-800 text-neutral-300 text-xs px-2 py-1 rounded border-0">
                        {categoryLabels[news.category]}
                      </Badge>
                      <Text className="text-neutral-600 text-xs">{news.source}</Text>
                    </View>
                    <Text className="text-neutral-600 text-xs">
                      {formatDate(news.publishTime)}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        ) : (
          /* 分组模式 - 参考 PushPlus */
          <View>
            {/* 🔥 热点资讯 */}
            {hotNews.length > 0 && (
              <View className="mb-6">
                <View className="flex items-center gap-2 mb-3">
                  <Flame size={16} color="#10a37f" />
                  <Text className="text-white font-medium">热点资讯</Text>
                </View>
                {hotNews.map((news) => renderNewsCard(news, true))}
              </View>
            )}

            {/* 🌍 政策风向 */}
            {policyNews.length > 0 && (
              <View className="mb-6">
                <View className="flex items-center gap-2 mb-3">
                  <Globe size={16} color="#10a37f" />
                  <Text className="text-white font-medium">政策风向（战略层）</Text>
                </View>
                {policyNews.map((news) => renderNewsCard(news, true))}
              </View>
            )}

            {/* 🎯 市场动态 */}
            {marketNews.length > 0 && (
              <View className="mb-6">
                <View className="flex items-center gap-2 mb-3">
                  <Target size={16} color="#10a37f" />
                  <Text className="text-white font-medium">市场动态（业务层）</Text>
                </View>
                {marketNews.map((news) => renderNewsCard(news, true))}
              </View>
            )}

            {/* 加载更多 */}
            {hasMore && (
              <View className="flex justify-center py-6">
                <Text className="text-neutral-600 text-sm">
                  {loading ? '加载中...' : '上拉加载更多'}
                </Text>
              </View>
            )}

            {/* 已加载全部 */}
            {!hasMore && newsList.length > 0 && (
              <View className="flex justify-center py-6">
                <Text className="text-neutral-600 text-sm">已加载全部资讯</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

export default IndexPage
