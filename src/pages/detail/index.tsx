import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShareButton } from '@/components/ui/share-button'
import { 
  ArrowLeft, 
  Bookmark,
  Sparkles,
  TrendingUp,
  Lightbulb,
  ExternalLink
} from 'lucide-react-taro'
import { Network } from '@/network'
import './index.css'

interface BawitonAnalysis {
  keyPoints: string[]
  bawitonImpact?: string
  bawitonInspiration?: string
  recommendation: string
}

interface NewsDetail {
  id: string
  title: string
  source: string
  publishTime: string
  category: 'policy' | 'industry' | 'technology' | 'market'
  summary: string
  content: string
  url?: string
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
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [bawitonAnalysis, setBawitonAnalysis] = useState<BawitonAnalysis | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useLoad(() => {
    console.log('Detail page loaded.')
  })

  // 分享给朋友
  useShareAppMessage(() => {
    if (!detail) {
      return {
        title: '智界雷达 - 具身智能资讯',
        path: '/pages/index/index',
        imageUrl: '/assets/share-cover.png'
      }
    }
    return {
      title: `【智界雷达】${detail.title}`,
      path: `/pages/detail/index?id=${detail.id}`,
      imageUrl: '/assets/share-cover.png'
    }
  })

  // 分享到朋友圈
  useShareTimeline(() => {
    if (!detail) {
      return {
        title: '智界雷达 - 具身智能资讯',
        query: '',
        imageUrl: '/assets/share-cover.png'
      }
    }
    return {
      title: `【智界雷达】${detail.title}`,
      query: `id=${detail.id}`,
      imageUrl: '/assets/share-cover.png'
    }
  })

  useEffect(() => {
    const { id } = router.params
    if (id) {
      fetchDetail(id)
    }
  }, [router.params])

  // 详情加载完成后自动获取八维通洞察
  useEffect(() => {
    if (detail && !bawitonAnalysis && !analysisLoading) {
      fetchBawitonAnalysis()
    }
  }, [detail])

  // 检查是否已收藏
  useEffect(() => {
    if (detail) {
      const bookmarks = Taro.getStorageSync('bookmarks') || []
      const isExists = bookmarks.some((item: any) => item.id === detail.id)
      setIsBookmarked(isExists)
      
      // 添加到阅读历史
      addToReadingHistory(detail)
    }
  }, [detail])

  // 添加到阅读历史
  const addToReadingHistory = (news: NewsDetail) => {
    const history = Taro.getStorageSync('readingHistory') || []
    // 移除已存在的记录
    const filteredHistory = history.filter((item: any) => item.id !== news.id)
    // 添加到最前面
    const historyItem = {
      id: news.id,
      title: news.title,
      source: news.source,
      publishTime: news.publishTime,
      category: news.category,
      summary: news.summary,
      readAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    filteredHistory.unshift(historyItem)
    // 最多保留100条
    if (filteredHistory.length > 100) {
      filteredHistory.pop()
    }
    Taro.setStorageSync('readingHistory', filteredHistory)
  }

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

  const fetchBawitonAnalysis = async () => {
    if (!detail || bawitonAnalysis) return
    
    try {
      setAnalysisLoading(true)
      const response = await Network.request({
        url: '/api/news/analyze',
        method: 'POST',
        data: { 
          newsId: detail.id, 
          title: detail.title, 
          content: detail.content || detail.summary,
          category: detail.category 
        }
      })
      console.log('Bawiton analysis response:', response)
      if (response.data) {
        setBawitonAnalysis(response.data)
      }
    } catch (error) {
      console.error('Bawiton analysis error:', error)
    } finally {
      setAnalysisLoading(false)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleBookmark = () => {
    if (!detail) return
    
    const bookmarks = Taro.getStorageSync('bookmarks') || []
    const isExists = bookmarks.some((item: any) => item.id === detail.id)
    
    if (isExists) {
      // 取消收藏
      const newBookmarks = bookmarks.filter((item: any) => item.id !== detail.id)
      Taro.setStorageSync('bookmarks', newBookmarks)
      setIsBookmarked(false)
      Taro.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      // 添加收藏
      const bookmarkItem = {
        id: detail.id,
        title: detail.title,
        source: detail.source,
        publishTime: detail.publishTime,
        category: detail.category,
        summary: detail.summary,
        url: detail.url,
        bookmarkedAt: new Date().toISOString()
      }
      bookmarks.unshift(bookmarkItem)
      Taro.setStorageSync('bookmarks', bookmarks)
      setIsBookmarked(true)
      Taro.showToast({ title: '收藏成功', icon: 'success' })
    }
  }

  // 打开原文链接
  const handleOpenOriginal = () => {
    if (!detail?.url) {
      Taro.showToast({ title: '暂无原文链接', icon: 'none' })
      return
    }
    
    // 小程序端使用 webview 打开
    Taro.navigateTo({
      url: `/pages/webview/index?url=${encodeURIComponent(detail.url || '')}&title=${encodeURIComponent(detail.title)}`
    }).catch(() => {
      // 如果跳转失败（如页面不存在），使用复制链接
      Taro.setClipboardData({
        data: detail.url || '',
        success: () => {
          Taro.showToast({ title: '链接已复制', icon: 'success' })
        }
      })
    })
  }

  // 点击相关推荐新闻
  const handleRelatedNewsClick = (news: { id: string; title: string; source: string; publishTime: string }) => {
    // 存储新闻信息到 Storage，供详情页使用
    Taro.setStorageSync('currentNews', {
      id: news.id,
      title: news.title,
      source: news.source,
      publishTime: news.publishTime,
      summary: news.title, // 用标题作为摘要
      category: 'industry' // 默认分类
    })
    
    // 跳转到详情页
    Taro.navigateTo({
      url: `/pages/detail/index?id=${news.id}`
    })
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
      {/* Header - Glass Style */}
      <View 
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
        className="px-4 py-4"
      >
        <View className="flex items-center gap-4">
          <View 
            className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center"
            onClick={handleBack}
          >
            <ArrowLeft size={20} color="#a3a3a3" />
          </View>
          <Text className="flex-1 text-white font-medium">资讯详情</Text>
        </View>
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

        {/* Content */}
        {detail.content && (
          <View className="mb-6">
            <Text className="text-neutral-300 text-sm font-medium mb-3 block">原文内容</Text>
            <Text className="text-neutral-400 text-base leading-relaxed whitespace-pre-wrap">{detail.content}</Text>
          </View>
        )}

        {/* Bawiton Analysis Card */}
        <View className="mb-6">
          <Card className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            {/* Card Header */}
            <View className="px-4 py-3 border-b border-neutral-800 flex items-center gap-2">
              <Sparkles size={16} color="#10a37f" />
              <Text className="text-white font-medium">
                {detail.category === 'policy' ? '对八维通的影响' : '对八维通的启发'}
              </Text>
            </View>
            
            {analysisLoading ? (
              <CardContent className="pt-4">
                <View className="flex items-center justify-center py-8">
                  <Text className="text-neutral-500 text-sm">AI 正在分析中...</Text>
                </View>
              </CardContent>
            ) : bawitonAnalysis ? (
              <CardContent className="pt-4">
                {/* Key Points */}
                <View className="mb-4">
                  <View className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} color="#10a37f" />
                    <Text className="text-neutral-300 text-sm font-medium">关键要点</Text>
                  </View>
                  {bawitonAnalysis.keyPoints.map((point, idx) => (
                    <View key={idx} className="flex gap-2 mb-2">
                      <View className="w-2 h-2 rounded-full bg-neutral-600 mt-2 flex-shrink-0" />
                      <Text className="text-neutral-400 text-sm leading-relaxed">{point}</Text>
                    </View>
                  ))}
                </View>

                {/* Bawiton Impact/Inspiration */}
                {bawitonAnalysis.bawitonImpact && (
                  <View className="mb-4">
                    <View className="flex items-center gap-2 mb-2">
                      <Lightbulb size={14} color="#10a37f" />
                      <Text className="text-neutral-300 text-sm font-medium">影响分析</Text>
                    </View>
                    <Text className="text-neutral-400 text-sm leading-relaxed">{bawitonAnalysis.bawitonImpact}</Text>
                  </View>
                )}

                {bawitonAnalysis.bawitonInspiration && (
                  <View className="mb-4">
                    <View className="flex items-center gap-2 mb-2">
                      <Lightbulb size={14} color="#10a37f" />
                      <Text className="text-neutral-300 text-sm font-medium">启发分析</Text>
                    </View>
                    <Text className="text-neutral-400 text-sm leading-relaxed">{bawitonAnalysis.bawitonInspiration}</Text>
                  </View>
                )}

                {/* Recommendation */}
                <View>
                  <View className="flex items-center gap-2 mb-2">
                    <View className="w-4 h-4 flex items-center justify-center">
                      <View className="w-2 h-2 rounded-full bg-neutral-500" />
                    </View>
                    <Text className="text-neutral-300 text-sm font-medium">决策建议</Text>
                  </View>
                  <Text className="text-neutral-400 text-sm leading-relaxed">{bawitonAnalysis.recommendation}</Text>
                </View>
              </CardContent>
            ) : (
              <CardContent className="pt-4">
                <View className="flex items-center justify-center py-8">
                  <Text className="text-neutral-500 text-sm">暂无洞察分析</Text>
                </View>
              </CardContent>
            )}
          </Card>
        </View>

        {/* Related News */}
        {detail.relatedNews && detail.relatedNews.length > 0 && (
          <View className="mt-6 pt-6 border-t border-neutral-900">
            <Text className="text-white font-medium mb-4">相关推荐</Text>
            {detail.relatedNews.map((news, idx) => (
              <Card 
                key={idx} 
                className="mb-3 bg-neutral-900 border-neutral-800 rounded-xl overflow-hidden"
                onClick={() => handleRelatedNewsClick(news)}
              >
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
        {/* 查看原文 */}
        <Button
          className="flex-1 bg-neutral-900 border-neutral-800 text-white rounded-xl h-12"
          onClick={handleOpenOriginal}
        >
          <View className="flex items-center gap-2">
            <ExternalLink size={18} color="#a3a3a3" />
            <Text className="text-neutral-300">原文</Text>
          </View>
        </Button>
        {/* 微信小程序分享按钮 */}
        <ShareButton
          className="flex-1 bg-white text-black rounded-xl h-12 border-0 flex items-center justify-center"
          style={{ padding: 0, lineHeight: '48px' }}
        >
          <Text className="font-medium text-black">分享</Text>
        </ShareButton>
      </View>
    </View>
  )
}

export default DetailPage
