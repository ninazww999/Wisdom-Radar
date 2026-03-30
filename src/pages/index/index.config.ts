export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '智界雷达',
      backgroundTextStyle: 'dark',
      enableShareTimeline: true,
      enableShareAppMessage: true
    })
  : {
      navigationBarTitleText: '智界雷达',
      backgroundTextStyle: 'dark',
      enableShareTimeline: true,
      enableShareAppMessage: true
    }
