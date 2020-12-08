import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'
import API from '../../API/'

import { http } from '../../utils/'

@VuexClass( {
  modules: {}
} )
class AssociationModule {
  defaultConfig: any = null

  @Getter strategyLevel ( { defaultConfig } ) {
    let o: any = {}
    if ( defaultConfig ) {
      for ( let i = 0, l = 4; i < l; i += 1 ) {
        if ( defaultConfig[ `biddingStrategyLevel${i}Enabled` ] ) {
          o[ i ] = {
            prop: i,
            label: defaultConfig[ `biddingStrategyLevel${i}Label` ],
            value: defaultConfig[ `biddingStrategyLevel${i}` ] / 100
          }
        }
      }
      if ( defaultConfig.salesGuidePriceEnabled ) {
        o[ 4 ] = {
          prop: 4,
          label: defaultConfig.salesGuidePriceLabel,
          value: 0
        }
      }
    }

    return o
  }
  @Mutation setDefaultConfig ( state, defaultConfig ) {

    state.defaultConfig = Object.assign( {}, defaultConfig, {
      biddingStrategyLevel0Label: 'A折扣',
      biddingStrategyLevel1Label: 'B折扣',
      biddingStrategyLevel2Label: 'C折扣',
      biddingStrategyLevel3Label: 'D折扣',
      salesGuidePriceLabel: '销售指导价'
    } )
  }
  @Action getDefaultConfig ( { commit, state } ) {
    if ( state.defaultConfig ) {
      return state.defaultConfig
    }
    return http( API.getDefaultSetting ).then( ( { data } ) => {
      let config = data.data || {}
      let { biddingStrategyLevel0, biddingStrategyLevel1, biddingStrategyLevel2, biddingStrategyLevel3 } = config
      config = {
        ...config,
        biddingStrategyLevel0: biddingStrategyLevel0 * 100 || '',
        biddingStrategyLevel1: biddingStrategyLevel1 * 100 || '',
        biddingStrategyLevel2: biddingStrategyLevel2 * 100 || '',
        biddingStrategyLevel3: biddingStrategyLevel3 * 100 || ''
      }
      commit( 'setDefaultConfig', config )
      return config
    } )
  } yyy
}

const storeModule = extractVuexModule( AssociationModule )
export default storeModule