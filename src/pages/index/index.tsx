import { View, Text } from '@tarojs/components'
import Taro, { useLoad, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  FileText, 
  RefreshCw
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

  // 判断摘要是否为残缺片段（需要隐藏）
  const isIncompleteSnippet = (summary: string): boolean => {
    if (!summary || summary.length < 20) return true
    
    // 开头是标点符号，说明是截断的片段
    if (/^[。！？；：，、.]/.test(summary)) return true
    
    // 开头是残缺的词语（1-2个字+标点）
    if (/^[\u4e00-\u9fa5]{1,2}[。！？；：，、]/.test(summary)) return true
    
    return false
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
    <View className="min-h-screen bg-black">
      {/* Header */}
      <View className="px-4 pt-6 pb-4">
        <View className="flex items-center justify-between">
          <View>
            <Text className="text-neutral-500 text-xs">{getTodayDate()}</Text>
            <Text className="text-white text-xl font-bold mt-1">智界雷达</Text>
          </View>
          <View 
            className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center"
            onClick={handleRefresh}
          >
            <RefreshCw size={18} color="#a3a3a3" className={refreshing ? 'animate-spin' : ''} />
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="px-4">
        {/* Category Tabs */}
        <View className="flex gap-2 mb-4 overflow-x-auto">
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

        {/* News List */}
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
        ) : (
          <View>
            {newsList.map((news) => (
              <Card 
                key={news.id} 
                className="mb-3 bg-neutral-900 border-neutral-800 overflow-hidden"
                onClick={() => handleNewsClick(news)}
              >
                <CardContent className="py-4 px-4">
                  {/* Title */}
                  <Text className="text-white font-medium text-base mb-2 leading-relaxed">
                    {news.title}
                  </Text>
                  
                  {/* Summary - 只显示完整的摘要，隐藏截断片段 */}
                  {news.summary && !isIncompleteSnippet(news.summary) && (
                    <Text className="text-neutral-500 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {news.summary}
                    </Text>
                  )}
                  
                  {/* Meta */}
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

            {/* Load More */}
            {hasMore && (
              <View className="flex justify-center py-6">
                <Text className="text-neutral-600 text-sm">
                  {loading ? '加载中...' : '上拉加载更多'}
                </Text>
              </View>
            )}

            {/* No More */}
            {!hasMore && newsList.length > 0 && (
              <View className="flex justify-center py-6">
                <Text className="text-neutral-600 text-sm">已加载全部</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

export default IndexPage
