<template>
  <div class="theme-event-floors" :class="`theme-event-floors-${themeEventMode || 0}`">
    <!-- <layout-modules :disabled="disabled" class="layout-modules" @add="joinToLayout" :theme-event-mode="themeEventMode"></layout-modules> -->

    <layout
      :disabled="disabled"
      class="layout"
      :layout-arr="layoutArr"
      @change="layoutChange"
      :layout-data="layoutData"
      @control="layoutControl"
      :themeEventType="themeEventType"
      :themeEventMode="themeEventMode"
    ></layout>

    <layout-config
      :disabled="disabled"
      class="layout-config"
      v-model="configVisible"
      :current="currentComponentId"
      :layout="curLayout"
      :themeEventMode="themeEventMode"
      @save="saveFloorItem"
      @cancel="cancelFloorItem"
      :themeEventId="themeEventId"
      :themeEventTime="themeEventTime"
      :themeEventType="themeEventType"
    ></layout-config>

    <!-- <div class="el-button-groups">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="updateFloorSequence">保存</el-button>
    </div>-->
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch, Inject } from 'vue-property-decorator'
import layoutModules from './layoutModules.vue'
import layoutConfig from './layoutConfig.vue'
import layout from './layout.vue'

import { random } from '../../../utils/'
import API from '../../../API'
import { basicProps } from '../const'
@Component( {
  name: 'theme-event-floors',
  components: {
    layout,
    layoutConfig,
    // layoutModules
  }
} )
export default class ThemeEventFloors extends Vue {
  @Prop()
  disabled: boolean
  @Prop()
  themeEventData: any
  get themeEventMode (): number {
    return +this.themeEventData.themeEventMode
  }
  get themeEventType (): number {
    return +this.themeEventData.themeEventType
  }
  get themeEventId (): number {
    return this.themeEventData.themeEventId
  }
  get themeEventTime () {
    return ( this.themeEventData.themeEventTime || [] ).concat()
  }
  @Prop()
  themeEventFloors: any[]
  @Watch( 'themeEventFloors.length' )
  themeEventFloorsLengthWatcher ( v ) {
    this.initThemeEventFloors()
  }
  layoutArr: any[] = []
  layoutData: any = {}
  currentComponentId: number = null

  get curLayout () {
    return this.layoutData[ this.currentComponentId ] || {}
  }

  created () {
    this.initThemeEventFloors()
  }
  initThemeEventFloors () {
    this.themeEventFloors.forEach( ( item, index ) => {
      let componentId = random( 0, 1e10 )
      this.layoutArr.push( componentId )
      this.$set( item, 'componentId', componentId )
      this.$set( item, 'themeEventId', this.themeEventId )
      this.$set( this.layoutData, componentId, item )
    } )
  }

  joinToLayout ( item ) {
    let componentId = random( 0, 1e10 )
    this.layoutArr.push( componentId )
    this.$set( item, 'componentId', componentId )
    this.layoutChange( item )
    // this.selectLayout( this.layoutArr.length - 1 )
  }

  layoutChange ( item ) {
    let { componentId } = item
    if ( componentId ) {
      this.$set( item, 'status', item.status || 0 )
      this.$set( this.layoutData, componentId, item )
    }
  }
  configVisible: boolean = false

  selectLayout ( index ) {
    try {
      this.currentComponentId = this.layoutArr[ index ]
      this.configVisible = true
    } catch ( e ) {
      console.log( e )
    }
  }

  layoutControl ( { index, type } ) {
    switch ( type ) {
      case 'edit':
        this.selectLayout( index )
        break
      case 'moveUp':
        if ( index > 0 ) {
          let arr = this.layoutArr.concat()
          let item = arr.splice( index, 1 )[ 0 ]
          arr.splice( index - 1, 0, item )
          this.layoutArr = arr
        }
        break
      case 'moveDown':
        let arr = this.layoutArr.concat()
        if ( index < ( arr.length - 1 ) ) {
          let item = arr.splice( index, 1 )[ 0 ]
          arr.splice( index + 1, 0, item )
          this.layoutArr = arr
        }
        break
      case 'save':
        this.saveFloorIndex( index )
        break
      case 'delete':
        this.delThemeEventFloor( index )
        // this.layoutArr.splice( index, 1 )
        break
      default:
        break
    }
  }
  updateFloorSequence ( bo = true ) {

    let arr = this.layoutArr.map( ( key, index ) => ( {
      id: this.layoutData[ key ].id,
      floorSequence: index
    } ) ).filter( v => v.id )
    if ( !arr.length ) {
      return
    }
    this.$http( API.updateFloorSequence, arr ).then( () => {
      if ( bo ) this.$router.replace( '/themeEvent/themeEventList' )
    } )
  }
  cancel () {
    this.$router.replace( '/themeEvent/themeEventList' )
  }
  delThemeEventFloor ( index ) {
    let item = this.layoutData[ this.layoutArr[ index ] ]
    this.layoutArr.splice( index, 1 )
    let { id } = item
    if ( id ) {
      this.$http( API.delThemeEventFloor, {
        id, themeEventId: this.themeEventId
      } )
    }
  }
  @Inject() formatMyDate
  packUpLayoutItem ( item ) {
    let o: any = {}
    o.floorLayoutDetail = {}
    Object.keys( item ).forEach( key => {
      if ( basicProps.indexOf( key ) > -1 ) {
        if ( key == 'floorLayoutDetail' ) {
          o.floorLayoutDetail = Object.assign( {}, o.floorLayoutDetail, item[ key ] )
        } else {
          o[ key ] = item[ key ]
        }
      } else {
        o.floorLayoutDetail[ key ] = item[ key ]
      }
    } )
    o.floorLayoutDetail.jumpLink = ( o.floorProducts || [] ).map( v => v.jumpLink )

    o.floorProducts = ( o.floorProducts || [] ).map( ( { spuId, skuId, lcSkuCode, lcSpuCode, themeEventPrice } ) => ( {
      spuId: spuId,
      skuId: skuId,
      lcSkuCode, lcSpuCode, themeEventPrice
    } ) )
    o.floorContainers = ( o.floorContainers || [] ).map( val => ( { containerInfo: JSON.stringify( val ) } ) )

    if ( !o.floorProducts.length ) {
      delete o.floorProducts
    }
    if ( !o.floorContainers.length ) {
      delete o.floorContainers
    }
    // o.floorType = item.floorType
    o.status = +( item.status === null ? 1 : item.status )
    // delete o.myProps
    let beginTime, endTime
    o.floorLayoutDetail = JSON.stringify( o.floorLayoutDetail )

    if ( o.time && o.time[ 0 ] ) {
      [ beginTime, endTime ] = o.time
    }
    // if ( o.beginTime && o.endTime ) {
    //   beginTime = o.beginTime.time
    //   endTime = o.endTime.time
    // }
    o.beginTime = this.formatMyDate( beginTime )
    o.endTime = this.formatMyDate( endTime, void 0, true )
    return o
  }
  saveFloorItem ( layout ) {
    layout = layout || this.curLayout
    if ( !layout.componentId ) {
      this.joinToLayout( layout )
    }
    if ( !this.validateFloor( layout ) ) {
      return
    }
    // if ( !this.validateContainer( layout ) ) {
    //   return
    // }

    let item = this.packUpLayoutItem( layout )
    this.$http( API.saveThemeEventFloor, { ...item, broadcast: true } ).then( ( { data } ) => {
      this.$set( this.layoutData[ layout.componentId ], 'id', data.rtnData )
      // let layoutData = this.layoutData
      // let len = Object.keys( layoutData ).length
      // let curLayout =layoutData[ this.layoutArr[ len - 1 ] ]
      // console.log( this.layoutData,  curLayout == layout, layout,curLayout,layout.componentId,curLayout.componentId )
      this.updateFloorSequence( false )
      this.configVisible = false
    } )
  }
  cancelFloorItem () {
    this.currentComponentId = null
    this.configVisible = false
  }
  saveFloorIndex ( index ) {
    let componentId = this.layoutArr[ index ]
    let layout = this.layoutData[ componentId ]
    this.saveFloorItem( layout )
  }
  validateFloor ( item ) {
    let props = [ 'floorType', 'floorTemplateName', 'floorName', 'floorDesc' ]
    for ( let i = 0, l = props.length; i < l; i++ ) {
      let prop = props[ i ]
      if ( item[ prop ] === void 0 || item[ prop ] === null || item[ prop ] === '' ) {
        this.$notify( {
          type: 'error',
          message: `${prop}设置错误`
        } )
        return false
      }
    }
    if ( item.floorName.length > 8 ) {
      this.$notify( {
        type: 'error',
        message: '楼层名称不能超过8个字符'
      } )
      return false
    }
    if ( item.floorDesc.length > 20 ) {
      this.$notify( {
        type: 'error',
        message: '楼层描述不能超过20个字符'
      } )
      return false
    }
    if ( !item.time || !item.time[ 0 ] ) {
      this.$notify( {
        type: 'error',
        message: '楼层活动有效期错误'
      } )
      return false
    }
    // if ( item.floorType === 1 || item.floorType === 2 ) {
    //   item.floorProducts.forEach( v => {
    //     if ( v.themeEventPrice === '' ) {
    //       this.$notify( {
    //         type: 'error',
    //         message: '活动价必输'
    //       } )
    //       return false
    //     }
    //   } )
    // }
    return true
  }
  // validateContainer ( item ) {
  //   item.floorContainers.forEach( v => {
  //     if ( v.goodsPrice === '' || v.realPrice === '' ) {
  //       this.$notify( {
  //         type: 'error',
  //         message: '商品原价以及现价必填'
  //       } )
  //       return false
  //     }
  //   } )
  //   return true
  // }

}
</script>
<style lang="stylus" scoped>
.theme-event-floors
  position relative
  // display flex
  // padding-bottom 50px
  // .el-button-groups
  // position absolute
  // right 0
  // bottom 0
  &:last-of-type
    padding-bottom 70px
  .layout
    padding 10px
.theme-event-floors-0
  .layout
    width 1160px
.theme-event-floors-1
  .layout
    width 375px
.layout-modules, .layout-config
  display flex
  justify-content flex-end
  flex-direction column
.layout
  border 1px solid #eee
  margin auto
</style>
