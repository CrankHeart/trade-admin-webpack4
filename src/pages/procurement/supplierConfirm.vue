<template>
  <div id="supplier-confirm" style="width:850px;margin:0 auto;overflow:hidden;">
    <div class="header">
      <div class="title">首营企业审核表</div>
      <div class="date">填表日期: {{formatDate(detail.submitDate)||getNowTime()}}</div>
    </div>
    <table border="1" bordercolor="#333" style="border-collapse:collapse; width:100%;">
      <tr>
        <td width="120">单位编码</td>
        <td width="500" colspan="3">{{detail.id}}</td>
        <td with="120">邮政编码</td>
        <td>{{detail.zipCode}}</td>
      </tr>
      <tr>
        <td>企业名称</td>
        <td colspan="5">{{detail.supplierName}}</td>
      </tr>
      <tr>
        <td>注册地址</td>
        <td colspan="5">{{detail.companyAddress+ detail.companyDetail}}</td>
      </tr>

      <tr>
        <td>联系电话</td>
        <td class="noborder-top" width="150">{{detail.contactTel}}</td>
        <td with="100">负责人</td>
        <td class="noborder-top" with="120">{{detail.legalPerson}}</td>
        <td with="120">质量负责人</td>
        <td class="noborder-top">{{detail.quPerson}}</td>
      </tr>
      <tr>
        <td width="120">联系人</td>
        <td width="150">{{detail.contactName}}</td>
        <td with="100" colspan="2">联系人身份证号码</td>
        <td colspan="2" with="120"></td>
      </tr>
      <tr>
        <td width="120" class="noborder-top">联系人电话</td>
        <td colspan="3" width="150">{{detail.contactTel}}</td>
        <td with="100">注册资金</td>
        <td with="120">NA</td>
      </tr>
      <tr>
        <td width="120">许可证号</td>
        <td colspan="3" width="150">{{detail.licenseNum}}</td>
        <td with="100">有效期至</td>
        <td with="120">{{detail.licenseExpDate}}</td>
      </tr>
      <tr>
        <td width="120">营业执照号</td>
        <td colspan="3" width="150">{{detail.bizLicenseNum}}</td>
        <td with="100">有效期至</td>
        <td with="120">{{detail.bizLicenseExpDate}}</td>
      </tr>
      <tr>
        <td width="120">法人委托书</td>
        <td colspan="3" width="150">
          <template href v-if="processStatus<=1">
            <input-file-upload @change="singleFileUpload($event)">
              <el-button type="text">上传</el-button>
            </input-file-upload>
            {{firstFormInfo.legalAttorney.path!=''?'已上传':''}}
          </template>
          <template v-else>
            <a
              target="_blank"
              class="el-button el-button--primary el-button--mini"
              :href="firstFormInfo.legalAttorney.path"
            >下载</a>
          </template>
        </td>
        <td with="100">有效期至</td>
        <td with="120">
          <el-date-picker
            v-if="processStatus<=1"
            v-model="firstFormInfo.legalAttorney.date"
            type="date"
            placeholder="选择日期"
          ></el-date-picker>
          <span v-else>{{firstFormInfo.legalAttorney.date}}</span>
        </td>
      </tr>
      <tr>
        <td width="120">质保协议书</td>
        <td colspan="3" width="150">
          <template href v-if="processStatus<=1">
            <input-file-upload @change="singleFileUpload($event,'quProtocol')">
              <el-button type="text">上传</el-button>
            </input-file-upload>
            {{firstFormInfo.quProtocol.path!=''?'已上传':''}}
          </template>
          <template v-else>
            <a
              target="_blank"
              class="el-button el-button--primary el-button--mini"
              :href="firstFormInfo.quProtocol.path"
            >下载</a>
          </template>
        </td>
        <td with="100">有效期至</td>
        <td with="120">
          <el-date-picker
            v-if="processStatus<=1"
            v-model="firstFormInfo.quProtocol.date"
            type="date"
            placeholder="选择日期"
          ></el-date-picker>
          <span v-else>{{firstFormInfo.quProtocol.date}}</span>
        </td>
      </tr>
      <tr>
        <td width="120">类别</td>
        <td colspan="5" width="150" style="text-align:left;">
          <span v-if="detail.category==1">■器械生产企业 □器械经营企业</span>
          <span v-else>□器械生产企业 ■器械经营企业</span>
        </td>
      </tr>
      <tr>
        <td width="120" class="noborder-top">
          □生产范围
          <br />□经营范围
        </td>
        <td colspan="5" width="150" style="text-align:left;">{{detail.categoryDesc}}</td>
      </tr>
      <tr>
        <td width="120" class="noborder-top">
          业务部门
          <br />审核意见
        </td>
        <td colspan="5" class="noborder-top" width="150">
          <div class="confirm_area">
            <template v-if="processStatus==2">
              <div>
                <textarea v-model="type1.desc" rows="5" style="width:100%"></textarea>
              </div>
              <div>
                <el-date-picker v-model="type1.date" type="date" placeholder="选择日期"></el-date-picker>
                <span>审批人:{{type1.userName}}</span>
              </div>
            </template>
            <template v-else-if="processStatus>2">
              <div class="confirm_msg">{{type1.desc}}</div>
              <div class="confirm_footer">负责人:{{type1.userName}} {{type1.date}}</div>
            </template>
          </div>
        </td>
      </tr>
      <tr>
        <td width="120" class="noborder-top">
          质管部门
          <br />审核意见
        </td>
        <td colspan="5" class="noborder-top" width="150">
          <div class="confirm_area">
            <template v-if="processStatus==3">
              <div>
                <textarea v-model="type2.desc" rows="5" style="width:100%"></textarea>
              </div>
              <div>
                <el-date-picker v-model="type2.date" type="date" placeholder="选择日期"></el-date-picker>
                <span>审批人:{{type2.userName}}</span>
              </div>
            </template>
            <template v-else-if="processStatus>3">
              <div class="confirm_msg">{{type2.desc}}</div>
              <div class="confirm_footer">负责人:{{type2.userName}} {{type2.date}}</div>
            </template>
          </div>
        </td>
      </tr>
      <tr>
        <td width="120" class="noborder-top">
          总经理/质管
          <br />副总审批意见
          <br />审核意见
        </td>
        <td colspan="5" class="noborder-top" width="150">
          <div class="confirm_area">
            <template v-if="processStatus==4">
              <div>
                <el-radio-group v-model="type3.value">
                  <el-radio :label="1">同意作为合格供货方</el-radio>
                  <el-radio :label="0">不同意作为合格供货方</el-radio>
                </el-radio-group>
              </div>
              <div>
                <el-date-picker v-model="type3.date" type="date" placeholder="选择日期"></el-date-picker>
                <span>审批人:{{type3.userName}}</span>
              </div>
            </template>
            <template v-else-if="processStatus>4">
              <div class="confirm_area">
                <span v-if="type3.value==1">同意作为合格供货方</span>
                <span v-else>不同意作为合格供货方</span>
              </div>
              <div class="confirm_footer">负责人:{{type3.userName}} {{type3.date}}</div>
            </template>
          </div>
        </td>
      </tr>
    </table>
    <el-button type="primary" v-if="processStatus!=5" style="margin-top:15px;" @click="submit">提交审核</el-button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import inputFileUpload from '@/components/inputFileUpload.vue'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/index'

import { serviceStatus, serviceTypes } from './const/'
import { matchArrItem } from '../../utils/'
import { fail } from 'assert';
@Component( {
  name: 'supplier-confirm',
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    inputFileUpload
  }
} )
export default class supplierConfirm extends Vue {
  @Prop( { type: [ Number, String ] } )
  supplierId

  @Watch( 'supplierId' )
  watchSupplierId ( id ) {
    this.loadData()
  }

  type = 1 // 默认第一步
  processStatus = 1
  id = 0

  firstFormInfo = {
    legalAttorney: { date: '', path: '' },// 法人证书路径
    quProtocol: { date: '', path: '' }// 质保证书路径
  }

  getNowTime ( format = 'yyyy-MM-dd' ) {
    let timeStmp = new Date();
    return this.formatMyDate( timeStmp, format )
  }

  type1 = {
    desc: '',
    date: '',
    userName: '杨中林'
  }
  type2 = {
    desc: '',
    date: '',
    userName: '吴超'
  }
  type3 = {
    value: 1,
    date: '',
    userName: '李锋'
  }

  detail = {
  }

  formatDate ( date ) {
    let timeStmp = date && date.time
    return timeStmp && this.formatMyDate( timeStmp, 'yyyy-MM-dd' )
  }

  getSupplierInfoDetail ( id ) {
    this.$http( API.getSupplierInfoDetail, { id } ).then( ( { data } ) => {
      this.processStatus = data.data.processStatus
      this.detail = data.data
      if ( data.data.processBizInfo !== "" ) {
        this.type1 = JSON.parse( data.data.processBizInfo || '{desc:"",date:"",userName:""}' )
      } else {
        this.type1.date = this.getNowTime()
      }
      if ( data.data.processQuInfo !== "" ) {
        this.type2 = JSON.parse( data.data.processQuInfo || '{desc:"",date:"",userName:""}' )
      } else {
        this.type2.date = this.getNowTime()
      }
      if ( data.data.processCeoInfo !== "" ) {
        this.type3 = JSON.parse( data.data.processCeoInfo || '{value:"1",date:"",userName:""}' )
      } else {
        this.type3.date = this.getNowTime()

      }

      if ( data.data.legalAttorney !== "" ) {
        this.firstFormInfo.legalAttorney = JSON.parse( data.data.legalAttorney )
      } else {
        this.firstFormInfo.legalAttorney.date = this.getNowTime()
      }

      if ( data.data.quProtocol !== "" ) {
        this.firstFormInfo.quProtocol = JSON.parse( data.data.quProtocol )
      } else {
        this.firstFormInfo.quProtocol.date = this.getNowTime()
      }

    } )
  }

  created () {
    this.loadData()
  }

  loadData () {
    this.id = this.supplierId
    if ( !this.id ) {
      return
    }
    this.getSupplierInfoDetail( this.id )
  }

  @Inject() formatMyDate
  getParams () {
    //    processStatus //1：待提交，2：待业务部门审核，3：待质量部门审核，4：待总经理审核，5：审核通过'
    if ( this.processStatus == 4 ) {
      this.type3.date = this.formatMyDate( this.type3.date, 'yyyy-MM-dd' )
      // this.type3.userName = this.userName
      return {
        id: this.id,
        processCeoInfo: this.type3,
        processStatus: 5
      }
    } else if ( this.processStatus == 3 ) {
      this.type2.date = this.formatMyDate( this.type2.date, 'yyyy-MM-dd' )
      // this.type2.userName = this.userName
      return {
        id: this.id,
        processQuInfo: this.type2,
        processStatus: 4
      }
    } else if ( this.processStatus == 2 ) {
      this.type1.date = this.formatMyDate( this.type1.date, 'yyyy-MM-dd' )
      // this.type1.userName = this.userName
      return {
        id: this.id,
        processBizInfo: this.type1,
        processStatus: 3
      }
    } else { // 待提交状态 this.processStatus==1 ,上传后的两个图片路径
      this.firstFormInfo.legalAttorney.date = this.formatMyDate( this.firstFormInfo.legalAttorney.date, 'yyyy-MM-dd' )
      this.firstFormInfo.quProtocol.date = this.formatMyDate( this.firstFormInfo.quProtocol.date, 'yyyy-MM-dd' )
      return {
        id: this.id,
        legalAttorney: this.firstFormInfo.legalAttorney,// 法人委托书
        quProtocol: this.firstFormInfo.quProtocol,// 质保委托书
        processStatus: 2,
        submitDate: this.getNowTime( 'yyyy-MM-dd hh:mm:ss' )

      }
    }

  }
  show_msg ( desc ) {
    this.$message( {
      title: '错误',
      message: desc,
      type: 'error'
    } )
  }

  checkForm () {
    console.log( this.processStatus )
    // 首次要检验两个上传图片,还有两个日期
    if ( this.processStatus <= 1 ) {
      if ( this.firstFormInfo.legalAttorney.path == "" ) {
        this.show_msg( '请上传法人委托书' );
        return false;
      }
      if ( this.firstFormInfo.quProtocol.path == "" ) {
        this.show_msg( '请上传质保协议书' );
        return false;
      }
      if ( this.firstFormInfo.legalAttorney.date == "" ) {
        this.show_msg( '法人委托书有效期时间尚未选择' );
        return false;
      }
      if ( this.firstFormInfo.quProtocol.date == "" ) {
        this.show_msg( '质保协议书有效期时间尚未选择' );
        return false;
      }
    } else if ( this.processStatus == 2 ) {
      if ( this[ 'type1' ].desc == "" ) {
        this.show_msg( '请填写审批内容' );
        return false;
      }
      if ( this[ 'type1' ].date == "" ) {
        this.show_msg( '请选择审批日期' );
        return false;
      }
    } else if ( this.processStatus == 3 ) {
      if ( this[ 'type2' ].desc == "" ) {
        this.show_msg( '请填写审批内容' );
        return false;
      }
      if ( this[ 'type2' ].date == "" ) {
        this.show_msg( '请选择审批日期' );
        return false;
      }
    } else if ( this.processStatus == 4 ) {
      if ( this[ 'type3' ].date == "" ) {
        this.show_msg( '请选择审批日期' );
        return false;
      }
    }
    // 第2-4步要检测 批审内容/日期不能为空
    return true;
  }
  submit () {
    //
    if ( !this.checkForm() ) {
      return
    }
    return this.$http( API.saveSupplierInfo, { ...this.getParams(), broadcast: true } ).then( res => {
      this.$emit( 'submit', res )
    } )
  }

  validateImg ( file ) {
    let isValidate = true
    const fileType = ( ( file.name || '' ).split( '.' ).slice( -1 )[ 0 ] || '' ).toLowerCase()
    const fileSize = file.size
    const maxSize = 400 * 1024

    if ( !( /(bmp|jp(e?)g|png|gif|svg)/.test( fileType ) ) ) {
      this.$message( {
        type: 'error',
        message: "上传图片格式错误！"
      } )
      isValidate = false
    }
    return isValidate
  }

  singleFileUpload ( e, type = 'legalAttorney' ) {
    let file = e.target.files[ 0 ]
    if ( !this.validateImg( file ) ) {
      return
    }
    const formData = new FormData()
    formData.append( "id", this.id + '' )
    formData.append( "imgPath[0]", file )
    let url = type == 'legalAttorney' ? API.uploadLegalAttorney : API.uploadQualityProtocol
    this.$http( url, formData, {
      headers: {
        'Content-type': 'multipart/form-data'
      }
    } ).then( ( { data } ) => {
      const { absolutePath, relativePath } = data
      if ( type == 'legalAttorney' ) {
        this.firstFormInfo.legalAttorney.path = absolutePath
      } else {
        this.firstFormInfo.quProtocol.path = absolutePath
      }
      this.$notify( {
        type: 'success',
        message: '上传成功！'
      } )
    }, () => {
      this.$notify( {
        type: 'error',
        message: '上传错误！'
      } )
    } )

  }
}
</script>
<style  scoped>
#supplier-confirm table tr td {
  text-align: center;
  padding: 15px;
}
#supplier-confirm .header {
  text-align: center;
  font-size: 16px;
  margin: 15px auto;
}
#supplier-confirm .header .date {
  text-align: right;
}
.noborder-top {
  border-top: none;
}
.text-left {
  text-align: left;
}
.confirm_area {
  position: relative;
  text-align: left;
  height: 150px;
  min-height: 100px;
}
.confirm_footer {
  position: absolute;
  bottom: 0px;
  right: 0px;
}
</style>
