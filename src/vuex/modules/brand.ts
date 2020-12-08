import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'

import { http } from '../../utils/'
import API from '../../API/'

@VuexClass( {
  modules: {}
} )
class BrandModule {
  brandList = []
  shouldInit: boolean = false
  @Getter allBrands ( state ) {
    let { brandList } = state
    let o: any = {}
    brandList.forEach( val => {
      o[ val.id ] = val
    } )
    return o
  }
  @Mutation setAllBrands ( state, data ) {
    state.brandList = []
    state.brandList.push( ...data )
  }
  @Mutation setShouldInit ( state, data: boolean ) {
    state.shouldInit = data
  }
  @Action getAllBrands ( { commit, state }, shouldInit ): Promise<any> {
    commit( 'setShouldInit', !!shouldInit )
    if ( state.brandList.length && !state.shouldInit ) {
      return state.brandList
    }
    return http( API.allBrands ).then( ( { data } ) => {
      commit( 'setAllBrands', data.brandList )
      commit( 'setShouldInit', false )
      return data.brandList
    } )
  }
}

const storeModule = extractVuexModule( BrandModule )
export default storeModule