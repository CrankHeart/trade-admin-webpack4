<template>
  <div class="product-instalment">
    <lc-title text="商品分期"></lc-title>
    <lc-condition :condition="condition" @submit="search">
      <template slot="btn">
        <el-button @click="dialogOpen()">新增商品分期</el-button>
      </template>
    </lc-condition>
    <lc-table
      :config="config"
      :data="data"
      @cur-change="curChange"
      :page="page"
      :loading="loading"
      :key="config.length"
      controller-name="productInstalmentConfig"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop=='control'">
          <el-button type="primary" size="small" @click="dialogOpen(row)">编辑</el-button>
          <el-button size="small" @click="deleteInstalment(row)">删除</el-button>
        </template>
        <template v-else-if="con.prop=='instalmentLen'">{{row.instalmentConfigList.length}}期</template>
        <template
          v-else-if="con.prop=='instalment'"
        >{{row.instalmentConfigList.map( v => `${v.periodRate}%` ).join(' | ')}}</template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>

    <el-dialog title="商品分期" :before-close="dialogClose" v-model="dialogVisible">
      <instalment-step
        v-model="currentSteps"
        :skus="currentRows"
        @sku-change="skuChange"
        :is-add="isAdd"
      ></instalment-step>
      <template slot="footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State, Action, Getter, Mutation } from 'vuex-class'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/index'
import instalmentStep from './components/instalmentStep.vue'

@Component( {
  name: 'product-instalment',
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    instalmentStep
  }
} )
export default class ProductInstalment extends Vue {
  @State( state => state.brand.brandList ) brandList
  @Action( 'brand/getAllBrands' ) getAllBrands
  condition: any[] = [
    { value: '', key: 'lcSkuCode', label: 'SKU编码', type: 'text' },
    { value: '', key: 'brandId', label: '品牌', type: 'select', options: [] }
  ]
  loading: boolean = false
  isAdd = false
  search ( cur?) {
    this.$permissionValidateWithNotify( 1127 )
    let o: any = {}
    this.condition.forEach( v => {
      let { key, value, type } = v
      if ( type == 'text' ) {
        o[ key ] = value && value.trim()
      } else {
        o[ key ] = value
      }
    } )
    this.page.cur = cur || this.page.cur
    o.start = ( this.page.cur - 1 ) * this.page.num
    o.num = this.page.num
    this.$router.push( {
      path: "/product/instalment",
      query: { ...o }
    } )
    this.$http( API.getInstalment, o )
      .then( ( { data } ) => {
        const myData = data.data
        this.loading = false
        this.data = myData.list
        this.page.total = myData.count
      } )
      .catch( err => {
        this.data = []
        this.page.total = 0
        this.loading = false
      } )
  }
  config: any[] = [
    // { prop: 'lcCode', label: 'lcCode', width: '150' },
    { prop: 'skuName', label: '名称', width: '300' },
    { prop: 'lcSkuCode', label: 'SKU编码', width: '150' },
    { prop: 'brandName', label: '品牌', width: '' },
    { prop: 'instalmentLen', label: '期数', width: '100' },
    { prop: 'instalment', label: '分期方案', width: '150' },
    { prop: 'control', label: '操作', fixed: 'right', width: '150' }
  ]
  data: any[] = []
  curChange ( cur ) {
    this.search( cur )
  }
  dialogVisible: boolean = false
  currentRows: any[] = []
  skuChange ( list ) {
    this.currentRows = list
  }
  currentSteps = []
  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  initGetData () {
    let query = this.$route.query
    this.condition.forEach( v => {
      let k = v.key
      if ( v.type === 'select' ) {
        v.value = +query[ k ] || undefined
      } else {
        v.value = query[ k ]
      }
    } )
    this.search()
    return
  }
  dialogOpen ( row?) {
    this.dialogVisible = true
    this.currentRows = row ? [ row ] : []
    this.currentSteps = ( ( row || {} ).instalmentConfigList || [ {} ] ).map( v => v.periodRate )
    this.isAdd = !row
  }
  deleteInstalment ( row ) {
    this.$confirm( '此操作将删除该商品分期配置，是否继续？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
    } ).then( () => {
      this.$http( API.deleteInstalment, { skuId: row.skuId } ).then( res => {
        this.$message( {
          message: '删除成功',
          type: 'success'
        } )
        this.data = this.data.filter( v => v.skuId !== row.skuId )
      }, rej => {
        this.$message( {
          message: rej.msg,
          type: 'warning'
        } )
      } )
    } )
  }
  submit () {
    this.$permissionValidateWithNotify( 1128 )
    if ( !this.validate() ) return
    let url = this.isAdd ? API.addInstalment : API.updateInstalment
    let skuId = this.currentRows[ 0 ].skuId
    let periods = this.currentSteps.filter( v => !!+v ).map( ( v, i ) => ( {
      periodNum: i + 1,
      periodRate: Number( v )
    } ) )
    let row = this.currentRows[ 0 ]
    this.$http( url, {
      skuId, periods,
      broadcast: true
    } ).then( res => {
      if ( !this.isAdd ) {
        row.instalmentConfigList = periods
      } else {
        this.page.total += 1
        this.data.unshift( {
          ...row,
          instalmentConfigList: periods
        } )
      }
      this.dialogClose()
    } )
  }
  validate () {
    if ( !this.currentRows.length ) {
      this.$notify( {
        type: 'error',
        message: '请选择适用商品'
      } )
      return false
    }
    let currentSteps = this.currentSteps.filter( v => v )
    if ( !currentSteps.length ) {
      this.$notify( {
        type: 'error',
        message: '请输入商品分期规则'
      } )
      return false
    }
    let total = currentSteps.reduce( ( t, p ) => t += Number( p ), 0 )

    if ( total !== 100 ) {
      this.$notify( {
        type: 'error',
        message: '请确认商品分期规则有效'
      } )
      return false
    }
    return true
  }
  cancel () {
    this.dialogClose()
  }
  dialogClose () {
    this.dialogVisible = false
    this.currentRows = []
    this.currentSteps = []
  }
  activated () {
    this.initGetData()
    let brand: any = this.condition[ 1 ]
    this.getAllBrands().then( () => brand.options = this.brandList )
  }
}
</script>