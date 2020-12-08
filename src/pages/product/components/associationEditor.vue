 <template>
  <lc-table
    :config="tableConfig"
    :data="tableData"
    :height="500"
    :has-page="false"
    class="association-editor"
  >
    <template slot-scope="{row,con}">
      <template v-if="['lcSpuCode','lcSkuCode'].indexOf(con.prop)>-1">
        <el-input
          v-model.trim="row[con.prop]"
          size="small"
          @change="inputChange(con.prop,row,$event)"
          :class="{'is-error':con.prop=='agreePrice'&&row.isError}"
          :disabled="!row.isAdd"
        ></el-input>
      </template>
      <template v-else-if="!row.isAdd">
        <template
          v-if="con.prop=='status'|| con.prop=='quoteStatus'"
        >{{converData(con.prop,row[con.prop])}}</template>
        <template v-else-if="con.prop=='strategyLevel'">
          <el-select v-model="row[con.prop]" @input="strategyLevelChange(row,$event)">
            <el-option
              v-for="item in strategyLevels"
              :key="item.label"
              :value="item.prop"
              :label="item.label"
            ></el-option>
          </el-select>
        </template>
        <template v-else-if="con.prop=='agreePrice'">
          <el-input v-model="row[con.prop]" :disabled="row.strategyLevel!==4"></el-input>
        </template>
        <template v-else-if="con.prop=='expirationDate'">{{formatTime(row[con.prop])}}</template>
        <template v-else-if="con.prop=='control'">
          <!-- <el-button type="text" @click="addNewItem(row.index)">新增</el-button> -->
          <el-button type="text" v-if="!row.isAdd" @click="delNewItem(row.index)">删除</el-button>
          <el-button type="text" @click="blackbox">&nbsp;</el-button>
        </template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </template>
  </lc-table>
</template>
<script lang="ts">
import { Component, Prop, Inject } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import AssociationProduct from '../../../components/associationProduct.vue'
import { matchArrItem, formatPrice } from '../../../utils'
import API from '../../../API'
import { associationStatuses, quoteStatuses, associationAuditStatuses } from '../const'

@Component( {
  name: 'association-editor'
} )
export default class AssociationEditor extends AssociationProduct {
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
  strategyLevelChange ( item, key ) {
    let strategyLevel = this.strategyLevels[ key ]
    item.levelRate = strategyLevel.value
    if ( key == 4 ) {
      item.agreePrice = ( item.actualBottomPrice || '' ).split( ' ~ ' )[ 0 ]
    } else {
      item.agreePrice = formatPrice( item.levelPrice * item.levelRate, true )
    }
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
    }
    return matchArrItem( value, arr, 'id' ).name
  }
  @Prop()
  sourceData: any[]
  getSkuOfAgreeProduct ( item ) {
    this.$http( API.getSkuOfAgreeProduct, {
      ...item,
      ...this.tenant
    } ).then(
      ( { data } ) => {
        let list = data.data
        if ( !list.length ) {
          return this.$notify( {
            type: 'warning',
            message: '无可售商品！'
          } )
        }
        // let tenantId = this.tenant.tenantId || ''
        let listKeys = list.map( v => this.tenantId + v.id )

        let oldList = this.sourceData.filter( val => listKeys.indexOf( val.tenantId + val.skuId ) > -1 )
        let listObj = oldList.reduce( ( total, next ) => {
          total[ next.skuId ] = Object.assign( {}, next )
          return total
        }, {} )

        let value = this.value.filter( val => listKeys.indexOf( val.tenantId + val.skuId ) < 0 ).concat( ...list.map( v => {
          let item = listObj[ v.id ] || {}
          return {
            ...v,
            tenantId: this.tenantId || item.tenantId,
            hasChanged: true,
            status: item.status === undefined ? 1 : item.status,
            skuId: v.id,
            ...item,
            strategyLevel: item.strategyLevel || null,
          }
        } ) )
        this.$emit( 'input', value.map( ( v, i ) => ( { ...v, index: i } ) ) )
      },
      ( { data } ) => {
        this.$notify( {
          type: "error",
          message: data.msg
        } )
      }
    )
  }
  get tableConfig (): any[] {
    let arr = this.config.length ? this.config : [
      { prop: 'lcSpuCode', label: 'spu编码', width: '' },
      { prop: 'lcSkuCode', label: 'sku编码', width: '' },
      { prop: 'name', label: '商品名称', width: '' },
      { prop: 'specification', label: '商品规格', width: '' },
      { prop: 'levelPrice', label: '会员价', width: '' },
      { prop: 'bottomPrice', label: '综合成本价', width: '' },
      { prop: 'actualBottomPrice', label: '销售底价', width: '' },
      { prop: 'strategyLevel', label: '协议价策略', width: '' }
    ]
    if ( this.hasPrice ) {
      arr.push( { prop: 'agreePrice', label: '协议价', width: '' } )
    }
    if ( this.isAdd ) {
      arr.push( { prop: 'control', label: '操作', width: '', fixed: 'right' } )
    }
    return arr
  }
  created () {
    this.getDefaultConfig()
  }
}
</script>
<style lang="stylus">
.association-editor
  .el-table__body-wrapper
    z-index 99
  .el-table__fixed-right
    z-index 100
</style>
