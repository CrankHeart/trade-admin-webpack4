<template>
  <div id="promotion-list">
    <lc-title text="促销列表">
      <create-link class="pull-right" v-if="$permissionValidate(548,400)"></create-link>
    </lc-title>
    <lc-condition :condition="condition" @submit="promotionListSearch"></lc-condition>
    <lc-table
      :sort="sort"
      :config="config"
      :data="data"
      @data-sort-change="sortChange"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop =='control'">
          <el-button size="small" @click="view(row,0)" v-if="$permissionValidate(545)">查看</el-button>

          <el-button
            size="small"
            @click="togglePromotion(row,1)"
            v-if="row.state==0&&$permissionValidate(546)"
          >取消</el-button>
          <!-- 原权限 促销恢复改为 促销编辑 -->
          <el-button
            size="small"
            @click="view(row,1)"
            v-if="row.state==2&&$permissionValidate(668)"
          >编辑</el-button>

          <el-button size="small" @click="copyPromotion(row)" v-if="$permissionValidate(547)">复制</el-button>
        </template>
        <template v-else>
          <span v-html="row[con.prop]"></span>
        </template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import createLink from './components/createLink.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/'
import { states, types } from './const/index'
import { duration, matchArrItem } from '../../utils/'
import API from '../../API'
@Component( {
  name: 'promotion-list',
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    createLink
  }
} )
export default class PromotionList extends Vue {
  startOptions = {
    disabledDate: ( time ) => {
      let end = this.condition[ 1 ].value
      return end && time.getTime() > new Date( end )
    }
  }
  endOptions = {
    disabledDate: ( time ) => {
      let start = this.condition[ 0 ].value
      return start && time.getTime() < new Date( start )
    }
  }
  condition = [
    { value: '', key: 'starttime', label: '发起时间', type: 'date', pickerOptions: this.startOptions },
    { value: '', key: 'endtime', label: '结束时间', type: 'date', pickerOptions: this.endOptions },
    { value: '', key: 'state', label: '促销状态', type: 'select', options: states },
    { value: '', key: 'type', label: '促销类型', type: 'select', options: types },
    { value: '', key: 'name', label: '促销名称', type: 'text' }
  ]
  config = [
    { prop: "name", label: "促销名称", width: "210" },
    { prop: "priority", label: "权重", width: "", sortable: true },
    { prop: "myType", label: "促销类型" },
    { prop: "myTimeMsg", label: "时间", width: "250" },
    { prop: "myStatus", label: "状态" },
    { prop: "control", label: "操作", width: "210" }
  ]
  data = []
  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  orderBy: string = 'desc'
  get sort () {
    return {
      order: this.orderBy == 'desc' ? 'descending' : 'ascending',
      prop: 'priority'
    }
  }
  activated () {
    this.initCondition()
    this.promotionListSearch()
  }
  converData ( value, prop ) {
    let arr = []
    switch ( prop ) {
      case 'type':
        arr = types
        break
      case 'state':
        arr = states
        break
    }
    return matchArrItem( value, arr )
  }
  initCondition () {
    let query = this.$route.query
    this.condition.forEach( val => {
      let key = val.key
      let v = query[ key ]
      if ( v ) {
        if ( key == 'starttime' || key == 'endtime' ) {
          val.value = new Date( v.replace( /\s/, 'T' ) )
        } else if ( key == 'state' ) {
          val.value = +v
        } else {
          val.value = v
        }
      }
    } )
  }
  sortChange ( { column, prop, order } ) {
    if ( !order || order == this.orderBy ) return
    this.orderBy = order == 'ascending' ? 'asc' : 'desc'
    this.page.cur = 1
    this.promotionListSearch()
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.promotionListSearch()
  }
  @Inject() formatMyDate
  formatListRequestData () {
    let o: any = {}
    this.condition.forEach( val => {
      let { key, value } = val
      o[ key ] = value
    } )
    o.starttime = o.starttime && this.formatMyDate( o.starttime )
    o.endtime = o.endtime && this.formatMyDate( o.endtime, 'yyyy-MM-dd hh:mm:ss', true )
    o.size = this.page.num
    o.pos = ( this.page.cur - 1 ) * o.size
    o.order = this.orderBy
    if ( o.state < 0 ) {
      delete o.state
    }
    if ( o.type == 'all' ) {
      delete o.type
    }
    return o
  }
  promotionListSearch () {
    this.$permissionValidateWithNotify( 544 )
    let o = this.formatListRequestData()
    this.$router.push( { path: '/promotion/list', query: o } )
    this.$http( API.promotion, o ).then( ( { data } ) => {
      this.data = this.formatData( data.promotions )
      this.page.total = data.total
    }, rej => {
      this.data = []
      this.page.total = 0
    } )
  }
  view ( row, type ) {
    if ( !row.id ) {
      return this.$notify( {
        type: 'error',
        message: '链接有误'
      } )
    }
    if ( type == 1 ) {
      this.$router.push( {
        path: '/promotion/create',
        query: {
          discountId: row.id
        }
      } )
    } else {
      this.$router.push( {
        path: '/promotion/detail/' + row.id
      } )
    }

  }
  togglePromotion ( v, state ) {
    this.$http( API.togglePromotion, {
      discountId: v.id,
      state
    } ).then( ( { data } ) => {
      v.myStatus = this.formatState( state, new Date( v.startTime.replace( /\s/, 'T' ) ), new Date( v.endTime.replace( /\s/, 'T' ) ) )
      this.$notify( {
        title: v.name,
        type: 'success',
        message: '成功设置状态为： ' + v.myStatus + '!'
      } )
    } )
  }
  copyPromotion ( v ) {
    if ( v.myType !== '全部' ) {
      for ( let i = 0, m = types.length; i < m; i++ ) {
        const type = types[ i ]
        if ( type.id !== '' && v.ruleClass === +type.id ) {
          return this.$router.push( {
            path: '/promotion/create',
            query: {
              copyId: v.id
            }
          } )
        }
      }
    }
    return this.$notify( {
      title: '促销活动复制失败',
      type: 'error',
      message: v.name + '不支持复制！'
    } )
  }
  formatState ( state, startTime, endTime ) {
    const now = Date.now()
    switch ( state ) {
      case 0:
        return ( now > endTime ? '已过期' : ( now < startTime ? '未开始' : '已开始' ) )
      case 1:
        return '已失效'
      case 2:
        return '未发布'
    }
  }
  formatData ( source ) {
    if ( !source ) return []
    let l = source.length
    while ( l ) {
      let data: any = source[ l - 1 ]
      let rulePeriodStart = data.rulePeriodStart && data.rulePeriodStart.time
      let rulePeriodEnd = data.rulePeriodEnd && data.rulePeriodEnd.time
      let startTime = rulePeriodStart && new Date( rulePeriodStart ) || null
      let endTime = rulePeriodEnd && new Date( rulePeriodEnd ) || null
      let now = Date.now()

      data.startTime = startTime && this.formatMyDate( startTime ) || '--'
      data.endTime = endTime && this.formatMyDate( endTime ) || '--'
      data.myStatus = this.formatState( data.state, startTime, endTime )
      data.myType = '不支持的促销类型'
      for ( let i = 0, m = types.length; i < m; i++ ) {
        const type = types[ i ]
        if ( '' + data.ruleClass == type.id ) {
          data.myType = type.name
          break
        }
      }
      data.myTimeMsg = '<p>' + data.startTime + ' 至</p><p>' + data.endTime + '</p><p>促销持续：' + duration( rulePeriodEnd - rulePeriodStart ) + '</p>'
      l--
    }
    return source
  }

}
</script>
