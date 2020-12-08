<template>
  <div class="standard-spu">
    <el-card class="box-card">
      <div slot="header">
        <span>{{title || 'SPU'}}</span>
        <el-button class="pull-right" type="text" @click="toggleEditStatus" v-if="editable">
          <template v-if="!isEdit">编辑</template>
          <template v-else>保存</template>
        </el-button>
        <slot name="header-slot"></slot>
      </div>
      <el-row :gutter="30" v-show="visible">
        <el-col :md="8" v-for="item in spuStandardProps" :key="item.prop">
          <div class="item">
            <label>{{item.label}}:</label>
            <template v-if="!isEdit || !canEdit">
              <template
                v-if="item.prop=='category3stId' || item.prop=='brandId' || item.prop=='storeId'"
              >{{convertData(spu[item.prop], item.prop)}}</template>
              <template v-else>
                <el-tooltip effect="light" :content="`${spu[item.prop]}`" placement="bottom-start">
                  <span>{{spu[item.prop]}}</span>
                </el-tooltip>
              </template>
            </template>
            <template v-else>
              <template v-if="item.prop=='category3stId'">
                <el-select v-model="spu.category3stId" placeholder="请选择" size="small" filterable>
                  <el-option
                    v-for="item in allTypes"
                    :label="item.name"
                    :value="item.id"
                    :key="item.id"
                  >{{item.name}}-{{item.id}}</el-option>
                </el-select>
              </template>
              <template v-else-if="item.prop == 'storeId' ">
                <el-select
                  v-model="spu.storeId"
                  placeholder="请选择"
                  size="small"
                  filterable
                  @change="validateProductUnique(item.prop)"
                >
                  <el-option
                    v-for="(store,index) in myStores"
                    :label="store.name"
                    :value="store.id"
                    :key="index"
                  ></el-option>
                </el-select>
              </template>
              <template v-else-if="item.prop=='brandId'">
                <el-select
                  v-model="spu.brandId"
                  placeholder="请选择"
                  size="small"
                  filterable
                  @change="validateProductUnique(item.prop)"
                >
                  <el-option
                    v-for="(brand,index) in brandList"
                    :label="brand.name"
                    :value="brand.id"
                    :key="index"
                  ></el-option>
                </el-select>
              </template>
              <template v-else-if="item.prop=='name'">
                <el-input
                  v-model="spu[item.prop]"
                  size="small"
                  @blur="validateProductUnique(item.prop)"
                ></el-input>
              </template>
              <template v-else-if="item.prop=='remark'">
                <el-input v-model="spu[item.prop]" type="textarea" :max="300"></el-input>
              </template>
              <template v-else>
                <el-input v-model="spu[item.prop]" size="small" :disabled="item.prop=='lcCode'"></el-input>
              </template>
            </template>
          </div>
        </el-col>
      </el-row>
      <slot :is-edit="isEdit"></slot>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Getter, Mutation, Action } from "vuex-class"
import { spuStandardProps } from '../const'
import { matchArrItem } from '../../../utils'
import API from '../../../API'

@Component( {
  name: 'StandardSpu'
} )
export default class StandardSpu extends Vue {
  @Action( "category/getAllCategory2" ) getAllCategory
  @Action( "brand/getAllBrands" ) getAllBrands
  @State( state => state.category.category2 ) allTypes
  @State( state => state.brand.brandList ) brandList
  @Action( 'stores/getAllStores' ) getAllStores
  @Getter( "stores/storeList" ) storeList
  @Prop()
  spu: any
  // spu备份
  @Prop()
  value: any
  @Prop()
  editable: boolean
  @Prop( { default: '' } )
  title: string
  @Prop( { default: true } )
  canEdit: boolean
  @Prop( { default: true } )
  visible: boolean
  spuStandardProps = spuStandardProps
  isEdit = false
  get myStores () {
    return this.storeList.map( ( { storeId, storeName } ) => ( {
      id: storeId,
      name: storeName
    } ) )
  }
  created () {
    this.getAllCategory()
    this.getAllBrands()
    this.getAllStores()
  }
  validateProductUnique ( prop ) {
    if ( !this.valideSubmit() ) return
    let { brandId, name, storeId } = this.spu
    let id = this.$route.params.id
    if ( !id ) {
      return
    }
    this.$http( API.validateProductUnique, {
      brandId,
      name,
      storeId,
      id,
      broadcast: true
    } ).then( ( { data } ) => {
      if ( !data.data ) {
        let { brandId, storeId, name, brandName, storeName } = this.value
        Object.assign( this.spu, { brandId, storeId, name, brandName, storeName } )
      } else {
        let { brandId, storeId, name, brandName, storeName } = this.spu
        // this.$emit( 'input', Object.assign( {}, this.spu ) )
      }
    }, () => {
      let { brandId, storeId, name, brandName, storeName } = this.value
      Object.assign( this.spu, { brandId, storeId, name, brandName, storeName } )
    } )
  }
  toggleEditStatus () {
    const fn = () => this.isEdit = !this.isEdit
    if ( this.isEdit ) {
      this.saveSpu( fn )
    } else {
      fn()
    }
  }
  saveSpu ( callBack ) {
    let spu = this.spu
    if ( spu.label === "订购商品" ) {
      spu.label = ""
    }
    if ( !this.valideSubmit() ) {
      return
    }
    this.$emit( 'save-spu', {
      ...spu,
      label: spu.label === '订购商品' ? '' : spu.label,
      callBack
    } )
  }
  valideSubmit () {
    return (
      this.validateType( this.spu ) &&
      this.validateBrand( this.spu ) &&
      this.validateStore( this.spu )
    )
  }
  validateType ( spu ) {
    const newType = this.allTypes.filter( ( v, i ) => {
      return v.id == spu.category3stId
    } )[ 0 ]
    if ( !newType ) {
      this.$notify( {
        type: "error",
        message: "类目识别错误，请联系管理员！"
      } )
      return false
    }
    spu.category3stName = newType && newType.name
    return true
  }
  validateBrand ( spu ) {
    const newBrand = this.brandList.filter( ( v, i ) => {
      return v.id == spu.brandId
    } )[ 0 ]
    if ( !newBrand ) {
      this.$notify( {
        type: "error",
        message: "品牌识别错误，请联系管理员！"
      } )
      return false
    }
    spu.brandName = newBrand.name
    return true
  }
  validateStore ( spu ) {
    const newStore = this.myStores.filter( ( v, i ) => {
      return v.id == spu.storeId
    } )[ 0 ]
    if ( !newStore ) {
      this.$notify( {
        type: "error",
        message: "经销商识别错误，请联系管理员！"
      } )
      return false
    }
    spu.storeName = newStore.name
    return true
  }
  convertData ( value, prop ) {
    let arr = []
    switch ( prop ) {
      case 'category3stId':
        arr = this.allTypes
        break
      case 'brandId':
        arr = this.brandList
        break
      case 'storeId':
        arr = this.myStores
        break
    }
    return matchArrItem( value, arr, 'id' ).name
  }
}
</script>
<style lang="stylus" scoped>
.standard-spu
  margin-bottom 20px
.el-col
  line-height 34px
  .item
    // padding-left 80px
    font-size 12px
    min-height 40px
    label
      display block
      font-weight bold
      // float left
      // margin-left -80px
      font-size 14px
    span
      display block
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
.el-select
  width 100%
</style>
