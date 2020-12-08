import supplierConfig from './options/supplierConfig'
import wareHouseConfig from './options/wareHouseConfig'
import typeConfig from './options/typeConfig'
export default {
  id: "addListTable",
  checkType: "checkBox",
  fieldWidth: "200px",
  optionWidth: "80px",
  record: {
    fields: [ {
        name: "SKU编码",
        key: "lcSkuCode",
        editor: "input",
        config: supplierConfig
      },
      {
        name: "类型",
        key: "wareHouse",
        editor: "select",
        config: wareHouseConfig
      },
      {
        name: "自有编码",
        key: "jiesuan",
        config: supplierConfig
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
        name: "预计到货日期",
        key: "invoiceType",
        editor: "date",
        config: supplierConfig
      },
      {
        name: "单位",
        key: "bankNum",
        width: "100px"
      },
      {
        name: "库存",
        key: "bankNum",
        width: "100px"
      },
      {
        name: "在途",
        key: "bankNum",
        width: "100px"
      },
      {
        name: "采购数量",
        key: "inputNumber",
        editor: "inputNumber"
      },
      {
        name: "单价",
        key: "inputNumber",
        editor: "inputNumber"
      },
      {
        name: "总金额",
        key: "bankNum",
        editor: "inputNumber"
      },
      {
        name: "优惠总额",
        key: "inputNumber",
        editor: "inputNumber"
      },
      {
        name: "优惠单价",
        key: "bankNum"
      },
      {
        name: "实付金额",
        key: "bankNum"
      },
      {
        name: "税点（%）",
        key: "inputNumber",
        editor: "inputNumber",
        min: 0,
        max: 100
      }
    ],
    options: [
        {
            name: '删除',
            type: 'danger',
            event: 'delete'
        }
    ],
  }
}
