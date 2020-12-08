<template>
  <div class="box">
    <h3>
      {{title}}
      <div class="tenant-user-regin-tabs">
        <ul>
          <li
            v-for="tab in tabs"
            :key="tab.id"
            @click="$emit('saleTypeChange', tab.id)"
            :class="{'is-active':tab.id==saleType}"
          >{{tab.name}}</li>
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
          <template slot-scope="scope">{{scope.row[scope.con.prop] || ''}}</template>
        </lc-table>
      </transition>
    </div>
  </div>
</template>
<script lang="ts">
import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { sortBy } from '../../../utils'
import { saleTypes } from '../const/index'
import { emptyRoundSvg } from '../const/svgPath'
import { thoundandSeparator } from '@/utils'
@Component( {
  name: 'product-brand-flow-top'
} )
export default class ProductBrandFlowTop extends GmvBasic {
  tabs: any[] = saleTypes

  @Prop() begindate: string
  @Prop() saleType: string

  get title (): string {
    return '商品TOP分布'
  }

  allData: any = []

  get tableData () {
    return this.allData.concat()
  }

  get baseConfig () {
    return this.saleType == '0' ? {
      label: { name: '类型' },
      saleAmount: { name: '销售额' }
    } : {
      label: { name: '类型' },
      saleNum: { name: '销售量' }
    }
  }

  get option () {
    let option = {
      tooltip: {
        trigger: 'item',
        formatter: ( { data, name, percent } ) => {
          return this.saleType == '1' ? `${name}<br/>销售量：${( data.value || 0 )} <br/>占比：${percent}% ` : `${name}<br/>销售额： ¥ ${thoundandSeparator( ( data.value || 0 ) )} 占比：${percent}%`
        }
      },
      legend: [
        {
          left: 20,
          top: 20,
          data: this.allData.map( v => ( {
            name: v.label,
            icon: 'path://' + emptyRoundSvg
          } ) ),
          itemWidth: 10,
          width: '100%'
        }
      ],
      color: [ 'rgb(135,193,69)', 'rgb(65,140,198)' ],
      series: [
        {
          name: '全平台销量',
          type: 'pie',
          radius: [ '0%', '60%' ],
          center: [ '55%', '63%' ],
          label: {
            normal: {
              show: true,
              formatter: ( { data } ) => data.label
            },
            emphasis: {
              show: true
            }
          },
          data: this.allData.map( v => ( {
            ...v,
            value: this.saleType == '1' ? v.saleNum : v.saleAmount,
            name: v.label
          } ) )
        },
      ]
    }

    return option
  }

  get requestOption () {
    let o: any = {
      queryType: this.saleType,
      begindate: this.begindate || '2017-1-1 00:00:00'
    }
    return o
  }
  @Watch( 'requestOption' )
  requestOptionWatcher () {
    this.getData()
  }
  getData () {
    this.$http( API.spuAttributeAmount, this.requestOption ).then( ( { data } ) => {
      let d = data.data
      let o: any = {}
      let key = this.saleType == '0' ? 'saleAmount' : 'saleNum'
      d.forEach( v => {
        let label = v.label || '普通'
        v.label = label
        if ( o[ label ] ) {
          o[ label ][ key ] += v[ key ]
        } else {
          o[ label ] = v
        }
      } )
      let arr = []
      Object.keys( o ).forEach( v => {
        return arr.push( o[ v ] )
      } )

      this.allData = arr
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }

  afterDraw () {
    this.yexiao.on( 'click', ( { dataIndex } ) => {
      this.$emit( 'choseLabel', this.allData[ dataIndex ] )
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
