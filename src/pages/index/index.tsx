import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  FileText, 
  TrendingUp, 
  Cpu, 
  ChartBarBig,
  ChevronRight,
  RefreshCw,
  Sparkles
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
  policy: '政策动态',
  industry: '行业动态',
  technology: '技术进展',
  market: '市场分析'
}

const categoryColors = {
  policy: 'bg-red-500',
  industry: 'bg-orange-500',
  technology: 'bg-green-500',
  market: 'bg-purple-500'
}

const quickActions = [
  { key: 'policy', label: '政策', icon: FileText, color: '#ef4444' },
  { key: 'industry', label: '行业', icon: TrendingUp, color: '#f97316' },
  { key: 'technology', label: '技术', icon: Cpu, color: '#22c55e' },
  { key: 'market', label: '市场', icon: ChartBarBig, color: '#a855f7' }
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
    <View className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex items-center justify-between">
          <View>
            <Text className="block text-lg font-bold text-gray-900">具身智能资讯</Text>
            <Text className="block text-xs text-gray-500 mt-1">{getTodayDate()}</Text>
          </View>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} color={refreshing ? '#9ca3af' : '#6b7280'} />
          </Button>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex gap-3">
          {quickActions.map((action) => (
            <View
              key={action.key}
              className="flex-1 flex flex-col items-center gap-2 py-2 rounded-lg bg-gray-50"
              onClick={() => handleCategoryClick(action.key)}
            >
              <View 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${action.color}20` }}
              >
                <action.icon size={20} color={action.color} />
              </View>
              <Text className="text-xs text-gray-700">{action.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* News List */}
      <ScrollView scrollY className="flex-1 p-4">
        {/* AI Assistant Banner */}
        <Card className="mb-4 bg-gradient-to-r from-blue-500 to-blue-600 border-none">
          <CardContent className="py-3">
            <View className="flex items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <Sparkles size={20} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-white">AI 智能助手</Text>
                <Text className="text-xs text-blue-100">为您解读行业资讯，提供决策建议</Text>
              </View>
              <ChevronRight size={16} color="#ffffff" />
            </View>
          </CardContent>
        </Card>

        {/* Category Filter Badge */}
        {activeCategory && (
          <View className="mb-3">
            <Badge className={`${categoryColors[activeCategory as keyof typeof categoryColors]} text-white`}>
              {categoryLabels[activeCategory as keyof typeof categoryLabels]}
            </Badge>
          </View>
        )}

        {/* News Items */}
        {loading && newsList.length === 0 ? (
          // Loading Skeleton
          <View>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="mb-3">
                <CardContent className="py-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </View>
        ) : newsList.length === 0 ? (
          // Empty State
          <View className="flex flex-col items-center justify-center py-16">
            <FileText size={48} color="#d1d5db" />
            <Text className="text-sm text-gray-400 mt-3">暂无资讯</Text>
          </View>
        ) : (
          // News List
          <View>
            {newsList.map((news) => (
              <Card 
                key={news.id} 
                className="mb-3"
                onClick={() => handleNewsClick(news.id)}
              >
                <CardContent className="py-4">
                  <View className="flex items-start gap-3">
                    <View className="flex-1">
                      <View className="flex items-center gap-2 mb-2">
                        <Badge 
                          className={`${categoryColors[news.category]} text-white text-xs`}
                        >
                          {categoryLabels[news.category]}
                        </Badge>
                        {news.isHot && (
                          <Badge className="bg-red-500 text-white text-xs">热</Badge>
                        )}
                      </View>
                      <Text className="text-sm font-semibold text-gray-900 mb-2 leading-snug">
                        {news.title}
                      </Text>
                      <Text className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {news.summary}
                      </Text>
                      <View className="flex items-center gap-2">
                        <Text className="text-xs text-gray-500">{news.source}</Text>
                        <Text className="text-xs text-gray-400">·</Text>
                        <Text className="text-xs text-gray-500">
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
              <View className="flex justify-center py-4">
                <Text className="text-xs text-gray-400">
                  {loading ? '加载中...' : '上拉加载更多'}
                </Text>
              </View>
            )}

            {/* No More */}
            {!hasMore && newsList.length > 0 && (
              <View className="flex justify-center py-4">
                <Text className="text-xs text-gray-400">已加载全部</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default IndexPage
