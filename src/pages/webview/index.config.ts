export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '原文链接'
    })
  : {
      navigationBarTitleText: '原文链接'
    }
