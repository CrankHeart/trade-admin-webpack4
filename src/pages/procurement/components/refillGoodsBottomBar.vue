<template>
  <div class="sticky-bottom" :style="{ left: mainMarginLeft}">
    <span>已添加商品（{{allSelectedSkuCount}}）</span>
    <el-button :disabled="isActiveAddBtn" @click="addAllSelected">添加</el-button>
    <el-button :disabled="isActiveDelBtn" @click="delAllSelected">删除</el-button>
    <template v-if="$permissionValidateWithEnv(1164,1160)">
      <el-button
        class="pull-right"
        :disabled="allSelectedSkuCount === 0"
        @click="finished"
        type="primary"
      >转计划外采购任务</el-button>
    </template>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import { Component, Prop, Watch, Inject } from 'vue-property-decorator'
import { State, Action, Getter, Mutation } from 'vuex-class'

@Component( {
  name: 'refill-goods-bottom-bar',
  components: {
  }
} )
export default class procurementCreateSkuResult extends Vue {
  @State( state => state.mainMarginLeft ) mainMarginLeft
  @State( state => state.procurement.buyingRequirementSkuList ) buyingRequirementSkuList
  @State( state => state.procurement.buyingRequirementSelectedSkuList ) buyingRequirementSelectedSkuList
  @Mutation( 'procurement/clearBuyingRequirementSelectedSkuList' ) clearBuyingRequirementSelectedSkuList
  @Mutation( 'procurement/addBuyingRequirementSkuList' ) addBuyingRequirementSkuList
  @Mutation( 'procurement/delBuyingRequirementSkuList' ) delBuyingRequirementSkuList


  @Prop()
  currView: string // 当前视图

  get isActiveAddBtn () {
    let isDisabled = false
    if ( this.buyingRequirementSelectedSkuList.length === 0 ) {
      isDisabled = true
    }
    return isDisabled
  }

  get isActiveDelBtn () {
    return this.isActiveAddBtn || this.buyingRequirementSkuList.length === 0
  }

  get allSelectedSkuCount () {
    return this.buyingRequirementSkuList.length
  }

  get currSelectedSku () {
    let currSelectedSku = []
    currSelectedSku = this.buyingRequirementSelectedSkuList
    return currSelectedSku
  }

  get currViewName () {
    let currViewName = '采购需求'
    return currViewName
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
        this.addBuyingRequirementSkuList( { result: v, isFormat: true } )
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


    // this.clearSelected()
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
      this.delBuyingRequirementSkuList( lcSkuCodes )
      this.clearSelected()
    } )
  }

  clearSelected () {
    this.clearBuyingRequirementSelectedSkuList()
  }

  finished () {
    // 转普通采购单
    this.$router.push( '/procurement/buyingRequirementExt' )
    // this.$emit( 'complete' )
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
  box-shadow 0 -1px 5px rgba(0,0,0,.2)
</style>






