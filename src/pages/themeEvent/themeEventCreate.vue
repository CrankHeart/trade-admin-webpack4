<template>
  <div id="theme-event-create">
    <themeEventBasicInfo v-model="themeEventData" @save="saveThemeEvent" :disabled="!$permissionValidate(654)"></themeEventBasicInfo>
    <themeEventFloors v-if="themeEventId" :theme-event-floors="themeEventFloors" :theme-event-data="themeEventData" :disabled="!$permissionValidate(654)"></themeEventFloors>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import themeEventBasicInfo from './components/themeEventBasicInfo.vue'
import themeEventFloors from './components/themeEventFloors.vue'
import API from '../../API'
import { basicProps } from './const'
@Component( {
  name: 'theme-event-create',
  components: {
    lcTitle,
    themeEventFloors,
    themeEventBasicInfo
  }
} )
export default class ThemeEventCreate extends Vue {
  themeEventData: any = {
    backgroundPicture: '',
    backgroundColor: ''
  }
  themeEventId: number = null

  get themeEventFloors () {
    let themeEventFloors = this.themeEventData.themeEventFloors || []
    return themeEventFloors.map( v => this.flattenLayoutItem( v ) )
  }

  flattenLayoutItem ( layout ) {
    let o: any = {}
    basicProps.forEach( v => {
      o[ v ] = layout[ v ]
    } )

    // o.floorLayoutDetail = JSON.parse( o.floorLayoutDetail || '{}' )
    Object.keys( o.floorLayoutDetail ).forEach( k => {
      if ( !o.hasOwnProperty( k ) ) {
        o[ k ] = o.floorLayoutDetail[ k ]
      }
    } )
    o.floorProducts = o.floorProducts.map( v => ( {
      ...v,
      ...v.goodsVO,
      id: v.goodsVO && v.goodsVO.goodsSkuId
    } ) )
    let { beginTime, endTime } = o
    if ( beginTime && endTime ) {
      o.time = [ new Date( beginTime.time ), new Date( endTime.time ) ]
    }
    o.floorTemplateName = o.floorTemplateName || 'pc/template1'
    return o
  }
  saveThemeEvent () {
    if ( !this.validateThemeEvent() ) {
      return
    }
    let item = this.formatSaveOption()
    this.$http( API.saveThemeEvent, {
      ...item,
      id: this.themeEventId || void 0,
      broadcast: true
    } ).then( ( { data } ) => {
      this.themeEventId = data.id
      this.$set( this.themeEventData, 'themeEventId', this.themeEventId )
      this.$router.replace( `?themeEventMode=${item.themeEventMode}&themeEventType=${item.themeEventType}&id=${this.themeEventId}` )
    } )
  }
  @Inject()
  formatMyDate
  formatSaveOption () {
    let item: any = {}
    let { themeEventTime } = this.themeEventData
    if ( themeEventTime && themeEventTime[ 1 ] ) {
      let [ beginTime, endTime ] = themeEventTime
      item.beginTime = this.formatMyDate( new Date( beginTime ) )
      item.endTime = this.formatMyDate( new Date( endTime ), void 0, true )
    }
    item.themeEventId = this.themeEventId
    return {
      ... this.themeEventData,
      ...item,
      themeEventFloors: void 0
    }
  }
  validateThemeEvent () {
    let keys = Object.keys( this.themeEventData )
    let len = keys.length
    while ( len-- ) {
      let key = keys[ len ]
      if ( key == 'backgroundPicture' || key == 'backgroundColor' ) {
        continue
      }
      let value = this.themeEventData[ key ]
      if ( value === '' ) {
        this.$notify( {
          type: 'error',
          message: `验证失败，请确认${key}字段是否正确`
        } )
        return false
      }
    }
    return true
  }

  // detail  function
  created () {
    let { query, params } = this.$route
    this.themeEventId = +params.id || void 0
    let { themeEventMode, themeEventType } = query
    if ( this.themeEventId !== void 0 ) {
      if ( query.hasOwnProperty( 'themeEventType' ) ) {
        if ( +themeEventType ) {
          this.getSubData()
        } else {
          this.getHomeData( +themeEventMode )
        }
      } else {
        this.$router.replace( `/themeEvent/themeEventList` )
        this.$notify( {
          type: 'error',
          message: '未知的类型'
        } )
      }
    }

  }
  getSubData () {
    this.$http( API.getThemeEventDetail, {
      themeEventId: this.themeEventId,
      // start: 0,
      // num: -1
    } ).then( ( { data } ) => {
      this.getDataCallBack( data )
    } )
  }
  getHomeData ( themeEventMode ) {
    this.$http( API.getHomeThemeEventDetail, {
      themeEventMode,
      // start: 0,
      // num: -1
    } ).then( ( { data } ) => {
      this.getDataCallBack( data )
    } )
  }
  async getDataCallBack ( data ) {
    let themeEventData = data.data
    for ( let i = 0, l = themeEventData.themeEventFloors.length; i < l; i++ ) {
      let item = themeEventData.themeEventFloors[ i ]
      if ( item.productTotal > 10 ) {
        let res = await this.$http( API.getSubEventFloorProductPaging, {
          start: 0,
          num: 100,
          themeEventId: item.themeEventId,
          themeEventFloorId: item.id
        } )
        let data = res.data.data
        item.floorProducts = data.floorProducts
        item.floorContainers = data.floorContainers
      }
      item.floorLayoutDetail = JSON.parse( item.floorLayoutDetail || '{}' )
      let jumpLink = item.floorLayoutDetail.jumpLink

      item.floorContainers = item.floorContainers.map( val => JSON.parse( val.containerInfo ) )

      item.floorProducts = item.floorProducts.map( ( value, index ) => ( {
        ...value,
        jumpLink: jumpLink && jumpLink[ index ] || ''
      } ) )
      item.time = [
        this.formatMyDate( new Date( item.beginTime.time ) ),
        this.formatMyDate( new Date( item.endTime.time ) ),
      ]
    }

    if ( !themeEventData ) {
      this.$router.back()
      this.$notify( {
        type: 'error',
        message: '请确认此活动是否存在！'
      } )
    }

    let { beginTime, endTime } = themeEventData
    if ( beginTime && endTime ) {
      themeEventData.beginTime = this.formatMyDate( new Date( beginTime.time ) )
      themeEventData.endTime = this.formatMyDate( new Date( endTime.time ), void 0, true )
      themeEventData.themeEventTime = [ themeEventData.beginTime, themeEventData.endTime ]
    }
    themeEventData.themeEventId = themeEventData.id
    this.themeEventData = themeEventData
  }
}
</script>
<style lang="stylus">
#theme-event-create
  .el-dialog--small
    width 80%
</style>




