export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '阅读历史'
    })
  : {
      navigationBarTitleText: '阅读历史'
    }
