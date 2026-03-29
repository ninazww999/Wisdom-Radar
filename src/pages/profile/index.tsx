import { View, Text } from '@tarojs/components'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
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

interface BookmarkItem {
  id: string
  title: string
  source: string
  publishTime: string
  category: 'policy' | 'industry' | 'technology' | 'market'
  summary: string
  bookmarkedAt: string
}

interface UserProfile {
  nickname: string
  subscribedCategories: string[]
  notificationEnabled: boolean
}

const categoryLabels: Record<string, string> = {
  policy: '政策',
  industry: '行业',
  technology: '技术',
  market: '市场'
}

const ProfilePage: FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    nickname: '用户',
    subscribedCategories: ['policy', 'industry', 'technology', 'market'],
    notificationEnabled: true
  })
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])

  useLoad(() => {
    console.log('Profile page loaded.')
  })

  useDidShow(() => {
    // 每次显示页面时重新加载收藏列表
    loadBookmarks()
  })

  const loadBookmarks = () => {
    const savedBookmarks = Taro.getStorageSync('bookmarks') || []
    setBookmarks(savedBookmarks)
  }

  const handleNotificationToggle = (enabled: boolean) => {
    setProfile({ ...profile, notificationEnabled: enabled })
  }

  const handleLogout = () => {
    console.log('Logout clicked')
  }

  const handleBookmarkClick = (item: BookmarkItem) => {
    Taro.setStorageSync('currentNews', item)
    Taro.navigateTo({
      url: `/pages/detail/index?id=${item.id}`
    })
  }

  const handleRemoveBookmark = (id: string) => {
    const newBookmarks = bookmarks.filter(item => item.id !== id)
    Taro.setStorageSync('bookmarks', newBookmarks)
    setBookmarks(newBookmarks)
    Taro.showToast({ title: '已取消收藏', icon: 'none' })
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

        {/* Bookmarks */}
        <Card className="mb-4 bg-neutral-900 border-neutral-800 rounded-xl">
          <View className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
            <Text className="text-white font-medium">我的收藏</Text>
            <Text className="text-neutral-500 text-xs">{bookmarks.length} 篇</Text>
          </View>
          {bookmarks.length > 0 ? (
            <View>
              {bookmarks.slice(0, 5).map((item, idx) => (
                <View 
                  key={idx} 
                  className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 last:border-b-0"
                  onClick={() => handleBookmarkClick(item)}
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-neutral-200 text-sm mb-1 leading-relaxed line-clamp-2">{item.title}</Text>
                    <View className="flex items-center gap-2">
                      <Badge className="bg-neutral-800 text-neutral-400 text-xs px-2 py-1 rounded border-0">
                        {categoryLabels[item.category]}
                      </Badge>
                      <Text className="text-neutral-600 text-xs">{item.source}</Text>
                    </View>
                  </View>
                  <View 
                    className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveBookmark(item.id)
                    }}
                  >
                    <Bookmark size={16} color="#10a37f" filled />
                  </View>
                </View>
              ))}
              {bookmarks.length > 5 && (
                <View className="px-4 py-3 flex items-center justify-center">
                  <Text className="text-neutral-500 text-xs">查看全部 {bookmarks.length} 篇</Text>
                </View>
              )}
            </View>
          ) : (
            <View className="px-4 py-8 flex items-center justify-center">
              <Text className="text-neutral-600 text-sm">暂无收藏</Text>
            </View>
          )}
        </Card>

        {/* Subscription */}
        <Card className="mb-4 bg-neutral-900 border-neutral-800 rounded-xl">
          <View className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
            <Text className="text-white font-medium">订阅管理</Text>
            <Text className="text-neutral-500 text-xs">{profile.subscribedCategories.length} 项</Text>
          </View>
          <CardContent className="pt-3">
            <Text className="text-neutral-600 text-xs mb-3">已订阅分类</Text>
            <View className="flex flex-wrap gap-2">
              {profile.subscribedCategories.map((cat) => (
                <Badge 
                  key={cat} 
                  className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded border-0 text-sm"
                >
                  {categoryLabels[cat]}
                </Badge>
              ))}
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
            <View className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <View className="flex items-center gap-3">
                <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Clock size={18} color="#a3a3a3" />
                </View>
                <Text className="text-neutral-200 text-sm">阅读历史</Text>
              </View>
              <ChevronRight size={18} color="#525252" />
            </View>

            {/* Privacy */}
            <View className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <View className="flex items-center gap-3">
                <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Shield size={18} color="#a3a3a3" />
                </View>
                <Text className="text-neutral-200 text-sm">隐私设置</Text>
              </View>
              <ChevronRight size={18} color="#525252" />
            </View>

            {/* Feedback */}
            <View className="flex items-center justify-between px-4 py-3">
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
