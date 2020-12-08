<template>
  <div class="box">
    <h3>
      {{title}}
      <div class="tenant-user-regin-tabs">
        <ul>
          <li
            v-for="(tab,index) in tabs"
            :key="tab"
            @click="$emit('is-sale-city-change', index === 1)"
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
import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { sortBy, thoundandSeparator } from '../../../utils'
import tenantBasic from './tenantBasic'
@Component( {
  name: 'tenant-user-region',
  mixins: [ tenantBasic ]
} )
export default class TenantUserRegion extends GmvBasic {
  tabs: string[] = [ '地理区域', '销售区域' ]
  // curTabIndex: number = 0
  get curTabIndex () {
    return +this.isSaleCity
  }
  @Prop()
  isHistory: boolean
  @Prop()
  isSaleCity: boolean
  @Prop()
  year: number
  @Prop( { type: [ Number, String ] } )
  type
  @Prop()
  month: number
  @Prop()
  curTab: number
  @Prop()
  region: string
  allData: any = []
  formatTitle () {
    let formatTypes: any = ( this as any ).formatTypes
    // return this.year + '年' + ( this.type === '3,4' && this.isHistory ? '' : this.month && this.month + '月' ) + formatTypes( this.type ) + ( this.isSaleCity ? '销售区域' : '地理区域' ) + '占比'
    return this.year + '年' + ( this.type === 2 && this.isHistory ? '' : this.month && this.month + '月' ) + formatTypes( this.type ) + ( this.isSaleCity ? '销售区域' : '地理区域' ) + '占比'
  }

  getData () {
    this.yexiao.showLoading()
    let url = this.curTab === 1 ? API.getUserRegionProNum : API.getUserRegionPro
    let option = ( this as any ).ajaxOption
    return this.$http( url, {
      ...option,
      type: option.type === undefined ? 0 : option.type
    } ).then( ( { data } ) => {
      let d = data.data || []
      d.forEach( v => {
        v.target = v.target || 0
      } )

      this.allData = d.filter( v => v )

      this.drawChart()
      return { data }
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }
  get tableData () {
    return this.allData.concat()
  }
  get baseConfig () {
    let prop = this.isSaleCity ? 'salesCity' : 'province'
    return this.curTab ? {
      [ prop ]: { name: '地区' },
      num: { name: '数量' },
      target: { name: `目标`, color: '#26a4d6' }
    } : {
      [ prop ]: { name: '地区' },
      gmv: { name: 'GMV' },
      target: { name: `目标`, color: '#26a4d6' }
    }
  }
  get option () {
    let data = this.allData.sort( sortBy( this.curTab ? 'num' : 'gmv', true ) )
    let colors = [
      { itemStyle: { normal: { color: '#94bf3c' } } },
      { itemStyle: { normal: { color: '#ffc020' } } },
      { itemStyle: { normal: { color: '#fe7065' } } },
      { itemStyle: { normal: { color: '#5a8eca' } } },
      { itemStyle: { normal: { color: '#dd9213' } } }
    ]
    let option = {
      tooltip: {
        trigger: 'item',
        formatter: ( { name, value, marker } ) => this.curTab ? `${name}<br/>${marker}数量： ${thoundandSeparator( value, 0 )} ` : `${name}<br/>销量： ¥ ${this.toTenThousand( value )} `
      },
      legend: [],
      grid: {
        top: '7%',
        left: '2%',
        right: '2%',
        bottom: '0%',
        containLabel: true
      },
      xAxis: [
        {
          axisLabel: {
            rotate: 70,
            textStyle: {
              fontSize: 12,
              color: '#ccc'
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          data: data.sort( sortBy( this.curTab ? 'num' : 'gmv', true ) ).map( v => v.province || v.salesCity || '其他' )
        }
      ],
      yAxis: [
        {
          axisLabel: {
            formatter: ( value, index ) => this.curTab ? value : this.toTenThousand( value, 0 ),
            rotate: 30,
            textStyle: {
              fontSize: 14,
              color: '#ccc'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ccc'
            }
          },
          splitNumber: 5,
          splitLine: {
            lineStyle: {
              width: 1,
              color: [ 'rgba(38, 164, 214,.2)' ]
            }
          }
        }
      ],
      barWidth: 20,
      label: {
        normal: {
          show: true,
          position: 'top',
          padding: 5,
          backgroundColor: 'rgba(38, 164, 214,.8)',
          color: '#fff',
          borderRadius: 4,
          formatter: ( { value } ) => this.curTab ? thoundandSeparator( value, 0 ) : thoundandSeparator( value / 10000, 2 )
        }
      },
      series: [
        {
          type: 'bar',
          data: data.sort( sortBy( this.curTab ? 'num' : 'gmv', true ) ).map( v => this.curTab ? v.num : v.gmv ),
          itemStyle: { normal: { color: 'rgba(38, 164, 214, 1)' } }
        },
        {
          type: 'line',
          data: data.map( v => v.target ),
          symbol: 'emptyCircle',
          symbolSize: 6,
          cursor: 'default',
          lineStyle: {
            normal: {
              color: '#b8e262'
            }
          },
          label: {
            normal: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              borderColor: 'rgba(0, 0, 0, 0.1)',
              color: '#94bf3c'
            }
          },
          tooltip: {
            formatter: ( { dataIndex, value, name } ) => {
              let d = data.filter( v => v.name == name )[ 0 ] || {}
              let total = this.curTab ? d.num : d.gmv
              return `${name}:<br/>
                  目　标：${this.toTenThousand( value )}<br/>
                  已完成：${this.toTenThousand( total )}<br/>
                  完成度：${( total / value * 100 ).toFixed( 2 ) + '%'}`
            }
          }
        }
      ]
    }
    return option
  }
  afterDraw () {
    this.yexiao.on( 'click', ( data ) => {
      this.$emit( 'chose-city', data )
    } )
  }
}

</script>
<style lang="stylus">
.tenant-user-regin-tabs
  font-weight normal
  position absolute
  right 50px
  top 0
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
