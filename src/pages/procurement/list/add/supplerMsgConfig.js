import settlementMethodConfig from './options/settlementMethodConfig'
import invoiceTypeConfig from './options/invoiceTypeConfig'
export default {
  fields: [ {
    name: "结算方式",
    key: "settlementMethod",
    editor: "select",
    config: settlementMethodConfig
  },
  {
    name: "开户行",
    key: "bankName"
  },
  {
    name: "银行账号",
    key: "settlementAccounts"
  },
  {
    name: "发票类型",
    key: "invoiceType",
    editor: "select",
    config: invoiceTypeConfig
  },
  {
    key: 'a',
    name: ''
  },
  {
    key: 'b',
    name: ''
  }
  ],
  layout: {
    xs: 8
  }
}
