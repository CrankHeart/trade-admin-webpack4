<template>
  <div id="bms-association">
    <lc-table :config="config" :data="list" :page="page" @cur-change="curChange" :has-page="true">
      <template slot-scope="{row,con}">
        <template v-if="con.prop=='lcSpuCode'">{{(row[con.prop]||'').substring(5)}}</template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import lcTable from '../../components/table'
import API from '../../API'

@Component( {
  name: 'bms-association',
  components: {
    lcTable
  }
} )
export default class BmsAssociation extends Vue {
  list: any[] = []
  page = {
    cur: 1,
    num: 20,
    total: 0
  }
  get tenant () {
    let { tenantId, tenantName } = this.$route.query
    return {
      tenantId,
      tenantName
    }
  }
  config = [
    { prop: 'name', label: '商品名称' },
    { prop: 'lcSpuCode', label: 'LC编码', width: '150' },
    { prop: 'brandName', label: '品牌', width: '150' },
    { prop: 'specification', label: '规格', width: '250' },
    { prop: 'levelPrice', label: '会员价(A/B/C)', width: '150' },
    { prop: 'agreePrice', label: '协议价', width: '150' }
  ]
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  computedSearchOption () {
    let o: any = {
      ...this.tenant
    }
    let { cur, num } = this.page
    o.start = ( cur - 1 ) * num
    o.num = num
    return o
  }
  searchType = 1
  search () {
    let option = this.computedSearchOption()
    this.$http( API.getAgreeProduct, option ).then( ( { data } ) => {
      this.page.total = data.total
      this.list = data.list
    }, () => {
      this.page.total = 0
      this.list = []
    } )
  }
  created () {
    this.search()
  }
}
</script>
