import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'

import { http } from '../../utils/'
import API from '../../API/'


interface Category {
  label?: string
  children?: any[]
  value?: Array<any> | string
}

@VuexClass( {
  modules: {}
} )
class CategoryModule {
  category = []
  category2 = []

  @Getter all ( state ) {
    let source = state.category, data = []

    Object.keys( source ).forEach( i => {
      let d1: Category = {}
      let s1 = source[ i ]
      d1.label = i
      d1.children = []
      if ( s1.length ) {
        d1.value = s1[ 0 ].firstClassID
      }

      Object.keys( s1 ).forEach( j => {
        let d2: Category = {}
        let s2 = s1[ j ]
        d2.label = s2.secondClass
        d2.children = []
        d2.value = s2.secondClassID
        Object.keys( s2.thirdClass ).forEach( k => {
          let d3: Category = {}
          let s3 = s2.thirdClass[ k ]
          d3.label = s3.name
          d3.value = s3.id
          d2.children.push( d3 )
        } )
        d1.children.push( d2 )
      } )

      data.push( d1 )
    } )

    return data
  }
  // @Getter all ( state ) {
  //   let source = state.category, data = []
  //   Object.keys( source ).forEach( i => {
  //     let d1: Category = {}
  //     let s1 = source[ i ]
  //     d1.label = i
  //     d1.children = []
  //     d1.value = []
  //     Object.keys( s1 ).forEach( j => {
  //       let d2: Category = {}
  //       let s2 = s1[ j ]
  //       d2.label = s2.secondClass
  //       d2.children = []
  //       d2.value = []
  //       Object.keys( s2.thirdClass ).forEach( k => {
  //         let d3: Category = {}
  //         let s3 = s2.thirdClass[ k ]
  //         d3.label = s3.name
  //         d3.value = s3.id
  //         // 无法直接使用push  衰
  //         // d2.value.push(s3.id)
  //         Array.prototype.push.call( d2.value, s3.id )
  //         d2.children.push( d3 )
  //       } )
  //       d2.value = d2.value.join( ';' )
  //       d1.children.push( d2 )
  //       // 无法直接使用push  衰
  //       // d1.value.push(d2.value)
  //       Array.prototype.push.call( d1.value, d2.value )
  //     } )
  //     d1.value = d1.value.join( ';' )
  //     data.push( d1 )
  //   } )
  //   return data
  // }

  @Mutation setAllCategory ( state, data ) {

    state.category = data
  }
  @Mutation setAllCategory2 ( state, data ) {
    state.category2.push( ...data )
  }

  @Action getAllCategory ( { commit, state } ) {
    if ( state.category.length ) return
    http( API.allTypes ).then( ( res: any ) => {
      commit( 'setAllCategory', res.data.productClass )
    } )
  }

  @Action getAllCategory2 ( { commit, state } ) {
    if ( state.category2.length ) return
    http( API.allTypes2 ).then( ( res: any ) => {
      commit( 'setAllCategory2', res.data.productCategory3stList )
    } )
  }

}

const storeModule = extractVuexModule( CategoryModule )
export default storeModule