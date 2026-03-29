import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Bookmark
} from 'lucide-react-taro'
import { Network } from '@/network'
import './index.css'

interface NewsDetail {
  id: string
  title: string
  source: string
  publishTime: string
  category: 'policy' | 'industry' | 'technology' | 'market'
  summary: string
  content: string
  relatedNews: Array<{
    id: string
    title: string
    source: string
    publishTime: string
  }>
}

const categoryLabels = {
  policy: '政策',
  industry: '行业',
  technology: '技术',
  market: '市场'
}

const DetailPage: FC = () => {
  const router = useRouter()
  const [detail, setDetail] = useState<NewsDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useLoad(() => {
    console.log('Detail page loaded.')
  })

  useEffect(() => {
    const { id } = router.params
    if (id) {
      fetchDetail(id)
    }
  }, [router.params])

  const fetchDetail = async (id: string) => {
    try {
      setLoading(true)
      
      const cachedNews = Taro.getStorageSync('currentNews')
      console.log('Cached news:', cachedNews)
      
      if (cachedNews && cachedNews.id === id) {
        const response = await Network.request({
          url: '/api/news/detail',
          method: 'GET',
          data: { id, title: cachedNews.title, summary: cachedNews.summary, category: cachedNews.category }
        })
        console.log('Fetch detail response:', response)
        
        if (response.data) {
          setDetail({
            ...cachedNews,
            content: response.data.content || cachedNews.summary,
            relatedNews: response.data.relatedNews || []
          })
        } else {
          setDetail({
            ...cachedNews,
            content: cachedNews.summary,
            relatedNews: []
          })
        }
      } else {
        const response = await Network.request({
          url: '/api/news/detail',
          method: 'GET',
          data: { id }
        })
        console.log('Fetch detail response:', response)
        if (response.data) {
          setDetail(response.data)
        }
      }
    } catch (error) {
      console.error('Fetch detail error:', error)
      const cachedNews = Taro.getStorageSync('currentNews')
      if (cachedNews) {
        setDetail({
          ...cachedNews,
          content: cachedNews.summary,
          relatedNews: []
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = () => {
    console.log('Share clicked')
  }

  if (loading) {
    return (
      <View className="min-h-screen bg-black">
        <View className="flex items-center justify-center h-96">
          <Text className="text-neutral-600 text-sm">加载中...</Text>
        </View>
      </View>
    )
  }

  if (!detail) {
    return (
      <View className="min-h-screen bg-black">
        <View className="flex items-center justify-center h-96">
          <Text className="text-neutral-600 text-sm">内容不存在</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-black">
      {/* Header */}
      <View className="px-4 py-4 flex items-center gap-4 border-b border-neutral-900">
        <View 
          className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center"
          onClick={handleBack}
        >
          <ArrowLeft size={20} color="#a3a3a3" />
        </View>
        <Text className="flex-1 text-white font-medium">资讯详情</Text>
      </View>

      {/* Content */}
      <ScrollView scrollY className="flex-1 px-4 py-4 pb-24">
        {/* Title */}
        <Text className="text-white text-xl font-bold mb-4 leading-relaxed">{detail.title}</Text>
        
        {/* Meta */}
        <View className="flex items-center gap-3 mb-6">
          <Badge className="bg-neutral-800 text-neutral-300 text-xs px-3 py-1 rounded-full border-0">
            {categoryLabels[detail.category]}
          </Badge>
          <Text className="text-neutral-600 text-sm">{detail.source}</Text>
          <Text className="text-neutral-700 text-sm">·</Text>
          <Text className="text-neutral-600 text-sm">{detail.publishTime}</Text>
        </View>

        {/* Summary */}
        <View className="mb-6">
          <Text className="text-neutral-400 text-base leading-relaxed">{detail.summary}</Text>
        </View>

        {/* Content */}
        {detail.content && detail.content !== detail.summary && (
          <View className="mb-6">
            <Text className="text-neutral-300 text-base leading-relaxed whitespace-pre-wrap">{detail.content}</Text>
          </View>
        )}

        {/* Related News */}
        {detail.relatedNews && detail.relatedNews.length > 0 && (
          <View className="mt-6 pt-6 border-t border-neutral-900">
            <Text className="text-white font-medium mb-4">相关推荐</Text>
            {detail.relatedNews.map((news, idx) => (
              <Card key={idx} className="mb-3 bg-neutral-900 border-neutral-800 rounded-xl overflow-hidden">
                <CardContent className="py-4 px-4">
                  <Text className="text-neutral-200 text-sm mb-2 leading-relaxed">{news.title}</Text>
                  <View className="flex items-center gap-2">
                    <Text className="text-neutral-600 text-xs">{news.source}</Text>
                    <Text className="text-neutral-700 text-xs">·</Text>
                    <Text className="text-neutral-600 text-xs">{news.publishTime}</Text>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          padding: '16px 20px',
          backgroundColor: '#000000',
          borderTop: '1px solid #171717'
        }}
      >
        <Button
          className="flex-1 bg-neutral-900 border-neutral-800 text-white rounded-xl h-12"
          onClick={handleBookmark}
        >
          <View className="flex items-center gap-2">
            <Bookmark size={18} color={isBookmarked ? '#10a37f' : '#a3a3a3'} />
            <Text className="text-neutral-300">{isBookmarked ? '已收藏' : '收藏'}</Text>
          </View>
        </Button>
        <Button
          className="flex-1 bg-white text-black rounded-xl h-12 border-0"
          onClick={handleShare}
        >
          <Text className="font-medium">分享</Text>
        </Button>
      </View>
    </View>
  )
}

export default DetailPage
