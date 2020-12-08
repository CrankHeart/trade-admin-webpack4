<template>
  <div class="condition">
    <el-form :label-width="labelWidth" class="el-row flex-wrap" :size="size">
      <template v-for="(item,index) in condition">
        <el-col
          :lg="item.col && item.col.lg || 8"
          :xs="24"
          :sm="item.col && item.col.sm || 12"
          :key="index"
          v-if="!item.hide  && thirdPartLimit(item)"
        >
          <el-form-item :label="item.label">
            <template v-if="item.type=='text'">
              <el-input v-model.trim="item.value" placeholder="请输入"></el-input>
            </template>

            <template v-else-if="item.type=='select'">
              <el-select
                clearable
                v-model="item.value"
                placeholder="请选择"
                :multiple="item.multiple"
                filterable
              >
                <el-option
                  v-for="options in item.options"
                  :label="options.name"
                  :value="options.id"
                  :key="options.id"
                ></el-option>
              </el-select>
            </template>

            <template v-else-if="item.type=='cascader'">
              <el-cascader
                clearable
                :options="allTypes"
                v-model="item.value"
                :show-all-levels="false"
                filterable
                change-on-select
              ></el-cascader>
            </template>

            <template v-else-if="item.type=='tenantSearch'">
              <lc-tenant-search
                @broadcast="broadcastItem($event,'tenantSearch')"
                :text="item.value&&item.value.name"
                :two-way="item.twoWay"
                :has-submit-btn="false"
              ></lc-tenant-search>
            </template>

            <template v-else-if="item.type=='officeSearch'">
              <lc-office-search @broadcast="broadcastItem($event,'officeSearch')" :user="item.value"></lc-office-search>
            </template>
            <template v-else-if="item.type=='customerSearch'">
              <lc-customer-search
                @broadcast="broadcastItem($event,'customerSearch')"
                :text="item.value&&item.value.name"
              ></lc-customer-search>
            </template>

            <template v-else-if="item.type=='storeSearch'">
              <lc-store-search v-model="item.value" @changeStoreId="broadcastId"></lc-store-search>
            </template>

            <template v-else-if="item.type=='salesSearch'">
              <lc-sales-leaders v-model="item.value" @changeSaleId="broadcastSaleId"></lc-sales-leaders>
            </template>

            <template v-else-if="item.type=='consumablesPersonSearch'">
              <consumables-person-search v-model="item.value" :formatter="item.formatter"></consumables-person-search>
            </template>

            <template v-else-if="item.type=='switch'">
              <el-switch v-model="item.value" on-text="on" off-text="off"></el-switch>
            </template>

            <template v-else-if="item.type=='radio'">
              <el-radio-group v-model="item.value" :disabled="item.disabled">
                <el-radio v-for="item in item.options" :key="item.id" :label="item.id">{{item.name}}</el-radio>
              </el-radio-group>
            </template>

            <template v-else-if="item.type=='checkbox'">
              <el-checkbox-group v-model="item.value">
                <el-checkbox v-for="opt in item.options" :key="opt.id" :label="opt.id">{{opt.name}}</el-checkbox>
              </el-checkbox-group>
            </template>

            <template v-else-if="item.type=='daterange'">
              <el-date-picker
                :editable="false"
                clearable
                v-model="item.value"
                type="daterange"
                align="left"
                placeholder="选择日期范围"
                format="yyyy-MM-dd"
                :picker-options="pickerOptions"
              ></el-date-picker>
            </template>

            <template v-else-if="item.type=='date'">
              <el-date-picker
                :editable="false"
                clearable
                v-model="item.value"
                type="date"
                align="left"
                placeholder="选择日期"
                format="yyyy-MM-dd"
                :picker-options="item.pickerOptions"
              ></el-date-picker>
            </template>

            <template v-else-if="item.type=='datetimerange'">
              <el-date-picker
                :editable="false"
                clearable
                v-model="item.value"
                type="datetimerange"
                align="left"
                placeholder="选择日期范围"
                format="yyyy-MM-dd"
                :picker-options="pickerOptions"
              ></el-date-picker>
            </template>

            <template v-else>
              <slot :row="item"></slot>
            </template>
          </el-form-item>
        </el-col>
      </template>
      <el-col :lg="24" :xs="24" :sm="24">
        <slot name="btn"></slot>
        <el-button @click="resetField" v-if="hasResetBtn">重置</el-button>
        <el-button type="primary" @click="handlerSearch">搜索</el-button>
      </el-col>
    </el-form>
    <hr />
  </div>
</template>
<script lang="ts">

import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import { State, Action, Getter } from 'vuex-class'

import lcTenantSearch from './tenantSearch/index.vue'
import lcOfficeSearch from './officeSearch.vue'
import lcCustomerSearch from './customerSearch.vue'
import lcStoreSearch from './storeSearch.vue'
import lcSalesLeaders from './salesLeaders.vue'
import consumablesPersonSearch from './consumablesPersonSearch.vue'
@Component( {
  name: 'condition',
  components: {
    lcTenantSearch,
    lcOfficeSearch,
    lcCustomerSearch,
    consumablesPersonSearch,
    lcStoreSearch,
    lcSalesLeaders
  }
} )
export default class Condition extends Vue {
  // pickerOptions: {
  //   shortcuts:[]
  // }
  @Prop( { default: '80px' } )
  labelWidth: string
  @Prop()
  size: string
  @Prop( { default: true } )
  hasResetBtn: boolean
  @Prop( { default: [] } )
  condition: [ object ]
  @Action( 'category/getAllCategory' ) getAllCategory
  @Getter( 'category/all' ) allTypes
  @State( state => state.login.loginIfor ) loginIfor
  thirdPartLimit ( item ) {
    return !( this.loginIfor.isThirdPartyLogin && [ 'tenantSearch', 'officeSearch', 'customerSearch' ].includes( item.type ) )
  }
  created () {
    let i = 0
    let l = this.condition.length
    for ( ; i < l; i++ ) {
      let condition: any = this.condition[ i ]
      if ( condition.type == 'cascader' ) {
        this.getAllCategory()
        break
      }
    }
  }
  pickerOptions: any = {
    shortcuts: [ {
      text: '最近一周',
      onClick ( picker ) {
        const end = new Date();
        const start = new Date();
        start.setTime( start.getTime() - 3600 * 1000 * 24 * 7 );
        picker.$emit( 'pick', [ start, end ] );
      }
    }, {
      text: '最近一个月',
      onClick ( picker ) {
        const end = new Date();
        const start = new Date();
        start.setTime( start.getTime() - 3600 * 1000 * 24 * 30 );
        picker.$emit( 'pick', [ start, end ] );
      }
    }, {
      text: '最近三个月',
      onClick ( picker ) {
        const end = new Date();
        const start = new Date();
        start.setTime( start.getTime() - 3600 * 1000 * 24 * 90 );
        picker.$emit( 'pick', [ start, end ] );
      }
    } ]
  }
  resetField () {
    this.condition.forEach( ( val: any, index: number ) => {
      let str: any = Object.prototype.toString.call( val.value )
      let type = str.match( /\[object\s+([a-zA-Z]+)\]/ )[ 1 ]

      if ( type == 'Array' ) {
        val.value = []
      } else if ( type == 'Object' ) {
        // val.value.name = ''
        // val.value = {}
        Object.keys( val.value ).forEach( key => {
          val.value[ key ] = void 0
        } )
        //  if ( type == 'String' || type == 'Number' || type == 'Date')
      } else {
        val.value = void 0
      }
    } )
    this.$emit( 'reset-callBack' )
  }
  handlerSearch () {
    this.condition.forEach( ( val: any, index: number ) => {
      let str: any = Object.prototype.toString.call( val.value )
      let type = str.match( /\[object\s+([a-zA-Z]+)\]/ )[ 1 ]
      if ( type == 'String' ) {
        val.value = val.value.replace( /^\s+|\s+$/g, '' )
      }
    } )

    this.$emit( 'submit', 1 )
  }

  broadcastItem ( item, type ) {
    this.condition.forEach( ( val: any ) => {
      if ( val.type === type ) {
        val.value = item
      }
    } )
  }
  broadcastId ( id ) {
    this.condition.forEach( ( val: any ) => {
      if ( [ 'storeSearch' ].includes( val.type ) ) {
        val.value = id
      }
    } )
  }

  broadcastSaleId ( id ) {
    this.condition.forEach( ( val: any ) => {
      if ( [ 'salesSearch' ].includes( val.type ) ) {
        val.value = id
      }
    } )
  }

}
</script>
<style lang="stylus" scoped>
.el-select, .el-cascader, .el-date-editor--daterange, .el-date-editor
  width 100%
.flex-wrap
  display flex
  flex-wrap wrap
.el-col:last-child
  text-align right
.el-form-item
  margin-bottom 10px
</style>

<style lang="stylus">
.store-search
  .el-select
    width 100%
</style>

