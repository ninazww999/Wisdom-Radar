import { View, Text } from '@tarojs/components'
import Taro, { useLoad, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  FileText, 
  TrendingUp, 
  Cpu, 
  ChartBarBig,
  ChevronRight,
  RefreshCw,
  Zap
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

const categoryColors = {
  policy: 'bg-gradient-to-r from-rose-500 to-pink-500',
  industry: 'bg-gradient-to-r from-amber-500 to-orange-500',
  technology: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  market: 'bg-gradient-to-r from-violet-500 to-purple-500'
}

const quickActions = [
  { key: 'policy', label: '政策', icon: FileText, gradient: 'from-rose-500 to-pink-500' },
  { key: 'industry', label: '行业', icon: TrendingUp, gradient: 'from-amber-500 to-orange-500' },
  { key: 'technology', label: '技术', icon: Cpu, gradient: 'from-emerald-500 to-teal-500' },
  { key: 'market', label: '市场', icon: ChartBarBig, gradient: 'from-violet-500 to-purple-500' }
]

const IndexPage: FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useLoad(() => {
    console.log('Index page loaded.')
    fetchNews()
  })

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
      
      const response = await Network.request({
        url: '/api/news/list',
        method: 'GET',
        data: { 
          page: pageNum, 
          pageSize: 10,
          category: category || undefined
        }
      })
      
      console.log('Fetch news response:', response)
      
      if (response.data) {
        const data = response.data as NewsResponse
        if (pageNum === 1) {
          setNewsList(data.list)
        } else {
          setNewsList(prev => [...prev, ...data.list])
        }
        setHasMore(data.hasMore)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Fetch news error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
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

  const handleNewsClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`
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
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const month = now.getMonth() + 1
    const date = now.getDate()
    const weekDay = weekDays[now.getDay()]
    return `${month}月${date}日 星期${weekDay}`
  }

  return (
    <View className="min-h-screen bg-gray-950">
      {/* Header with Gradient */}
      <View className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 px-5 pt-6 pb-20 relative overflow-hidden">
        {/* Decorative circles */}
        <View className="absolute -top-20 -right-20 w-40 h-40 bg-white bg-opacity-10 rounded-full" />
        <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-white bg-opacity-5 rounded-full" />
        
        <View className="flex items-center justify-between relative z-10">
          <View>
            <Text className="text-gray-200 text-xs">{getTodayDate()}</Text>
            <Text className="text-white text-xl font-bold mt-1">具身智能资讯</Text>
          </View>
          <View 
            className="w-10 h-10 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center"
            onClick={handleRefresh}
          >
            <RefreshCw size={18} color="#ffffff" className={refreshing ? 'animate-spin' : ''} />
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="px-5 -mt-12 relative z-20">
        {/* Quick Actions */}
        <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800 shadow-xl mb-4">
          <View className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const isActive = activeCategory === action.key
              return (
                <View
                  key={action.key}
                  className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all ${isActive ? `bg-gradient-to-r ${action.gradient} shadow-lg` : 'bg-gray-800 hover:bg-gray-750'}`}
                  onClick={() => handleCategoryClick(action.key)}
                >
                  <View className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-white bg-opacity-25' : `bg-gradient-to-r ${action.gradient}`}`}>
                    <action.icon size={18} color="#ffffff" />
                  </View>
                  <Text className={`text-xs ${isActive ? 'text-white font-medium' : 'text-gray-300'}`}>
                    {action.label}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* AI Assistant Card */}
        <Card className="mb-4 bg-gradient-to-r from-violet-600 to-purple-600 border-none shadow-xl overflow-hidden relative">
          <View className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10" />
          <CardContent className="py-4 px-4 relative z-10">
            <View className="flex items-center gap-3">
              <View className="w-12 h-12 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                <Zap size={24} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-sm">AI 智能助手</Text>
                <Text className="text-violet-100 text-xs mt-1">为您解读行业资讯，提供决策建议</Text>
              </View>
              <ChevronRight size={20} color="#ffffff" />
            </View>
          </CardContent>
        </Card>

        {/* News List */}
        {loading && newsList.length === 0 ? (
          <View>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="mb-4 bg-gray-900 border-gray-800">
                <CardContent className="py-4">
                  <View className="flex gap-3">
                    <View className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-3 bg-gray-800" />
                      <Skeleton className="h-3 w-full mb-2 bg-gray-800" />
                      <Skeleton className="h-3 w-1/2 bg-gray-800" />
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        ) : newsList.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <FileText size={32} color="#4b5563" />
            </View>
            <Text className="text-gray-400 text-sm">暂无资讯</Text>
          </View>
        ) : (
          <View>
            {newsList.map((news) => (
              <Card 
                key={news.id} 
                className="mb-4 bg-gray-900 border-gray-800 hover:border-gray-700 transition-all overflow-hidden"
                onClick={() => handleNewsClick(news.id)}
              >
                <CardContent className="py-4 px-4">
                  <View className="flex gap-3">
                    <View className="flex-1">
                      {/* Category Badge */}
                      <View className="flex items-center gap-2 mb-3">
                        <Badge className={`${categoryColors[news.category]} text-white text-xs px-3 py-1 rounded-full border-0`}>
                          {categoryLabels[news.category]}
                        </Badge>
                        {news.isHot && (
                          <View className="bg-gradient-to-r from-rose-500 to-orange-500 px-2 py-1 rounded-full">
                            <Text className="text-white text-xs">热</Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Title */}
                      <Text className="text-white font-semibold text-sm mb-2 leading-relaxed">
                        {news.title}
                      </Text>
                      
                      {/* Summary */}
                      <Text className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                        {news.summary}
                      </Text>
                      
                      {/* Meta */}
                      <View className="flex items-center gap-2">
                        <Text className="text-gray-500 text-xs">{news.source}</Text>
                        <Text className="text-gray-600 text-xs">•</Text>
                        <Text className="text-gray-500 text-xs">
                          {formatDate(news.publishTime)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}

            {/* Load More */}
            {hasMore && (
              <View className="flex justify-center py-6">
                <Text className="text-gray-500 text-xs">
                  {loading ? '加载中...' : '上拉加载更多'}
                </Text>
              </View>
            )}

            {/* No More */}
            {!hasMore && newsList.length > 0 && (
              <View className="flex justify-center py-6">
                <Text className="text-gray-600 text-xs">已加载全部</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

export default IndexPage
