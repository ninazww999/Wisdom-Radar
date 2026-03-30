import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Shield, Eye, Lock, Database } from 'lucide-react-taro'
import './index.css'

const PrivacyPage: FC = () => {
  const [settings, setSettings] = useState({
    analyticsEnabled: true,
    crashReportEnabled: true,
    personalizedAds: false
  })

  useLoad(() => {
    console.log('Privacy page loaded.')
  })

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
        <Text className="text-white text-xl font-bold">隐私设置</Text>
      </View>

      {/* Content */}
      <View className="px-4 pt-4">
        <Card className="bg-neutral-900 border-neutral-800 rounded-xl">
          {/* Analytics */}
          <View className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <View className="flex items-center gap-3">
              <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                <Eye size={18} color="#a3a3a3" />
              </View>
              <View>
                <Text className="text-neutral-200 text-sm">使用分析</Text>
                <Text className="text-neutral-600 text-xs">帮助我们改进产品</Text>
              </View>
            </View>
            <Switch 
              checked={settings.analyticsEnabled}
              onCheckedChange={(enabled) => setSettings({ ...settings, analyticsEnabled: enabled })}
            />
          </View>

          {/* Crash Report */}
          <View className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <View className="flex items-center gap-3">
              <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                <Database size={18} color="#a3a3a3" />
              </View>
              <View>
                <Text className="text-neutral-200 text-sm">崩溃报告</Text>
                <Text className="text-neutral-600 text-xs">自动发送崩溃日志</Text>
              </View>
            </View>
            <Switch 
              checked={settings.crashReportEnabled}
              onCheckedChange={(enabled) => setSettings({ ...settings, crashReportEnabled: enabled })}
            />
          </View>

          {/* Personalized Ads */}
          <View className="flex items-center justify-between px-4 py-3">
            <View className="flex items-center gap-3">
              <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                <Lock size={18} color="#a3a3a3" />
              </View>
              <View>
                <Text className="text-neutral-200 text-sm">个性化推荐</Text>
                <Text className="text-neutral-600 text-xs">基于阅读记录推荐内容</Text>
              </View>
            </View>
            <Switch 
              checked={settings.personalizedAds}
              onCheckedChange={(enabled) => setSettings({ ...settings, personalizedAds: enabled })}
            />
          </View>
        </Card>

        {/* Privacy Policy */}
        <Card className="mt-4 bg-neutral-900 border-neutral-800 rounded-xl">
          <View className="flex items-center justify-between px-4 py-3">
            <View className="flex items-center gap-3">
              <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                <Shield size={18} color="#a3a3a3" />
              </View>
              <Text className="text-neutral-200 text-sm">隐私政策</Text>
            </View>
          </View>
        </Card>

        {/* Info */}
        <View className="mt-6 px-4">
          <Text className="text-neutral-600 text-xs leading-relaxed">
            我们重视您的隐私。您的数据将被安全存储，不会与第三方共享。您可以随时更改这些设置。
          </Text>
        </View>
      </View>
    </View>
  )
}

export default PrivacyPage
