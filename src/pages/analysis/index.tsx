import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  ChartBarBig,
  Hash
} from 'lucide-react-taro'
import './index.css'

const hotTopics = [
  { topic: '人形机器人', count: 128 },
  { topic: '具身智能', count: 95 },
  { topic: '空间计算', count: 78 },
  { topic: '多模态大模型', count: 65 },
  { topic: '机器人操作系统', count: 52 },
  { topic: '智能感知', count: 48 },
  { topic: '运动控制', count: 42 },
  { topic: '产业政策', count: 38 }
]

const categoryStats = [
  { category: '政策', count: 45, percentage: 25 },
  { category: '行业', count: 68, percentage: 38 },
  { category: '技术', count: 42, percentage: 23 },
  { category: '市场', count: 25, percentage: 14 }
]

const weeklyTrend = [
  { date: '周一', count: 28 },
  { date: '周二', count: 35 },
  { date: '周三', count: 42 },
  { date: '周四', count: 38 },
  { date: '周五', count: 45 },
  { date: '周六', count: 32 },
  { date: '周日', count: 25 }
]

const AnalysisPage: FC = () => {
  useLoad(() => {
    console.log('Analysis page loaded.')
  })

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
        className="px-4 pt-6 pb-4"
      >
        <Text className="text-white text-xl font-bold">数据分析</Text>
        <Text className="text-neutral-500 text-sm mt-1">智界雷达数据洞察</Text>
      </View>

      {/* Content */}
      <ScrollView scrollY className="flex-1 px-4 pb-4">
        {/* Stats Overview */}
        <View className="flex gap-3 mb-4">
          <Card className="flex-1 bg-neutral-900 border-neutral-800 rounded-xl">
            <CardContent className="py-4 px-4">
              <Text className="text-neutral-500 text-xs mb-1">本周资讯</Text>
              <Text className="text-white text-2xl font-bold">245</Text>
              <View className="flex items-center gap-1 mt-1">
                <TrendingUp size={12} color="#10a37f" />
                <Text className="text-xs" style={{ color: '#10a37f' }}>+12%</Text>
              </View>
            </CardContent>
          </Card>
          <Card className="flex-1 bg-neutral-900 border-neutral-800 rounded-xl">
            <CardContent className="py-4 px-4">
              <Text className="text-neutral-500 text-xs mb-1">热点话题</Text>
              <Text className="text-white text-2xl font-bold">18</Text>
              <View className="flex items-center gap-1 mt-1">
                <Text className="text-neutral-500 text-xs">个热门话题</Text>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Category Stats */}
        <Card className="mb-4 bg-neutral-900 border-neutral-800 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">分类分布</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {categoryStats.map((stat, idx) => (
              <View key={idx} className="flex items-center justify-between py-2">
                <Text className="text-neutral-400 text-sm">{stat.category}</Text>
                <View className="flex items-center gap-3">
                  <View className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <View 
                      className="h-full bg-white rounded-full" 
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </View>
                  <Text className="text-neutral-500 text-xs w-12 text-right">{stat.count} 篇</Text>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Hot Topics */}
        <Card className="mb-4 bg-neutral-900 border-neutral-800 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Hash size={16} color="#10a37f" />
              热门话题
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <View className="flex flex-wrap gap-2">
              {hotTopics.map((item, idx) => (
                <Badge 
                  key={idx} 
                  className="bg-neutral-800 text-neutral-300 px-3 py-2 rounded-lg border-0"
                >
                  <Text className="text-sm">{item.topic}</Text>
                  <Text className="text-neutral-600 text-xs ml-2">{item.count}</Text>
                </Badge>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card className="mb-4 bg-neutral-900 border-neutral-800 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <ChartBarBig size={16} color="#10a37f" />
              本周趋势
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <View className="flex items-end justify-between h-24 px-2">
              {weeklyTrend.map((item, idx) => {
                const maxCount = Math.max(...weeklyTrend.map(d => d.count))
                const height = (item.count / maxCount) * 100
                return (
                  <View key={idx} className="flex flex-col items-center gap-1">
                    <View 
                      className="w-6 bg-neutral-700 rounded-t"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    <Text className="text-neutral-600 text-xs">{item.date}</Text>
                  </View>
                )
              })}
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  )
}

export default AnalysisPage
