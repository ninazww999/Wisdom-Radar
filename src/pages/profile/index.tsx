import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  User, 
  Bell, 
  Bookmark, 
  Clock, 
  ChevronRight,
  LogOut,
  Mail,
  Shield
} from 'lucide-react-taro'
import './index.css'

interface UserProfile {
  nickname: string
  avatar: string
  subscribedCategories: string[]
  notificationEnabled: boolean
  readingHistory: Array<{
    id: string
    title: string
    readTime: string
  }>
}

const ProfilePage: FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    nickname: '董事长',
    avatar: '',
    subscribedCategories: ['policy', 'industry', 'technology', 'market'],
    notificationEnabled: true,
    readingHistory: [
      { id: '1', title: '工信部发布具身智能发展指导意见', readTime: '2024-01-15' },
      { id: '2', title: '特斯拉Optimus机器人最新进展', readTime: '2024-01-14' },
      { id: '3', title: '空间计算技术路线图发布', readTime: '2024-01-13' }
    ]
  })

  const categoryLabels: Record<string, string> = {
    policy: '政策动态',
    industry: '行业动态',
    technology: '技术进展',
    market: '市场分析'
  }

  useLoad(() => {
    console.log('Profile page loaded.')
  })

  const handleNotificationToggle = (enabled: boolean) => {
    setProfile({ ...profile, notificationEnabled: enabled })
  }

  const handleLogout = () => {
    console.log('Logout clicked')
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-b from-blue-600 to-blue-500 px-4 py-6">
        <View className="flex items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            <User size={32} color="#2563eb" />
          </View>
          <View className="flex-1">
            <Text className="block text-xl font-bold text-white">{profile.nickname}</Text>
            <Text className="block text-xs text-blue-100 mt-1">具身智能资讯助手</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView scrollY className="flex-1 p-4">
        {/* Subscription Management */}
        <Card className="mb-4">
          <View className="px-4 py-3 border-b border-gray-200">
            <Text className="text-base font-semibold text-gray-900">订阅管理</Text>
          </View>
          <CardContent className="pt-4">
            <Text className="text-xs text-gray-500 mb-3">已订阅的分类（每日推送）</Text>
            <View className="flex flex-wrap gap-2">
              {profile.subscribedCategories.map((cat) => (
                <Badge 
                  key={cat} 
                  className="bg-blue-100 text-blue-600 hover:bg-blue-200"
                >
                  {categoryLabels[cat]}
                </Badge>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="mb-4">
          <View className="px-4 py-3 border-b border-gray-200">
            <Text className="text-base font-semibold text-gray-900">设置</Text>
          </View>
          <View>
            {/* Notification */}
            <View className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <View className="flex items-center gap-3">
                <Bell size={20} color="#6b7280" />
                <View>
                  <Text className="text-sm text-gray-700">推送通知</Text>
                  <Text className="text-xs text-gray-500">每日资讯推送提醒</Text>
                </View>
              </View>
              <Switch 
                checked={profile.notificationEnabled}
                onCheckedChange={handleNotificationToggle}
              />
            </View>

            {/* Reading History */}
            <View className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <View className="flex items-center gap-3">
                <Clock size={20} color="#6b7280" />
                <Text className="text-sm text-gray-700">阅读历史</Text>
              </View>
              <ChevronRight size={16} color="#9ca3af" />
            </View>

            {/* Bookmarks */}
            <View className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <View className="flex items-center gap-3">
                <Bookmark size={20} color="#6b7280" />
                <Text className="text-sm text-gray-700">我的收藏</Text>
              </View>
              <ChevronRight size={16} color="#9ca3af" />
            </View>

            {/* Privacy */}
            <View className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <View className="flex items-center gap-3">
                <Shield size={20} color="#6b7280" />
                <Text className="text-sm text-gray-700">隐私设置</Text>
              </View>
              <ChevronRight size={16} color="#9ca3af" />
            </View>

            {/* Feedback */}
            <View className="flex items-center justify-between px-4 py-3">
              <View className="flex items-center gap-3">
                <Mail size={20} color="#6b7280" />
                <Text className="text-sm text-gray-700">意见反馈</Text>
              </View>
              <ChevronRight size={16} color="#9ca3af" />
            </View>
          </View>
        </Card>

        {/* Recent Reading */}
        <Card className="mb-4">
          <View className="px-4 py-3 border-b border-gray-200">
            <Text className="text-base font-semibold text-gray-900">最近阅读</Text>
          </View>
          <View>
            {profile.readingHistory.map((item, idx) => (
              <View 
                key={idx} 
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="text-sm text-gray-700 mb-1">{item.title}</Text>
                  <Text className="text-xs text-gray-500">{item.readTime}</Text>
                </View>
                <ChevronRight size={16} color="#9ca3af" />
              </View>
            ))}
          </View>
        </Card>

        {/* Logout */}
        <Card className="mb-4">
          <View 
            className="flex items-center justify-center px-4 py-3"
            onClick={handleLogout}
          >
            <LogOut size={20} color="#ef4444" />
            <Text className="text-sm text-red-500 ml-2">退出登录</Text>
          </View>
        </Card>

        {/* Version */}
        <View className="flex items-center justify-center py-4">
          <Text className="text-xs text-gray-400">版本 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default ProfilePage
