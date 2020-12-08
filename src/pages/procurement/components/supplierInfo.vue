<template>
  <div class="supplier-info-container">
    <el-form
      :model="supplierBasicInfoForm"
      :rules="rules"
      ref="supplierBasicInfoForm"
      size="mini"
      label-width="135px"
      class="supplier-info"
      :key="formKey"
    >
      <el-card header="基本信息">
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="供应商名称" prop="supplierName">
            <el-input v-model.trim="supplierBasicInfoForm.supplierName" placeholder="请输入供应商名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="采购负责人" prop="personInCharge">
            <el-select placeholder="请选择采购负责人" v-model="supplierBasicInfoForm.personInCharge">
              <el-option
                v-for="val in personInCharge"
                :key="val.id"
                :value="val.name"
                :label="val.name"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="供应商联系人" prop="contactName">
            <el-input v-model="supplierBasicInfoForm.contactName" placeholder="请输入供应商联系人"></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="供应商联系人手机" prop="contactTel">
            <el-input v-model="supplierBasicInfoForm.contactTel" placeholder="请输入供应商联系人手机"></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="供应商公司电话" prop="companyMobile">
            <el-input v-model="supplierBasicInfoForm.companyMobile" placeholder="请输入供应商公司电话"></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="是否启用" prop="supplierEnable">
            <el-radio-group v-model="supplierBasicInfoForm.supplierEnable" style="margin-top: 8px;">
              <el-radio
                v-for="enable in supplierEnables"
                :key="enable.id"
                :label="enable.id"
              >{{enable.name}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :lg="16" :md="16" :sm="24">
          <el-form-item label="供应商详细地址" prop="companyDetail">
            <template v-if="!isUpdateAddress && id || step == 3">
              <span>{{supplierBasicInfoForm.companyAddress+supplierBasicInfoForm.companyDetail}}</span>
              <el-button type="primary" size="small" @click="updateAddress">编辑</el-button>
            </template>
            <template v-else>
              <el-cascader
                :options="cascaderAddress"
                placeholder="请选择退货地址"
                v-model="companyArea"
                @active-item-change="handleItemChange"
                @change="handleAreaChange"
                :disabled="!cascaderAddress.length"
              ></el-cascader>
              <!-- <el-cascader :options="allAddress" placeholder="请选择退货地址" v-model="companyArea" @change="handleAreaChange" :disabled="!allAddress.length"></el-cascader> -->
              <el-input v-model="supplierBasicInfoForm.companyDetail" placeholder="请输入详细退货地址"></el-input>
            </template>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="邮政编码" prop="zipCode">
            <el-input v-model="supplierBasicInfoForm.zipCode" placeholder="请输入邮政编码"></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="法定代表人" prop="legalPerson">
            <el-input v-model="supplierBasicInfoForm.legalPerson" placeholder="请输入法定代表人"></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="质量负责人" prop="quPerson">
            <el-input v-model="supplierBasicInfoForm.quPerson" placeholder="请输入质量负责人"></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="12">
          <el-form-item label="企业类别" prop="category">
            <el-select v-model="supplierBasicInfoForm.category">
              <el-option
                v-for="item in supplierCategoryTypes"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :lg="12" :md="12" :sm="12">
          <el-form-item label="生产/经营范围" prop="categoryDesc">
            <el-input type="textarea" v-model="supplierBasicInfoForm.categoryDesc"></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="12">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="supplierBasicInfoForm.remark"></el-input>
          </el-form-item>
        </el-col>
      </el-card>
      <el-card header="结算信息">
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="开户行" prop="bankName">
            <el-input v-model="supplierBasicInfoForm.bankName" placeholder="请输入开户行"></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="银行账号" prop="settlementAccounts">
            <el-input v-model="supplierBasicInfoForm.settlementAccounts" placeholder="请输入银行账号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="税点" prop="taxPoint">
            <el-input v-model.number="supplierBasicInfoForm.taxPoint" placeholder="请输入税点"></el-input>%
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="结算方式" prop="settlementMethod">
            <!-- <el-input v-model="supplierBasicInfoForm.settlementMethod" placeholder="请输入银行账号"></el-input> -->
            <el-select v-model="supplierBasicInfoForm.settlementMethod">
              <el-option
                v-for="item in settlementMethods"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item
            label="账期"
            prop="accountPeriod"
            :show-message="supplierBasicInfoForm.settlementMethod == 1"
          >
            <el-input
              :disabled="supplierBasicInfoForm.settlementMethod !== 1"
              v-model.number="supplierBasicInfoForm.accountPeriod"
              placeholder="请输入账期"
            ></el-input>
            <span style="width:80px">个月账期</span>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item
            label="结算日"
            prop="settlementDay"
            :show-message="supplierBasicInfoForm.settlementMethod == 1"
          >
            <span style="width:40px">当月</span>
            <el-input
              :disabled="supplierBasicInfoForm.settlementMethod !== 1"
              min="1"
              max="31"
              v-model.number="supplierBasicInfoForm.settlementDay"
              placeholder="请输入结算日"
            ></el-input>
            <span style="width:60px">日结账</span>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="发票类型" prop="invoiceType">
            <el-select v-model="supplierBasicInfoForm.invoiceType">
              <el-option
                v-for="item in invoiceTypes"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-card>
      <el-card header="标签">
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="运费" prop="freeShipping">
            <el-input type="text" v-model="supplierBasicInfoForm.freeShipping" placeholder="请输入运费"></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="开票习惯" prop="invoiceHabit">
            <el-input
              type="text"
              v-model="supplierBasicInfoForm.invoiceHabit"
              placeholder="请输入开票习惯"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="起订量" prop="minimumQuantity">
            <el-input
              type="text"
              v-model="supplierBasicInfoForm.minimumQuantity"
              placeholder="请输入起订量"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="8" :sm="24">
          <el-form-item label="优惠政策" prop="preferentialPolicy">
            <el-input
              type="text"
              v-model="supplierBasicInfoForm.preferentialPolicy"
              placeholder="请输入优惠政策"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-card>

      <el-col :lg="24" :md="24" :sm="24">
        <el-form-item>
          <el-button
            v-if="!id && step == 1 "
            class="pull-right"
            type="primary"
            @click="saveSupplierInfo()"
          >保存并至下一步</el-button>
          <el-button v-if="id" class="pull-right" type="primary" @click="hasChange()">保存</el-button>
          <el-button v-if="id" class="pull-right" @click="cancel()">取消</el-button>
        </el-form-item>
      </el-col>
    </el-form>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch, Prop } from 'vue-property-decorator'
import { Getter, State, Mutation, Action } from 'vuex-class'
import API from '../../../API'
import { settlementMethods, invoiceTypes, supplierEnables, supplierCategoryTypes } from '../const'

@Component( {
  name: 'supplier-info',
  components: {
  }
} )
export default class supplierInfo extends Vue {
  @Action( 'supplier/getPersonIncharge' ) getPersonIncharge
  @State( state => state.supplier.personInCharge ) personInCharge
  @State( state => state.address.cascaderAddress ) cascaderAddress
  @Action( 'address/getAddress' ) getAddress
  @Getter( 'address/allAddress' ) allAddress
  @Mutation( "address/setTheCity" ) setTheCity
  @Mutation( "address/setTheArea" ) setTheArea
  @Mutation( "supplier/setShouldInit" ) setShouldInit
  @Mutation( 'supplier/setSupplierDetail' ) setSupplierDetail
  get id () {
    return this.$route.params.id
  }
  @Prop() supplierId2: number
  @Prop() step: number
  formKey: any = 1

  settlementMethods: any[] = settlementMethods
  invoiceTypes: any[] = invoiceTypes
  supplierCategoryTypes: any[] = supplierCategoryTypes
  supplierEnables: any[] = supplierEnables

  supplierBasicInfoForm: any = {
    supplierName: '',
    personInCharge: '',
    bankName: "",
    companyAddress: "",
    companyDetail: "",
    companyMobile: "",
    contactName: "",
    contactTel: "",
    remark: "",
    settlementAccounts: "",
    settlementMethod: "", // 结算方式
    accountPeriod: "", // 账期
    settlementDay: "", // 结算日
    invoiceType: "", // 发票类型
    taxPoint: "", // 税点
    freeShipping: "", // 运费
    invoiceHabit: "", //  开票习惯
    minimumQuantity: "", //  起订量
    preferentialPolicy: "", //  优惠政策
    supplierEnable: "", // 是否启用,
    zipCode: "",
    legalPerson: "",
    quPerson: "",
    category: 1,
    categoryDesc: ""
  }

  supplierBasicInfoForm2: any = {}
  isUpdateAddress: boolean = false
  updateAddress () {
    this.isUpdateAddress = true
    this.supplierBasicInfoForm.companyAddress = ''
    this.supplierBasicInfoForm.companyDetail = ''
  }
  getSupplierInfoDetail ( id ) {
    this.$http( API.getSupplierInfoDetail, { id } ).then( ( { data } ) => {
      if ( data.data.settlementMethod === 0 ) {
        data.data.accountPeriod = ''
        data.data.settlementDay = ''
      }

      this.supplierBasicInfoForm = { ...this.supplierBasicInfoForm, ...data.data }
      this.supplierBasicInfoForm2 = { ...this.supplierBasicInfoForm }
    } )
  }
  supplierId: any = ''
  created () {
    this.getAddress()
    this.getPersonIncharge()
    if ( this.supplierId2 && this.step == 3 ) {
      this.getSupplierInfoDetail( this.supplierId2 )
    }
  }
  deactivated () {
    this.formKey = Math.random()
    Object.keys( this.supplierBasicInfoForm ).forEach( item => {
      this.supplierBasicInfoForm[ item ] = ''
    } )
  }
  activated () {
    if ( this.id ) {
      this.getSupplierInfoDetail( this.id )
    }
  }

  companyArea: any = []
  handleAreaChange ( val ) {
    this.companyArea = val
    let companyAddress = ''
    let array = this.allAddress
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
    this.supplierBasicInfoForm.companyAddress = companyAddress
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






  companyMobileValidator ( rule, value, callback ) {
    if ( !value ) {
      callback( new Error( '请输入电话' ) )
    } else if ( !( /^\d{3,5}-\d{6,8}$|^\(\d{3,5}\)-\d{6,8}$|^\d{6,8}$|^1[34578]\d{9}$/ ).test( value ) ) {
      callback( new Error( '请根据格式书写号码,例如:021-34567890' ) )
    } else {
      callback()
    }
  }

  rules = {
    supplierName: [
      { required: true, message: '请输入供应商名称', trigger: 'blur' },
    ],
    personInCharge: [
      { required: true, message: '请选择采购负责人', trigger: 'change' }
    ],
    contactName: [
      { required: true, message: '请输入供应商联系人', trigger: 'blur' }
    ],
    contactTel: [
      { required: true, message: '请输入供应商联系人手机', trigger: 'blur' }
    ],
    bankName: [
      { required: true, message: '请输入开户行', trigger: 'blur' }
    ],
    settlementAccounts: [
      { required: true, message: '请输入银行账号', trigger: 'blur' }
    ],
    companyMobile: [
      { required: true, message: '请输入公司电话', trigger: 'blur' },
      { validator: this.companyMobileValidator }
    ],
    // effectiveDate: [
    //   { required: true, type: 'array', message: '请选择日期', trigger: 'blur' },
    //   { validator: this.effectiveDateValidator }
    // ],
    companyDetail: [
      { required: true, message: '请输入详细退货地址', trigger: 'blur' }
    ],
    settlementMethod: [
      { required: true, message: '请选择结算方式', type: 'number', trigger: 'change' }
    ],
    accountPeriod: [
      { validator: this.validateAccountPeriod, trigger: 'blur' }
    ],
    settlementDay: [
      { validator: this.validateSettlementDay, trigger: 'blur' }
    ],
    invoiceType: [
      { required: true, message: '请选择发票类型', type: 'number', trigger: 'change' }
    ],
    taxPoint: [
      { required: true, type: "number", message: '税点需为数字值', trigger: 'change' },
      { validator: this.validateTaxPoint, trigger: 'blur' }
    ],
    supplierEnable: [
      { required: true, type: "number", message: '请选择是否启用', trigger: 'change' },
    ],
    zipCode: [
      { required: true, message: '请输入邮政编码', trigger: 'blur' }
    ],
    legalPerson: [
      { required: true, message: '请输入法定代表人', trigger: 'blur' }
    ],
    quPerson: [
      { required: true, message: '请输入质量负责人', trigger: 'blur' }
    ],
    categoryDesc: [
      { required: true, message: '请输入生产/经营范围', trigger: 'blur' }
    ]
  }

  validateAccountPeriod ( rule, value, callback ) {
    if ( this.supplierBasicInfoForm.settlementMethod === 1 ) {
      if ( value && +value >= 1 ) {
        callback()
      } else {
        callback( new Error( '请输入合规的账期数字' ) )
      }
    } else {
      callback()
    }
  }

  validateSettlementDay ( rule, value, callback ) {
    if ( this.supplierBasicInfoForm.settlementMethod === 1 ) {
      if ( value.toString().length === 0 ) {
        callback( new Error( '请输入结算日期' ) )
      } else if ( +value < 1 || +value > 31 ) {
        callback( new Error( '请输入正确的日期数字' ) )
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

  validateTaxPoint ( rule, value, callback ) {
    if ( value >= 0 && value < 100 ) {
      callback()
    } else {
      callback( '请输入0到100之间的数字' )
    }
  }

  validateSupplierInfo () {
    let ref: any = this.$refs[ 'supplierBasicInfoForm' ]
    let flag = false
    ref.validate( ( valid ) => {
      flag = valid
      // if ( !valid ) {
      //   flag = true
      //   return false
      // }
    } )
    // if ( flag ) { return false }
    // if ( !this.supplierBasicInfoForm.agreement ) {
    //   this.$notify( {
    //     type: "warning",
    //     message: "请上传经销协议"
    //   } )
    //   return false
    // }
    return flag
  }

  cancel () {
    this.$router.back()
  }

  hasChange () {
    let array = Object.keys( this.supplierBasicInfoForm )
    let form1 = this.supplierBasicInfoForm
    let form2 = this.supplierBasicInfoForm2
    if ( this.id || this.step == 3 ) {
      let isChanged = array.some( item => {
        return form2[ item ] !== form1[ item ]
      } )
      if ( !!isChanged == true ) {
        return this.saveSupplierInfo( true )
      } else if ( !isChanged && !!this.id ) {
        this.$router.push( `/procurement/supplierDetail/${this.id}` )
      } else { }
    }
  }

  @Inject() formatMyDate
  saveSupplierInfo ( boolean = false ) {
    if ( !this.validateSupplierInfo() ) return Promise.reject( false ).catch( err => err )
    let params = this.supplierBasicInfoForm
    params.supplierName = params.supplierName.trim()
    return this.$http( API.saveSupplierInfo, { ...params, broadcast: true } ).then( res => {
      this.setShouldInit( true )
      this.supplierId = res.data.data
      if ( !!this.id ) { // 编辑
        this.$router.push( `/procurement/supplierDetail/${this.id}` )
      } else if ( !this.id && !boolean ) { // 新增 第一步
        // this.uploadAgreement( this.supplierId ).then( () => {
        //   this.$emit( "change-step", { supplierId: this.supplierId.toString(), step: 2 } )
        // } )
        this.$emit( "change-step", { supplierId: this.supplierId.toString(), step: 2 } )
        // 新该规则, 新增后,调到
      } else {
        // this.$emit( "change-step", { supplierId: this.supplierId.toString(), step: 2 } )
      }
    } )
  }
}
</script>
<style lang="stylus">
.supplier-info-container
  .supplier-info
    &:after
      content ''
      clear both
      display block
    .el-cascader
      width 300px
    .el-form-item__content
      display flex
    .el-upload__tip
      margin-left 10px
    .supplier-upload
      margin-left 10px
    .uploadFile
      label
        &:before
          content '*'
          color #ff4949
          margin-right 4px
      .upload-container
        .upload-input
          position relative
          margin-top 5px
          input
            position absolute
            top 0
            left 0
            z-index 10
            width 90px
            height 25x
            border 1px solid red
            opacity 0
        .upload-mask
          z-index 1
          width 90px
          height 25px
          line-height 25px
          cursor pointer
          text-align center
          background-color #20a0ff
          color #ffffff
        .uploadFile-name
          width 200px
          position absolute
          top 0px
          left 105px
          overflow hidden
          text-overflow ellipsis
          white-space nowrap
  .el-card
    margin-bottom 20px
</style>
