<template>
  <div id="business-brands">
    <lc-title text="品牌管理" @click.native.self="darknessChange">
      <el-button
        type="primary"
        class="pull-right"
        v-if="$permissionValidate(513)"
        @click="editPop()"
      >创建品牌</el-button>
    </lc-title>
    <template v-if="!(darkness % 3)">
      <dark-brand></dark-brand>
    </template>
    <lc-table :config="config" :data="data" @cur-change="curChange" :page="page">
      <template slot-scope="scope">
        <template v-if="scope.con.prop =='delState'">
          <el-select
            v-model="scope.row['delState']"
            :key="scope.row.id"
            size="small"
            :disabled=" !$permissionValidate(515)"
          >
            <el-option
              @click.native="updateState(scope.row)"
              v-for="item in delStates"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
        <template v-else-if="scope.con.prop == 'nameCn'">
          <div class="update">
            {{scope.row['nameCn']}}
            <el-button
              size="mini"
              v-if="$permissionValidate(514)"
              icon="edit"
              class="pull-right"
              type="primary"
              @click.stop="editPop(scope.row)"
            ></el-button>
          </div>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>

    <el-dialog
      :title="title"
      v-model="dialogVisible"
      size="small"
      :before-close="dialogClose"
      :key="editBrand.random"
      v-if="dialogVisible"
    >
      <span>
        <el-form label-width="100px" ref="myForm">
          <el-form-item label="品牌名称" :class="{'is-error':errorCode===1}">
            <el-input v-model="editBrand.brandName" size="small" placeholder="请输入品牌名称"></el-input>
          </el-form-item>
          <el-form-item label="拼音" :class="{'is-error':errorCode===2||errorCode===3}">
            <el-input v-model="editBrand.brandNameEn" size="small" placeholder="请输入品牌拼音"></el-input>
            <div class="el-form-item__error" v-if="errorCode!==0">
              <span v-if="errorCode===1">品牌名不能为空</span>
              <span v-if="errorCode===2">拼音不能为空</span>
              <span v-if="errorCode===3">拼音只能为字母</span>
            </div>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop, Inject } from "vue-property-decorator"
import lcTitle from "../../components/title.vue"
import lcTable from "../../components/table/index"
import API from "../../API"
import { Mutation } from "vuex-class"
import { Page } from '../../typing/index'
import darkBrand from './components/darkBrand.vue'
@Component( {
  name: "business-brands",
  components: {
    lcTitle,
    lcTable,
    darkBrand
  }
} )
export default class BusinessBrands extends Vue {

  @Mutation( "brand/setShouldInit" ) setShouldInit
  darkness = 1
  darknessChange () {
    this.darkness++
  }

  delStates = [ { name: "展示", id: 0 }, { name: "不展示", id: 1 } ]
  config = [
    { prop: "nameCn", label: "品牌名称" },
    { prop: "nameEn", label: "拼音" },
    { prop: "onSaleNo", label: "可售" },
    { prop: "stopSaleNo", label: "停售" },
    { prop: "cancelledNo", label: "作废" },
    { prop: "delState", label: "状态" }
  ]
  data = []
  errorCode: number = 0
  get title (): string {
    return this.editId ? "修改品牌" : "创建品牌"
  }
  editId: number | null = null
  dialogVisible: boolean = false
  page: Page = {
    cur: 1,
    num: 15,
    total: 0
  }
  editBrand = {
    brandName: "",
    brandNameEn: "",
    random: Math.random()
  }

  dialogClose () {
    this.resetForm()
    this.editId = null
    this.dialogVisible = false
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.getData()
  }
  editPop ( item ) {
    this.dialogVisible = true
    if ( item ) {
      this.editBrand = {
        brandName: item.nameCn,
        brandNameEn: item.nameEn,
        random: Math.random()
      }
      this.editId = item.id
    }
  }
  validate () {
    let { brandName, brandNameEn } = this.editBrand

    if ( !brandName ) {
      this.errorCode = 1
      return false
    }
    if ( !brandNameEn ) {
      this.errorCode = 2
      return false
    }
    if ( !/^[a-zA-Z]+$/.test( brandNameEn ) ) {
      this.errorCode = 3
      return false
    }
    return true
  }
  submitForm () {
    if ( !this.validate() ) return
    let obj = {
      nameCn: this.editBrand.brandName,
      nameEn: this.editBrand.brandNameEn.toUpperCase(),
      id: this.editId
    }
    this.$http( this.editId ? API.updateGoodBrand : API.addGoodBrand, {
      ...obj,
      broadcast: true
    } ).then( ( { data } ) => {
      this.dialogClose()
      this.getData()
      this.setShouldInit( true )
    } )
  }
  resetForm () {
    this.editBrand.brandName = ""
    this.editBrand.brandNameEn = ""
  }
  updateState ( item ) {
    this.$http( API.updateGoodBrand, {
      id: item.id,
      delState: item.delState, // 展示或不展示状态
      // broadcast: true
    } ).then( ( { data } ) => {
      this.getData()
      this.$notify( {
        type: 'success',
        message: data.msg
      } )
    }, ( { data } ) => {
      this.$alert( data.msg, "警告", {
        confirmButtonText: "确定",
        callback: action => {
          this.getData() // 防止并发情况，同步一下数据  ???
          if ( item.delState === 1 ) {
            item.delState = 0
          } else {
            item.delState = 1
          }
        }
      } )
    }
    )
      .catch( err => {
        console.log( err, 222 )
      } )
  }
  activated () {
    this.getData()
  }
  getData () {
    this.$permissionValidateWithNotify( 525 )
    let start = ( this.page.cur - 1 ) * this.page.num
    this.$http( API.getGoodsBrand, { start, num: this.page.num } ).then(
      ( { data } ) => {
        this.page.total = data.total
        this.data = data.list
      },
      rej => {
        this.page.total = 0
        this.data = []
      }
    )
  }
}
</script>
<style lang="stylus" scoped>
.update
  .el-button
    display none
td:hover
  .update
    .el-button
      display block
</style>


