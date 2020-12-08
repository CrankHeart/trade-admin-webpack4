import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'
import API from '../../API/'

import { http } from '../../utils/'

@VuexClass( {
  modules: {}
} )
class LogisticModule {
  logistic: any = []
  shouldInit: boolean = false
  @Mutation setAllLogistic ( state, data ) {
    state.logistic = data
  }
  @Getter allLogistic ( state ) {
    let o = {}
    state.logistic.forEach( logc => {
      o[ logc.id ] = logc
    } )
    return o
  }
  @Mutation setShouldInit ( state, data: boolean ) {
    state.shouldInit = data
  }
  @Action getAllLogistic ( { commit, state } ) {
    if ( state.logistic.length && !state.shouldInit ) {
      return
    }
    http( API.allLogistic ).then( ( res: any ) => {
      commit( 'setAllLogistic', res.data.logisticCompanyList )
      commit( 'setShouldInit', false )
    } )
  }
}

const storeModule = extractVuexModule( LogisticModule )
export default storeModule
