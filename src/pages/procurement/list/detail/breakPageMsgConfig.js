import planStateConfig from './options/planStateConfig'
export default {
  record: {
    fields: [ {
      name: "拆分后子采购单",
      key: "procurementSn",
      style: {
        color: 'blue',
        cursor: 'pointer'
      }
    },
    {
      name: "当前状态",
      key: "planState",
      config: planStateConfig
    },
    {
      name: "拆单时间",
      key: "splitOrderDate",
      type: "date"
    }
    ]
  }
}
