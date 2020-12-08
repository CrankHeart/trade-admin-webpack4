import Vue from 'vue'
import { Component } from 'vue-property-decorator'

export default {
  data() {
    return {
      permissionEditInvoiceBtn: '',
      permissionReCreateInvoiceBtn: '',
      permissionReverseEInvoiceBtn: '',
      permissionRemakeEInvoiceBtn: ''
    }
  },
  created() {
    let path = this.$route.path
    if ( path.includes('/server/statementDetai') ) { // 对账单详情页
      this.permissionEditInvoiceBtn = 1089 
      this.permissionReCreateInvoiceBtn = 1090
      this.permissionReverseEInvoiceBtn = 1121
      this.permissionRemakeEInvoiceBtn = 1120
    } else if ( path.includes('/order/detail') ) {
      this.permissionEditInvoiceBtn = 1091
      this.permissionReCreateInvoiceBtn = 1092
      this.permissionReverseEInvoiceBtn = 1118
      this.permissionRemakeEInvoiceBtn = 1119
    }
  },
}



// import Vue from 'vue'
// import { Component } from 'vue-property-decorator'

// @Component({

// })
// export default class ServerOrderInvoice extends Vue {
//   editInvoice: number = 0
// }






