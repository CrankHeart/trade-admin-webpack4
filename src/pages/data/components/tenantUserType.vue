<template>
  <div class="box">
    <h3>
      {{title}}
      <div class="tenant-user-type-tabs">
        <ul>
          <li
            v-for="(tab,index) in tabs"
            :key="tab"
            @click="$emit('is-sales-department-change', index === 1)"
            :class="{'is-active':index==curTabIndex}"
          >{{tab}}</li>
        </ul>
      </div>
      <tool-tips
        @handler-click="tableBtnClick"
        :has-view="hasView"
        :tips-html="tipsHtml"
        :has-tips="hasTips"
        :is-table="isTable"
      ></tool-tips>
    </h3>
    <div class="data-box">
      <div class="canvas" ref="my-canvas"></div>

      <transition name="el-zoom-in-bottom">
        <lc-table
          :has-page="false"
          :height="height"
          :config="config"
          :data="tableData"
          v-if="isTable"
        >
          <template slot-scope="scope">{{scope.row[scope.con.prop] }}</template>
        </lc-table>
      </transition>
    </div>
  </div>
</template>
<script lang="ts">
// import GmvBasic from './gmvBasic.vue'
import GmvUser from './gmvUser'
import { Component, Prop, Watch } from 'vue-property-decorator'
import API from '../../../API/'
import { emptyRoundSvg } from '../const/svgPath'
import tenantBasic from './tenantBasic'
import { userTypeObj } from '../../order/const/orderSearchCondition'
import { salesDepartmentsObj } from '../../../const/index'
@Component( {
  name: 'tenant-user-type',
  mixins: [ tenantBasic ]
} )
export default class TenantUserType extends GmvUser {
  @Prop( { type: [ Number, String ] } )
  type
  @Prop()
  isHistory: boolean
  @Prop()
  isSaleCity: boolean
  @Prop()
  regionProvince: string
  @Prop()
  curTab: number
  @Prop()
  region: string
  @Prop()
  isSalesDepartment: boolean
  @Prop()
  userType: number
  @Prop()
  salesDepartmentsType: number
  tabs: string[] = [ '各类型客户', '销售部门' ]
  get curTabIndex () {
    return +this.isSalesDepartment
  }
  formatTitle () {
    let formatTypes: any = ( this as any ).formatTypes
    // return this.year + '年' + ( this.type === '3,4' && this.isHistory ? '' : this.month && this.month + '月' ) + formatTypes( this.type ) + ( this.isSaleCity ? '销售区域' : '地理区域' ) + ( this.regionProvince || '' ) + '客户分类占比'
    return this.year + '年' + ( this.type === 2 && this.isHistory ? '' : this.month && this.month + '月' ) + formatTypes( this.type ) + ( this.isSaleCity ? '销售区域' : '地理区域' ) + ( this.regionProvince || '' ) + '客户分类占比'
  }
  get baseConfig (): any {
    return this.curTabIndex === 0 ? ( this.curTab ? {
      myUserType: { name: '客户类型' },
      num: { name: '数量' }
    } : {
      myUserType: { name: '客户类型' },
      gmv: { name: 'GMV' }
    } ) : ( this.curTab ? {
      myUserType: { name: '销售部门' },
      num: { name: '数量' }
    } : {
      myUserType: { name: '销售部门' },
      gmv: { name: 'GMV' }
    } )
  }
  @Watch( 'curTabIndex' )
  curTabIndexWatcher () {
    this.getData()
  }
  getData () {
    this.yexiao.showLoading()
    let url = this.curTabIndex === 0 ? ( this.curTab === 1 ? API.getUserTypeProNum : API.getUserTypePro ) : ( this.curTab === 1 ? API.salesDepartmentsNum : API.salesDepartmentsGmv )
    let option = ( this as any ).ajaxOption
    this.$http( url, {
      ...option
    } ).then( ( { data } ) => {
      let d = data.data || []
      d.forEach( v => {
        // console.log( v )
        v.myUserType = this.curTabIndex === 0 ? ( userTypeObj[ v.userType ].name || '未知用户' ) : ( salesDepartmentsObj[ v.salesDepartments ].name || '空' )
      } )
      this.allData = d
      // this.$emit('chose-user', {
      //   data: {},
      //   name: ''
      // })
      // this.$emit('next-step')
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }

  get option (): any {
    let option = {
      title: [
        {
          text: '0',
          // subtext: '各类型客户',
          textStyle: {
            color: '#338cea',
            fontSize: 30,
          },
          // subtextStyle: {
          //   color: '#3d3d3d',
          //   fontSize: 18,
          // },
          left: 20,
          top: 10
        }
      ],
      tooltip: {
        trigger: 'item',
        // formatter: '{b} <br/>本月销量：¥ {c}  <br/>占比：{d}%'
        formatter: ( { value, name, percent } ) => this.curTab ? `${name}<br/>数量： ${value} 占比：${percent}%` : `${name}<br/>销量： ¥ ${this.toTenThousand( value )} 占比：${percent}%`
      },
      legend: [
        {
          left: 20,
          top: 50,
          data: [

          ],
          itemWidth: 10,
          width: '100%'
        }
      ],
      series: [
        {
          name: '全平台销量',
          type: 'pie',
          radius: [ '0%', '70%' ],
          center: [ '55%', '63%' ],
          label: {
            normal: {
              show: true,
              formatter: `{b}`
            },
            emphasis: {
              show: true
            }
          },
          data: [
            // { itemStyle: { normal: { color: '#94bf3c' } } },
            // { itemStyle: { normal: { color: '#ffc020' } } },
            // { itemStyle: { normal: { color: '#fe7065' } } },
            // { itemStyle: { normal: { color: '#5a8eca' } } },
            // { itemStyle: { normal: { color: '#dd9213' } } },
            // { itemStyle: { normal: { color: '#2d9213' } } }
          ]
        },
      ]
    }
    let total = 0

    this.allData.forEach( ( v, i ) => {
      let prop = ''
      if ( this.curTab ) {
        prop = 'num'
      } else {
        prop = 'gmv'
      }
      total += v[ prop ]
      // this.encodeUserType( v )
      v.name = this.curTabIndex === 0 ? ( userTypeObj[ v.userType ].name || '未知用户' ) : ( salesDepartmentsObj[ v.salesDepartments ].name || '空' )
      option.legend[ 0 ].data.push( { name: v.name, icon: 'path://' + emptyRoundSvg }, )
      // Object.assign( option.series[ 0 ].data[ i ], { value: v[ prop ], name: v.name, userType: v.userType } )

      let colors = [ '#94bf3c', '#ffc020', '#fe7065', '#5a8eca', '#dd9213', '#2d9213' ]
      let o = {
        value: v[ prop ],
        name: v.name,
        itemStyle: {
          normal: {
            color: colors[ i ]
          }
        }
      }
      let myType = this.curTabIndex === 0 ? { userType: v.userType } : { salesDepartments: v.salesDepartments }
      option.series[ 0 ].data.push( { ...o, ...myType } )

    } )
    option.title[ 0 ].text = ( this.curTab && total + '家' ) || ( '¥' + this.toTenThousand( total ) )

    return option
  }
}

</script>
<style lang="stylus">
.tenant-user-type-tabs
  font-weight normal
  position absolute
  right 45px
  top -5px
  z-index 9999
  li
    float left
    line-height 24px
    border 1px solid #efefef
    font-size 12px
    padding 3px 10px
    cursor pointer
    background #fff
    &:first-child
      padding-left 25px
      border-top-left-radius 15px
      border-bottom-left-radius 15px
    &:last-child
      margin-left -1px
      padding-right 25px
      border-top-right-radius 15px
      border-bottom-right-radius 15px
    &.is-active
      background #ccc
</style>
