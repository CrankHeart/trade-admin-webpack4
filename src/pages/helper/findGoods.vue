<template>
  <div id="find-goods">
    <lc-title text="找货助手"></lc-title>
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table
      :config="config"
      :data="myData"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop=='createDate'">{{formatMyDate(scope.row.createDate.time)}}</template>
        <template v-else-if="scope.con.prop=='comment'">
          <el-input
            type="textarea"
            :autosize="{minRows:1,maxRows:4}"
            v-model="scope.row.comment"
            @change="commentChange(scope.row)"
            @blur="commentUpdate(scope.row)"
          ></el-input>
        </template>
        <template v-else-if="scope.con.prop=='usrId'">
          <!--用户名显示中文-->
          {{scope.row['usrId']}} {{scope.row['usrName'] ? '('+scope.row['usrName']+')':'' }}
        </template>
        <template v-else-if="scope.con.prop=='type'">{{types[scope.row.type].name}}</template>
        <template v-else-if="scope.con.prop=='product_desc'">
          <el-button type="text" @click="toDetail(scope.row)" v-if="scope.row[scope.con.prop]">查看详情</el-button>
        </template>
        <template v-else-if="scope.con.prop=='content'">
          <div v-html="scope.row['content']"></div>
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
import lcTable from '../../components/table/index'
import API from '../../API'
import { Page } from '../../typing/index'
@Component( {
  name: 'find-goods',
  components: {
    lcTitle, lcCondition, lcTable
  }
} )
export default class FindGoods extends Vue {
  types = [
    { name: '找货', id: 0 },
    { name: '面议', id: 1 },
    { name: '订购', id: 2 }
  ]
  condition = [
    { value: [], key: 'date', label: '时间范围', type: 'daterange' },
    { value: '', key: 'type', label: '类型', type: 'select', options: this.types }
  ]
  config = [
    { prop: "type", label: "类型" },
    { prop: "createDate", label: "日期" },
    { prop: "usrId", label: "用户名称" },
    { prop: "content", label: "内容" },
    { prop: "mobile", label: "联系方式" },
    { prop: "comment", label: "备注" },
    { prop: "product_desc", label: "相关商品" }
  ]
  allData = []
  page: Page = {
    cur: 1,
    total: 0,
    num: 20
  }
  curChange ( cur: number ) {
    this.page.cur = cur
  }
  commentChange ( item ) {
    item.isChanged = true
  }
  commentUpdate ( item ) {
    this.$permissionValidateWithNotify( 556 )
    if ( !item.isChanged ) return
    this.$http( API.saveGoodsAssistComment, {
      id: item.id,
      comment: item.comment
    } ).then( res => {
      delete item.isChanged
    } )
  }
  toDetail ( item ) {
    this.$http( API.getProductList, {
      lcCode: item.product_desc
    } ).then( ( { data } ) => {
      this.$router.push( {
        path: '/product/detail/' + data.list[ 0 ].id
      } )
    }, ( { data } ) => {
      this.$notify( {
        type: 'error',
        message: data.msg || '访问错误，请重新尝试！'
      } )
    } )
  }
  activated () {
    this.search()
  }
  get myData () {
    let num = this.page.num
    let start = ( this.page.cur - 1 ) * num
    return this.allData.slice( start, start + num )
  }
  @Inject() formatMyDate
  search ( cur?) {
    this.$permissionValidateWithNotify( 555 )
    this.page.cur = cur || this.page.cur
    let o: any = {}
    this.condition.forEach( val => {
      let { key, value } = val
      if ( key == 'date' ) {
        if ( value && value[ 0 ] ) {
          o.startTime = this.formatMyDate( value[ 0 ] )
          o.endTime = this.formatMyDate( value[ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
        }
      } else {
        if ( value !== '' ) {
          o[ key ] = value
        }
      }
    } )
    this.$http( API.getGoodsAssistByTime, o ).then( ( { data } ) => {
      this.allData = data.info
      this.page.total = data.total
    } )
  }
  created () {
    console.log( this )
  }
}
</script>

