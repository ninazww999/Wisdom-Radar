import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mail, MessageSquare } from 'lucide-react-taro'
import './index.css'

const FeedbackPage: FC = () => {
  const [feedback, setFeedback] = useState('')

  useLoad(() => {
    console.log('Feedback page loaded.')
  })

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }
    
    // 保存反馈到本地存储
    const feedbacks = Taro.getStorageSync('feedbacks') || []
    feedbacks.push({
      content: feedback,
      createdAt: new Date().toISOString()
    })
    Taro.setStorageSync('feedbacks', feedbacks)
    
    Taro.showToast({ title: '感谢您的反馈', icon: 'success' })
    setFeedback('')
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
        <Text className="text-white text-xl font-bold">意见反馈</Text>
      </View>

      {/* Content */}
      <View className="px-4 pt-4">
        <Card className="bg-neutral-900 border-neutral-800 rounded-xl mb-4">
          <CardContent className="py-4 px-4">
            <View className="flex items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                <MessageSquare size={20} color="#10a37f" />
              </View>
              <View>
                <Text className="text-white font-medium">我们重视您的声音</Text>
                <Text className="text-neutral-500 text-xs">您的反馈将帮助我们做得更好</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Feedback Input */}
        <Card className="bg-neutral-900 border-neutral-800 rounded-xl mb-4">
          <View className="px-4 py-3 border-b border-neutral-800">
            <Text className="text-neutral-400 text-sm">反馈内容</Text>
          </View>
          <CardContent className="py-4 px-4">
            <Textarea 
              className="bg-neutral-800 rounded-lg"
              style={{ minHeight: '120px' }}
              placeholder="请输入您的建议或问题..."
              value={feedback}
              onInput={(e) => setFeedback(e.detail.value)}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3"
          onClick={handleSubmit}
        >
          提交反馈
        </Button>

        {/* Contact */}
        <Card className="mt-4 bg-neutral-900 border-neutral-800 rounded-xl">
          <View className="flex items-center gap-3 px-4 py-3">
            <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
              <Mail size={18} color="#a3a3a3" />
            </View>
            <View>
              <Text className="text-neutral-200 text-sm">联系邮箱</Text>
              <Text className="text-neutral-500 text-xs">support@bawiton.com</Text>
            </View>
          </View>
        </Card>
      </View>
    </View>
  )
}

export default FeedbackPage
