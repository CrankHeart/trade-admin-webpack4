import oidc from 'oidc-client'

export const isLogined = function () {
  return localStorage.getItem( 'isLogin' ) == 'true' ? true : false
}

let baseUrl
if ( process.env.NODE_ENV == 'production' ) {
  baseUrl = 'https://op.linkedcare.cn/trade-manage/#/'
} else if ( process.env.NODE_ENV == 'development' && process.env.SSO_ENV == 'local' ) {
  // 本地测试时用这个
  baseUrl = 'http://localhost:6061/#/'
} else if ( process.env.NODE_ENV == 'integration' ) {
  baseUrl = 'https://eop-integration.linkedcare.cn/trade-manage/#/'
} else {
  // 测试环境
  baseUrl = 'https://etradetest.linkedcare.cn/trade-manage/#/'
}

export const configs = {
  authority: process.env.NODE_ENV == 'production' ? 'https://identity-app.linkedcare.cn:10081/' : 'https://openplatform-app.lctest.cn:11001',
  client_id: 'trademanage',
  redirect_uri: baseUrl + 'callback',
  response_type: 'code',
  scope: 'openid profile mall.user',
  automaticSilentRenew: true,
  silent_redirect_uri: baseUrl + 'silent',
  post_logout_redirect_uri: baseUrl + 'logout',
  monitorSession: false,
  userStore: new oidc.WebStorageStateStore( { store: window.localStorage } )
}

export const logoutPage = '/logout'
