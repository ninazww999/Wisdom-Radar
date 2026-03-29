import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Lightbulb, 
  ChartBarBig, 
  FileChartPie,
  Zap
} from 'lucide-react-taro'
import { Network } from '@/network'
import './index.css'

interface TrendData {
  category: string
  count: number
  trend: 'up' | 'down' | 'stable'
  percentage: number
}

interface AnalysisData {
  period: string
  totalNews: number
  categoryDistribution: TrendData[]
  hotTopics: Array<{
    topic: string
    heat: number
    trend: 'up' | 'down' | 'stable'
  }>
  insights: string[]
  recommendations: string[]
}

const AnalysisPage: FC = () => {
  const [activeTab, setActiveTab] = useState('week')
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    console.log('Analysis page loaded.')
    fetchAnalysis()
  })

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      const response = await Network.request({
        url: '/api/analysis/trends',
        method: 'GET',
        data: { period: activeTab }
      })
      console.log('Fetch analysis response:', response)
      if (response.data) {
        setAnalysisData(response.data)
      }
    } catch (error) {
      console.error('Fetch analysis error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp size={14} color="#22c55e" />
    if (trend === 'down') return <TrendingDown size={14} color="#f43f5e" />
    return <Minus size={14} color="#6b7280" />
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-emerald-400'
    if (trend === 'down') return 'text-rose-400'
    return 'text-gray-400'
  }

  const getTrendBg = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'bg-emerald-500 bg-opacity-20'
    if (trend === 'down') return 'bg-rose-500 bg-opacity-20'
    return 'bg-gray-500 bg-opacity-20'
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

  return (
    <View className="min-h-screen bg-gray-950">
      {/* Header with Gradient */}
      <View className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 px-5 pt-6 pb-20 relative overflow-hidden">
        <View className="absolute -top-20 -right-20 w-40 h-40 bg-white bg-opacity-10 rounded-full" />
        <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-white bg-opacity-5 rounded-full" />
        
        <View className="relative z-10">
          <Text className="text-white text-xl font-bold">智能分析</Text>
          <Text className="text-violet-200 text-xs mt-1">行业趋势与决策建议</Text>
        </View>
      </View>

      {/* Content */}
      <View className="px-5 -mt-12 relative z-20">
        {/* Tabs */}
        <Card className="mb-4 bg-gray-900 border-gray-800 rounded-2xl shadow-xl p-1">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full bg-gray-800 rounded-xl">
              <TabsTrigger value="week" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">本周</TabsTrigger>
              <TabsTrigger value="month" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">本月</TabsTrigger>
              <TabsTrigger value="quarter" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">本季度</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {analysisData && (
          <>
            {/* Summary Card */}
            <Card className="mb-4 bg-gradient-to-r from-violet-600 to-purple-600 border-none rounded-2xl shadow-xl overflow-hidden relative">
              <View className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10" />
              <CardContent className="py-5 relative z-10">
                <View className="flex items-center justify-between">
                  <View>
                    <Text className="text-violet-200 text-xs">资讯总数</Text>
                    <Text className="text-white text-4xl font-bold mt-1">{analysisData.totalNews}</Text>
                    <Text className="text-violet-200 text-xs mt-1">{analysisData.period}</Text>
                  </View>
                  <View className="w-14 h-14 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                    <Zap size={28} color="#ffffff" />
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="mb-4 bg-gray-900 border-gray-800 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <FileChartPie size={16} color="#8b5cf6" />
                  分类分布
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisData.categoryDistribution.map((item, idx) => (
                  <View key={idx} className="flex items-center justify-between mb-3 last:mb-0">
                    <View className="flex items-center gap-3">
                      <Text className="text-gray-300 text-sm">{item.category}</Text>
                      <View className={`px-2 py-1 rounded-full ${getTrendBg(item.trend)}`}>
                        {getTrendIcon(item.trend)}
                      </View>
                    </View>
                    <View className="flex items-center gap-3">
                      <Text className="text-white font-semibold text-lg">{item.count}</Text>
                      <Text className={`text-xs font-medium ${getTrendColor(item.trend)}`}>
                        {item.trend === 'up' ? '+' : ''}{item.percentage}%
                      </Text>
                    </View>
                  </View>
                ))}
              </CardContent>
            </Card>

            {/* Hot Topics */}
            <Card className="mb-4 bg-gray-900 border-gray-800 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <ChartBarBig size={16} color="#8b5cf6" />
                  热门话题
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisData.hotTopics.map((topic, idx) => (
                  <View key={idx} className="flex items-center justify-between mb-3 last:mb-0">
                    <View className="flex items-center gap-3 flex-1">
                      <View className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold ${idx === 0 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : idx === 2 ? 'bg-gradient-to-r from-amber-700 to-amber-800' : 'bg-gray-700'}`}>
                        {idx + 1}
                      </View>
                      <Text className="text-gray-300 text-sm">{topic.topic}</Text>
                    </View>
                    <View className="flex items-center gap-2">
                      <View className={`px-2 py-1 rounded-full ${getTrendBg(topic.trend)}`}>
                        {getTrendIcon(topic.trend)}
                      </View>
                      <Text className="text-gray-500 text-xs">热度 {topic.heat}</Text>
                    </View>
                  </View>
                ))}
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="mb-4 bg-gray-900 border-gray-800 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Lightbulb size={16} color="#8b5cf6" />
                  关键洞察
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisData.insights.map((insight, idx) => (
                  <View key={idx} className="flex gap-3 mb-3 last:mb-0">
                    <View className="w-2 h-2 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                    <Text className="text-gray-400 text-sm leading-relaxed">{insight}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="mb-4 bg-gradient-to-r from-violet-600 to-purple-600 border-none rounded-2xl overflow-hidden relative">
              <View className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10" />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp size={16} color="#ffffff" />
                  决策建议
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 relative z-10">
                {analysisData.recommendations.map((rec, idx) => (
                  <View key={idx} className="flex gap-3 mb-3 last:mb-0">
                    <View className="w-6 h-6 rounded-lg bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                      <Text className="text-white text-xs font-bold">{idx + 1}</Text>
                    </View>
                    <Text className="text-gray-100 text-sm leading-relaxed">{rec}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </View>
    </View>
  )
}

export default AnalysisPage
