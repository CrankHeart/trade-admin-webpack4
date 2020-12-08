export default {
  queryUrl: '/pms/purchaseReturnOrder/returnOrderRecordList',
  page: true,
  record: {
    fields: [ {
      name: "服务单号",
      key: "serviceSn",
      style: {
        color: 'blue',
        cursor: 'pointer'
      },
    },
    {
      name: "类型",
      key: "serviceTypeName"
    },
    {
      name: "商品数量",
      key: "number"
    },
    {
      name: "退款总额",
      key: "amount"
    },
    {
      name: "退换货状态",
      key: "returnStatusName"
    },
    {
      name: "创建日期",
      key: "createTime",
      type: "date"
    }
    ]
  }
}
