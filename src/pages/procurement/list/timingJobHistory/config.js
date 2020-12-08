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
        key: "wareHouse"
      },
      {
        name: "入库数量",
        key: "inku"
      },
      {
        name: "未入库数量",
        key: "outku"
      },
      {
        name: "预计到货时间",
        key: "jiesuan"
      },
      {
        name: "实际入库时间",
        key: "wareHouse"
      }
    ],
    options: [
      {
        name: '更新',
        event: 'update',
        show: record =>{
          return record.value.skuNum === 2 || record.value.skuNum === 3
        }
      }
    ],
  }
}
  