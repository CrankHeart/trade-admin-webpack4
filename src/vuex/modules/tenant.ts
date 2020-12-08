import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'

@VuexClass( {
  modules: {}
} )
class TenantModule {
  tenantNameStore = {}
  @Getter tenantIdStore ( state ) {
    let o = {}
    let tenantNameStore = state.tenantNameStore
    Object.keys( tenantNameStore ).forEach( key => {
      let v = tenantNameStore[ key ]
      o[ v.id ] = v
    } )
    return o
  }
  // @Mutation setSingeTenant(state, { key, roundingType }) {
  //   let tenant = state.tenantNameStore[key]
  //   if (tenant) {
  //     state.tenantNameStore[key] = Object.assign({}, tenant, { roundingType })
  //   }
  // }
  @Mutation setTenantNameStoreList ( state, arr ) {
    arr.forEach( v => {
      state.tenantNameStore[ v.name ] = v
    } )
  }
  @Mutation setTenantNameStore ( state, o ) {
    let { tenantName, roundingType } = o
    let data = state.tenantNameStore[ tenantName ] || {}
    data.roundingType = roundingType
  }
}

const storeModule = extractVuexModule( TenantModule )
export default storeModule