<template>
  <div class="sticky-bottom" :style="{ left: mainMarginLeft}">
    <span>已添加商品（{{allSelectedSkuCount}}）</span>
    <el-button :disabled="isActiveAddBtn" @click="addAllSelected">添加</el-button>
    <el-button :disabled="isActiveDelBtn" @click="delAllSelected">删除</el-button>
    <el-button :disabled="isActiveChooseBtn" @click="chooseSupplier">选择供应商</el-button>
    <template v-if="$permissionValidateWithEnv(1152, 1150)">
      <el-button
        class="pull-right"
        :disabled="allSelectedSkuCount === 0"
        @click="finished"
        type="primary"
      >转普通采购单</el-button>
    </template>
    <select-supplier-dialog
      :sku="currSelectedSku"
      v-model="visibleChooseSupplier"
      @editSucess="addSupplierSucess"
    ></select-supplier-dialog>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import { Component, Prop, Watch, Inject } from 'vue-property-decorator'
import { State, Action, Getter, Mutation } from 'vuex-class'
import selectSupplierDialog from "./selectSupplierDialog.vue";

@Component( {
  name: 'purchasing-tasks-bottom-bar',
  components: {
    selectSupplierDialog
  }
} )
export default class purchasingTasksBottomBar extends Vue {
  @State( state => state.mainMarginLeft ) mainMarginLeft
  @State( state => state.procurement.commonSkuList ) commonSkuList
  @State( state => state.procurement.commonSelectedSkuList ) commonSelectedSkuList
  @State( state => state.procurement.orderSelectedSkuList ) orderSelectedSkuList
  @Mutation( 'procurement/clearCommonSelectedSkuList' ) clearCommonSelectedSkuList
  @Mutation( 'procurement/clearOrderSelectedSkuList' ) clearOrderSelectedSkuList

  @Mutation( 'procurement/addCommonSkuList' ) addCommonSkuList
  @Mutation( 'procurement/delCommonSkuList' ) delCommonSkuList
  @Mutation( 'procurement/clearCommonSkuList' ) clearCommonSkuList

  @Prop()
  currView: string // 当前视图

  visibleChooseSupplier: boolean = false
  notClear: boolean = false

  get isActiveAddBtn () {
    let isDisabled = false
    if ( this.currView === 'refillCommonSku' && this.commonSelectedSkuList.length === 0 ) {
      isDisabled = true
    } else if ( this.currView === 'refillOrderSku' && this.orderSelectedSkuList.length === 0 ) {
      isDisabled = true
    }
    return isDisabled
  }

  get isActiveDelBtn () {
    return this.isActiveAddBtn || this.commonSkuList.length === 0
  }

  get isActiveChooseBtn () {
    return this.allSelectedSkuCount === 0
  }

  get allSelectedSkuCount () {
    return this.commonSkuList.length
  }

  get currSelectedSku () {
    let currSelectedSku = []

    if ( this.currView === 'refillCommonSku' ) {
      currSelectedSku = this.commonSelectedSkuList
    } else if ( this.currView === 'refillOrderSku' ) {
      currSelectedSku = this.orderSelectedSkuList
    }
    return currSelectedSku
  }

  get currViewName () {
    let currViewName = ''
    if ( this.currView === 'refillCommonSku' ) {
      currViewName = '普通视图'
    } else if ( this.currView === 'refillOrderSku' ) {
      currViewName = '订购视图'
    }
    return currViewName
  }

  @Watch( '$route' )
  routerChange ( to, from ) {
    if ( from.path === '/procurement/purchasingTasks' ) {
      if ( !this.notClear ) {
        this.clearCommonSkuList()
      }
    }
  }

  // 全部添加按钮
  addAllSelected () {
    let count = 0
    if ( this.currSelectedSku.length === 0 ) {
      return
    }

    this.currSelectedSku.forEach( v => {
      if ( !v.isAdded ) {
        v.isAdded = true
        this.addCommonSkuList( { result: v, isFormat: true } )
        count++
      }
    } )
    if ( count > 0 ) {
      this.$notify( {
        type: 'success',
        message: `${this.currViewName}选中的商品全部添加成功`
      } )
    } else {
      this.$notify( {
        type: 'warning',
        message: `请不要重复添加`
      } )
    }
  }

  // 全部删除按钮
  delAllSelected () {
    if ( this.currSelectedSku.length === 0 ) {
      return
    }
    this.$confirm( `确定删除${this.currViewName}所有选中的商品吗`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    } ).then( () => {
      let lcSkuCodes = []
      this.currSelectedSku.forEach( v => {
        v.isAdded = false
        lcSkuCodes.push( v.lcSkuCode )
      } )
      this.delCommonSkuList( lcSkuCodes )
      this.clearSelected()
    } )
  }

  // 批量选择供应商
  chooseSupplier () {
    this.visibleChooseSupplier = true
  }

  clearSelected () {
    if ( this.currView === 'refillCommonSku' ) {
      this.clearCommonSelectedSkuList()
    } else if ( this.currView === 'refillOrderSku' ) {
      this.clearOrderSelectedSkuList()
    }
  }

  finished () {
    // 转普通采购单
    if ( this.hasSameSupplier() ) {
      this.$notify( {
        type: 'warning',
        message: `不能存在供应商不同的采购单`
      } )
    } else {
      this.notClear = true
      this.$router.push( '/procurement/commomProcurement' )
    }
    // this.$emit( 'complete' )
  }

  hasSameSupplier () {
    let supplierId = '';
    for ( let item of this.commonSkuList ) {
      if ( item.supplierId ) {
        if ( !supplierId ) {
          supplierId = item.supplierId
        } else if ( supplierId != item.supplierId ) {
          return true
        }
      }
    }
    return false
  }

  addSupplierSucess () {
    console.log( 'sucess!!!' )
    // this.clearCommonSkuList();
    this.$emit( "editSucess" );
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






