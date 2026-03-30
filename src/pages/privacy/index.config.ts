export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '隐私设置'
    })
  : {
      navigationBarTitleText: '隐私设置'
    }
