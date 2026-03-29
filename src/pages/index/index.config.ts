export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '智界雷达',
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark'
    })
  : {
      navigationBarTitleText: '智界雷达',
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark'
    }
