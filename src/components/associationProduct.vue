<template>
  <lc-table
    :config="tableConfig"
    :data="tableData"
    :has-page="false"
    v-bind="height?{height}:{}"
    class="quote-add-new"
  >
    <template slot-scope="scope">
      <template v-if="['lcSpuCode','lcSkuCode','quotePrice'].indexOf(scope.con.prop)>-1">
        <el-input
          v-model.trim="scope.row[scope.con.prop]"
          size="small"
          placeholder="请输入8位短码"
          @change="inputChange(scope.con.prop,scope.row,$event)"
          :class="{'is-error':scope.con.prop=='quotePrice'&&scope.row.isError}"
          :disabled="['lcSpuCode','lcSkuCode'].indexOf(scope.con.prop)>-1 && !scope.row.isAdd"
        ></el-input>
      </template>
      <template v-else-if="scope.con.prop=='control'">
        <!-- <el-button type="text" @click="addNewItem(scope.row.index)">新增</el-button> -->
        <el-button type="text" v-if="!scope.row.isAdd" @click="delNewItem(scope.row.index)">删除</el-button>
        <el-button type="text" @click="blackbox">&nbsp;</el-button>
      </template>
      <template v-else>{{scope.row[scope.con.prop]}}</template>
    </template>
  </lc-table>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import lcTable from './table/'
import API from '../API'
import { debounce } from '../utils'

@Component( {
  name: 'association',
  components: {
    lcTable
  }
} )
export default class associationProduct extends Vue {
  @Prop( { default: true } )
  isAdd: boolean
  @Prop( { default: () => [] } )
  config: any[]
  @Prop( { default: true } )
  hasPrice: boolean
  @Prop( { type: [ Number, String ] } )
  height
  get tableConfig (): any[] {
    let arr = this.config.length ? this.config : [
      { prop: 'lcSpuCode', label: 'spu编码', width: '' },
      { prop: 'lcSkuCode', label: 'sku编码', width: '' },
      { prop: 'name', label: '商品名称', width: '' },
      { prop: 'specification', label: '商品规格', width: '' },
      { prop: 'salesGuidePrice', label: '销售底价', width: '' }
    ]
    if ( this.hasPrice ) {
      arr.push( { prop: 'quotePrice', label: '报价', width: '' } )
    }
    if ( this.isAdd ) {
      arr.push( { prop: 'control', label: '操作', width: '', fixed: 'right' } )
    }
    return arr
  }
  @Prop()
  value: any[]
  @Prop()
  tenant: any
  get tenantId () {
    return this.tenant.tenantId
  }
  blackboxIndex = 0
  blackbox () {
    this.blackboxIndex += 1
    if ( this.blackboxIndex % 7 === 0 ) {
      this.$prompt( '请输入skuCode，以空格进行分割', '未经测试的程序，请谨慎使用', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      } ).then( ( { value } ) => {
        let str = value.replace( /\s+/g, ' ' )
        let arr = str.split( /\s/ )
        arr.forEach( lcCode => {
          let prop = /11000[0-9]{8}/.test( lcCode ) ? 'lcSpuCode' : 'lcSkuCode'
          this.getSkuOfAgreeProduct( {
            [ prop ]: lcCode
          } )
        } )
      } ).catch( () => {

      } )
    }
  }
  inputChange: ( prop: string, item: any, value: string ) => viod = debounce( function ( prop, item, value ) {
    if ( !this.tenantId ) {
      return this.$notify( {
        type: 'error',
        message: '请先选择集团企业后，再选择商品'
      } )
    }
    if ( ( prop == 'lcSkuCode' || prop == 'lcSpuCode' ) && value.length == 8 ) {
      if ( /(^(\d){8}$)/.test( value ) ) {
        value = `${prop == 'lcSkuCode' ? '22000' : '11000'}${value}`
        this.getSkuOfAgreeProduct( {
          [ prop ]: value
        } )
      } else {
        this.$notify( {
          type: 'warning',
          message: '输入的编码不合法，请输入正确的编码'
        } )
      }

    } else if ( prop == 'quotePrice' ) {
      this.$set( item, 'isError', +item.bottomPrice > +item.quotePrice && item.quotePrice !== '' )
    }

  }, 600, true )
  getSkuOfAgreeProduct ( item ) {
    this.$http( API.getSkuOfAgreeProduct, {
      ...item,
      tenantId: this.tenant.tenantId
    } ).then(
      ( { data } ) => {
        let list = data.data
        if ( !list.length ) {
          return this.$notify( {
            type: 'warning',
            message: '无可售商品！'
          } )
        }
        let listKeys = list.map( v => v.id )
        let oldList = this.value.filter( val => listKeys.indexOf( val.skuId ) > -1 )
        let listObj = oldList.reduce( ( total, next ) => {
          total[ next.skuId ] = next
          return total
        }, {} )

        let value = this.value.filter( val => listKeys.indexOf( val.skuId ) < 0 ).concat( ...list.map( v => {
          let old = listObj[ v.id ] || {}
          return {
            ...v,
            skuId: v.id,
            agreePrice: old.agreePrice || '',
            quotePrice: old.quotePrice || '',
            strategyLevel: old.strategyLevel || null,
            levelRate: old.levelRate || ''
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
  delNewItem ( index ) {
    this.value.splice( index, 1 )
    this.$emit( 'input', this.value.map( ( v, i ) => ( { ...v, index: i } ) ) )
  }
  addNewItem ( index?) {
    // let lastItem = this.value.slice( -1 )[ 0 ] || {}
    // if ( !lastItem.lcSkuCode && this.value.length ) {
    //   return
    // } else {
    //   let o = {
    //     lcSpuCode: '',
    //     lcSKuCode: '',
    //     name: '',
    //     specification: '',
    //     quotePrice: '',
    //     skuId: 0
    //   }
    //   if ( index !== undefined ) {
    //     this.value.splice( index + 1, 0, o )
    //   } else {
    //     this.value.push( o )
    //   }
    // }

  }
  get tableData () {
    return this.isAdd ? this.value.concat( {
      lcSpuCode: '',
      lcSkuCode: '',
      isAdd: true
    } ) : this.value
  }
}
</script>
<style lang="stylus" >
.quote-add-new
  .is-error
    .el-input__inner
      border-color red
      color red
</style>

