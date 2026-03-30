import { View, Text } from '@tarojs/components'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Trash2 } from 'lucide-react-taro'
import './index.css'

interface HistoryItem {
  id: string
  title: string
  source: string
  publishTime: string
  category: 'policy' | 'industry' | 'technology' | 'market'
  summary: string
  readAt: string
}

const categoryLabels: Record<string, string> = {
  policy: '政策',
  industry: '行业',
  technology: '技术',
  market: '市场'
}

const HistoryPage: FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useLoad(() => {
    console.log('History page loaded.')
  })

  useDidShow(() => {
    loadHistory()
  })

  const loadHistory = () => {
    const savedHistory = Taro.getStorageSync('readingHistory') || []
    setHistory(savedHistory)
  }

  const handleItemClick = (item: HistoryItem) => {
    Taro.setStorageSync('currentNews', item)
    Taro.navigateTo({
      url: `/pages/detail/index?id=${item.id}`
    })
  }

  const handleClearHistory = () => {
    Taro.showModal({
      title: '清空历史',
      content: '确定要清空所有阅读历史吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('readingHistory')
          setHistory([])
          Taro.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className="min-h-screen bg-black">
      {/* Header */}
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
          <Text className="text-white text-xl font-bold">阅读历史</Text>
          {history.length > 0 && (
            <View 
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-neutral-800"
              onClick={handleClearHistory}
            >
              <Trash2 size={14} color="#a3a3a3" />
              <Text className="text-neutral-400 text-xs">清空</Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View className="px-4 pt-4">
        {history.length > 0 ? (
          <Card className="bg-neutral-900 border-neutral-800 rounded-xl">
            {history.map((item, idx) => (
              <View 
                key={idx} 
                className="flex items-start justify-between px-4 py-3 border-b border-neutral-800 last:border-b-0"
                onClick={() => handleItemClick(item)}
              >
                <View className="flex-1 mr-3">
                  <Text className="text-neutral-200 text-sm mb-1 leading-relaxed line-clamp-2">{item.title}</Text>
                  <View className="flex items-center gap-2 mt-2">
                    <Badge className="bg-neutral-800 text-neutral-400 text-xs px-2 py-1 rounded border-0">
                      {categoryLabels[item.category]}
                    </Badge>
                    <Text className="text-neutral-600 text-xs">{item.source}</Text>
                  </View>
                  <View className="flex items-center gap-1 mt-2">
                    <Clock size={12} color="#525252" />
                    <Text className="text-neutral-600 text-xs">{item.readAt}</Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
              <Clock size={32} color="#525252" />
            </View>
            <Text className="text-neutral-500 text-sm">暂无阅读历史</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default HistoryPage
