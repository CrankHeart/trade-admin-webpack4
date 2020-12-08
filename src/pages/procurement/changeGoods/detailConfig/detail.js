export default {
  fields: [ {
      name: "服务单号",
      key: "1"
    },
    {
      name: "采购单号",
      key: "2"
    }, {
      name: "供应商",
      key: "3"
    },
    {
      name: "换货状态",
      key: "4"
    }, {
      name: "创建人",
      key: "5"
    },
    {
      name: "创建日期",
      key: "6"
    }, {
      name: "类型",
      key: "7"
    },
    {
      name: "换货原因",
      key: "8"
    }, {
      name: "联系人",
      key: "suppliersId"
    },
    {
      name: "联系电话",
      key: "wareHouse"
    }, {
      name: "联系地址",
      key: "suppliersId"
    }
  ],
  layout: {
    lg: 8,
    modules: [ {
      key: 'card1',
      title: '基础信息',
      content: [ '1', '2', '3', '4', '5', '6', '7', '8' ]
    }, {
      key: 'card2',
      title: '供应商地址信息'
    } ]
  }
}
