export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/detail/index',
    'pages/analysis/index',
    'pages/profile/index'
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
        pagePath: 'pages/analysis/index',
        text: '分析',
        iconPath: './assets/tabbar/trending-up.png',
        selectedIconPath: './assets/tabbar/trending-up-active.png'
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
