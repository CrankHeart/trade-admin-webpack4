export default {
  fieldWidth: '200px',
  page: true,
  queryFields: {
    fields: [ {
      name: 'SKU编码',
      key: 'skuNum',
      editor: 'input'
    }, {
      name: '批号',
      key: 'num',
      editor: 'input'
    } ]
  },
  record: {
    fields: [ {
        name: "入库单号",
        key: "11"
      }, {
        name: "SKU编码",
        key: "1"
      },
      {
        name: "商品名称",
        key: "2"
      }, {
        name: "入库数量",
        key: "4"
      }, {
        name: "批次",
        key: "5"
      }, {
        name: "批号",
        key: "7"
      }, {
        name: "生产日期",
        key: "6"
      },
      {
        name: "失效日期",
        key: "8"
      }, {
        name: "入库日期",
        key: "9"
      }, {
        name: "库存状态",
        key: "9"
      }
    ]
  }
}
