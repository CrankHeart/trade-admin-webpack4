<template>
  <lc-table
    :config="myConfig"
    :data="list"
    :page="page"
    @cur-change="curChange"
    @size-change="sizeChange"
    :has-page="hasPage"
  >
    <template slot-scope="{row,con}">
      <template v-if="con.prop=='expirationDate'">{{formatTime(row[con.prop])}}</template>
      <template v-else-if="con.prop=='strategyLevel'">
        <el-select
          v-model="row[con.prop]"
          @input="strategyLevelChange(row,$event)"
          :disabled="!$permissionValidate(499)"
        >
          <el-option
            v-for="item in strategyLevels"
            :key="item.label"
            :value="item.prop"
            :label="item.label"
          ></el-option>
        </el-select>
      </template>
      <template v-else-if="con.prop=='agreePrice'">
        <el-input
          v-model="row[con.prop]"
          size="small"
          :disabled="row.strategyLevel!==4"
          @change="agreePriceChange(row)"
        ></el-input>
      </template>
      <template
        v-else-if="con.prop=='status'|| con.prop=='quoteStatus' ||con.prop=='whetherPurchase' "
      >{{converData(con.prop,row[con.prop])}}</template>
      <template v-else-if="con.prop=='control'">
        <el-switch
          v-model="row.status"
          on-text="生效"
          off-text="失效"
          :on-value="1"
          :off-value="0"
          :disabled="!$permissionValidate(500)"
          @input="toggleStatus(row)"
        ></el-switch>
        <!-- <el-button size="small" type="warning" v-if="$permissionValidate(500)" @click="toggleStatus(row)">修改状态</el-button> -->
        <el-button
          size="small"
          type="primary"
          v-if="$permissionValidate(499)"
          @click="$emit('update',[row])"
          :disabled="!row.hasChanged"
        >保存</el-button>
        <el-button
          size="small"
          type="default"
          v-if="$permissionValidate(1007)"
          @click="viewHistory(row)"
        >查看记录</el-button>
      </template>
      <template v-else>{{row[con.prop]}}</template>
    </template>
  </lc-table>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject, Watch } from 'vue-property-decorator'

import lcTable from '../../../components/table'
import { matchArrItem, formatPrice } from '../../../utils'
import API from '../../../API'
import { associationStatuses, quoteStatuses, associationAuditStatuses, goalStatuses } from '../const'
import { Getter, Action } from 'vuex-class'

@Component( {
  name: 'association-search-result',
  components: {
    lcTable
  }
} )
export default class AssociationTenantSearch extends Vue {
  @Prop()
  type: number
  @Prop()
  tenant: any
  @Prop()
  hasPage: boolean
  @Getter( 'association/strategyLevel' ) strategyLevels
  @Action( 'association/getDefaultConfig' ) getDefaultConfig
  @Inject() formatMyDate
  formatTime ( date ) {
    let time = date && date.time
    if ( !time ) {
      return '--'
    } else {
      return this.formatMyDate( new Date( time ) )
    }
  }
  agreePriceChange ( item ) {
    item.hasChanged = true
    this.$emit( 'push', [ item ] )
  }
  strategyLevelChange ( item, key ) {
    let strategyLevel = this.strategyLevels[ key ]
    item.levelRate = strategyLevel.value
    if ( key == 4 ) {
      item.agreePrice = ( item.guidePrice || '' ).split( ' ~ ' )[ 0 ]
    } else {
      item.agreePrice = formatPrice( item.levelPrice * item.levelRate, true )
    }
    item.hasChanged = true
    this.$emit( 'push', [ item ] )
  }

  viewHistory ( item ) {
    let { tenantId, lcSkuCode } = item
    this.$http( API.getOperation, {
      tenantId, lcSkuCode,
      start: 0,
      num: 100
    } ).then( ( { data } ) => {
      let { info = [] } = data.data || {}
      const h = this.$createElement;
      this.$msgbox( {
        title: `[${lcSkuCode}]-操作记录`,
        message: h( 'div', null, info.map( val => {
          return h( 'p', {
            style: {
              'lineHeight': '26px'
            },
          }, [
            h( 'span', {
              style: {
                'display': 'inline-block',
                'width': '150px'
              }
            }, val.applyStatus ? this.formatTime( val.auditTime ) : this.formatTime( val.applyTime ) ),
            h( 'span', {
              style: {
                'display': 'inline-block',
                'width': '130px'
              }
            }, `协议价：${val.agreePrice}` ),
            h( 'span', {
              style: {
                'display': 'inline-block',
                'width': '100px'
              }
            }, `状  态: ${this.converData( 'goalStatus', val.goalStatus )}` ),
            h( 'span', {
              style: {
                'display': 'inline-block',
                'width': '100px'
              }
            }, val.applyStatus ? ( val.auditStatus ? '通过' : '拒绝' ) : '未审核' )
          ] )
        } ) ),
        confirmButtonText: '确定'
      } )
    } )
  }
  toggleStatus ( item ) {
    let { status, id, tenantId, tenantName } = item
    this.$prompt( `此操作将会改变协议价状态 -> ${!status ? '失效' : '生效'}, 请输入理由`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    } ).then( ( { value } ) => {
      // if ( !value.trim() ) {
      //   return
      // }
      this.$set( item, 'hasChanged', true )
      this.$set( item, 'remark', value )
      this.$emit( 'push', [ item ], 1 )
      // this.$http( API.updateStatus, {
      //   id,
      //   remark: value,
      //   status: +!status,
      //   broadcast: true,
      //   tenantId,
      //   tenantName
      // } ).catch(()=>{
      //   item.status = !item.status
      // })
    } ).catch( () => {
      item.status = !item.status
    } )
  }
  @Prop()
  config: any[]
  @Prop()
  list: any[]
  @Prop()
  page: any
  get myConfig () {
    return this.config.concat(
      { prop: 'control', label: '操作', fixed: 'right', width: '300' },
    )
  }
  curChange ( v ) {
    this.$emit( 'page-change', 'current', v )
  }
  sizeChange ( v ) {
    this.$emit( 'page-change', 'size', v )
  }
  converData ( type, value ) {
    let arr = []
    switch ( type ) {
      case 'status':
        arr = associationStatuses
        break
      case 'quoteStatus':
        arr = quoteStatuses
        break
      case 'auditStatus':
        arr = associationAuditStatuses
        break
      case 'goalStatus':
        arr = goalStatuses
        break
      case 'whetherPurchase':
        arr = [
          { id: 0, name: '无' },
          { id: 1, name: '有' },
        ]
        break
    }
    return matchArrItem( value, arr, 'id' ).name
  }
  created () {
    this.getDefaultConfig()
  }
}
</script>

