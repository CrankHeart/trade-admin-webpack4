<template>
  <div class="sticky-bottom" :style="{ left: mainMarginLeft }">
    <span>已添加（{{ allSelectedSkuCount }}）</span>
    <el-button @click="addAllSelected">添加</el-button>
    <el-button :disabled="selectList.length == 0" @click="delAllSelected">删除</el-button>
    <template>
      <el-button
        class="pull-right"
        :disabled="allSelectedSkuCount === 0"
        @click="checkAccount"
        type="primary"
      >发起核对</el-button>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch, Inject } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import API from '@/API'

let randomDate = Date.now()
@Component( {
  name: "receivable-bottom-bar",
  components: {}
} )
export default class receivableBottomBar extends Vue {
  @State( state => state.mainMarginLeft ) mainMarginLeft;
  @State( state => state.receivable.selectList ) selectList;
  @Mutation( "receivable/combineSelectlist" ) combineSelectlist;
  @Mutation( "receivable/clearReceviableCommonSkuList" ) clearReceviableCommonSkuList;

  @Prop( { default: () => [] } )
  selectedList: any[]; // 传入的加入购物车的数据

  get allSelectedSkuCount () {
    return this.selectList.length;
  }

  // 添加按钮
  addAllSelected () {
    if ( this.selectedList.length === 0 ) {
      return;
    }
    let combinArr = this.selectedList.map( info => {
      return {
        ...info,
        value: true
      };
    } );
    this.combineSelectlist( combinArr );
  }

  // 全部删除按钮
  delAllSelected () {
    if ( this.selectList.length === 0 ) {
      return;
    }
    this.$confirm( `确定删除所有选中么?`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    } ).then( () => {
      // let combinArr = this.selectedList.map(info => {
      //   return {
      //     ...info,
      //     value: false
      //   };
      // });
      // this.combineSelectlist(combinArr);
      this.clearReceviableCommonSkuList()
    } );
  }

  checkAccount () {
    // 检测权限
    this.$permissionValidateWithNotifyEnv( 1174, 1170 );
    if ( this.selectList.length == 0 ) {
      return;
    }
    this.$confirm( "确认发起核对吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    } ).then( () => {
      this.$http( API.launchedStatement, {
        requestId: randomDate,
        receivableSns: this.selectList.map( v => v.receivableSn )
      } ).then( ( { data } ) => {
        this.$notify( {
          type: "success",
          message: data.msg || '核对成功'
        } );
        this.$emit( 'success', data )
        randomDate = Date.now()
        this.clearReceviableCommonSkuList()
      } )
        .catch( err => {
          this.$notify( {
            type: "error",
            message: err.data.msg || "未知错误"
          } );
          randomDate = Date.now()
        } );
    } );
  }
}
</script>

<style lang="stylus" scoped>
.sticky-bottom
  position fixed
  bottom 0
  right 0
  height 28px
  padding 16px
  background #fff
  z-index 99
  box-shadow 0 -1px 5px rgba(0, 0, 0, 0.2)
</style>
