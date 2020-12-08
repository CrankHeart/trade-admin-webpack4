
/* tslint-disable */

import Vue from 'vue'
import { formatPrice } from '@/utils/'

Vue.directive('permission-visible', {
  bind(el, binding, vnode) {
    let { context } = vnode
    let { expression } = binding
    try {
      (<any> window).eval(`context.$permissionValidate( ${expression} )`)
    } catch (e) {
      context.$nextTick(() => {
        el.parentElement.removeChild(el)
      })

    }
  }
})

function getRandomCode(length) {
  if (length > 0) {
    let data = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    let nums = '';
    for (let i = 0; i < length; i++) {
      let r = parseInt( Math.random() * 61 );
      nums += data[r];
    }
    return nums;
  } else {
    return false;
  }
}

Vue.directive('price-info', {
  bind(el, binding, vnode) {
    // console.log( binding.value)
    // console.log( el.innerHTML)
    let priceNum = binding.value
    vnode.key = getRandomCode(32)
    if ( priceNum == undefined ) {
      priceNum = el.innerHTML || 0
    }
    if ( parseFloat( priceNum ).toString() == 'NaN' ) {
      el.innerHTML = `<div style="text-align:right">${priceNum}</div>`;
    }else {
      el.innerHTML = `<div style="text-align:right">${formatPrice(priceNum)}</div>`;
    }
  }
})


Vue.directive('currentLimiting', {
  inserted(el, binding, vnode) {
    let { arg, value } = binding
    let isCalling = false
    const finish = () => (isCalling = false)
    el.__bindingLimited = e => {
      if (!isCalling) {
        isCalling = true
        let [fn, ...args] = value
        args = args.map(v => (v === '$event' ? e : v))
        let result = fn.apply(vnode.context, args)
        if (result instanceof Promise) {
          result.then(finish, finish)
        } else {
          setTimeout(finish, 3000)
        }
      }
    }
    el.addEventListener(arg, el.__bindingLimited)
  },
  unbind(el, binding) {
    let { arg } = binding
    el.removeEventListener(arg, el.__bindingLimited)
  }
})


Vue.directive('currentLimiting2', {
  inserted(el, binding, vnode) {
    const mask = document.createElement('div')
    if (!['absolute', 'fixed', 'sticky'].includes(el.style.position)) {
      el.style.position = 'relative'
    }
    (mask as any).style = `
          position:absolute;
          left:0;
          right:0;
          top:0;
          bottom:0;
          z-index:2;`
    el.appendChild(mask)
    const { arg, value } = binding

    let __isCalling = false
    const finish = () => (__isCalling = false)
    (el as any).__limiteFn = e => {
      e.stopPropagation()
      if (!__isCalling) {
        __isCalling = true
        try {
          let result = el[arg]()
          if (!value && result instanceof Promise) {
            result.then(finish, finish)
          } else {
            setTimeout(finish, value || 3000)
          }
        } catch (e) {
          setTimeout(finish, value || 3000)
        }
      }
    }
    mask.addEventListener(arg, (el as any).__limiteFn)
  }
})
