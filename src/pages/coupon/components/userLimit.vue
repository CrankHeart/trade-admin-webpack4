<template>
  <el-row :gutter="20" class="coupon-user-limit">
    <el-input
      v-model="fuzzyTenantName"
      placeholder="请输入集团名称"
      class="search"
      size="small"
      @keydown.enter.native="getTenant"
    >
      <el-button slot="append" icon="search" @click="getTenant"></el-button>
    </el-input>
    <el-col :span="10">
      <h5>集团名称</h5>
      <div class="box">
        <ul>
          <li
            v-for="item in tenantList"
            :key="item.tenantId"
            :class="{'is-active':item.tenantId===tenantId}"
            @click="getOfficeByTenant(item)"
          >{{item.tenantName}}</li>
        </ul>
      </div>
    </el-col>
    <el-col :span="14">
      <h5>
        <el-checkbox
          v-model="allOfficeChecked"
          
        ></el-checkbox>客户名称
        <fast-search
          @fast-search="fastSearchOffice"
          :basic-list="officeList"
          prop-name="customerName"
          key="office"
        ></fast-search>
      </h5>

      <div class="box">
        <ul>
          <li v-for="item in list" :key="item.id">
            <el-checkbox
              v-model="item.checked"
              @change="$emit('user-toggle',item)"
            >({{item.id}}){{item.customerName}}({{item.customerId}})</el-checkbox>
          </li>
        </ul>
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API'
import fastSearch from '../../../components/fastSearch.vue'

@Component({
  name: 'coupon-user-limit',
  components: {
    fastSearch
  }
})
export default class CouponUserLimit extends Vue {
  @Prop()
  selectedList: any[]

  get selectedListIds() {
    return (this.selectedList || []).map(v => v.id)
  }
  get allOfficeChecked() {
    if (this.list.length) {
      /* tslint-disable-next-line */
      return this.list.every(v => v.checked)
    }
    return false
  }
  set allOfficeChecked(v) {
    this.list.forEach(val => {
      val.checked = v
      this.$emit('user-toggle', val)
    })
  }

  tenantList: any[] = []

  officeCache = {}
  get officeList() {
    return this.officeCache[this.tenantId] || []
  }
  fastList: any[] = []
  fastSearchOffice(list) {
    this.fastList = list
  }
  get list() {
    return this.fastList.length && this.fastList || this.officeList
  }
  tenantId: any = null
  fuzzyTenantName: string = ''
  getTenant() {
    this.tenantId = null
    this.$http(API.getTenantsInfoDetail, {
      tenantName: this.fuzzyTenantName,
      pageIndex: 0,
      pageSize: 100
    }).then(
      ({ data }) => {
        if (!data.hasOwnProperty('data') || data.data.items.length == 0) {
          this.tenantList = []
          return
        }
        this.tenantList = data.data.items
      },
      rej => {
        this.tenantList = [] = []
      }
    )
  }

  getOfficeByTenant({ tenantId }) {
    this.tenantId = tenantId
    this.fastList = []
    if (!this.officeCache[tenantId]) {
      this.$http(API.getOfficesByTenantId, { tenantId }).then(({ data }) => {
        let { officeList = [] } = data && data.data || {}
        officeList.forEach(value => value.checked = false)
        this.$set(this.officeCache, tenantId, officeList)
      })
    }
  }
}
</script>
<style lang="stylus" scoped>
.search
  position absolute
  top -35px
  left 130px
.box
  height 300px
  overflow auto
h5
  line-height 30px
  height 30px
  overflow hidden
  .el-pagination
    margin-top 0!important
li
  line-height 30px
  cursor pointer
  &.is-active
    background #20a0ff
    color #ffffff
    text-indent 1em
</style>

