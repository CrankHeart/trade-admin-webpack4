// import store from './index'
import { http } from '../../utils/'
import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'
import API from '../../API/'


interface Status {
  errorMsg: string
  errorNum: number
  rightNum: number
}

@VuexClass( {
  modules: {}
} )
class ImportStore {
  msg: string = ''

  statusData: Status = {
    errorMsg: '',
    errorNum: 0,
    rightNum: 0
  }

  complete: boolean = false

  @Mutation change ( state, data ) {
    Object.keys( data ).forEach( ( v ) => {
      state[ v ] = data[ v ]
    } )
  }

  @Action checkStatus ( { commit }, url ) {
    let timer
    let count = 10000
    let start = new Date()

    getStatus()
    function getStatus () {
      timer = setInterval( () => {
        http( API.product.status ).then( res => {
          getStatus()
        }, ( { data } ) => {
          if ( data.code == 'IN0002' ) {
            clearTimeout( timer )
            timer = null
            let { errorMsg, errorNum, rightNum } = data
            commit( 'change', {
              msg: data.msg,
              statusData: {
                errorMsg,
                errorNum,
                rightNum
              },
              complete: true
            } )
          }
        } )
      }, time() )
    }
    function time () {
      return count = count > 10000 ? count - 2000 : count
    }
  }
}
const storeModule = extractVuexModule( ImportStore )

// store.registerModule('import', storeModule)

export default storeModule
