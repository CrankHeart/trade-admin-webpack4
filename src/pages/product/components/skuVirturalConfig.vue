<template>
  <div class="sku-virtural-config">
    <el-select
      v-if="isEdit"
      :value="item.skuType"
      placeholder="请选择"
      size="small"
      :disabled="isAllDisabled"
      @input="dialogOpen($event,true)"
    >
      <el-option
        v-for="option in skuTypes"
        :label="option.name"
        :value="option.id"
        :key="option.id"
        :disabled="option.disabled"
      >{{option.name}}</el-option>
    </el-select>
    <template v-else>{{formatSkuTypes(item.skuType)}}</template>

    <el-tooltip
      v-if="item.skuType&& item.skuType!==3"
      class="relations"
      effect="dark"
      placement="top-start"
    >
      <div slot="content">
        点击
        <i class="el-icon-warning"></i>
        编辑商品虚拟关系
        <br />
        <p
          v-for="item in item.contrastingRelations"
          :key="item.id"
        >{{item.lcSkuCode}} × {{item.scale}}</p>
      </div>
      <i class="el-icon-warning" @click="dialogOpen(item.skuType)"></i>
    </el-tooltip>
    <el-dialog
      v-if="dialogVisible"
      :title="item.specification"
      v-model="dialogVisible"
      size="small"
      :before-close="dialogClose"
      :key="item.id"
    >
      <el-form class="el-row" label-width="85px" size="large">
        <div class="scoll-wrap">
          <template v-for=" (relation,index) in myRelations">
            <el-form-item
              :key="index"
              class="el-col el-col-7"
              label="lcSkuCode"
              :class="{'is-error':relation.isError}"
            >
              <el-input
                :disabled="isAllDisabled"
                v-model="relation.lcSkuCode"
                @change="lcSkuCodeChange(relation)"
                v-if="isEdit"
              ></el-input>
              <template v-else>{{relation.lcSkuCode}}</template>
            </el-form-item>
            <el-form-item :key="index" class="el-col el-col-7" label="换算大小">
              <!--  :disabled="item.skuType==4" -->
              <el-input :disabled="isAllDisabled" v-model="relation.scale" v-if="isEdit"></el-input>
              <template v-else>{{relation.scale}}</template>
            </el-form-item>
            <el-form-item :key="index" class="el-col el-col-7" label="分配金额" v-if="isSuitSku">
              <el-input :disabled="isAllDisabled" v-model="relation.allocatedCost" v-if="isEdit"></el-input>
              <template v-else>{{relation.allocatedCost}}</template>
            </el-form-item>
            <el-form-item
              :key="index"
              class="el-col el-col-2"
              label
              label-width="10px"
              v-if="myRelations.length>1&&isEdit"
            >
              <el-button :disabled="isAllDisabled" type="text" @click="relationDel(index)">删除</el-button>
            </el-form-item>
          </template>
        </div>
        <el-form-item class="el-col el-col-10" label v-if="isEdit && isSuitSku">
          <el-button :disabled="isAllDisabled" type="primary" @click="relationAdd">新增</el-button>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">取 消</el-button>
        <el-button :disabled="isAllDisabled" type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import API from '../../../API'
import { matchArrItem } from '../../../utils/'
import { skuTypes } from '../const'
@Component( {
  name: 'SkuVirturalConfig'
} )
export default class SkuVirturalConfig extends Vue {
  @Prop()
  item: any
  @Prop( { default: false } )
  disabled: boolean
  @Prop( { default: true } )
  changeable: boolean
  @Prop( { default: true } )
  isEdit: boolean
  @Prop( { default: false } )
  isAllDisabled: boolean
  skuTypes = skuTypes
  myRelations: any[] = []
  dialogVisible = false
  deepItem: any = {}
  get isSuitSku () {
    return this.item.skuType === 2
  }
  // mounted () {
  //   // TODO select里直接修改item而且vue没有不可变数据结构，里面的逻辑我看懵逼了，先这么将就一下
  //   let interval: number;
  //   const req = () => {
  //     if ( this.item ) {
  //       cancelAnimationFrame( interval );
  //       this.deepItem = JSON.parse( JSON.stringify( this.item ) )
  //       this.isAllDisabled = ( [ 1, 2, 4 ] as any ).includes( this.deepItem.skuType )
  //     } else {
  //       interval = requestAnimationFrame( req );
  //     }
  //   };
  //   interval = requestAnimationFrame( req );
  // }

  formatSkuTypes ( v ) {
    return matchArrItem( v, this.skuTypes, 'id' ).name
  }

  dialogOpen ( skuType, isChange ) {
    let contrastingRelations = this.item.contrastingRelations
    if ( isChange && this.item.skuType !== skuType ) {
      contrastingRelations = []
    }

    this.item.skuType = skuType
    if ( skuType ) {
      this.dialogVisible = true
      this.myRelations = JSON.parse( JSON.stringify( contrastingRelations ) ) || []
      if ( !this.myRelations.length ) {
        this.relationAdd()
      }
    }
  }
  relationAdd () {
    let o: any = { lcSkuCode: '', scale: this.item.skuType == 4 ? 1 : '' }
    if ( this.isSuitSku ) {
      o.allocatedCost = ''
    }
    let { lcSkuCode, scale, allocatedCost } = this.myRelations.slice( -1 )[ 0 ] || o
    if ( !this.myRelations.length ) {
      this.myRelations.push( o )
    } else if ( !this.isSuitSku && lcSkuCode && +scale ) {
      this.myRelations.push( o )
    } else if ( this.isSuitSku && lcSkuCode && +scale && +allocatedCost ) {
      this.myRelations.push( o )
    } else { }
  }
  lcSkuCodeChange ( relation ) {
    this.$set( relation, 'isError', false )
  }
  relationDel ( index ) {
    this.myRelations.splice( index, 1 )
  }
  dialogClose () {
    this.dialogVisible = false
  }
  submitForm () {
    if ( !this.isEdit ) {
      this.dialogClose()
      return
    }
    if ( !this.initValidate() ) return
    this.$http( API.checkSuitSkuAvailable, {
      contrastingRelations: this.myRelations,
      skuId: this.item.id,
      broadcast: true,
      skuType: this.item.skuType
    } ).then( ( { data } ) => {
      this.submitSuccess()
    }, ( { data } ) => {
      let errList = Object.keys( data.error || {} )
      this.myRelations.forEach( v => {
        if ( errList.indexOf( v.lcSkuCode ) > -1 ) {
          this.$set( v, 'isError', true )
        }
      } )
    } )
  }
  submitSuccess () {
    this.item.contrastingRelations = this.myRelations
    this.dialogClose()
  }
  initValidate () {
    for ( let i = 0, l = this.myRelations.length; i < l; i++ ) {
      let myRelations = this.myRelations[ i ]
      let { lcSkuCode, scale, allocatedCost = '' } = myRelations
      myRelations.lcSkuCode = lcSkuCode = lcSkuCode.replace( /^\s+|\s+$/g, '' )
      for ( let j = 0; j < l; j++ ) {
        if ( i === j ) continue
        let myRelationsJ = this.myRelations[ j ]
        myRelationsJ.lcSkuCode = myRelationsJ.lcSkuCode.replace( /^\s+|\s+$/g, '' )
        if ( lcSkuCode == myRelationsJ.lcSkuCode ) {
          this.$set( myRelationsJ, 'isError', true )
          return false
        }
      }
      if ( !this.isSuitSku && lcSkuCode != '' && +scale ) {
        continue
      } else if ( this.isSuitSku && lcSkuCode != '' && +scale && +allocatedCost ) {
        continue
      }
      this.$set( myRelations, 'isError', true )
      return false
    }
    return true
  }
}
</script>
<style lang="stylus" scoped>
.sku-virtural-config
  display flex
  justify-content space-between
  > .el-icon-warning
    line-height 30px
    cursor pointer
.sku-virtural-config
  > .el-icon-warning
    color #97a0ae
    margin-left 5px
</style>

<style lang="stylus" >
.sku-virtural-config
  .el-form-item
    margin-bottom 22px !important
  .el-form-item:not(.el-col-2) .el-form-item__content
    margin-left 85px !important
</style>
