import {
  changeGoodsStatus,
  supplierList
} from '../optionConfig/index'
export default {
  queryUrl: '',
  visibleCtr: true,
  queryFields: {
    fields: [ {
      name: '服务单号',
      key: 'num',
      editor: 'input'
    }, {
      name: '采购单号',
      key: 'num',
      editor: 'input'
    }, {
      name: 'SKU编码',
      key: 'num',
      editor: 'input'
    }, {
      name: '换货状态',
      key: 'num',
      editor: 'select',
      clearable: true,
      config: changeGoodsStatus
    }, {
      name: '供应商',
      key: 'num',
      editor: 'select',
      clearable: true,
      filterable: true,
      config: supplierList
    }, {
      name: '创建日期',
      key: 'num',
      editor: 'date'
    } ]
  },
  page: true,
  fieldWidth: '200px',
  record: {
    fields: [ {
      name: '服务单号',
      key: 'returnOrderSn',
      style: {
        color: 'blue',
        cursor: 'pointer'
      },
      width: '250px'
    }, {
      name: '采购单号',
      key: 'procurementOrderSn',
      style: {
        color: 'blue',
        cursor: 'pointer'
      },
      width: '250px'
    }, {
      name: '类型',
      key: 'num'
    }, {
      name: '换货商品数量',
      key: 'num'
    }, {
      name: '退款总额',
      key: 'num'
    }, {
      name: '供应商',
      key: 'num'
    }, {
      name: '换货状态',
      key: 'num'
    }, {
      name: '创建人',
      key: 'num'
    }, {
      name: '创建日期',
      key: 'num',
      type: 'date'
    } ],
    options: [ {
      name: '审核',
      event: 'approve'
    }, {
      name: '取消',
      event: 'cancel',
      type: 'danger'
    } ]
  }
}
