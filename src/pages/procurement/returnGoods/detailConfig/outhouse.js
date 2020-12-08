export default {
  queryUrl: '/pms/wmsShipmentConfirm/getList',
  fieldWidth: '200px',
  page: true,
  record: {
    fields: [ {
      name: "SKU编码",
      key: "itemCode"
    },
    {
      name: "商品名称",
      key: "itemName"
    }, {
      name: "规格",
      key: "specification"
    }, {
      name: "单位",
      key: "unit"
    },
    {
      name: "数量",
      key: "quantity"
    }, {
      name: "批号",
      key: "lot"
    },
    {
      name: "失效日期",
      key: "expirationDate",
      type: "date"
    }, {
      name: "单价",
      key: "skuPrice"
    }, {
      name: "退款总金额",
      key: "totalAmount"
    }
    ]
  }
}
