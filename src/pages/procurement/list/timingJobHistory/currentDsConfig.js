export default {
  fieldWidth: "200px",
  optionWidth: "80px",
  record: {
    fields: [
      {
        name: "SKU编码",
        key: "skuNum"
      },
      {
        name: "自有编码",
        key: "jiesuan"
      },
      {
        name: "名称",
        key: "wareHouse"
      },
      {
        name: "规格",
        key: "jiesuan"
      },
      {
        name: "发货数量",
        key: "jiesuan",
        editor: "inputNumber"
      },
      {
        name: "已入库数量",
        key: "inku"
      },
      {
        name: "未入库数量",
        key: "outku"
      },
      {
        name: "更新数量",
        key: "wareHouse",
        editor: "inputNumber"
      },
      {
        name: "预计到货时间",
        key: "date",
        editor: "date"
      }
    ]
  }
}
  