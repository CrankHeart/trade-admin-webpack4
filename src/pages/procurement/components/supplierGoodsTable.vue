<template>
  <div class="supplier-goods-table">
    <!-- <lc-table-config :base-config="supplierResConfig" @set-config="setSupplierResConfig"></lc-table-config> -->
    <lc-table
      :config="supplierResConfig"
      :data="supplierSelectedGoodsList"
      @cur-change="curChange"
      :page="page"
      :key="supplierResConfig.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop==='competitive'">
          <span v-if="scope.row[scope.con.prop]">是</span>
          <span v-else>否</span>
        </template>
        <template
          v-else-if="scope.con.prop==='goodStatus'"
        >{{ formatSalesStatus( scope.row[scope.con.prop] )}}</template>
        <template v-else-if="scope.con.prop === 'deliveryPeriod'">
          <span v-if="scope.row.isEdit">
            <el-input
              v-model.trim="scope.row[scope.con.prop]"
              @input="validNum(scope.row,'deliveryPeriod')"
              placeholder="请输入"
            ></el-input>
            <p class="num-error" v-if="scope.row.deliveryPeriodError">只能是数字</p>
          </span>
          <span v-else>{{scope.row[scope.con.prop]}}天</span>
        </template>
        <template v-else-if="scope.con.prop === 'recentDelivery'">{{scope.row[scope.con.prop]}}天</template>
        <template v-else-if="scope.con.prop==='agreePrice'">
          <span v-if="scope.row.isEdit">
            <el-input
              v-model.trim="scope.row[scope.con.prop]"
              @input="validNum(scope.row,'agreePrice')"
              placeholder="请输入"
            ></el-input>
            <p class="num-error" v-if="scope.row.agreePriceError">只能是数字</p>
          </span>
          <span v-else>{{scope.row[scope.con.prop]}}</span>
        </template>
        <!-- <template v-else-if="scope.con.prop==='factoryGuidePrice'">
          <span v-if="scope.row.isEdit">
            <el-input v-model.trim="scope.row[scope.con.prop]" @input="validNum(scope.row, 'factoryGuidePrice')" placeholder="请输入"> </el-input>
            <p class="num-error" v-if="scope.row.factoryGuidePriceError">只能是数字</p>
          </span>
          <span v-else>{{scope.row[scope.con.prop]}}</span>
        </template>-->
        <template v-else-if="scope.con.prop==='ctrl'">
          <div class="ctrl-btn">
            <span v-if="scope.row.preferred === 1 ">首选</span>
            <a
              v-if="$permissionValidate(641) && scope.row.preferred !== 1"
              type="primary"
              size="small"
              @click="control('preferred',scope.row)"
            >设为首选</a>
            <template v-if="$permissionValidate(640)">
              <a v-if="scope.row.isEdit" @click="control('save',scope.row)">保存</a>
              <a v-else @click="control('edit',scope.row)">编辑</a>
            </template>
            <a v-if="$permissionValidate(642)" @click="control('delete',scope.row)">删除</a>
          </div>
        </template>
        <template v-else>
          <span :title="scope.row[scope.con.prop]">{{scope.row[scope.con.prop]}}</span>
        </template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Getter, State, Mutation, Action } from 'vuex-class'
import lcTable from '../../../components/table/index'
import lcTableConfig from "../../../components/table/control.vue"
import { supplierResConfig, salesStatus } from '../const/index'
import API from '../../../API'


@Component( {
  name: 'supplier-goods-table',
  components: {
    lcTable,
    lcTableConfig
  }
} )
export default class supplierGoodsTable extends Vue {
  @State( state => state.supplier.supplierDetail )
  supplierDetail

  @Prop( {
    type: Number
  } )
  supplierId

  @Prop( {
    type: Number,
    default: () => null
  } )
  brandId

  @Prop( {
    type: String,
    default: () => null
  } )
  lcCode

  supplierResConfig = supplierResConfig
  supplierSelectedGoodsList: any = []
  supplierSelectedGoodsListBak: any = []

  goodsListVisible: boolean = false
  page = {
    cur: 1,
    num: 10,
    total: 0
  }

  activated () {
    this.getSupplierSkuList()
  }

  get id () {
    return this.$route.params.id
  }




  formatParams () {
    let { cur, num } = this.page

    let param: any = {
      supplierId: this.id || this.supplierId,
      start: ( cur - 1 ) * num,
      num
    }
    if ( this.brandId && this.brandId.toString.length > 0 ) {
      param.brandId = this.brandId
    }
    if ( this.lcCode && this.lcCode.length > 0 ) {
      param.lcCode = this.lcCode
    }
    return param
  }
  getSupplierSkuList () {
    this.$permissionValidateWithNotify( 639 )
    this.$http( API.getSupplierSkuList, this.formatParams() ).then(
      ( { data } ) => {
        this.supplierSelectedGoodsList = data.list.map( v => {
          v.isEdit = false
          return v
        } )
        // this.supplierSelectedGoodsListBak = [...this.supplierSelectedGoodsList] =>
        this.supplierSelectedGoodsListBak = [ ...data.list ].map( v => {
          return { id: v.id, agreePrice: v.agreePrice }
        } )
        this.page.total = data.total
      },
      rej => {
        this.$notify( {
          type: 'warning',
          message: '信息获取失败'
        } )
      }
    )
  }
  hasChange () {
    let changedArr: any[] = []
    let form1 = this.supplierSelectedGoodsList
    let form2 = this.supplierSelectedGoodsListBak
    let isChanged = form1.forEach( ( item, index ) => {
      if ( form2[ index ].agreePrice !== item.agreePrice ) {
        changedArr.push( item )
      }
    } )

    if ( changedArr.length > 0 ) {
      return this.saveSupplierGoods( changedArr )
    }
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.getSupplierSkuList()
  }

  search () {
    this.page.cur = 1
    this.getSupplierSkuList()
  }

  refresh () {
    this.goodsListVisible = false
    this.search()
  }

  reset () {
    this.lcCode = ''
    this.brandId = ''
  }

  validNum ( item, type ) {
    let reg = /^[\d]+(\.\d+)?$/
    if ( reg.test( item[ type ] ) ) {
      Vue.set( item, `${type}Error`, false )
    } else {
      Vue.set( item, `${type}Error`, true )
    }

  }

  control ( type: 'preferred' | 'edit' | 'save' | 'delete' | 'cancel', item ) {
    if ( type === 'edit' ) {
      item.isEdit = true
    } else if ( type === 'save' ) {
      this.saveSupplierGoods( [ item ] )
    } else if ( type === 'preferred' ) {
      this.setPreferredSupplier( item )
    } else if ( type === 'delete' ) {
      this.$confirm( '是否确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        closeOnClickModal: false
      } ).then( () => {
        this.delSuppliergoods( [ item ] )
      } )
    }
  }

  // 后台接口可以批量更改，所以这里参数先定成数组
  saveSupplierGoods ( values: any[] = [] ) {
    let vaildate: boolean = false
    let params: any[] = []

    // 是否有不合格数字
    values.some( ( { agreePrice, deliveryPeriod, id, supplierId, skuId, agreePriceError, deliveryPeriodError } ) => {
      params.push( { agreePrice, id, supplierId, skuId, deliveryPeriod } )
      vaildate = agreePriceError || deliveryPeriodError
      return vaildate
    } )
    if ( vaildate ) return

    return this.$http( API.updateSupplierGoods, {
      list: params
    } ).then( ( { data } ) => {
      if ( data.failedList.length > 0 ) {
        this.$notify( {
          type: 'warning',
          message: data.failedList.length + '条数据更新失败'
        } )
      } else if ( data.failedList.length == 0 && data.successList.length === params.length ) {
        this.$message( {
          type: 'success',
          message: '更新成功'
        } )
      }

      data.successList.forEach( v => {
        for ( let i = 0, len = values.length; i < len; i++ ) {
          if ( v.id === values[ i ].id ) {
            values[ i ].isEdit = false
            break
          }
        }
      } )

    } )
  }

  setPreferredSupplier ( item ) {
    this.$http( API.setPreferredSupplier, {
      ssrId: item.id
    } )
      .then( res => {
        item.preferred = 1
        item.preferredSupplier = this.supplierDetail.supplierName
      } )
      .catch( err => {
        this.$notify( {
          type: 'warning',
          message: '设置失败'
        } )
      } )
  }
  delAllSupplierGoods () {
    this.delSuppliergoods( this.supplierSelectedGoodsList )
  }

  delSuppliergoods ( items ) {
    let params = items.map( v => {
      return {
        id: v.id,
        supplierId: v.supplierId,
        skuId: v.skuId
      }
    } )

    this.$http( API.delSupplierGoods, {
      list: params
    } ).then(
      ( { data } ) => {
        if ( data.failedList.length == 0 ) {
          this.$notify( {
            type: 'success',
            message: '删除成功'
          } )
        } else {
          this.$notify( {
            type: 'warning',
            message: data.failedList.length + '条数据删除失败'
          } )
        }

        this.page.total -= data.successList.length

        for ( let i = 0, len = data.successList.length; i < len; i += 1 ) {
          this.supplierSelectedGoodsList.some( ( v, index ) => {
            if ( v.id === data.successList[ i ].id ) {
              this.supplierSelectedGoodsList.splice( index, 1 )
              return true
            }
            return false
          } )
        }

        if ( !this.supplierSelectedGoodsList.length ) {
          this.getSupplierSkuList()
        }
      },
      rej => {
        this.$notify( {
          type: 'warning',
          message: '删除失败'
        } )
      }
    )
  }

  formatSalesStatus ( status ) {
    return salesStatus.filter( v => v.id === +status )[ 0 ].name
  }
}
</script>

<style lang="stylus" scoped>
.ctrl-btn
  a
    cursor pointer
    margin-right 10px
  span
    color #67c23a
    margin-right 10px
.num-error
  color #ff4949
</style>
