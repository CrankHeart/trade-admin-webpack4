export default {
  queryUrl: '/pms/purchaseReturnOrder/getOperateList',
  record: {
    fields: [ {
      name: "操作人",
      key: "createUserName"
    },
    {
      name: "操作时间",
      key: "createTime",
      type: "date"
    }, {
      name: "操作",
      key: "operateType"
    },
    {
      name: "操作内容",
      key: "operateContent"
    }
    ]
  }
}
