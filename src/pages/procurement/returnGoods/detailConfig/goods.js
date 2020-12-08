import {
  skuTypes
} from '../../optionConfig/index'
export default {
  queryUrl: '/pms/purchaseReturnOrder/getDetailList',
  fieldWidth: '200px',
  page: true,
  record: {
    fields: [ {
      name: "SKU编码",
      key: "lcSkuCode"
    },
    {
      name: "自有编码",
      key: "storeSkuCode"
    }, {
      name: "名称",
      key: "skuName"
    },
    {
      name: "规格",
      key: "skuSpecification"
    }, {
      name: "单位",
      key: "skuUnit"
    },
    {
      name: "数量",
      key: "skuNum"
    }, {
      name: "单价",
      key: "skuPrice"
    },
    {
      name: "退款总金额",
      key: "totalAmount"
    }, {
      name: "库存状态",
      key: "skuType",
      config: skuTypes
    }
    ]
  }
}
