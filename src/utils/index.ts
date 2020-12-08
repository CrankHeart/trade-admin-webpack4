import API from '../API'

import CryptoJS from 'crypto-js'

import { KEY } from '../const/'

const validatePermission = ( store = {}, id ) => store[ id ]
/**
 * 权限验证
 *
 * @param {any} store 权限对象
 * @param {*} arg ( [ 1, 2 ], 3 ) => ( 1 || 2 ) && 3
 * @returns
 */
export const validatePermissions = ( store, ...arg ) => {
  return arg.every( val => {
    if ( Array.isArray( val ) ) {
      return val.some( v => validatePermission( store, v ) )
    } else {
      return validatePermission( store, val )
    }
  } )
  // if ( isPassed ) {
  //   return true
  // } else {
  //   // throw new Error( `权限受限，受限权限id为${arg}` )
  //   return false
  // }
}

export const formatPrice = ( price, isRound = false ) => {
  price = +price || 0
  if ( isRound ) {
    let scale = price > 50 ? 1 : 10
    price = Math.round( price * scale ) / scale
  }
  return price.toFixed( 2 )
}

export const formatPriceWithRight = ( price, isRound = false ) => {
  return '<div style="text-align:right">' + formatPrice( price, isRound ) + '</div>'
}

export const formatMyDate = ( date: any, str: string = 'yyyy-MM-dd hh:mm:ss', isEnd: boolean = false ) => {
  if ( !date ) {
    return
  }
  if ( !( date instanceof Date ) ) {
    date = new Date( date )
  }

  if ( date.toString() == 'Invalid Date' ) return 'Invalid Date'
  if ( isEnd ) {
    date.setHours( 0 )
    date.setMinutes( 0 )
    date.setSeconds( 0 )
    date.setMilliseconds( 0 )
    date = new Date( date.getTime() + 1000 * 60 * 60 * 24 - 1 )
  }

  let o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor( ( date.getMonth() + 3 ) / 3 ), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  if ( /(y+)/.test( str ) ) str = str.replace( RegExp.$1, ( date.getFullYear() + '' ).substr( 4 - RegExp.$1.length ) )
  for ( let k in o ) {
    if ( new RegExp( '(' + k + ')' ).test( str ) ) {
      str = str.replace( RegExp.$1, ( RegExp.$1.length == 1 ) ? ( o[ k ] ) : ( ( '00' + o[ k ] ).substr( ( '' + o[ k ] ).length ) ) )
    }
  }

  return str
}

export const sortBy = ( prop, bo ) => ( o1, o2 ) => bo && o1[ prop ] < o2[ prop ] ? 1 : -1

export function htmlEncodeByRegExp ( str ): string {
  let s = ''
  if ( str.length == 0 ) return ''
  s = str.replace( /&/g, '&amp;' )
  s = s.replace( /</g, '&lt;' )
  s = s.replace( />/g, '&gt;' )
  s = s.replace( / /g, '&nbsp;' )
  s = s.replace( /\'/g, '&#39;' )
  s = s.replace( /\'/g, '&quot;' )
  return s
}


export function isPositiveNum ( num ): boolean {
  return /^[0-9]*[1-9][0-9]*$/.test( num )
}
export function htmldecodeByRegExp ( str ) {
  let s = ''
  if ( str.length == 0 ) return ''
  s = str.replace( /\&amp\;/g, '&' )
  s = s.replace( /\&lt\;/g, '<' )
  s = s.replace( /\&gt\;/g, '>' )
  s = s.replace( /\&\#39\;/g, '\'' )
  s = s.replace( /\&nbsp\;/g, ' ' )
  s = s.replace( /\&quot\;/g, '"' )
  return s
}

export const getClientHeight = () => window.innerHeight

import _post from './http'

export const http = _post


export function getCookie ( name: string ): string {
  let arr: Array<any>
  let reg = new RegExp( '(^| )' + name + '=([^;]*)(;|$)' )
  if ( arr = document.cookie.match( reg ) )
    return decodeURIComponent( arr[ 2 ] )
  else
    return ''
}
export function delCookie ( name: string ): void {
  let exp: Date = new Date()
  exp.setTime( exp.getTime() - 1 )
  let cval = getCookie( name )
  if ( cval != null )
    document.cookie = name + '=' + cval + ';expires=' + exp.toUTCString()
}
export function setCookie ( name: string, value: string, time: number ): void {
  let exp = new Date()
  exp.setTime( exp.getTime() + time )
  document.cookie = name + '=' + encodeURIComponent( value ) + ';expires=' + exp.toUTCString()
}

export function matchXSS ( str: string ): boolean {
  return !!str.match( /[`~!@#$%^&*()_+<>?:'{},.\/;'[\]]/im )
}

export const throttle = function ( fn: Function, delay: number, immediate: boolean, debounce: boolean ) {
  let curr = +new Date()// 当前时间
  let last_call = 0
  let last_exec = 0
  let timer = null
  let diff // 时间差
  let context// 上下文
  let args
  let exec = function () {
    last_exec = curr
    fn.apply( context, args )
  }
  return function () {
    curr = +new Date()
    context = this
    args = arguments
    diff = curr - ( debounce ? last_call : last_exec ) - delay
    clearTimeout( timer )
    if ( debounce ) {
      if ( immediate ) {
        timer = setTimeout( exec, delay )
      } else if ( diff >= 0 ) {
        exec()
      }
    } else {
      if ( diff >= 0 ) {
        exec()
      } else if ( immediate ) {
        timer = setTimeout( exec, -diff )
      }
    }
    last_call = curr
  }
}

export function debounce ( fn, delay, immediate ) {
  return throttle( fn, delay, immediate, true )
}

export function getterConfig ( store, config ) {
  let len = store.length
  config.forEach( val => {
    if ( len && store.indexOf( val.prop ) == -1 ) {
      return val.isChecked = false
    }
    val.isChecked = true
  } )
  return config
}
export function matchArrItem ( value, arr, prop ) {
  for ( let i = 0, l = arr.length; i < l; i++ ) {
    let item = arr[ i ] || {}
    if ( item[ prop ] === value ) {
      return item
    }
  }
  return {}
}

export function duration ( d ) {
  let v: number = d / 1000
  let sd = 24 * 60 * 60
  let day: number = Math.floor( v / sd )
  let afterDay: number = v - day * sd
  let hour: number = Math.floor( afterDay / ( 60 * 60 ) )
  let afterHour: number = v - day * sd - hour * 60 * 60
  let min: number = Math.floor( afterHour / 60 )
  let second: number = v - day * sd - hour * 60 * 60 - min * 60
  return ( day > 0 ? day + '天' : '' ) +
    ( ( day > 0 || hour > 0 ) ? hour + '小时' : '' ) +
    ( ( day > 0 || hour > 0 || min > 0 ) ? min + '分' : '' ) +
    ( ( day > 0 || hour > 0 || min > 0 || second > 0 ) ? second + '秒' : '' )
}

export function injectScript ( src: string ) {
  return new Promise( ( resolve, reject ) => {
    let head = document.head,
      sc = document.createElement( 'script' )
    sc.src = src
    head.appendChild( sc )
    sc.onload = () => {
      resolve()
    }
  } )
}


export const getTenantOfficeUserName = ( function () {
  let bakAll = JSON.parse( localStorage.customs || '{}' )
  return function ( key ) {
    if ( bakAll[ key ] ) {
      return Promise.resolve( bakAll[ key ] )
    }
    return _post( API.getTenantOfficeUserName, { id: key } ).then( ( { data } ) => {
      bakAll[ key ] = data.tenantName + '-' + data.officeName + '-' + data.userName
      localStorage.customs = JSON.stringify( bakAll )
      return bakAll[ key ]
    }, rej => {
      bakAll[ key ] = '无效的用户信息'
    } )
  }
} )()

export const encryptByDES = ( msg: string ): string => {
  let keyHex = CryptoJS.enc.Utf8.parse( KEY )
  let encrypted = CryptoJS.DES.encrypt( msg, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  } )
  return encrypted.toString()
}

export const thoundandSeparator = ( val: string | number, count: number = 2 ) => {
  return ( +val ).toFixed( count ).replace( /(\d)(?=(\d{3})+\.)/g, '$1,' )
}

export function compare ( name, order = 1 ) {
  return function ( o1, o2 ) {
    return ( o1[ name ] < o2[ name ] ? -1 : 1 ) * order
  }
}

function returnSelf ( arg ) {
  return this
}
export const requireAll = ( requireContext, fn = returnSelf ) => requireContext.keys().reduce( ( prev, next ) => {
  // next ./portrait.ts
  let path = next.split( '.' )[ 1 ].substr( 1 )

  prev[ path ] = fn.call( requireContext( next ), next )
  return prev
}, {} )

export const random = ( min, max ) => Math.floor( Math.random() * ( max - min + 1 ) + min )

export const find = ( value, obj, key ) => {
  let iterator = obj[ Symbol.iterator ]()
  let next
  while ( ( next = iterator.next() ) && !next.done ) {
    let iteratorValue = next.value
    let matchValue = key !== undefined ? iteratorValue[ key ] : iteratorValue
    if ( matchValue === value ) {
      return iteratorValue
    }
  }
  return {}
}
export const isNotEmptyObj = ( obj ) => {
  if ( Object.prototype.toString.call( obj ) !== '[object Object]' ) {
    return new Error( '传入参数类型不为object' )
  }
  return !!Object.keys( obj ).length
}

Array.prototype[ '_find' ] = function ( value, prop ) {
  return find( value, this, prop )
}

String.prototype.trim = function () {
  let str = this,
    s = str.replace( /^\s\s*/, '' ),
    ws = /\s/,
    i = s.length;
  while ( ws.test( s.charAt( --i ) ) );
  return s.slice( 0, i + 1 );
}

// 格式化货币,10000->10,000
export const rmbFormat = ( s, n = 2 ) => {
  /*
   * 参数说明：
   * s：要格式化的数字
   * n：保留几位小数
   * */
  n = n > 0 && n <= 20 ? n : 2;
  s = parseFloat( ( s + '' ).replace( /[^\d\.-]/g, '' ) ).toFixed( n ) + '';
  let l = s.split( '.' )[ 0 ].split( '' ).reverse(),
    r = s.split( '.' )[ 1 ];
  let t = '';
  for ( let i = 0; i < l.length; i++ ) {
    t += l[ i ] + ( ( i + 1 ) % 3 == 0 && ( i + 1 ) != l.length ? ',' : '' );
  }
  return t.split( '' ).reverse().join( '' ) + '.' + r;
}
// Array.prototype._unique = function ( isStrict = true ) {
//   let result = []
//   outer:
//   for ( let i = 0, l = this.length; i < l; i++ ) {
//     let item$this = this[ i ]
//     inner:
//     for ( let j = 0, k = result.length; j < k; j++ ) {
//       let item$result = result[ j ]
//       let matched = isStrict ? item$this === item$result : item$this == item$result
//       if ( matched ) {
//         continue outer
//       }
//     }
//     result.push( item$this )
//   }
//   return result
// }

// 打开新的标签页
export const openNewWebWin = ( path, name = '' ) => {
  // 这里打开弹窗返回时无法保存当前tab以及搜索条件,所以使用打开新页面方式进行跳转
  let { href } = window.location;
  let webPrefix = href.substr( 0, href.lastIndexOf( '#' ) );
  let openUrl = `${webPrefix}#/${path}`;
  window.open( openUrl, name );
}

// 前端修复后端个人账户脏数据
export const buildPersonTypeData = ( list ) => {
  return list.map( item => {
    if ( item.userType == 6 || item.tenantId == 'mall' ) {
      return Object.assign( item, {
        tenantId: '',
        officeId: ''
      } )
    } else {
      return item
    }
  } )
}

