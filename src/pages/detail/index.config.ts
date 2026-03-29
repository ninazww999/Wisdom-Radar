export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '资讯详情',
      enableShareTimeline: true,
      enableShareAppMessage: true
    })
  : {
      navigationBarTitleText: '资讯详情',
      enableShareTimeline: true,
      enableShareAppMessage: true
    }
