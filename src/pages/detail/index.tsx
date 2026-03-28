import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Bookmark, Share2, Sparkles, FileText } from 'lucide-react-taro'
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
  policy: 'bg-red-500',
  industry: 'bg-orange-500',
  technology: 'bg-green-500',
  market: 'bg-purple-500'
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
    } catch (error) {
      console.error('Fetch detail error:', error)
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
        data: { newsId: detail.id, title: detail.title, content: detail.content }
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

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = () => {
    console.log('Share clicked')
  }

  if (loading) {
    return (
      <View className="flex flex-col h-full bg-gray-50">
        <View className="flex items-center justify-center h-96">
          <Text className="text-gray-400">加载中...</Text>
        </View>
      </View>
    )
  }

  if (!detail) {
    return (
      <View className="flex flex-col h-full bg-gray-50">
        <View className="flex items-center justify-center h-96">
          <Text className="text-gray-400">内容不存在</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex items-center border-b border-gray-200">
        <View className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft size={20} color="#6b7280" />
        </View>
        <Text className="flex-1 text-center text-base font-semibold text-gray-900">资讯详情</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Content */}
      <ScrollView scrollY className="flex-1">
        <View className="p-4">
          {/* Title */}
          <Text className="block text-xl font-bold text-gray-900 mb-3">{detail.title}</Text>
          
          {/* Meta */}
          <View className="flex items-center gap-2 mb-4">
            <Badge className={`${categoryColors[detail.category]} text-white text-xs`}>
              {categoryLabels[detail.category]}
            </Badge>
            <Text className="text-xs text-gray-500">{detail.source}</Text>
            <Text className="text-xs text-gray-400">·</Text>
            <Text className="text-xs text-gray-500">{detail.publishTime}</Text>
          </View>

          {/* Summary */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                <FileText size={16} color="#2563eb" />
                摘要
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Text className="text-sm text-gray-600 leading-relaxed">{detail.summary}</Text>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="mb-4">
            <CardContent className="pt-4">
              <Text className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{detail.content}</Text>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {aiAnalysis ? (
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                  <Sparkles size={16} color="#2563eb" />
                  AI 智能解读
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <View>
                  <Text className="text-xs text-blue-600 font-semibold mb-1">关键要点</Text>
                  {aiAnalysis.keyPoints.map((point, idx) => (
                    <Text key={idx} className="block text-xs text-gray-600 mb-1">• {point}</Text>
                  ))}
                </View>
                <View>
                  <Text className="text-xs text-blue-600 font-semibold mb-1">影响分析</Text>
                  <Text className="text-xs text-gray-600">{aiAnalysis.impact}</Text>
                </View>
                <View>
                  <Text className="text-xs text-blue-600 font-semibold mb-1">决策建议</Text>
                  <Text className="text-xs text-gray-600">{aiAnalysis.recommendation}</Text>
                </View>
              </CardContent>
            </Card>
          ) : (
            <Button
              className="w-full mb-4 bg-blue-600 text-white"
              onClick={generateAiAnalysis}
              disabled={aiLoading}
            >
              <View className="flex items-center gap-2">
                <Sparkles size={16} color="#ffffff" />
                <Text>{aiLoading ? 'AI 分析中...' : 'AI 智能解读'}</Text>
              </View>
            </Button>
          )}

          <Separator className="my-4" />

          {/* Related News */}
          {detail.relatedNews.length > 0 && (
            <View>
              <Text className="block text-base font-semibold text-gray-900 mb-3">相关推荐</Text>
              {detail.relatedNews.map((news, idx) => (
                <Card key={idx} className="mb-2">
                  <CardContent className="py-3">
                    <Text className="text-sm text-gray-700 mb-1">{news.title}</Text>
                    <View className="flex items-center gap-2">
                      <Text className="text-xs text-gray-500">{news.source}</Text>
                      <Text className="text-xs text-gray-400">·</Text>
                      <Text className="text-xs text-gray-500">{news.publishTime}</Text>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </View>
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
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e5e7eb'
        }}
      >
        <Button
          className="flex-1 bg-white border border-gray-300 text-gray-700"
          onClick={handleBookmark}
        >
          <View className="flex items-center gap-2">
            <Bookmark size={16} color={isBookmarked ? '#2563eb' : '#6b7280'} />
            <Text>{isBookmarked ? '已收藏' : '收藏'}</Text>
          </View>
        </Button>
        <Button
          className="flex-1 bg-blue-600 text-white"
          onClick={handleShare}
        >
          <View className="flex items-center gap-2">
            <Share2 size={16} color="#ffffff" />
            <Text>分享</Text>
          </View>
        </Button>
      </View>
    </View>
  )
}

export default DetailPage
