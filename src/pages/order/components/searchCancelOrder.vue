<template>
  <el-dialog title="确认取消订单" class="cancel-prompt" v-model="cancelPromptVisible" size="small">
    <p>
      <i class="el-icon-warning"></i>
      <span>该订单与{{cancelPromptMsg.count}}个订单在同一支付单下, 取消该订单会同时取消其它级联订单，是否取消当前订单?</span>
    </p>
    <p>
      <el-input
        type="textarea"
        v-model.trim="cancelPromptMsg.operationNote"
        placeholder="请输入取消订单的理由(必填)"
        :disabled="loading"
      ></el-input>
    </p>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closePromptCancel">取 消</el-button>
      <el-button type="primary" :loading="loading" @click="cancelPromptConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Vue, Component, Inject, Prop, Watch } from 'vue-property-decorator'
import API from '../../../API'
@Component( {
  name: 'seach-order-cancel',
} )
export default class SearchCancelOrder extends Vue {
  @Inject() app
  @Prop() order: any
  cancelPromptMsg: any = {}

  loading: boolean = false
  cancelPromptVisible: boolean = true

  @Watch( 'cancelPromptVisible' )
  visibleWatcher ( v ) {
    this.closePromptCancel()
  }
  created () {
    this.getOrderMsg()
  }

  getOrderMsg () {
    let item = this.order
    this.$http( API.getOrderStatusReminder, {
      paymentId: item.paymentId,
      orderStatus: item.orderStatus
    } ).then( ( { data } ) => {
      this.cancelPromptMsg = {
        item: item,
        count: data.leftNum,
        operationNote: ''
      }
      this.cancelPromptVisible = true
    } ).catch( () => {
      this.$message( {
        type: 'info',
        message: '已取消操作'
      } );
    } );
  }
  closePromptCancel () {
    this.$emit( 'visible-change', false, 'orderCancel' )
  }

  cancelPromptConfirm () {
    // this.cancelPromptMsg.operationNote = this.cancelPromptMsg.operationNote.trim()
    const { operationNote } = this.cancelPromptMsg;
    if ( !operationNote ) {
      return this.$notify( {
        type: 'error',
        message: '订单取消理由不能为空!'
      } )
    }

    if ( operationNote.length > 100 ) {
      return this.$notify( {
        type: 'error',
        message: '订单取消理由不能超过100字!'
      } )
    }

    this.loading = true;

    this.cancelPromptMsg.item.operationNote = operationNote
    //  this.closePromptCancel()
    // this.$emit( 'cancel-order', this.cancelPromptMsg.item )

    this.cancelOrder( this.cancelPromptMsg.item );

  }

  closeDialog () {
    this.cancelPromptVisible = false;
    console.log( "closeDialog", this.cancelPromptVisible );
  }

  async cancelOrder ( item ) {
    let { orderStatus, sn, id, operationNote, shoppingType } = item
    orderStatus = 6;

    const reqParams = {
      sn, id, operationNote, orderStatus, shoppingType
    }

    try {
      let res = await this.$http( API.updateOrderStatus, reqParams )
      // res:{data: {…}, status: 200, statusText: "", headers: {…}, config: {…}, …}
      // data: {msg: "更新成功", code: "A0000", updateStatus: 1}
      let { data } = res;
      const { code, msg } = data;
      if ( code == "A0000" ) {
        this.$message( {
          type: 'success',
          message: '取消当前订单成功!'
        } )
        // 关闭弹窗
        this.closeDialog();
        // this.$emit( 'cancel-order', this.cancelPromptMsg.item )
        // 刷新顶层组件的所有数据
        this.app.refreshOrder();
      } else {
        this.$notify( {
          type: 'error',
          message: msg
        } )
      }
    } catch ( error ) {
      // error: {data: {msg: "更新失败", code: "A0001"}}
      let { msg } = error.data;
      // console.log( "error", error );
      this.$notify( { type: 'error', message: msg } )
    } finally {
      console.log( "finally" );
      this.loading = false;
    }
    // this.$emit( 'cancel-order', this.cancelPromptMsg.item )
  }

}
</script>
<style lang="stylus">
.el-dialog__body
  p
    margin-bottom 10px
</style>


