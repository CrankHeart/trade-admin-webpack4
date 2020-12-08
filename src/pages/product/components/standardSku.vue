<template>
  <div class="standard-sku">
    <el-card class="box-card">
      <div slot="header">
        <span>SKU</span>
        <el-button
          class="pull-right"
          type="text"
          @click="addNewVisible=true"
          v-if="canEdit&&editable&&$permissionValidate(511)"
        >新增SKU</el-button>
        <el-tooltip placement="left-start" effect="light">
          <el-button class="pull-right" type="text">快捷预览项</el-button>
          <ul slot="content" class="drop-menu">
            <li
              v-for="con in allProps"
              :key="con.prop"
              :class="{'is-active':visibleProps.indexOf(con.prop)>-1}"
              @click="toggleVisibleProp(con.prop)"
            >
              {{con.label}}
              <i class="pull-right el-icon-check"></i>
            </li>
          </ul>
        </el-tooltip>
        <slot name="header-slot"></slot>
      </div>
      <el-collapse>
        <!-- sku -->
        <el-collapse-item v-for="item in skuList" :key="item.id" :name="item.id">
          <template slot="title">
            <el-tooltip effect="light" :content="`${item.specification}`" placement="bottom-start">
              <span class="title">[{{item.id}}]-{{item.specification}}</span>
            </el-tooltip>-
            <!-- v-if="'specification'!==myType" -->
            <template v-for="myType in visibleProps">
              <template v-if="myType=='purchaseLimit' || myType=='oversold'">
                <span
                  v-if="myType=='purchaseLimit' && item.goodLabel==0"
                  :key="myType"
                  class="label"
                >
                  是否限购--
                  <span>{{item.switchValue?`限购 ${item.purchaseLimit}`:`不限购`}}</span>
                </span>
                <span
                  v-else-if="myType=='oversold' && item.goodLabel==1"
                  :key="myType"
                  class="label"
                >
                  设置超卖属性--
                  {{formatOversold(item.oversold)}}
                </span>
              </template>
              <span v-else :key="myType" class="label">
                {{convertData(myType,'props','prop','label')}}--
                <SkuViewConfig @click.native.stop :item="item" :prop="myType" :spu="spu"></SkuViewConfig>
              </span>
            </template>
          </template>
          <el-row :gutter="30" class="inner" v-show="visible">
            <el-col :md="8" v-for="props in skuStandardProps" :key="props.prop">
              <label>{{props.label}}</label>
              <template v-if="item.isEdit && canEdit">
                <SkuEditConfig
                  :isAllDisabled="[ 1, 2, 4 ].includes( item.skuType )"
                  :spu="spu"
                  :item="item"
                  :prop="props.prop"
                ></SkuEditConfig>
              </template>
              <template v-else>
                <span>
                  <SkuViewConfig :spu="spu" :item="item" :prop="props.prop"></SkuViewConfig>
                </span>
              </template>
            </el-col>
          </el-row>
          <!-- 内容插槽  <template slot-scope="scope">...</template> -->
          <slot :is-edit="item.isEdit" :row="item"></slot>
          <!-- 编辑按钮 -->
          <el-button
            v-if="editable"
            class="edit-check-btn"
            type="text"
            @click.stop="toggleEditStatus(item,$event)"
          >
            <i class="el-icon-edit" v-if="!item.isEdit"></i>
            <i class="el-icon-check" v-else></i>
          </el-button>
        </el-collapse-item>
      </el-collapse>
    </el-card>
    <el-dialog title="新增SKU" v-model="addNewVisible" v-if="canEdit">
      <el-form label-width="100px">
        <el-form-item v-for="item in skuStandardProps" :key="item.prop" :label="item.label">
          <el-input v-model.trim="newSku[item.prop]" size="small" :disabled="item.prop=='lcCode'" />
        </el-form-item>
        <el-form-item label>
          <el-button type="primary" size="small" :loading="addNewBtnLoading" @click="addNewSku">确认</el-button>
          <el-button type="text" size="small" @click="addNewVisible=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator'
import SkuViewConfig from './skuViewConfig.vue'
import SkuEditConfig from './skuEditConfig.vue'

import { skuStandardProps, skuExtendProps, goodStatuses, goodLabels, whileStocksLasts } from '../const'
import { compare, matchArrItem } from '../../../utils'

import { oversolds, findItem } from '../const'

@Component( {
  name: 'StandardSku',
  components: {
    SkuViewConfig,
    SkuEditConfig
  }
} )

export default class StandardSku extends Vue {
  @Inject() formatMyDate
  @Prop() sku: any[]
  @Prop() spu: any
  @Prop() editable: boolean
  @Prop( { default: 'skuConfig' } )
  storageName: string
  // searchValue: string = ''
  visibleProps: string[] = []
  // searchResult: any[] = []
  addNewBtnLoading: boolean = false
  created () {
    let skuConfig = localStorage.getItem( this.storageName ) || ''
    this.visibleProps = skuConfig.split( ',' ).splice( 0, 5 ).filter( v => v )
  }
  get skuList () {
    return this.sku
  }
  getSkuItem ( item ) {
    if ( ( [ 1, 2, 4 ] as any ).includes( item.skuType ) ) {
      return JSON.parse( JSON.stringify( item ) )
    }
    return item
  }
  toggleVisibleProp ( prop ) {
    if ( 'specification' == prop ) return
    let index = this.visibleProps.indexOf( prop )
    if ( index > -1 ) {
      this.visibleProps.splice( index, 1 )
    } else {
      this.visibleProps.push( prop )
    }
    if ( this.visibleProps.length > 5 ) {
      this.visibleProps.shift()
    }
    console.log( this.storageName, this.visibleProps.join( ',' ) );
    localStorage.setItem( this.storageName, this.visibleProps.join( ',' ) )
  }

  @Prop( { default: true } )
  canEdit: boolean
  @Prop( { default: true } )
  visible: boolean
  @Prop( { default: () => [] } )
  extendProps: any[]
  get allProps () {
    // console.log( 111111111111, this.extendProps, this.skuStandardProps );
    return this.skuStandardProps.concat( this.extendProps )
  }
  toggleEditStatus ( item: any, ev ) {
    const fn = () => this.$set( item, 'isEdit', !item.isEdit )
    if ( item.isEdit ) {
      // TODO 下期迭代使用
      let errorMsg = "";
      // switchValue = false; //是否限购 默认false 不限购
      let { goodLabel, switchValue, purchaseLimit, oversold } = item;

      // 校验
      // 订购商品:goodLabel:0
      if ( goodLabel == 0 ) {
        // purchaseLimit 必填
        if ( switchValue ) { // 限购必须输入数量
          if ( purchaseLimit === "" ) {
            errorMsg = "请输入可订购数量"
          }
        }
      } else {
        // 常备商品为:goodLabel:1
        if ( oversold === "" ) {
          errorMsg = "请设置超卖属性"
        }
      }

      if ( errorMsg ) {
        return this.$notify( {
          type: 'error',
          message: errorMsg
        } )
      }
      // 保存旧值 编辑的时候用
      item.oldPurchaseLimit = item.purchaseLimit;
      // 提交表单数据
      let sku = JSON.parse( JSON.stringify( item ) );

      // 清理数据
      // 订购商品:0
      if ( sku.goodLabel == 0 ) {
        sku.oversold = "";
        // 是否限购 默认false 不限购
        if ( !sku.switchValue ) {
          sku.purchaseLimit = -1;
        }
      } else {
        // 常备商品为:1
        sku.purchaseLimit = "";
      }
      this.saveSku( sku, fn )
    } else {
      fn()
    }
  }
  skuStandardProps = skuStandardProps
  addNewVisible: boolean = false
  newSku: any = {}

  addNewSku () {
    if ( !this.validateSku( this.newSku ) ) return
    this.addNewBtnLoading = true
    this.$emit( 'add-sku', {
      sku: this.newSku,
      callBack: () => {
        this.addNewVisible = false
        this.addNewBtnLoading = false
      }
    } )
  }

  saveSku ( item, callBack ) {
    if ( !this.validateSku( item ) ) return
    // emit detail.vue 保存
    this.$emit( 'save-sku', {
      ...item,
      callBack
    } )
  }
  validateSku ( sku ) {
    let { specification = '', id } = sku
    specification = specification.replace( /\s/g, '' )
    let props = this.extendProps.length ? this.extendProps : this.skuStandardProps
    let keys = this.extendProps.length ? [] : props.map( v => v.prop )

    for ( let i = 0, l = keys.length; i < l; i++ ) {
      let key = keys[ i ]
      if ( key == 'lcCode' || key == 'barcode' ) continue
      let v = sku[ key ]
      let value = `${v == undefined ? '' : v}`
      if ( value.trim() === '' ) {
        this.$notify( {
          type: 'error',
          message: '请确认商品内容输入完全！'
        } )
        return false
      }
    }
    // if ( specification == '' ) {
    //   this.$notify( {
    //     type: 'error',
    //     message: 'SKU规格不能为空！'
    //   } )
    //   return false
    // }
    // if ( unit == '' ) {
    //   this.$notify( {
    //     type: 'error',
    //     message: 'SKU单位不能为空！'
    //   } )
    //   return false
    // }

    let l = this.sku.length
    for ( let i = 0; i < l; i++ ) {
      let item = this.sku[ i ]
      let specificationO = item.specification.replace( /\s/g, '' )
      let idO = item.id
      if ( specificationO == specification && id !== idO ) {
        this.$notify( {
          type: 'error',
          message: '规格名称重复！'
        } )
        return false
      }
    }
    return true
  }
  convertData ( value, prop, key = 'id', resultKey = 'name' ) {
    let arr = []
    switch ( prop ) {
      case 'props':
        arr = this.allProps
        break
      case 'goodLabel':
        arr = goodLabels
        break
      case 'goodStatus':
        arr = goodStatuses
        break
      case 'whileStocksLast':
        arr = whileStocksLasts
        break
    }
    return matchArrItem( value, arr, key )[ resultKey ] || '--'
  }

  formatOversold ( id ) {
    if ( id === "" || id === undefined || id === null ) return "";
    return findItem( id, oversolds ).name;
  }
}
</script>
<style lang="stylus" scoped>
.el-collapse
  border none
.standard-sku
  margin-bottom 20px
label
  display block
  font-weight bold
.inner
  color #333
  line-height 34px
.edit-check-btn.el-button
  position absolute
  right 20px
  top 10px
  z-index 999
  width 40px
  height 40px
  border 1px solid #20a0ff
  border-radius 50%
.label, .title
  display inline-block
  width 200px
  overflow hidden
  text-overflow ellipsis
  white-space nowrap
  vertical-align middle
.label
  width 165px
.el-col
  span
    display block
    overflow hidden
    text-overflow ellipsis
    white-space nowrap
.el-form-item
  margin-bottom 10px
.drop-menu
  position relative
  font-size 14px
  width 300px
  li
    line-height 30px
    border-bottom 1px solid #eeeeee
    cursor pointer
    width 50%
    float left
    padding-right 10px
    box-sizing border-box
    .el-icon-check
      display none
      margin-top 10px
    &:hover
      color #20a0ff
    &.is-active
      color #20a0ff
      .el-icon-check
        display block
</style>
<style lang="stylus">
.standard-sku
  .el-collapse
    .el-collapse-item__header__arrow
      float right
      margin-top 16px
    .el-collapse-item__header
      overflow hidden
      .aptitude-config, .sku-virtural-config
        display inline !important
    .el-collapse-item__content
      position relative
    .el-collapse-item__wrap
      background-color #e7ebef
.el-tooltip__popper.is-light
  border-color #ccc
</style>

