<template>
  <div class="manage-list">
    <lc-table :config="config" :data="myData" @cur-change="curChange" :page="page">
      <template slot-scope="scope">
        <template v-if="scope.con.prop=='roles'">
          <p v-for="(item,index) in scope.row.user[scope.con.prop]" :key="index">{{item.roleName}}</p>
        </template>
        <template v-else-if="scope.con.prop=='control'">
          <el-button type="text" @click="delUserPop(scope.row)" v-if="$permissionValidate(598)">删除</el-button>
        </template>
        <template v-else>{{scope.row.user[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <el-dialog title="删除" v-model="dialogVisible" size="tiny" :before-close="handleClose">
      <span>
        是否要删除
        <br />
        {{curUsr&&curUsr.userName}}的账户信息
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="delUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import lcTable from '../../../components/table/'
import API from '../../../API'
@Component( {
  name: 'manage-list',
  components: {
    lcTable
  }
} )
export default class ManageList extends Vue {
  config = [
    { prop: "id", label: "ID", width: "120" },
    { prop: "loginName", label: "账户名" },
    { prop: "emailAddress", label: "邮箱" },
    { prop: "userName", label: "姓名" },
    { prop: "roles", label: "角色" },
    { prop: "storeName", label: "供应商" },
    { prop: "control", label: "操作" }
  ]
  allData = []
  page = {
    cur: 1,
    num: 20,
    total: 0
  }
  get myData () {
    let num = this.page.num
    let start = ( this.page.cur - 1 ) * num
    return this.allData.slice( start, start + num )
  }
  curUsr: any = null
  dialogVisible: boolean = false

  curChange ( cur ) {
    this.page.cur = cur
  }
  delUserPop ( user ) {
    this.curUsr = user
    this.dialogVisible = true
  }
  delUser () {
    this.dialogVisible = false
    let id = this.curUsr.user.id
    this.$http( API.userDel, {
      id,
      broadcast: true
    } ).then( res => {
      // this.$notify({
      //   type: 'success',
      //   message: res.data.msg
      // })
      let i = this.allData.indexOf( this.curUsr )
      this.allData = this.allData.filter( v => v.user.id !== id )
      // }, rej => {
      //   this.$notify({
      //     type: 'error',
      //     message: rej.data.msg
      //   })
    } )
  }
  handleClose () {
    this.curUsr = null
    this.dialogVisible = false
  }
  activated () {
    this.search()
  }
  search () {
    let o: any = {}
    this.$http( API.userListInfo, {
      start: 0,
      num: 1500
    } ).then( ( { data } ) => {
      this.allData = data.list
      this.page.total = data.count
    } ).catch( err => {
      console.log( err )
    } )
  }
}

</script>
<style lang="stylus" scoped></style>

