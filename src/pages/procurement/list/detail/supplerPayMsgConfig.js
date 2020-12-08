import payStateConfig from './options/payStateConfig'
import settlementMethodConfig from '../add/options/settlementMethodConfig'
import invoiceTypeConfig from '../add/options/invoiceTypeConfig'
export default {
  fields: [
    {
      name: "供应商名称",
      key: "suppliers"
    },
    {
      name: "付款状态",
      key: "payState",
      config: payStateConfig
    },
    {
      name: "结算方式",
      key: "settlementMethod",
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
      config: invoiceTypeConfig
    },
    {
      name: "请款时间",
      key: "time"
    }
  ],
  layout:{
    sm: 8
  }
}