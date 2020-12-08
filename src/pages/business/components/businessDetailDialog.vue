<template>
  <el-dialog title="商家详情信息填写" :visible="value" :before-close="cancel" class="business-detail-dialog">
    <el-form :rules="rules" :model="formInline" label-width="80px" ref="business-detail-form">

      <el-form-item v-for="item in itemList" :label="item.label" :prop="item.prop" v-model="formInline[item.prop]" :key="item.prop">
        <template v-if="item.prop=='address'">
          <address-cascader v-model="formInline[item.prop]" @address-change="addressChange" :companyArea="companyArea"></address-cascader>
        </template>
        <el-input v-else-if="item.prop=='remark'" v-model="formInline[item.prop]" type="textarea" :placeholder="item.placeholder"></el-input>
        <el-switch v-else-if="item.prop=='isDoBusiness'" v-model="formInline[item.prop]"></el-switch>
        <el-select v-else-if="item.prop=='companyType'" v-model="formInline[item.prop]">
          <el-option v-for="companyType in companyTypes" :key="companyType.id" :label="companyType.name" :value="companyType.id"></el-option>
        </el-select>
        <el-input v-else v-model="formInline[item.prop]" :placeholder="item.placeholder"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button @click="cancel" size="large">取 消</el-button>
        <el-button type="primary" size="large" @click="confirm">确 定</el-button>
      </el-form-item>

    </el-form>

  </el-dialog>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Inject, Prop, Watch } from "vue-property-decorator"
import API from "../../../API"
import { Getter, Action, State } from "vuex-class"
import { companyTypes } from '../const/index'
import addressCascader from '../../../components/addressCascader.vue'

@Component( {
  name: "business-detail-dialog",
  components: {
    addressCascader
  }
} )
export default class businessDetailDialog extends Vue {

  @Prop()
  id: number
  @Prop( { default: false } )
  value: boolean
  @Prop( { default: () => { } } )
  businessDetail: object

  companyTypes: any = companyTypes

  created() {
    if ( this.businessDetail ) {
      let { isDoBusiness, companyAddressDetail, provinceId, countryId, cityId, address } = ( this.businessDetail as any )
      Object.keys( this.formInline ).forEach( v => {
        if ( this.formInline.hasOwnProperty( v ) ) {
          this.formInline[ v ] = this.businessDetail[ v ]
        }
      } )

      this.formInline.isDoBusiness = !!isDoBusiness

      this.formInline.address = companyAddressDetail
      this.form.address = address.replace( companyAddressDetail, '' )
      this.companyArea = [ provinceId, cityId, countryId ]
    }
  }


  companyArea: any = []
  form: any = {}
  addressChange( v ) {
    this.form.address = v.companyAddress
    this.companyArea = v.companyArea
  }
  itemList: any = [
    { prop: 'storeName', label: '名称', placeholder: '请输入商家名称' },
    { prop: 'companyName', label: '企业名称', placeholder: '请输入企业名称' },
    { prop: 'companyType', label: '企业类型', placeholder: '请选择企业类型' },
    { prop: 'contact', label: '联系人', placeholder: '请输入联系人名称' },
    { prop: 'storeMobile', label: '电话', placeholder: '请输入联系人电话' },
    { prop: 'address', label: '店铺地址', placeholder: '请输入店铺地址' },
    { prop: 'bankOfDeposit', label: '开户行', placeholder: '请输入开户行' },
    { prop: 'bankAccount', label: '银行账号', placeholder: '请输入银行账号' },
    { prop: 'remark', label: '备注', placeholder: '请输入备注' },
    { prop: 'isDoBusiness', label: '是否营业' }
  ]

  formInline = {
    storeName: '',
    companyName: '',
    companyType: 0,
    contact: '',
    storeMobile: '',
    address: '',
    companyAddressDetail: '',
    remark: '',
    bankOfDeposit: '',
    bankAccount: '',
    isDoBusiness: true
  }
  rules: any = {
    storeName: [
      { required: true, message: '请输入商家名称', trigger: 'blur' }
    ],
    contact: [
      { required: true, message: '请填写联系人名称', trigger: 'blur' }
    ],
    storeMobile: [
      { required: true, message: '请填写联系人电话', trigger: 'blur' }
    ],
    address: [
      { required: true, message: '请填写商家地址', trigger: 'blur' }
    ],
    bankOfDeposit: [
      { required: true, message: '请填写请输入开户行', trigger: 'blur' }
    ],
    bankAccount: [
      { required: true, message: '请填写银行账号', trigger: 'blur' }
    ]
  }

  get ajaxOption() {
    let address = this.form.address + this.formInline.address
    let isDoBusiness = +this.formInline.isDoBusiness
    return ( { ...this.formInline, address, isDoBusiness } )
  }
  confirm() {
    let myForm: any = this.$refs[ 'business-detail-form' ]
    let isPassed = true
    myForm.fields.forEach( ( field, index ) => {
      field.validate( '', errors => {
        if ( errors ) {
          isPassed = false
        }
      } );
    } )
    if ( isPassed ) {
      let isAddBusinessPage = this.id == undefined
      let APIName = isAddBusinessPage ? 'addStore' : 'updateStoreInfo'
      this.ajaxOption.companyAddressDetail = this.formInline[ 'address' ]
      let option = isAddBusinessPage ? this.ajaxOption : { ...this.ajaxOption, id: this.id, customerOwnership: ( this.businessDetail[ 'customerOwnership' ] || 0 ) }
      this.$http( API[ APIName ], option ).then( ( { data } ) => {
        this.$message( {
          message: data.msg,
          type: 'success'
        } )
        let businessDetail = isAddBusinessPage ? { detail: { ...option, id: ( data.data.id || '' ) } } : { detail: option, area: this.companyArea }
        this.$emit( 'change-dialog', businessDetail )
      }, ( { data } ) => {
        this.$message( {
          message: data.msg,
          type: 'warning'
        } )
      } )
    }
  }
  cancel() {
    this.$emit( 'change-dialog', 0 )
  }
}
</script>
<style lang="stylus" >
.business-detail-dialog
  .el-cascader
    width 300px
  .el-dialog--small
    width 80%
  .el-input-group__prepend
    border none
</style>
