
<template>
  <div class="box">
    <h3>
      {{title}}
      <tool-tips @handler-click="tableBtnClick" :has-view="hasView" :tips-html="tipsHtml" :has-tips="hasTips" :is-table="isTable"></tool-tips>
    </h3>
    <div class="data-box">
      <div class="canvas" ref="my-canvas"></div>
      <transition name="el-zoom-in-bottom">
        <div class="el-table el-table--fit el-table--border el-table--enable-row-hover el-table--enable-row-transition" v-if="isTable">
          <div class="el-table__header-wrapper">
            <table cellspacing="0" cellpadding="0" border="0" class="el-table__header" style="width: 100%;">
              <colgroup>
                <col name="el-table_1_column_3" width="33.3%">
                <col name="el-table_1_column_4" width="33.3%">
                <col name="el-table_1_column_5" width="33.3%">
              </colgroup>
              <thead>
                <tr>
                  <th class="is-leaf" v-for="item in config" :key="item.prop">
                    <div class="cell">{{item.label}}</div>
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          <div class="el-table__body-wrapper" style="height:334px;">
            <table cellspacing="0" cellpadding="0" border="0" class="el-table__header" style="width: 100%;">
              <colgroup>
                <col name="el-table_1_column_3" width="33.3%">
                <col name="el-table_1_column_4" width="33.3%">
                <col name="el-table_1_column_5" width="33.3%">
              </colgroup>
              <tbody v-for="(item,index) in tableData" :key="index">
                <template v-if="item.datapanelProvinceList">
                  <tr v-for="(p,i) in item.datapanelProvinceList" :key="i">
                    <td v-if="!i" :rowspan="item.datapanelProvinceList.length">
                      <div class="cell">{{item.region}}</div>
                    </td>
                    <td>
                      <div class="cell">{{p.province}}</div>
                    </td>
                    <td>
                      <div class="cell">{{p.gmv}}</div>
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td>
                      <div class="cell">{{item.name}}</div>
                    </td>
                    <td>
                      <div class="cell">{{item.name}}</div>
                    </td>
                    <td>
                      <div class="cell">{{item.gmv}}</div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script lang="ts">
import GmvBasic from "./gmvBasic.vue"
import { Component, Watch, Prop } from "vue-property-decorator"
import API from "../../../API/"

import { emptyRoundSvg } from '../const/svgPath'
import { thoundandSeparator } from '@/utils'
@Component( {
  name: "gmv-proportion"
} )
export default class GmvProportion extends GmvBasic {
  @Prop() year: number
  @Watch( "year" )
  yearWatcher ( v ) {
    // if (typeof v !== "string") return
    this.getData()
  }
  @Prop() month: number
  @Watch( "month" )
  monthWatcher ( v ) {
    this.getData()
  }
  @Prop() user: any
  @Watch( "user" )
  userWatcher ( v ) {
    this.getData()
  }
  formatTitle () {
    let myUser = ( this.user && this.user.name ) || "用户"

    return this.year + "年" + ( this.month && this.month + "月" ) + myUser + "区域占比"
  }
  allData: any = []
  get tableData () {
    return this.allData.concat()
  }

  get baseConfig () {
    return {
      region: { name: "地区" },
      city: { name: "省市" },
      gmv: { name: "GMV" }
    }
  }
  get config () {
    let o: any = []
    Object.keys( this.baseConfig ).forEach( key => {
      o.push( {
        prop: key,
        label: this.baseConfig[ key ].name
      } )
    } )
    return o
  }

  get zoneData () {
    this.allData.forEach( val => {
      let total = 0
      if ( val.datapanelProvinceList && val.datapanelProvinceList instanceof Array ) {
        val.datapanelProvinceList.forEach( v => {
          if ( v.isSelected ) total += v.gmv
        } )
      } else {
        if ( val.isSelected ) total += val.gmv
      }
      val.total = total
    } )
    // console.log( this.allData )
    return this.allData
  }
  get provinceData () {
    let datapanelProvinceList = []
    this.allData.forEach( v => {
      if ( v.datapanelProvinceList && v.datapanelProvinceList instanceof Array ) {
        v.datapanelProvinceList.forEach( val => {
          datapanelProvinceList.push( { ...val, total: val.isSelected ? val.gmv : 0 } )
        } )
      } else {
        datapanelProvinceList.push( { ...v, total: v.isSelected ? v.gmv : 0 } )
      }
    } )
    return datapanelProvinceList
  }
  get option () {
    let str = this.user ? this.user.name : ""
    let option = {
      tooltip: {
        trigger: "item",
        // formatter: "{b} <br/>销量： ¥ {c} 占比：{d}%"
        formatter: function ( { data, name, percent } ) {
          return `${name}<br/>销量： ¥ ${thoundandSeparator( ( data.gmv || 0 ) )} 占比：${percent}%`
        }
      },
      legend: [
        {
          left: 0,
          top: this.provinceData.length > 20 ? 60 : 100,
          height: this.provinceData.length > 20 ? 320 : 200,
          orient: "vertical",
          data: [],
          itemWidth: 5
        },
        {
          left: 0,
          top: 10,
          data: [],
          itemWidth: 10,
          width: "100%"
        }
      ],
      series: [
        {
          name: "省市销量",
          type: "pie",
          radius: [ "47%", "59%" ],
          center: [ "65%", "55%" ],
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
            { itemStyle: { normal: { color: "#94bf3c" } } },
            { itemStyle: { normal: { color: "#27a393" } } },
            { itemStyle: { normal: { color: "#26a4d6" } } },
            { itemStyle: { normal: { color: "#dd9213" } } },
            { itemStyle: { normal: { color: "#ffc021" } } }
          ]
        },
        {
          name: "地区销量",
          type: "pie",
          radius: [ "0%", "35%" ],
          center: [ "65%", "55%" ],
          label: {
            normal: {
              position: "inside",
              show: true,
              formatter: `{b}`
            },
            emphasis: {
              show: true
            }
          },
          data: [
            { itemStyle: { normal: { color: "#27a393" } } },
            { itemStyle: { normal: { color: "#a99f19" } } },
            { itemStyle: { normal: { color: "#f7ba2a" } } },
            { itemStyle: { normal: { color: "#e2534d" } } },
            { itemStyle: { normal: { color: "#3bbcbf" } } },
            { itemStyle: { normal: { color: "#dd9213" } } },
            { itemStyle: { normal: { color: "#20a0ff" } } },
            { itemStyle: { normal: { color: "#94bf3c" } } }
          ]
        }
      ]
    }
    this.zoneData.forEach( ( v, i ) => {
      option.legend[ 1 ].data.push( { ...v, icon: 'path://' + emptyRoundSvg, name: v.region } )
      option.series[ 1 ].data[ i ] = Object.assign( option.series[ 1 ].data[ i ] || {}, {
        ...v,
        value: v.total,
        isZone: 1,
        name: v.region
      } )
    } )
    this.provinceData.forEach( ( v, i ) => {
      option.legend[ 0 ].data.push( {
        ...v,
        // name: v.province || v.name,
        name: v.province,
        icon: 'path://' + emptyRoundSvg
      } )
      option.series[ 0 ].data[ i ] = Object.assign( option.series[ 0 ].data[ i ] || {}, {
        ...v,
        // name: v.province || v.name,
        name: v.province,
        value: v.total
      } )
    } )

    return option
  }
  @Watch( "option", { deep: true } )
  optionWatcher () {
    this.drawChart()
  }

  getData () {
    this.yexiao.showLoading()
    let o: any = {
      year: this.year,
      month: this.month,
      email: this.realEmail
    }
    if ( this.user ) {
      o.userType = this.user.userType
    }
    this.$http( API.getRegion, o ).then(
      ( { data } ) => {
        let d = data.data || []
        // if (!data.length) return
        this.$emit( "chose-city" )
        // this.$emit("next-step")
        d.forEach( v => {
          if ( v.datapanelProvinceList && v.datapanelProvinceList instanceof Array ) {
            v.datapanelProvinceList.forEach( va => {
              va.isSelected = true
              va.parent = v.name
            } )
          }
          v.isSelected = true
        } )
        this.allData = d
        this.drawChart()
      },
      rej => {
        this.notifyError( rej.data.msg )
      }
    )
  }

  afterDraw () {
    this.yexiao.off( "legendselectchanged" )

    this.yexiao.on( "click", params => {
      this.$emit( "chose-city", params )
    } )

    let o = {}
    this.provinceData.filter( v => {
      if ( !v.isSelected ) {
        if ( v.parent ) {
          o[ v.parent ] = o[ v.parent ] || 0
          o[ v.parent ]++
        }
      }
      return !v.isSelected
    } ).forEach( v => {
      this.yexiao.dispatchAction( {
        type: "legendToggleSelect",
        name: v.province
      } )
    } )

    this.zoneData.filter( v => {
      if ( o[ v.name ] == v.datapanelProvinceList.length ) {
        return true
      }
      return !v.isSelected
    } ).forEach( v => {
      this.yexiao.dispatchAction( {
        type: "legendToggleSelect",
        name: v.region
      } )
    } )

    this.yexiao.on( "legendselectchanged", params => {
      let arr = [],
        p = params.selected
      outerloop: for ( let i = 0, l = this.allData.length; i < l; i++ ) {
        let d = this.allData[ i ]
        if ( d.region == params.name ) {
          // 地区点击
          d.isSelected = p[ d.region ]
          d.datapanelProvinceList.forEach( v => {
            v.isSelected = p[ d.region ]
            if ( v.isSelected ) {
              d.isSelected = true
            }
          } )
          break outerloop
        } else {
          for ( let j = 0, k = d.datapanelProvinceList.length; j < k; j++ ) {
            let v = d.datapanelProvinceList[ j ]
            if ( v.province == params.name ) {
              v.isSelected = p[ v.province ]
              break outerloop
            }
          }
        }
      }
    } )
  }
}
</script>
