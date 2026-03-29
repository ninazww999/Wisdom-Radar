import { View, WebView } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'

const WebviewPage: FC = () => {
  const router = useRouter()
  const [url, setUrl] = useState('')

  useLoad(() => {
    console.log('Webview page loaded.')
    const { url: pageUrl } = router.params
    if (pageUrl) {
      setUrl(decodeURIComponent(pageUrl))
    }
  })

  // H5 端直接使用 window.location
  if (Taro.getEnv() === Taro.ENV_TYPE.WEB && url) {
    window.location.href = url
    return null
  }

  return (
    <View className="min-h-screen bg-black">
      {url && (
        <WebView src={url} />
      )}
    </View>
  )
}

export default WebviewPage
