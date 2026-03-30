import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { 
  User, 
  Bell, 
  Clock, 
  ChevronRight,
  LogOut,
  Mail,
  Shield
} from 'lucide-react-taro'
import './index.css'

interface UserProfile {
  nickname: string
  notificationEnabled: boolean
}

const ProfilePage: FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    nickname: '用户',
    notificationEnabled: true
  })

  useLoad(() => {
    console.log('Profile page loaded.')
  })

  const handleNotificationToggle = (enabled: boolean) => {
    setProfile({ ...profile, notificationEnabled: enabled })
  }

  const handleLogout = () => {
    console.log('Logout clicked')
  }

  const handleReadingHistory = () => {
    Taro.navigateTo({
      url: '/pages/history/index'
    })
  }

  const handlePrivacy = () => {
    Taro.navigateTo({
      url: '/pages/privacy/index'
    })
  }

  const handleFeedback = () => {
    Taro.navigateTo({
      url: '/pages/feedback/index'
    })
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
        <Text className="text-white text-xl font-bold">我的</Text>
      </View>

      {/* Content */}
      <View className="px-4">
        {/* User Card */}
        <Card className="mb-4 bg-neutral-900 border-neutral-800 rounded-xl">
          <CardContent className="py-4 px-4">
            <View className="flex items-center gap-4">
              <View className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center">
                <User size={24} color="#a3a3a3" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium">{profile.nickname}</Text>
                <Text className="text-neutral-500 text-sm">智界雷达</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="mb-4 bg-neutral-900 border-neutral-800 rounded-xl">
          <View className="px-4 py-3 border-b border-neutral-800">
            <Text className="text-white font-medium">设置</Text>
          </View>
          <View>
            {/* Notification */}
            <View className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <View className="flex items-center gap-3">
                <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Bell size={18} color="#a3a3a3" />
                </View>
                <View>
                  <Text className="text-neutral-200 text-sm">推送通知</Text>
                  <Text className="text-neutral-600 text-xs">每日资讯推送</Text>
                </View>
              </View>
              <Switch 
                checked={profile.notificationEnabled}
                onCheckedChange={handleNotificationToggle}
              />
            </View>

            {/* Reading History */}
            <View 
              className="flex items-center justify-between px-4 py-3 border-b border-neutral-800"
              onClick={handleReadingHistory}
            >
              <View className="flex items-center gap-3">
                <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Clock size={18} color="#a3a3a3" />
                </View>
                <Text className="text-neutral-200 text-sm">阅读历史</Text>
              </View>
              <ChevronRight size={18} color="#525252" />
            </View>

            {/* Privacy */}
            <View 
              className="flex items-center justify-between px-4 py-3 border-b border-neutral-800"
              onClick={handlePrivacy}
            >
              <View className="flex items-center gap-3">
                <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Shield size={18} color="#a3a3a3" />
                </View>
                <Text className="text-neutral-200 text-sm">隐私设置</Text>
              </View>
              <ChevronRight size={18} color="#525252" />
            </View>

            {/* Feedback */}
            <View 
              className="flex items-center justify-between px-4 py-3"
              onClick={handleFeedback}
            >
              <View className="flex items-center gap-3">
                <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Mail size={18} color="#a3a3a3" />
                </View>
                <Text className="text-neutral-200 text-sm">意见反馈</Text>
              </View>
              <ChevronRight size={18} color="#525252" />
            </View>
          </View>
        </Card>

        {/* Logout */}
        <Card className="mb-4 bg-neutral-900 border-neutral-800 rounded-xl overflow-hidden">
          <View 
            className="flex items-center justify-center px-4 py-3"
            onClick={handleLogout}
          >
            <LogOut size={18} color="#ef4444" />
            <Text className="text-red-500 text-sm ml-2">退出登录</Text>
          </View>
        </Card>

        {/* Version */}
        <View className="flex items-center justify-center py-6">
          <Text className="text-neutral-700 text-xs">版本 1.0.0</Text>
        </View>
      </View>
    </View>
  )
}

export default ProfilePage
