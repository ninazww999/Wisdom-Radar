import { Button, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { FC, ReactNode } from 'react'

interface ShareButtonProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * 微信小程序分享按钮组件
 * 用于触发分享到好友功能，仅在小程序环境下使用原生 Button 的 openType="share"
 */
export const ShareButton: FC<ShareButtonProps> = ({ children, className, style }) => {
  // 非小程序环境显示提示
  if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
    return (
      <View 
        className={className} 
        style={style}
        onClick={() => {
          Taro.showToast({ title: '请在微信小程序中使用分享功能', icon: 'none' })
        }}
      >
        {children}
      </View>
    )
  }

  // 小程序环境使用原生 Button 触发分享
  return (
    <Button
      openType="share"
      className={className}
      style={style}
    >
      {children}
    </Button>
  )
}
