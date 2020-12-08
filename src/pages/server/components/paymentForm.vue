<template>
  <div>
    <el-form class="el-row" :model="formInline" label-width="100px" ref="business-detail-form">
      <el-col :span="12" :lg="12" :md="12" :sm="12" :xs="12" v-for="(item, i) in itemList" :key="i">
        <el-form-item :label="item.label">
          <el-date-picker
            v-if="item.type == 'datetimerange'"
            v-model="formInline[item.prop]"
            type="datetime"
            placeholder="选择日期时间"
            :disabled="
            isCheck ||
              item.disabled ||
              (voucherStatus !== 0 && voucherStatus !== 2)
          "
          ></el-date-picker>
          <el-select
            v-else-if="item.type == 'select'"
            v-model="formInline[item.prop]"
            :disabled="
            isCheck ||
              item.disabled ||
              (voucherStatus !== 0 && voucherStatus !== 2) ||
              (item.prop == 'lcBank' && formInline.paymentType === '')
          "
          >
            <el-option
              v-for="list in item.options"
              :key="list.id"
              :label="list.name"
              :value="list.id"
            ></el-option>
          </el-select>
          <el-input
            v-else-if="item.prop == 'officeName'"
            v-model="formInline['officeName']"
            :type="item.type"
            :disabled="
            isCheck ||
              item.disabled ||
              (voucherStatus !== 0 && voucherStatus !== 2) ||
              !!officeName
          "
            :placeholder="item.placeholder"
          ></el-input>
          <template v-else-if="item.prop == 'payee'">
            <salesLeaders v-model="formInline['payee']"></salesLeaders>
          </template>
          <el-input
            v-else
            v-model="formInline[item.prop]"
            :type="item.type"
            :disabled="
            isCheck ||
              item.disabled ||
              (voucherStatus !== 0 &&
                voucherStatus !== 2 &&
                item.prop !== 'lcTradeSn') ||
              (item.prop == 'lcTradeSn' && voucherStatus > 2)
          "
            :placeholder="item.placeholder"
          ></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="'付款凭证上传'">
          <template v-if="!isCheck && (voucherStatus == 0 || voucherStatus == 2)">
            <input-file-upload @change="singleFileUpload($event)" v-if="uploadImgList.length < 3">
              <el-button type="text" class="upload-img">上传</el-button>
            </input-file-upload>
            <span class="img-tip" v-else>凭证最多上传3张</span>
          </template>
          <div class="voucher-img-list">
            <div v-for="(uploadImg, index) in uploadImgList" :key="uploadImg.absolutePath">
              <template v-if="uploadImgList">
                <img :src="uploadImg.absolutePath" width="80" />
                <div class="check-img" @click="viewImg = uploadImg.absolutePath">查看</div>
                <i
                  class="el-icon-close"
                  @click="deleteImg(uploadImg, index)"
                  v-if="
                  !isCheck &&
                    (voucherStatus == 0 || voucherStatus == 2) &&
                    !uploadImg.imgSource &&
                    $permissionValidate([1045, 1067, 1056, 1062])
                "
                ></i>
              </template>
            </div>
          </div>
        </el-form-item>
      </el-col>
    </el-form>
    <div class="view-mask" v-if="viewImg" @click="viewImg=''">
      <div class="img">
        <img :src="viewImg" />
        <i class="el-icon-close"></i>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/API";
import {
  paymentTypes,
  lcBanks,
  lcAllipays,
  lcWechats,
  lcFinAdjust
} from "@/pages/server/const/paymentVoucherConst.ts";
import inputFileUpload from "@/components/inputFileUpload.vue";
import salesLeaders from "@/components/salesLeaders.vue";

const formInline = {
  voucherSn: "",
  officeName: "",
  amount: null,
  tradeSn: "",
  remark: "",
  tenantId: "",
  officeId: "",
  payee: "",
  payer: "",
  lcBank: "",
  lcTradeSn: "",
  actualPayDate: "",
  paymentType: "",
  reviewRemark: "",
  writeOffRemark: ""
};
export default {
  components: {
    inputFileUpload,
    salesLeaders
  },
  props: {
    isCheck: {
      type: Boolean,
      default: true
    },
    voucherStatus: {
      type: Number
    },
    customerInfo: {
      type: Object
    }
  },
  watch: {
    customerInfo: {
      handler( newName, oldName ) {
        this.initForm();
      },
      deep: true
    },
    formInline: {
      handler( newValue, oldValue ) {
        this.$emit( 'formchange', newValue )
      },
      deep: true
    }
  },
  data() {
    return {
      viewImg: '',
      uploadImgList: [],
      formInline: { ...formInline },
      reviewItemList: [
        {
          prop: "lcTradeSn",
          label: "商家流水号",
          type: "text",
          placeholder: "请输入商家流水号",
          disabled: false
        },
        {
          prop: "reviewRemark",
          label: "审批备注",
          type: "textarea",
          placeholder: "请输入审批备注",
          disabled: false
        },
        {
          prop: "writeOffRemark",
          label: "核销备注",
          type: "textarea",
          placeholder: "请输入核销备注",
          disabled: false
        }
      ]
    };
  },
  computed: {
    lcBanks() {
      const { paymentType } = this.formInline
      switch ( +paymentType ) {
        case 1:
          Object.assign( this.formInline, { lcBank: '' } )
          return lcBanks
        case 2:
          Object.assign( this.formInline, { lcBank: '' } )
          return lcAllipays
        case 3:
          Object.assign( this.formInline, { lcBank: '' } )
          return lcWechats
        case 4:
          Object.assign( this.formInline, { lcBank: '' } )
          return lcFinAdjust
        default:
          Object.assign( this.formInline, { lcBank: -1 } )
          return [ { id: -1, name: '未分配' } ]
      }
    },
    is3rdParty () {
      return this.$store.getters['stores/is3rdParty']
    },
    itemList() {
      const list = [
        {
          prop: "amount",
          label: "凭证金额",
          type: "text",
          placeholder: "请输入金额",
          disabled: false
        },
        {
          prop: "payer",
          label: "付款人",
          type: "text",
          placeholder: "请输入付款人",
          disabled: false
        },
        {
          prop: "paymentType",
          label: "交易渠道",
          type: "select",
          disabled: false,
          options: paymentTypes
        },
        {
          prop: "lcBank",
          label: "收款账号",
          type: "select",
          disabled: false,
          options: this.lcBanks
        },
        {
          prop: "tradeSn",
          label: "交易流水",
          type: "text",
          placeholder: "请输入交易流水号",
          disabled: false
        },
        {
          prop: "payee",
          label: "销售负责人",
          type: "text",
          placeholder: "请输入销售负责人",
          disabled: false
        },
        {
          prop: "actualPayDate",
          label: "实际付款时间",
          type: "datetimerange",
          placeholder: "请选择付款时间",
          disabled: false
        },
        {
          prop: "remark",
          label: "备注",
          type: "textarea",
          placeholder: "请输入备注信息",
          disabled: false
        }
      ]
      // 自营方表单
      if (!this.is3rdParty) {
        return list
      }
      // 第三方，不显示收款账号 & 销售负责人
      list.splice(3, 1)
      list.splice(4, 1)
      return list

    },
  },
  methods: {
    getFormInfo() {
      let formInfo = Object.assign( {}, this.formInline, {
        uploadImgList: this.uploadImgList
      } );
      return formInfo;
    },
    async initForm() {
      let data = await this.$http( API.getPaymentVoucherSn, { financialType: 1 } );
      let voucherSn = data.data.data
      this.uploadImgList = [];
      this.formInline = { ...formInline, voucherSn };
    },
    validateImg( file ) {
      let isValidate = true;
      const fileType = (
        ( file.name || "" ).split( "." ).slice( -1 )[ 0 ] || ""
      ).toLowerCase();
      const fileSize = file.size;
      const maxSize = 200 * 1024;

      if ( !/(bmp|jp(e?)g|png|gif|svg)/.test( fileType ) ) {
        this.$message( {
          type: "error",
          message: "上传图片格式错误！"
        } );
        isValidate = false;
      }
      if ( fileSize > maxSize ) {
        this.$message( {
          type: "error",
          message: "上传图片大小不能大于200kb！"
        } );
        isValidate = false;
      }
      return isValidate;
    },
    singleFileUpload( e ) {
      let file = e.target.files[ 0 ];
      if ( !this.validateImg( file ) ) {
        return;
      }
      // const absolutePath = item.absolutePath
      const formData = new FormData();
      formData.append( "voucherSn", this.formInline.voucherSn );
      formData.append( "imgPath[0]", file );

      this.$http( API.paymentVoucherUploadImg, formData, {
        headers: {
          "Content-type": "multipart/form-data"
        }
      } ).then(
        ( { data } ) => {
          const { absolutePath, relativePath } = data;
          this.uploadImgList.push( { absolutePath, relativePath } );

          this.$notify( {
            type: "success",
            message: "上传成功！"
          } );
        },
        () => {
          this.$notify( {
            type: "error",
            message: "上传错误！"
          } );
        }
      );
    },
    deleteImg( uploadImg, index ) {
      this.$confirm( '是否确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        closeOnClickModal: false
      } ).then( () => {
        this.uploadImgList.splice( index, 1 )
        let imgUrl = uploadImg.imgUrl || uploadImg.relativePath
        this.$http( API.deletePaymentVoucherImage, { imgUrl } ).then( res => {
          this.$notify( {
            type: 'success',
            message: '删除成功！'
          } )
        }, rej => {
          this.$notify( {
            type: 'warning',
            message: '删除失败,请重试！'
          } )

        } )
      } )
    }
  },
  created() {
    this.initForm();
  }
};
</script>

<style lang="stylus" scoped>
.upload-img
  cursor pointer
.voucher-img-list
  display flex
  div
    border 1px solid #eee
    margin-left 20px
    position relative
    .check-img
      position absolute
      top 0
      left -20px
      width 80px
      height 80px
      background rgba(0, 0, 0, 0.3)
      color #fff
      text-align center
      line-height 80px
      cursor pointer
      display none
    &:hover
      .check-img
        display block
    img
      width 80px
      height 80px
    i
      width 18px
      height 18px
      text-align center
      line-height 18px
      top -9px
      right -9px
      position absolute
      display block
      background rgba(32, 160, 255, 0.5)
      color #fff
      border-radius 50%
      &:hover
        background rgb(32, 160, 255)
.button-box
  margin 20px 30px
.view-mask
  position fixed
  left 0
  top 0
  right 0
  bottom 0
  z-index 999
  background rgba(0, 0, 0, 0.3)
  .img
    min-width 200px
    min-height 200px
    max-width 400px
    background rgba(0, 0, 0, 0.3)
    box-shadow 0 0 20px rgba(0, 0, 0, 0.8)
    position absolute
    top 50%
    left 50%
    transform translate3d(-50%, -50%, 0)
    i
      width 25px
      height 25px
      text-align center
      line-height 25px
      top -9px
      right -9px
      position absolute
      display block
      background rgba(32, 160, 255, 0.5)
      color #fff
      border-radius 50%
      &:hover
        background rgb(32, 160, 255)
    img
      width 100%
      height 100%
.img-tip
  color red
</style>
