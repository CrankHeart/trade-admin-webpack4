<template>
  <el-input v-model="addressvalue" class="address-cascader" placeholder="请输入详细地址">
    <el-cascader
      slot="prepend"
      :options="cascaderAddress"
      class="area-address"
      v-model="addressCompanyArea"
      @active-item-change="handleItemChange"
      @change="handleAreaChange"
      :disabled="!cascaderAddress.length"
      clearable
    ></el-cascader>
  </el-input>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop, Watch } from "vue-property-decorator"
import { Getter, Action, State, Mutation } from "vuex-class"
@Component( {
  name: "address-cascader",
  components: {}
} )
export default class addressCascader extends Vue {
  @Action( 'address/getAddress' ) getAddress
  @Getter( 'address/allAddress' ) allAddress
  @State( state => state.address.cascaderAddress ) cascaderAddress
  @Mutation( "address/setTheCity" ) setTheCity
  @Mutation( "address/setTheArea" ) setTheArea
  @Prop()
  value: string
  @Prop( { default: () => [] } )
  companyArea: [ number ]

  @Watch( 'companyArea' ) companyAreaWatch ( area ) {
    // 兼容性处理:当dialog 嵌套地址列表时, dialog重新打开,不会再次渲染地址,这里监听地址变化,然后重新渲染
    this.addressCompanyArea = area
    this.handleAreaChange( area )
  }

  addressCompanyArea: [ number ] = []
  get addressvalue () {
    return this.value
  }
  set addressvalue ( v ) {
    this.$emit( 'input', v )
  }
  // get addressCompanyArea () {
  //   return this.companyArea
  // }
  // set addressCompanyArea ( v ) {
  //   this.$emit( 'change', v )
  // }
  // @Watch('addressCompanyArea')
  // watchAddressChange( newVal ){
  //   this.$emit( 'change', newVal )
  // }


  created () {
    this.getAddress().then( res => {
      let area = this.companyArea || []
      if ( area.length > 0 ) {
        // this.handleItemChange( this.addressCompanyArea )
        this.setTheCity( area[ 0 ] )
        this.setTheArea( {
          province: area[ 0 ],
          city: area[ 1 ]
        } )
      }
      this.addressCompanyArea = area
      this.handleAreaChange( area )
    } )
  }

  handleAreaChange ( val ) {
    let array = this.allAddress
    let companyAddress = ''
    for ( let i = 0; i < val.length; i++ ) {
      for ( let j = 0; j < array.length; j++ ) {
        if ( val[ i ] === array[ j ].value ) {
          if ( [ 3317, 3318, 3319, 3320 ].indexOf( array[ j ].value ) === -1 ) {
            companyAddress += array[ j ].label
          }
          array = array[ j ].children
          break
        }
      }
    }
    this.$emit( 'address-change', { companyAddress, companyArea: val } )
  }
  handleItemChange ( val ) {
    let province = val[ 0 ]
    let city = val[ 1 ]
    if ( province && !city ) {
      this.setTheCity( province )
    } else if ( province && city ) {
      this.setTheArea( { province, city } )
    }
  }
}
</script>
<style lang="stylus">
.address-cascader
  .el-cascader
    width 300px
  .el-dialog--small
    width 80%
  .el-input-group__prepend
    border none
.el-form-item.is-error
  .address-cascader .el-input__inner
    border-color #ff4949 !important
</style>

