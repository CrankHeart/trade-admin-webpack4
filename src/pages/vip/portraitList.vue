<template>
  <div id="user-portrait">
    <lc-title text="用户画像"></lc-title>
    <lc-condition :condition="condition" @submit="search" label-width="120px">
      <template slot-scope="{row}">
        <template v-if="row.type=='region' ">
          <el-input v-model="row.value.searchValue" placeholder="请根据区域范围输入搜索条件">
            <el-select
              v-model="row.value.condition"
              placeholder="搜索范围"
              slot="prepend"
              style="width:120px"
            >
              <el-option label="大区" value="region"></el-option>
              <el-option label="省市" value="province"></el-option>
              <el-option label="城市" value="city"></el-option>
            </el-select>
          </el-input>
        </template>
        <template v-else-if="row.type=='saleRegion' ">
          <el-input v-model="row.value.searchValue" placeholder="请根据区域范围输入搜索条件">
            <el-select
              v-model="row.value.condition"
              placeholder="搜索范围"
              slot="prepend"
              style="width:120px"
            >
              <el-option label="销售大区" value="salesRegion"></el-option>
              <el-option label="销售城市" value="salesCity"></el-option>
            </el-select>
          </el-input>
        </template>
      </template>
    </lc-condition>
    <el-button
      :disabled="!selectedData.length"
      size="small"
      @click="dialogVisible=true"
      style="margin-bottom:20px;"
      v-if="$permissionValidate(559)"
    >修改耗材负责人</el-button>
    <lc-table-config :base-config="baseConfig" @set-config="setPortraitConfig"></lc-table-config>
    <lc-table
      :config="config"
      :data="myData"
      :height="600"
      :page="page"
      @cur-change="curChange"
      :selection="true"
      @data-selection-change="dataSelectionChange"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop=='control'">
          <el-button
            type="info"
            size="mini"
            @click="detailOper(row)"
            v-if="$permissionValidate(558)"
          >查看详情</el-button>
        </template>
        <template v-else-if=" con.prop=='isActive'">
          <!-- {{row[con.prop] ? '是':'否'}} -->
          {{convertStatus(row[con.prop],option.activeStatus)}}
        </template>
        <template v-else-if="con.prop=='signed' ">{{row[con.prop] ? '是':'否'}}</template>
        <template
          v-else-if="con.prop=='salesDepartments' "
        >{{convertStatus(row[con.prop],option.salesDepartmentss)}}</template>
        <template v-else-if="con.prop=='customerLevel'">
          <!-- {{row[con.prop] ? '是':'否'}} -->
          {{convertStatus(row[con.prop],option.customerLevels)}}
        </template>
        <template v-else-if="con.prop=='purchasingFrequency'">
          <!-- {{row[con.prop] ? '是':'否'}} -->
          {{convertStatus(row[con.prop],option.purchasingFrequencys)}}
        </template>
        <template
          v-else-if="con.prop=='lastTradeTime' || con.prop=='firstTradeTime'"
        >{{formatMyDate(row[con.prop] && row[con.prop].time)}}</template>
        <template
          v-else-if="'userType,priceLevel,creditLevel,roundingType'.indexOf(con.prop)>-1"
        >{{convertData(row[con.prop],con.prop )}}</template>
        <template
          v-else-if="con.prop=='orderType'"
        >{{row.enabled ? `月结用户 | ${row.settlementMethod?row.settlementMethod+'个月': '固定期限'}`:'普通用户'}}</template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
    <el-dialog v-model="dialogVisible" title="修改耗材负责人">
      <consumables-person-search v-model="consumablesPerson"></consumables-person-search>
      <div slot="footer">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmChangeConsumablesPerson">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import { buildPersonTypeData } from '@/utils/index'
import lcTitle from "../../components/title.vue"
import lcCondition from "../../components/condition.vue"
import lcTable from "../../components/table/"
import lcTableConfig from "../../components/table/control.vue"
import { orderTypes, userTypes, priceLevels, creditLevels, activeStatus, customerLevels, settlementStatus, purchasingFrequencys, salesDepartmentss, tradeStatuss, monthlyServers } from './const/'
import { Mutation, Getter } from "vuex-class"
import portraitMixins from './components/portraitMixins'
import consumablesPersonSearch from '../../components/consumablesPersonSearch.vue'

import API from '../../API'
@Component( {
  name: 'UserPortrait',
  mixins: [ portraitMixins ],
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    lcTableConfig,
    consumablesPersonSearch
  }
} )
export default class UserPortrait extends Vue {
  @Getter( "portrait/portraitConfig" ) baseConfig
  @Mutation( 'portrait/setPortraitConfig' ) setPortraitConfig
  sourceList: any[]
  get config () {
    return this.baseConfig.filter( v => v.isChecked )
  }
  @Getter( 'login/email' ) email
  get realEmail () {
    if ( this.$permissionValidate( 727 ) ) {
      return this.email
    }
    return void 0
  }
  convertStatus ( status, list ) {
    for ( let i = 0, l = list.length; i < l; i++ ) {
      let myStatus = list[ i ]
      if ( myStatus.id == status ) {
        return myStatus.name
      }
    }
    return ''
  }
  option = {
    orderTypes, userTypes, priceLevels, creditLevels, activeStatus, customerLevels, settlementStatus, purchasingFrequencys, salesDepartmentss
  }
  condition = [
    { value: { condition: '', searchValue: '' }, key: 'region', label: '地理区域', type: 'region' },
    { value: { condition: '', searchValue: '' }, key: 'saleRegion', label: '客户归属区域', type: 'saleRegion' },
    { value: {}, key: 'tenant', label: '集团名称', type: 'tenantSearch' },
    { value: '', key: 'name', label: '客户名称', type: 'text' },
    // { value: '', key: 'enabled', label: '结算类型', type: 'select', options: settlementStatus },
    { value: '', key: 'enabled', label: '月结服务', type: 'select', options: monthlyServers },
    { value: '', key: 'creditLevel', label: '信用等级', type: 'select', options: creditLevels },

    { value: '', key: 'tradeStatus', label: '交易状态', type: 'select', options: tradeStatuss },

    { value: '', key: 'purchasingFrequency', label: '采购频率', type: 'select', options: purchasingFrequencys },
    // { value: '', key: 'date', label: '成长阶段', type: 'select' },
    { value: '', key: 'userType', label: '用户分类', type: 'select', options: userTypes },
    { value: '', key: 'customerLevel', label: '客户等级', type: 'select', options: customerLevels },
    { value: '', key: 'isActive', label: '是否活跃', type: 'select', options: activeStatus },
    { value: '', key: 'priceLevel', label: '会员等级', type: 'select', options: priceLevels },
    { value: '', key: 'lastTradeTime', label: '最近下单日期', type: 'daterange' },
    { value: '', key: 'firstTradeTime', label: '首次交易日期', type: 'daterange' },
    // {value: undefined, key: 'salesDepartments', label: '销售部门', type: 'select',options:salesDepartmentss},
    { value: '', key: 'consumablesPerson', label: '耗材负责人', type: 'consumablesPersonSearch', formatter: 'userName' },
    { value: '', key: 'isOverdue', label: '是否逾期', type: 'switch' }
  ]
  myData = []
  page = {
    cur: 1,
    num: 20,
    total: 0
  }
  selectedData: any[] = []
  consumablesPerson: string = ''
  dialogVisible: boolean = false
  dataSelectionChange ( arr ) {
    this.selectedData = arr
  }
  confirmChangeConsumablesPerson () {
    this.$confirm( `此操作将会使所选客户所属耗材负责人更改为[${this.consumablesPerson}], 是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.batchUpdateConsumablesPerson()
    } ).catch( () => {
      this.dialogVisible = false
    } )
  }
  batchUpdateConsumablesPerson () {
    let item = {
      consumablesPerson: this.consumablesPerson,
      customerOfficesList: this.selectedData.map( v => v.id )
    }
    this.$http( API.batchUpdateConsumablesPerson, {
      ...item,
      broadcast: true
    } ).then( ( { data } ) => {
      this.dialogVisible = false
      this.selectedData.forEach( val => {
        val.consumablesPerson = this.consumablesPerson.split( ':' )[ 0 ]
      } )
    } )

  }
  curChange ( cur ) {
    this.search( cur )
  }

  detailOper ( row ) {
    let { id, tenantId, officeId } = row
    if ( tenantId === '' || officeId === '' ) {
      const sourceItemData = this.sourceList.find( item => item.id === row.id ) || {}
      tenantId = sourceItemData.tenantId
      officeId = sourceItemData.officeId
    }
    this.$router.push( `/vip/portrait/detail/${id}?tenant_id=${tenantId}&office_id=${officeId}` )
  }

  search ( cur?) {
    this.$permissionValidateWithNotify( 557 )
    this.page.cur = cur || this.page.cur
    let option = this.computeSearchCondition()
    this.selectedData = []
    this.optionToUrl( option )
    this.$http( API.getOfficesList, {
      ...option,
      email: this.realEmail
    } ).then( ( { data } ) => {
      let source = data.data
      this.sourceList = source.list
      // 修复个人账户类型
      this.myData = buildPersonTypeData( JSON.parse( JSON.stringify( this.sourceList ) ) )
      this.page.total = source.total
    } )
  }
  optionToUrl ( option ) {
    let query = Object.assign( {}, option )
    'start,num,lastTradeTimeBegin,lastTradeTimeEnd,firstTradeTimeBegin,firstTradeTimeEnd'.split( ',' ).forEach( key => {
      delete query[ key ]
    } )
    if ( !query.isOverdue ) {
      delete query.isOverdue
    }
    this.$router.push( {
      path: '/vip/portrait/list',
      query
    } )
  }
  urlToOption () {
    let query: any = this.$route.query
    this.page.cur = ( query.start / this.page.num + 1 ) || this.page.cur || 1
    this.condition.forEach( ( val: any ) => {
      let { key, type } = val
      if ( type == 'tenantSearch' ) {
        if ( query.tenant_id ) {
          val.value = { id: query.tenant_id, name: query.tenant_name }
        }

      } else if ( type == 'customerSearch' ) {
        val.value = {
          customerName: query.customerName,
          customerId: query.customerId
        }
      } else if ( key !== 'region' && key !== 'saleRegion' ) {
        let myValue = query[ key ]
        if ( myValue ) {
          if ( type === 'select' ) {
            val.value = +myValue
          } else if ( type === 'switch' ) {
            val.value = +myValue === 1 ? true : false
          } else {
            val.value = myValue
          }
        }
      } else {
        let arr = []
        if ( key == 'region' ) {
          arr = [ 'region', 'province', 'city' ]
        } else {
          arr = [ 'salesRegion', 'salesCity' ]
        }
        for ( let i = 0, l = arr.length; i < l; i++ ) {
          let k = arr[ i ]
          let v = ( query[ k ] || '' ).trim()
          if ( v ) {
            val.value = { condition: k, searchValue: v }
            break
          }
        }
      }
    } )
  }
  activated () {
    this.urlToOption()
    this.search()
  }
  // created() {
  //   this.urlToOption()
  //   this.search(this.page.cur)
  // }
  @Inject() formatMyDate
  computeSearchCondition () {
    let o: any = {}
    this.condition.forEach( ( val: any ) => {
      let { key, value, type } = val
      if ( type == 'tenantSearch' ) {
        o.tenant_id = value.id
        o.tenant_name = value.name
      } else if ( type == 'customerSearch' ) {
        o.customerName = o.customerName = value && ( value as any ).name
        o.customerId = o.customerId = value && ( value as any ).id
        delete o[ key ]
      } else if ( key == 'region' || key == 'saleRegion' ) {
        let { condition, searchValue } = ( value as any )
        searchValue = ( searchValue || '' ).trim()
        if ( condition && searchValue ) {
          o[ condition ] = searchValue
        }
      } else if ( key == 'lastTradeTime' || key == 'firstTradeTime' ) {
        if ( value && value[ 0 ] ) {
          o[ key + 'Begin' ] = this.formatMyDate( value[ 0 ] )
          o[ key + 'End' ] = this.formatMyDate( value[ 1 ], void 0, true )
          o[ key ] = [ o[ key + 'Begin' ], o[ key + 'End' ] ]
        }
      } else if ( 'settlementMethod,creditLevel,userType,enabled,priceLevel,isActive,purchasingFrequency,tradeStatus'.indexOf( key ) > -1 ) {
        if ( value !== '' && ( value as any ) >= 0 ) {
          o[ key ] = value
        }
      } else if ( key === 'isOverdue' ) {
        if ( value !== '' ) {
          o[ key ] = +value
        }
      } else {
        if ( value ) {
          o[ key ] = value
        }
      }
    } )
    let { cur, num } = this.page
    o.start = ( cur - 1 ) * num || 0
    o.num = num
    return o
  }
}
</script>
