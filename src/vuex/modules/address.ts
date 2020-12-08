import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'
import API from '../../API/'

import { http } from '../../utils/'
let currProvinceData: any = {}
function formatAddress ( arr: any[] = [] ) {
  arr.forEach( val => {
    val.value = val.id
    val.label = val.name
    val.children = val.result
    formatAddress( val.children )
  } )
}

let formatAddressObj = ( function () {
  let o = {}
  function check ( arr: any[] = [] ) {
    arr.forEach( val => {
      o[ val.id ] = val.name
      check( val.result )
    } )
  }
  return {
    check,
    data: o
  }
} )()



@VuexClass( {
  modules: {}
} )
class AddressModule {
  address: any = []
  areaAddressList: any[] = []
  cascaderAddress: any[] = []
  @Mutation setAllAddress ( state, data ) {
    state.address = data
  }
  @Getter allAddress ( state ) {
    formatAddress( state.address )
    return state.address
  }
  // @Getter allAddressObj(state) {
  //   formatAddressObj.check(state.address)
  //   return formatAddressObj.data
  // }

  @Action getAddress ( { commit, state } ) {
    if ( state.address.length ) {
      return Promise.resolve(state.address)
    }
    return http( API.getAddressList ).then( ( { data } ) => {
      let address = data.data      
      if ( state.address.length == 0 ) {
        commit('setAllAddress', address)
        commit('setAllProvince', address)
      } 
      return address
    } )
  }

  @Action getAreaList( { commit, state } ) {
    if (state.areaAddressList.length) {
      return state.areaAddressList
    }
    // (优化性能) 这里接口不常变化,所以.可以存到localStorage里面
    let jsonAreaAddressList = sessionStorage.getItem('areaJson')

    if (jsonAreaAddressList && jsonAreaAddressList.length > 0) {
      jsonAreaAddressList = JSON.parse(jsonAreaAddressList)
      if (jsonAreaAddressList.length > 0) {
        commit('setArealist', jsonAreaAddressList)
      }
      return jsonAreaAddressList
    } else {
      return http(API.getAreaList).then(({data}) => {
        let myData = data && data.data || []
        let areaAddressList = myData.map(v => JSON.parse(JSON.stringify(v).replace(/id/g, 'value').replace(/name/g, 'label').replace(/result/g, 'children')))
        if (areaAddressList && areaAddressList.length > 0) {
          sessionStorage.setItem('areaJson', JSON.stringify(areaAddressList))
        }
        commit('setArealist', areaAddressList)
      })
    }
  }
  @Mutation setArealist ( state, areaAddressList ) {
    state.areaAddressList = areaAddressList
  }
  @Mutation setAllProvince ( state, allAddress ) {
    state.cascaderAddress = allAddress.map( v => {
      return {
        value: v.id,
        label: v.name,
        children: []
      }
    } )
  }
  @Mutation setTheCity ( state, province ) {
    currProvinceData = state.address.filter(v => v.id === province)[0] || { result: [] }
    let currProvince = state.cascaderAddress.filter( v => v.value === province )[ 0 ] || {}
    currProvince.children = currProvinceData.result.map( v => {
      return {
        value: v.id,
        label: v.name,
        children: []
      }
    } )
  }
  @Mutation setTheArea ( state, data ) {
    if ( !currProvinceData.result ) {
      return
    }
    let citys = currProvinceData.result.filter(v => v.id === data.city)[0] || { result: [] }
    let currProvince = state.cascaderAddress.filter(v => v.value === data.province)[0] || { children: [] }
    let currCity = currProvince.children.filter( v => v.value === data.city )[ 0 ] || {}
    currCity.children = citys.result.map( v => {
      return {
        value: v.id,
        label: v.name
      }
    } )
  }
}

const storeModule = extractVuexModule( AddressModule )
export default storeModule


