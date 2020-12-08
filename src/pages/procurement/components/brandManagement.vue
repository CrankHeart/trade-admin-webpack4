<template>
  <div class="brandList">
    <!-- <lc-condition></lc-condition> -->
    <div class="brand-header">
      <label>品牌名称</label>
      <el-input v-model.trim="brandName" placeholder="请输入" class="brand-name-input">
        <el-button @click="search" slot="append" icon="search"></el-button>
      </el-input>
    </div>
    <lc-table
      :data="tableData"
      :config="config"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop==='supplierType' ">
          <span v-if="scope.row.isEdit">
            <el-select v-model="scope.row[scope.con.prop]" placeholder="请选择">
              <el-option
                v-for="type in supplierType"
                :key="type.id"
                :label="type.name"
                :value="type.id"
              ></el-option>
            </el-select>
          </span>
          <span v-else>{{formatSupplierType(scope.row[scope.con.prop])}}</span>
        </template>
        <template v-else-if="scope.con.prop==='deliveryPeriod' ">
          <span v-if="scope.row.isEdit">
            <!-- <el-date-picker v-model="scope.row.deliveryPeriod" type="date" placeholder="选择日期"> </el-date-picker> -->
            <el-input
              type="number"
              :min="1"
              :step="1"
              placeholder="请输入交期"
              v-model="scope.row.deliveryPeriod"
            ></el-input>
          </span>
          <span
            v-else-if="!scope.row.isEdit && scope.row.deliveryPeriod "
          >{{ formatDeliveryPeriod(scope.row.deliveryPeriod) }}天</span>
          <!-- <span v-if="scope.row.isEdit || scope.row.deliveryPeriod"></span> -->
          <span></span>
        </template>
        <template v-else-if="scope.con.prop==='control' ">
          <div class="control">
            <template v-if="$permissionValidate(691)">
              <el-button
                type="info"
                v-if="scope.row.isEdit"
                @click="control('save',scope.row)"
                size="small"
              >保存</el-button>
              <el-button type="info" v-else @click="control('edit',scope.row)" size="small">编辑</el-button>
            </template>
          </div>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import API from '../../../API'
import lcTable from '../../../components/table'
import { supplierType } from '../const'


@Component( {
  name: 'brand-management',
  components: {
    lcTable
  }
} )
export default class brandManagement extends Vue {
  @Prop( {
    type: Number
  } )
  supplierId
  supplierType: any[] = supplierType

  brandName: string = ''
  tableData: any[] = []

  config: any = [
    { prop: 'brandName', label: '品牌名称' },
    { prop: 'supplierType', label: '供应商类型' },
    { prop: 'deliveryPeriod', label: '品牌交期' },
    { prop: 'skuNum', label: 'SKU数量' },
    { prop: 'control', label: '操作', width: "150px" },
  ]

  page = {
    cur: 1,
    total: 0,
    num: 10
  }

  activated () {
    this.search()
  }

  @Inject() formatMyDate

  search ( name: string = '' ) {
    this.$permissionValidateWithNotify( 637 )
    this.$http( API.getSupplierBrands, this.formatParams()
    ).then( ( { data } ) => {
      this.tableData = data.list.map( v => {
        v.isEdit = false
        return v
      } )
      this.page.total = data.total
    } )
  }

  formatParams () {
    let { cur, num } = this.page

    return {
      brandName: this.brandName.trim(),
      supplierId: this.supplierId,
      start: ( cur - 1 ) * num,
      num
    }
  }

  control ( type: 'edit' | 'save', item ) {
    if ( type === 'edit' ) {
      item.isEdit = true
    } else if ( type === 'save' ) {
      this.updateBrand( item )
    }
  }

  updateBrand ( item: any = {} ) {
    let param: any = {
      id: item.id,
      supplierType: item.supplierType
    }
    if ( item.deliveryPeriod ) {
      param.deliveryPeriod = Math.floor( +item.deliveryPeriod )
    }
    this.$http( API.updateSupplierBrand, param ).then( res => {
      this.$message( {
        type: "success",
        message: "更新成功"
      } )
      item.isEdit = false
    } ).catch( err => {
      this.$notify( {
        type: "warning",
        message: "更新失败"
      } )
    } )
  }

  curChange ( v ) {
    this.page.cur = v
    this.search()
  }

  formatSupplierType ( type ) {
    let supplier = supplierType.filter( v => v.id === type )[ 0 ]
    return supplier && supplier.name
  }

  formatDeliveryPeriod ( time ) {
    return Math.floor( +time )
  }
}

</script>

<style lang="stylus" scoped>
.brand-header
  display flex
  align-items center
  margin-bottom 20px
  label
    margin-right 10px
.brand-name-input
  width 300px
</style>
