<template>
  <div class="product-turnover-time box">
    <h3>
      {{title}}
      <div class="product-turnover-time-tabs">
        <ul>
          <li
            v-for="tab in tabs"
            :key="tab.id"
            @click="$emit('showTypeChange', tab.id)"
            :class="{'is-active':tab.id==showType}"
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
import { productTurnoverShowTypes, productTurnoverTurnTypes } from '../const'
import API from '../../../API/'
import { emptyRoundSvg } from '../const/svgPath'
import { matchArrItem } from '../../../utils'
@Component( {
  name: 'product-turnover-time'
} )
export default class ProductTurnoverTime extends GmvBasic {
  tabs: any[] = productTurnoverShowTypes
  @Prop()
  showType: number
  @Prop()
  year: number
  @Prop()
  month: number
  get requestOption () {
    return {
      showType: this.showType,
      year: this.year,
      month: this.month
    }
  }
  @Watch( 'requestOption' )
  requestOptionWatcher ( v ) {
    this.getData()
  }
  allData: any = []
  get baseConfig () {
    let item = matchArrItem( this.showType, productTurnoverShowTypes, 'id' )
    return {
      label: { name: '类型' },
      [ item.prop ]: { name: item.name }
    }
  }
  get title () {
    return matchArrItem( this.showType, productTurnoverShowTypes, 'id' ).name
  }

  get tableData () {
    return this.allData.concat()
  }
  getData () {
    this.$http( API.getSkuSummarys, this.requestOption ).then( ( { data } ) => {
      let prop = matchArrItem( this.showType, productTurnoverShowTypes, 'id' ).prop
      let d = data.data || []
      this.allData = d.map( v => ( { ...v, value: v[ prop ], label: matchArrItem( v.turnType, productTurnoverTurnTypes, 'id' ).name } ) )

      this.drawChart()
    } )
  }
  get option () {
    let option = {
      tooltip: {
        trigger: 'item'
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
      grid: {
        top: '7%',
        left: '2%',
        right: '2%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          axisLabel: {
            rotate: 70,
            textStyle: {
              fontSize: 12,
              color: '#9397a2'
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          data: this.allData.map( v => v.label )
        }
      ],
      yAxis: [
        {
          axisLabel: {
            textStyle: {
              fontSize: 14,
              color: '#9397a2'
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              width: 1,
              color: [ '#f5f5f5' ]
            }
          }
        }
      ],
      series: [
        {
          name: matchArrItem( this.showType, productTurnoverShowTypes, 'id' ).name,
          type: 'bar',
          itemStyle: {
            normal: {
              color: 'rgba(38, 164, 214, 1)'
            }
          },
          barWidth: 20,
          data: this.allData
        },
      ]
    }

    return option
  }
  afterDraw () {
    this.yexiao.on( 'click', ( { data } ) => {
      this.$emit( 'turnTypeChange', data.turnType )
    } )
  }
}
</script>
<style lang="stylus" scoped>
.product-turnover-time-tabs
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
.box
  margin-bottom 20px
h3
  position relative
  .el-icon-information
    font-size 12px
.data-box
  height 370px
  position relative
  .table-with-page, .el-table
    position absolute
    width 100%
    height 100%
    left 0
    top 0
.canvas
  width 100%
  height 370px
</style>
