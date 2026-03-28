export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '具身智能资讯',
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark'
    })
  : {
      navigationBarTitleText: '具身智能资讯',
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark'
    }
