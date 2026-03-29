import { View, Text } from '@tarojs/components'
import Taro, { useLoad, useDidShow, usePullDownRefresh, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useState, useRef } from 'react'
import type { FC } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react-taro'
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
  url?: string
}

interface NewsResponse {
  list: NewsItem[]
  total: number
  hasMore: boolean
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
  const [dailyQuote] = useState(getDailyQuote)
  
  // 记录上次刷新的日期，确保每天第一次打开时刷新
  const lastRefreshDateRef = useRef<string>('')

  useLoad(() => {
    console.log('Index page loaded.')
  })

  // 获取当前日期字符串（YYYY-MM-DD）
  const getTodayDateStr = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }

  // 每次页面显示时检查是否需要刷新
  useDidShow(() => {
    const today = getTodayDateStr()
    
    // 如果是今天第一次打开，自动刷新获取最新资讯
    if (lastRefreshDateRef.current !== today) {
      console.log('[useDidShow] New day detected, refreshing news...', today)
      fetchNews()
      lastRefreshDateRef.current = today
    } else {
      console.log('[useDidShow] Already refreshed today:', today)
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

  const fetchNews = async () => {
    try {
      setLoading(true)
      
      console.log('[Fetch News] Fetching latest news...')
      
      const response = await Network.request({
        url: '/api/news/list',
        method: 'GET',
        data: { page: 1, pageSize: 15 }
      })
      
      console.log('[Fetch News] Response:', response)
      
      if (response.data) {
        const data = response.data as NewsResponse
        setNewsList(data.list)
        lastRefreshDateRef.current = getTodayDateStr()
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
    await fetchNews()
  }

  const handleNewsClick = (news: NewsItem) => {
    Taro.setStorageSync('currentNews', news)
    Taro.navigateTo({
      url: `/pages/detail/index?id=${news.id}`
    })
  }

  const formatTime = (dateStr: string) => {
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

  // 按分类分组资讯，每个维度只取3条
  const getGroupedNews = () => {
    const hotNews = newsList.filter(item => item.isHot || item.category === 'technology').slice(0, 3)
    const policyNews = newsList.filter(item => item.category === 'policy').slice(0, 3)
    const industryNews = newsList.filter(item => item.category === 'industry').slice(0, 3)
    const marketNews = newsList.filter(item => item.category === 'market').slice(0, 3)
    
    return { hotNews, policyNews, industryNews, marketNews }
  }

  const { hotNews, policyNews, industryNews, marketNews } = getGroupedNews()

  // 渲染单条资讯 - 简洁样式
  const renderNewsItem = (news: NewsItem, index: number) => (
    <View 
      key={news.id} 
      className="py-3 border-b border-neutral-800 last:border-b-0"
      onClick={() => handleNewsClick(news)}
    >
      <View className="flex items-start gap-3">
        {/* 序号 */}
        <View className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-1">
          <Text className="text-neutral-400 text-xs">{index + 1}</Text>
        </View>
        
        {/* 内容 */}
        <View className="flex-1 min-w-0">
          <Text className="text-neutral-200 text-sm leading-relaxed block mb-2">
            {news.title}
          </Text>
          <View className="flex items-center gap-2">
            <Text className="text-neutral-500 text-xs">{news.source}</Text>
            <Text className="text-neutral-700 text-xs">·</Text>
            <Text className="text-neutral-500 text-xs">{formatTime(news.publishTime)}</Text>
          </View>
        </View>
      </View>
    </View>
  )

  // 渲染分组
  const renderSection = (title: string, icon: string, news: NewsItem[]) => {
    if (news.length === 0) return null
    
    return (
      <View className="mb-5">
        <View className="flex items-center gap-2 mb-2 px-4">
          <Text className="text-base">{icon}</Text>
          <Text className="text-white font-medium">{title}</Text>
        </View>
        <View className="bg-neutral-900 rounded-lg mx-4 px-3">
          {news.map((item, idx) => renderNewsItem(item, idx))}
        </View>
      </View>
    )
  }

  // 加载骨架屏
  const renderSkeleton = () => (
    <View className="px-4">
      {[1, 2, 3].map((section) => (
        <View key={section} className="mb-5">
          <Skeleton className="h-5 w-24 mb-2 bg-neutral-800" />
          <View className="bg-neutral-900 rounded-lg p-3">
            {[1, 2, 3].map((item) => (
              <View key={item} className="py-3 border-b border-neutral-800 last:border-b-0">
                <Skeleton className="h-4 w-full mb-2 bg-neutral-800" />
                <Skeleton className="h-3 w-24 bg-neutral-800" />
              </View>
            ))}
          </View>
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
        className="px-4 pt-10 pb-4 sticky top-0 z-10"
      >
        <View className="flex items-center justify-between mb-3">
          <View>
            <Text className="text-white text-xl font-bold">智界雷达</Text>
            <Text className="text-neutral-500 text-sm mt-1">{getTodayDate()}</Text>
          </View>
          <View 
            className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center"
            onClick={handleRefresh}
          >
            <RefreshCw size={16} color="#a3a3a3" className={refreshing ? 'animate-spin' : ''} />
          </View>
        </View>
        
        {/* 系统说明 */}
        <View className="bg-neutral-900 bg-opacity-50 rounded-lg p-3 mb-2">
          <Text className="text-neutral-400 text-xs leading-relaxed">
            每日自动抓取具身智能与空间智能领域最新资讯，AI智能筛选热点、政策、行业、市场动态，为您提供决策参考。
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
        <View className="pt-2">
          {renderSection('热点资讯', '🔥', hotNews)}
          {renderSection('政策风向', '📋', policyNews)}
          {renderSection('行业动态', '🏢', industryNews)}
          {renderSection('市场趋势', '📈', marketNews)}
          
          {/* 底部提示 */}
          <View className="text-center py-6">
            <Text className="text-neutral-600 text-xs">— 下拉刷新获取最新资讯 —</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default IndexPage
