export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/detail/index',
    'pages/profile/index',
    'pages/webview/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#030712',
    navigationBarTitleText: '智界雷达',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#6b7280',
    selectedColor: '#ffffff',
    backgroundColor: '#030712',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/tabbar/house.png',
        selectedIconPath: './assets/tabbar/house-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/tabbar/user.png',
        selectedIconPath: './assets/tabbar/user-active.png'
      }
    ]
  }
})
