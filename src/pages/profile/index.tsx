import { View, Text } from '@tarojs/components'
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
  Shield,
  Sparkles
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
    policy: '政策',
    industry: '行业',
    technology: '技术',
    market: '市场'
  }

  const categoryGradients: Record<string, string> = {
    policy: 'from-rose-500 to-pink-500',
    industry: 'from-amber-500 to-orange-500',
    technology: 'from-emerald-500 to-teal-500',
    market: 'from-violet-500 to-purple-500'
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
    <View className="min-h-screen bg-gray-950">
      {/* Header with Gradient */}
      <View className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 px-5 pt-8 pb-24 relative overflow-hidden">
        {/* Decorative circles */}
        <View className="absolute -top-20 -right-20 w-40 h-40 bg-white bg-opacity-10 rounded-full" />
        <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-white bg-opacity-5 rounded-full" />
        
        <View className="flex items-center gap-4 relative z-10">
          <View className="w-16 h-16 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center border border-white border-opacity-30">
            <User size={32} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">{profile.nickname}</Text>
            <View className="flex items-center gap-2 mt-1">
              <Sparkles size={12} color="#fbbf24" />
              <Text className="text-violet-200 text-xs">具身智能资讯助手</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="px-5 -mt-12 relative z-20">
        {/* Subscription Management */}
        <Card className="mb-4 bg-gray-900 border-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <View className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <Text className="text-white font-semibold">订阅管理</Text>
            <View className="px-3 py-1 rounded-full bg-violet-500 bg-opacity-20">
              <Text className="text-violet-400 text-xs">{profile.subscribedCategories.length} 项</Text>
            </View>
          </View>
          <CardContent className="pt-4">
            <Text className="text-gray-500 text-xs mb-3">已订阅的分类（每日推送）</Text>
            <View className="flex flex-wrap gap-2">
              {profile.subscribedCategories.map((cat) => (
                <Badge 
                  key={cat} 
                  className={`bg-gradient-to-r ${categoryGradients[cat]} text-white px-3 py-1 rounded-full border-0 text-xs`}
                >
                  {categoryLabels[cat]}
                </Badge>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="mb-4 bg-gray-900 border-gray-800 rounded-2xl overflow-hidden">
          <View className="px-5 py-4 border-b border-gray-800">
            <Text className="text-white font-semibold">设置</Text>
          </View>
          <View>
            {/* Notification */}
            <View className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <View className="flex items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                  <Bell size={18} color="#ffffff" />
                </View>
                <View>
                  <Text className="text-gray-200 text-sm">推送通知</Text>
                  <Text className="text-gray-500 text-xs">每日资讯推送提醒</Text>
                </View>
              </View>
              <Switch 
                checked={profile.notificationEnabled}
                onCheckedChange={handleNotificationToggle}
              />
            </View>

            {/* Reading History */}
            <View className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <View className="flex items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                  <Clock size={18} color="#ffffff" />
                </View>
                <Text className="text-gray-200 text-sm">阅读历史</Text>
              </View>
              <ChevronRight size={18} color="#6b7280" />
            </View>

            {/* Bookmarks */}
            <View className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <View className="flex items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Bookmark size={18} color="#ffffff" />
                </View>
                <Text className="text-gray-200 text-sm">我的收藏</Text>
              </View>
              <ChevronRight size={18} color="#6b7280" />
            </View>

            {/* Privacy */}
            <View className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <View className="flex items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Shield size={18} color="#ffffff" />
                </View>
                <Text className="text-gray-200 text-sm">隐私设置</Text>
              </View>
              <ChevronRight size={18} color="#6b7280" />
            </View>

            {/* Feedback */}
            <View className="flex items-center justify-between px-5 py-4">
              <View className="flex items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                  <Mail size={18} color="#ffffff" />
                </View>
                <Text className="text-gray-200 text-sm">意见反馈</Text>
              </View>
              <ChevronRight size={18} color="#6b7280" />
            </View>
          </View>
        </Card>

        {/* Recent Reading */}
        <Card className="mb-4 bg-gray-900 border-gray-800 rounded-2xl overflow-hidden">
          <View className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <Text className="text-white font-semibold">最近阅读</Text>
            <ChevronRight size={18} color="#6b7280" />
          </View>
          <View>
            {profile.readingHistory.map((item, idx) => (
              <View 
                key={idx} 
                className="flex items-center justify-between px-5 py-4 border-b border-gray-800 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="text-gray-200 text-sm mb-1 leading-relaxed">{item.title}</Text>
                  <Text className="text-gray-500 text-xs">{item.readTime}</Text>
                </View>
                <ChevronRight size={16} color="#4b5563" />
              </View>
            ))}
          </View>
        </Card>

        {/* Logout */}
        <Card className="mb-4 bg-gray-900 border-gray-800 rounded-2xl overflow-hidden">
          <View 
            className="flex items-center justify-center px-5 py-4"
            onClick={handleLogout}
          >
            <LogOut size={18} color="#f43f5e" />
            <Text className="text-rose-400 text-sm ml-2">退出登录</Text>
          </View>
        </Card>

        {/* Version */}
        <View className="flex items-center justify-center py-6">
          <Text className="text-gray-600 text-xs">版本 1.0.0</Text>
        </View>
      </View>
    </View>
  )
}

export default ProfilePage
