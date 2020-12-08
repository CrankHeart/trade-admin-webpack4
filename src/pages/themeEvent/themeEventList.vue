<template>
  <div id="theme-event-list">
    <lc-title text="活动列表"></lc-title>
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table
      :config="config"
      :data="data"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template
          v-if="['themeEventMode','status','themeEventType'].indexOf(scope.con.prop)>-1"
        >{{matchItem(scope.row[scope.con.prop],scope.con.prop)}}</template>
        <template v-else-if="scope.con.prop==='themeEventTime'">{{formatTimeToStr(scope.row)}}</template>
        <template v-else-if="scope.con.prop==='ctrol'">
          <el-button type="primary" size="small">
            <router-link
              :to="`/themeEvent/${scope.row.id}?themeEventMode=${scope.row.themeEventMode}&themeEventType=${scope.row.themeEventType}`"
              tag="span"
              class="link"
              v-if="$permissionValidate(653)"
            >查看</router-link>
          </el-button>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/'
import API from '../../API/'
import { themeEventTypes, themeEventModes, status } from './const/'
import { matchArrItem } from '../../utils/'
@Component( {
  name: 'activity-list',
  components: {
    lcTitle,
    lcCondition,
    lcTable
  }
} )
export default class ActivityList extends Vue {
  data = []
  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  curChange ( cur ) {
    this.search( cur )
  }
  config: any[] = [
    { prop: 'id', label: '活动id' },
    { prop: 'themeEventName', label: '活动名称' },
    { prop: 'themeEventMode', label: '客户端' },
    { prop: 'themeEventTime', label: '活动时间' },
    { prop: 'status', label: '活动状态' },
    { prop: 'themeEventType', label: '活动类型' },
    { prop: 'ctrol', label: '操作' },
  ]
  formatTimeToStr ( item ) {
    let { beginTime, endTime } = item
    if ( beginTime && endTime ) {
      return `${this.formatMyDate( new Date( beginTime.time ) )} - ${this.formatMyDate( new Date( endTime.time ), void 0, true )}`
    }
    return ''
  }
  matchItem ( id, arrName ) {
    let arr = []
    switch ( arrName ) {
      case 'themeEventMode':
        arr = themeEventModes
        break
      case 'status':
        arr = status
        break
      case 'themeEventType':
        arr = themeEventTypes
        break
    }

    let o = matchArrItem( id, arr, 'id' ) || {}
    return o.name
  }
  condition = [
    { value: '', key: 'themeEventName', label: '活动名称', type: 'text' },
    { value: '', key: 'themeEventMode', label: '客户端', type: 'radio', options: themeEventModes },
    { value: '', key: 'themeEventTime', label: '活动时间', type: 'daterange' },
    { value: '', key: 'status', label: '活动状态', type: 'radio', options: status },
    { value: '', key: 'themeEventType', label: '活动类型', type: 'radio', options: themeEventTypes }
  ]
  routeChange ( query ) {
    this.$router.push( {
      path: '/themeEvent/themeEventList',
      query
    } )
  }
  initCondition () {
    let query = this.$route.query
    this.condition.forEach( ( val: any ) => {
      let key = val.key
      val.value = query[ key ]
      if ( key == 'themeEventType' || key == 'status' || key == 'themeEventMode' ) {
        if ( val.value ) {
          val.value = +val.value
        }
      } else if ( key == 'themeEventTime' ) {
        let beginTime = query.beginTime
        if ( beginTime ) {
          let endTime = query.end
        }
      }
    } )
  }
  activated () {
    this.initCondition()
    this.search()
  }
  search ( cur?: number ) {
    this.$permissionValidateWithNotify( 652 )
    this.page.cur = cur || this.page.cur

    let option = this.computedOption()

    this.$http( API.getThemeEventByCondition, option ).then( ( { data } ) => {
      let myDate = data.data
      this.data = myDate.list
      this.page.total = myDate.total
    } )
  }
  @Inject() formatMyDate
  computedOption () {
    let o: any = {}
    this.condition.forEach( ( v: any ) => {
      let { key, value } = v
      if ( value !== '' ) {
        o[ key ] = value
      }
    } )
    let { cur, num } = this.page
    o.num = num
    o.start = ( cur - 1 ) * num
    if ( o.themeEventTime && o.themeEventTime[ 0 ] ) {
      let [ beginTime, endTime ] = o.themeEventTime
      o.beginTime = this.formatMyDate( new Date( beginTime ) )
      o.endTime = this.formatMyDate( new Date( endTime ), void 0, true )
    }
    this.routeChange( o )
    return o
  }
}

</script>
<style lang="stylus" scoped>
.link
  color #fff
  display block
  width 100%
  height 100%
</style>