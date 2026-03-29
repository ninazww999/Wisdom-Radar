import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  Sparkles, 
  FileText,
  TrendingUp,
  Lightbulb,
  ChevronRight
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
  aiAnalysis?: {
    keyPoints: string[]
    impact: string
    recommendation: string
  }
  relatedNews: Array<{
    id: string
    title: string
    source: string
    publishTime: string
  }>
}

const categoryLabels = {
  policy: '政策动态',
  industry: '行业动态',
  technology: '技术进展',
  market: '市场分析'
}

const categoryColors = {
  policy: 'bg-gradient-to-r from-rose-500 to-pink-500',
  industry: 'bg-gradient-to-r from-amber-500 to-orange-500',
  technology: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  market: 'bg-gradient-to-r from-violet-500 to-purple-500'
}

const DetailPage: FC = () => {
  const router = useRouter()
  const [detail, setDetail] = useState<NewsDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<NewsDetail['aiAnalysis'] | null>(null)
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
      
      // 优先读取缓存数据（从首页跳转时存储）
      const cachedNews = Taro.getStorageSync('currentNews')
      console.log('Cached news:', cachedNews)
      
      if (cachedNews && cachedNews.id === id) {
        // 使用缓存数据，并调用 API 获取完整详情
        const response = await Network.request({
          url: '/api/news/detail',
          method: 'GET',
          data: { id, title: cachedNews.title, summary: cachedNews.summary }
        })
        console.log('Fetch detail response:', response)
        
        if (response.data) {
          // 合并缓存数据和 API 返回数据
          setDetail({
            ...cachedNews,
            content: response.data.content || cachedNews.summary,
            aiAnalysis: response.data.aiAnalysis || null,
            relatedNews: response.data.relatedNews || []
          })
          setAiAnalysis(response.data.aiAnalysis || null)
        } else {
          // API 无返回，仅使用缓存数据
          setDetail({
            ...cachedNews,
            content: cachedNews.summary,
            relatedNews: []
          })
        }
      } else {
        // 无缓存，直接调用 API
        const response = await Network.request({
          url: '/api/news/detail',
          method: 'GET',
          data: { id }
        })
        console.log('Fetch detail response:', response)
        if (response.data) {
          setDetail(response.data)
          setAiAnalysis(response.data.aiAnalysis || null)
        }
      }
    } catch (error) {
      console.error('Fetch detail error:', error)
      // 出错时尝试使用缓存
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

  const generateAiAnalysis = async () => {
    if (!detail || aiAnalysis) return
    
    try {
      setAiLoading(true)
      const response = await Network.request({
        url: '/api/news/analyze',
        method: 'POST',
        data: { newsId: detail.id, title: detail.title, content: detail.content || detail.summary }
      })
      console.log('AI analysis response:', response)
      if (response.data) {
        setAiAnalysis(response.data)
      }
    } catch (error) {
      console.error('AI analysis error:', error)
    } finally {
      setAiLoading(false)
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
      <View className="min-h-screen bg-gray-950">
        <View className="flex items-center justify-center h-96">
          <Text className="text-gray-500 text-sm">加载中...</Text>
        </View>
      </View>
    )
  }

  if (!detail) {
    return (
      <View className="min-h-screen bg-gray-950">
        <View className="flex items-center justify-center h-96">
          <Text className="text-gray-500 text-sm">内容不存在</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gray-950">
      {/* Header with Gradient */}
      <View className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 px-5 py-4 relative">
        <View className="flex items-center gap-4">
          <View 
            className="w-10 h-10 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center"
            onClick={handleBack}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </View>
          <Text className="flex-1 text-white font-semibold">资讯详情</Text>
          <View className="w-10 h-10" />
        </View>
      </View>

      {/* Content */}
      <ScrollView scrollY className="flex-1 px-5 py-4">
        {/* Title */}
        <Text className="text-white text-xl font-bold mb-4 leading-relaxed">{detail.title}</Text>
        
        {/* Meta */}
        <View className="flex items-center gap-3 mb-4">
          <Badge className={`${categoryColors[detail.category]} text-white text-xs px-3 py-1 rounded-full border-0`}>
            {categoryLabels[detail.category]}
          </Badge>
          <Text className="text-gray-500 text-xs">{detail.source}</Text>
          <Text className="text-gray-600 text-xs">•</Text>
          <Text className="text-gray-500 text-xs">{detail.publishTime}</Text>
        </View>

        {/* Summary Card */}
        <Card className="mb-4 bg-gray-900 border-gray-800 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-300 text-sm flex items-center gap-2">
              <FileText size={16} color="#8b5cf6" />
              摘要
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Text className="text-gray-400 text-sm leading-relaxed">{detail.summary}</Text>
          </CardContent>
        </Card>

        {/* Content Card */}
        {detail.content && detail.content !== detail.summary && (
          <Card className="mb-4 bg-gray-900 border-gray-800 rounded-2xl">
            <CardContent className="py-4">
              <Text className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{detail.content}</Text>
            </CardContent>
          </Card>
        )}

        {/* AI Analysis */}
        {aiAnalysis ? (
          <Card className="mb-4 bg-gradient-to-r from-violet-600 to-purple-600 border-none rounded-2xl overflow-hidden relative">
            <View className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Sparkles size={16} color="#ffffff" />
                AI 智能解读
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              {/* Key Points */}
              <View className="mb-4">
                <View className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} color="#22d3ee" />
                  <Text className="text-cyan-300 text-xs font-semibold">关键要点</Text>
                </View>
                {aiAnalysis.keyPoints.map((point, idx) => (
                  <View key={idx} className="flex gap-2 mb-2">
                    <View className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    <Text className="text-gray-100 text-xs leading-relaxed">{point}</Text>
                  </View>
                ))}
              </View>

              {/* Impact */}
              <View className="mb-4">
                <View className="flex items-center gap-2 mb-2">
                  <Lightbulb size={14} color="#fbbf24" />
                  <Text className="text-amber-300 text-xs font-semibold">影响分析</Text>
                </View>
                <Text className="text-gray-100 text-xs leading-relaxed">{aiAnalysis.impact}</Text>
              </View>

              {/* Recommendation */}
              <View>
                <View className="flex items-center gap-2 mb-2">
                  <ChevronRight size={14} color="#34d399" />
                  <Text className="text-emerald-300 text-xs font-semibold">决策建议</Text>
                </View>
                <Text className="text-gray-100 text-xs leading-relaxed">{aiAnalysis.recommendation}</Text>
              </View>
            </CardContent>
          </Card>
        ) : (
          <Button
            className="w-full mb-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl h-12 border-0"
            onClick={generateAiAnalysis}
            disabled={aiLoading}
          >
            <View className="flex items-center gap-2">
              <Sparkles size={18} color="#ffffff" />
              <Text className="font-medium">{aiLoading ? 'AI 分析中...' : 'AI 智能解读'}</Text>
            </View>
          </Button>
        )}

        <Separator className="my-5 bg-gray-800" />

        {/* Related News */}
        {detail.relatedNews && detail.relatedNews.length > 0 && (
          <View>
            <Text className="text-white text-base font-semibold mb-4">相关推荐</Text>
            {detail.relatedNews.map((news, idx) => (
              <Card key={idx} className="mb-3 bg-gray-900 border-gray-800 rounded-2xl overflow-hidden">
                <CardContent className="py-4 px-4">
                  <Text className="text-gray-200 text-sm mb-2 leading-relaxed">{news.title}</Text>
                  <View className="flex items-center gap-2">
                    <Text className="text-gray-500 text-xs">{news.source}</Text>
                    <Text className="text-gray-600 text-xs">•</Text>
                    <Text className="text-gray-500 text-xs">{news.publishTime}</Text>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions with Glass Effect */}
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
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #1f2937'
        }}
      >
        <Button
          className="flex-1 bg-gray-800 border-gray-700 text-gray-300 rounded-2xl h-12"
          onClick={handleBookmark}
        >
          <View className="flex items-center gap-2">
            <Bookmark size={18} color={isBookmarked ? '#8b5cf6' : '#9ca3af'} />
            <Text>{isBookmarked ? '已收藏' : '收藏'}</Text>
          </View>
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl h-12 border-0"
          onClick={handleShare}
        >
          <View className="flex items-center gap-2">
            <Share2 size={18} color="#ffffff" />
            <Text>分享</Text>
          </View>
        </Button>
      </View>
    </View>
  )
}

export default DetailPage
