import {
  skuTypes
} from '../../optionConfig'
export default {
  queryUrl: '/pms/wmsReceiptConfirm/getList',
  fieldWidth: "200px",
  queryFields: {
    fields: [ {
      name: "SKU编码",
      key: "itemCode",
      editor: "input"
    },
    {
      name: "批号",
      key: "lot",
      editor: "input"
    }
    ]
  },
  page: true,
  record: {
    fields: [ {
      name: "入库单号",
      key: "receiptCode"
    },
    {
      name: "SKU编码",
      key: "itemCode"
    },
    {
      name: "商品名称",
      key: "itemName"
    },
    {
      name: "入库数量",
      key: "quantity"
    },
    {
      name: "批次",
      key: "batch"
    },
    {
      name: "批号",
      key: "lot"
    },
    {
      name: "生产日期",
      key: "manufactureDate",
      type: "date"
    },
    {
      name: "失效日期",
      key: "expirationDate",
      type: "date"
    },
    {
      name: "入库日期",
      key: "agingDate",
      type: "date"
    },
    {
      name: "库存状态",
      key: "inventorySts"
    }
    ]
  }
}
