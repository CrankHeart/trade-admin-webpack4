import Vue from 'vue'
import VueRouter from 'vue-router'
import { isLogined, logoutPage } from '../pages/sso/sso'
Vue.use( VueRouter )

export const routes: any = [
  {
    path: '/',
    redirect: '/ssologin'
  },
  {
    path: '/helloworld', // 留一个开发自己知道的后面入口,名字不再使用之前的login
    component: () => import( '../pages/login/index.vue' )
  },
  {
    path: '/index',
    component: () => import( '../pages/home/index.vue' ),
    children: [
      {
        path: '/home',
        component: () => import( '../pages/home/home.vue' ),
      }
    ]
  },
  {
    path: '/ssologin',
    component: () => import( '../pages/sso/ssologin.vue' )
  },
  {
    path: '/callback',
    component: () => import( '../pages/sso/callback.vue' )
  },
  {
    path: '/silent',
    component: () => import( '../pages/sso/silent.vue' )
  },
  {
    path: '/logout',
    redirect: '/home'
    // component: () => import( '../pages/sso/logout.vue' )
  }
]

const router = new VueRouter( { routes } )

// 全局路由守卫
router.beforeEach( ( to, from, next ) => {
  const nextRoute = [ '/callback', '/logout', '/login', '/silent', '/ssologin', '/home', '/helloworld' ] // 不需要登录的页面
  let isLogin = isLogined()
  // 未登录状态；当路由到 nextRoute 指定页时，跳转至 UserLogIn
  if ( nextRoute.indexOf( to.path ) >= 0 ) { // 检测是否登录的页面
    if ( to.path === logoutPage && isLogin ) {
      next( '/home' )
    } else {
      next()
    }
  } else {
    if ( !isLogin ) {
      sessionStorage.setItem( 'loginReturn', to.fullPath )
      router.push( { path: '/ssologin' } )
    } else {
      next()
    }
  }

} )
export default router
