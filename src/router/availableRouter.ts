import router, { routes } from './index'
// 快速路由,文件由webpack RouterCreatePlugin 插件根据 src/router/temp/下json文件自动生成的路由文件
// import navbarList from './temp/fast_navbar.js'
// import detailList from './temp/fast_detail.js'
// 如果不是用快速路由,可以注释掉上面两行,使用下面两行即可
import navbarList from './data/data_navbar.js'
import detailList from './data/data_detail.js'
export const availableNav = []
// 这里路由改为动态生成,根据选择的路由,提升编译速度
let navbar = navbarList
let detail = detailList

export default function extendRouteByPermission ( permission ) {
  let skeleton = routes[ 2 ].children
  let newNavbar = []
  if ( availableNav.length ) {
    return
  }
  navbar.forEach( ( val, index ) => {
    let o = Object.assign( {}, val, { children: [] } )
    let children: any[] = val.children || []
    children.forEach( ( v, i ) => {
      let permissionId = +v.permission
      v = { ...v, meta: { permissionId } }
      if ( !permissionId || permission[ permissionId ] ) {
        skeleton.push( v )
        o.children.push( v )
      }
    } )
    if ( o.children.length ) {
      newNavbar.push( o )
    }
  } )
  availableNav.push( ...newNavbar )
  detail.forEach( ( val: any ) => {
    let permissionId = +val.permission
    if ( !permissionId || permission[ permissionId ] ) {
      skeleton.push( { ...val, meta: { permissionId, isDetail: true } } )
    }
  } )
  routes.push( {
    path: '*',
    name: '404',
    component: () => import( '../pages/404/index.vue' )
  } )
  router.addRoutes( routes )
}
