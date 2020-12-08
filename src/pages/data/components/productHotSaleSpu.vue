<template>
  <div class="box">
    <h3>
      {{title}}
      <!-- <div class="tenant-user-regin-tabs ">
        <ul>
          <li v-for="tab in tabs" :key="tab.id" @click="$emit('saleTypeChange', tab.id)" :class="{'is-active':tab.id==saleType}">{{tab.name}}</li>
        </ul>
      </div>-->
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
          <template slot-scope="scope">{{scope.row[scope.con.prop]}}</template>
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
  name: 'product-hot-sale-spu'
} )
export default class ProductHotSaleSpu extends GmvBasic {
  tabs: any[] = saleTypes

  @Prop() begindate: string
  @Prop() saleType: string

  get title (): string {
    return '品牌TOP分布'
  }

  allData: any = []

  get tableData () {
    return this.allData.concat()
  }

  get baseConfig () {
    return {
      name: { name: '商品' },
      value: { name: this.saleType == '0' ? '销售额' : '销售量' }
    }
  }
  get option () {
    let option = {
      tooltip: {
        trigger: 'item',
        formatter: ( { data, name, percent } ) => {
          return this.saleType == '1' ? `${name}<br/>销售量：${( data.value || 0 )} <br/>占比：${percent}% ` : `${name}<br/>销售额： ¥ ${thoundandSeparator( ( data.value || 0 ) )} <br/>占比：${percent}%`
        }
      },
      color: [ 'rgb(135,193,69)', 'rgb(65,140,198)' ],
      legend: [
        {
          left: 20,
          top: 20,
          data: this.allData.map( v => ( {
            name: v.name,
            icon: 'path://' + emptyRoundSvg
          } ) ),
          itemWidth: 10,
          width: '100%'
        }
      ],
      series: [
        {
          name: '全平台销量',
          type: 'pie',
          radius: [ '0%', '60%' ],
          center: [ '55%', '63%' ],
          label: {
            normal: {
              show: true
            },
            emphasis: {
              show: true
            }
          },
          data: this.allData
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
    this.$http( API.spuSelling, this.requestOption ).then( ( { data } ) => {
      let o: any[] = []
      let d = data.data || {}
      Object.keys( d ).forEach( v => {
        o.push( {
          name: v,
          value: d[ v ] || 0
        } )
      } )

      this.allData = o
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }
}


</script>