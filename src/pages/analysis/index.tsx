import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Lightbulb, ChartBarBig, FileChartPie } from 'lucide-react-taro'
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
    if (trend === 'down') return <TrendingDown size={14} color="#ef4444" />
    return <Minus size={14} color="#9ca3af" />
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-500'
    if (trend === 'down') return 'text-red-500'
    return 'text-gray-500'
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

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="block text-lg font-bold text-gray-900">智能分析</Text>
        <Text className="block text-xs text-gray-500 mt-1">行业趋势与决策建议</Text>
      </View>

      {/* Tabs */}
      <View className="bg-white px-4 py-2 border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full">
            <TabsTrigger value="week" className="flex-1">本周</TabsTrigger>
            <TabsTrigger value="month" className="flex-1">本月</TabsTrigger>
            <TabsTrigger value="quarter" className="flex-1">本季度</TabsTrigger>
          </TabsList>
        </Tabs>
      </View>

      {/* Content */}
      <ScrollView scrollY className="flex-1 p-4">
        {analysisData && (
          <>
            {/* Summary */}
            <Card className="mb-4">
              <CardContent className="pt-4">
                <View className="flex items-center justify-between mb-2">
                  <Text className="text-sm text-gray-600">资讯总数</Text>
                  <Text className="text-2xl font-bold text-blue-600">{analysisData.totalNews}</Text>
                </View>
                <Text className="text-xs text-gray-500">统计周期：{analysisData.period}</Text>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <FileChartPie size={16} color="#2563eb" />
                  分类分布
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisData.categoryDistribution.map((item, idx) => (
                  <View key={idx} className="flex items-center justify-between mb-3 last:mb-0">
                    <View className="flex items-center gap-2">
                      <Text className="text-sm text-gray-700">{item.category}</Text>
                      {getTrendIcon(item.trend)}
                    </View>
                    <View className="flex items-center gap-2">
                      <Text className="text-sm font-semibold text-gray-900">{item.count}</Text>
                      <Text className={`text-xs ${getTrendColor(item.trend)}`}>
                        {item.trend === 'up' ? '+' : ''}{item.percentage}%
                      </Text>
                    </View>
                  </View>
                ))}
              </CardContent>
            </Card>

            {/* Hot Topics */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <ChartBarBig size={16} color="#2563eb" />
                  热门话题
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisData.hotTopics.map((topic, idx) => (
                  <View key={idx} className="flex items-center justify-between mb-2 last:mb-0">
                    <View className="flex items-center gap-2 flex-1">
                      <Badge className="bg-blue-100 text-blue-600 text-xs">TOP{idx + 1}</Badge>
                      <Text className="text-sm text-gray-700">{topic.topic}</Text>
                    </View>
                    <View className="flex items-center gap-1">
                      {getTrendIcon(topic.trend)}
                      <Text className="text-xs text-gray-500">热度 {topic.heat}</Text>
                    </View>
                  </View>
                ))}
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <Lightbulb size={16} color="#2563eb" />
                  关键洞察
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisData.insights.map((insight, idx) => (
                  <View key={idx} className="flex gap-2 mb-2 last:mb-0">
                    <View className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <Text className="text-sm text-gray-600 leading-relaxed">{insight}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                  <TrendingUp size={16} color="#2563eb" />
                  决策建议
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisData.recommendations.map((rec, idx) => (
                  <View key={idx} className="flex gap-2 mb-2 last:mb-0">
                    <View className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Text className="text-xs text-white font-bold">{idx + 1}</Text>
                    </View>
                    <Text className="text-sm text-gray-700 leading-relaxed">{rec}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  )
}

export default AnalysisPage
