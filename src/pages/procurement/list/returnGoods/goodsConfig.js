export default {
  fieldWidth: "200px",
  record: {
    fields: [ {
      name: "SKU编码",
      key: "lcSkuCode"
    },
    {
      name: "自有编码",
      key: "storeSkuCode"
    },
    {
      name: "名称",
      key: "name"
    },
    {
      name: "规格",
      key: "specification"
    },
    {
      name: "单位",
      key: "unit"
    },
    {
      name: "数量",
      key: "skuNum",
      editor: 'inputNumber',
      required: true,
      min: 0
    },
    {
      name: "单价",
      key: "skuPrice"
    },
    {
      name: "退款总金额",
      key: "totalAmount",
      editor: 'inputNumber',
      required: true,
      min: 0
    },
    {
      name: "库存状态",
      key: "skuType",
      editor: 'select',
      required: true,
      config: {
        key: 'code',
        show: 'name',
        data: [ {
          code: 0,
          name: '正品'
        }, {
          code: 1,
          name: '临期'
        }, {
          code: 2,
          name: '次品'
        } ]
      }
    }
    ]
  }
}
