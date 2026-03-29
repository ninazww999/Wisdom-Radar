import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  ChartBarBig,
  Hash,
  RefreshCw
} from 'lucide-react-taro'
import { Network } from '@/network'
import './index.css'

interface HotTopic {
  topic: string
  count: number
}

interface CategoryStat {
  category: string
  count: number
  percentage: number
}

interface WeeklyTrendItem {
  day: string
  count: number
}

interface StatsData {
  totalNews: number
  hotTopics: HotTopic[]
  categoryStats: CategoryStat[]
  weeklyTrend: WeeklyTrendItem[]
}

const AnalysisPage: FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useLoad(() => {
    console.log('Analysis page loaded.')
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await Network.request({
        url: '/api/news/stats',
        method: 'GET'
      })
      console.log('Stats response:', response)
      if (response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Fetch stats error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStats()
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
        className="px-4 pt-6 pb-4"
      >
        <View className="flex items-center justify-between">
          <View>
            <Text className="text-white text-xl font-bold">数据分析</Text>
            <Text className="text-neutral-500 text-sm mt-1">智界雷达数据洞察</Text>
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
      <ScrollView scrollY className="flex-1 px-4 pb-4">
        {/* Stats Overview */}
        <View className="flex gap-3 mb-4">
          <Card className="flex-1 bg-neutral-900 border-neutral-800 rounded-xl">
            <CardContent className="py-4 px-4">
              <Text className="text-neutral-500 text-xs mb-1">本周资讯</Text>
              {loading ? (
                <Skeleton className="h-8 w-16 bg-neutral-800" />
              ) : (
                <>
                  <Text className="text-white text-2xl font-bold">{stats?.totalNews || 0}</Text>
                  <View className="flex items-center gap-1 mt-1">
                    <TrendingUp size={12} color="#10a37f" />
                    <Text className="text-xs" style={{ color: '#10a37f' }}>实时数据</Text>
                  </View>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="flex-1 bg-neutral-900 border-neutral-800 rounded-xl">
            <CardContent className="py-4 px-4">
              <Text className="text-neutral-500 text-xs mb-1">热点话题</Text>
              {loading ? (
                <Skeleton className="h-8 w-16 bg-neutral-800" />
              ) : (
                <>
                  <Text className="text-white text-2xl font-bold">{stats?.hotTopics?.length || 0}</Text>
                  <View className="flex items-center gap-1 mt-1">
                    <Text className="text-neutral-500 text-xs">个热门话题</Text>
                  </View>
                </>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Category Stats */}
        <Card className="mb-4 bg-neutral-900 border-neutral-800 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">分类分布</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <View key={i} className="flex items-center justify-between py-2">
                  <Skeleton className="h-4 w-12 bg-neutral-800" />
                  <Skeleton className="h-4 w-20 bg-neutral-800" />
                </View>
              ))
            ) : (
              stats?.categoryStats?.map((stat, idx) => (
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
              ))
            )}
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
            {loading ? (
              <View className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-8 w-24 bg-neutral-800 rounded-lg" />
                ))}
              </View>
            ) : (
              <View className="flex flex-wrap gap-2">
                {stats?.hotTopics?.map((item, idx) => (
                  <Badge 
                    key={idx} 
                    className="bg-neutral-800 text-neutral-300 px-3 py-2 rounded-lg border-0"
                  >
                    <Text className="text-sm">{item.topic}</Text>
                    <Text className="text-neutral-600 text-xs ml-2">{item.count}</Text>
                  </Badge>
                ))}
              </View>
            )}
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
            {loading ? (
              <View className="flex items-end justify-between h-24 px-2">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <Skeleton key={i} className="h-16 w-6 bg-neutral-800 rounded-t" />
                ))}
              </View>
            ) : (
              <View className="flex items-end justify-between h-24 px-2">
                {stats?.weeklyTrend?.map((item, idx) => {
                  const maxCount = Math.max(...(stats?.weeklyTrend?.map(d => d.count) || [1]))
                  const height = (item.count / maxCount) * 100
                  return (
                    <View key={idx} className="flex flex-col items-center gap-1">
                      <View 
                        className="w-6 bg-neutral-700 rounded-t"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      />
                      <Text className="text-neutral-600 text-xs">{item.day}</Text>
                    </View>
                  )
                })}
              </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  )
}

export default AnalysisPage
