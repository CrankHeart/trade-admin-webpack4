import {
  returnGoodsStatus,
  returnGoodsTypes,
  supplierList
} from '../optionConfig/index'
export default {
  id: 'purchaseReturnOrder',
  queryUrl: '/pms/purchaseReturnOrder/getList',
  visibleCtr: true,
  queryFields: {
    fields: [ {
      name: '服务单号',
      key: 'returnOrderSn',
      editor: 'input'
    }, {
      name: '采购单号',
      key: 'procurementOrderSn',
      editor: 'input'
    }, {
      name: 'SKU编码',
      key: 'lcSkuCode',
      editor: 'input'
    }, {
      name: '退货状态',
      key: 'returnOrderStatus',
      editor: 'select',
      clearable: true,
      config: returnGoodsStatus
    }, {
      name: '退货类型',
      key: 'returnOrderType',
      editor: 'select',
      clearable: true,
      config: returnGoodsTypes
    }, {
      name: '创建日期',
      key: 'createDate',
      editor: 'date'
    }, {
      name: '供应商',
      key: 'supplierId',
      editor: 'select',
      clearable: true,
      filterable: true,
      config: supplierList
    }, ]
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
      key: 'returnOrderType',
      config: returnGoodsTypes
    }, {
      name: '退货商品数量',
      key: 'returnTotalNum'
    }, {
      name: '退款总额',
      key: 'returnTotalAmount'
    }, {
      name: '供应商',
      key: 'supplierName'
    }, {
      name: '退货状态',
      key: 'returnOrderStatus',
      config: returnGoodsStatus
    }, {
      name: '创建人',
      key: 'createUserName'
    }, {
      name: '创建日期',
      key: 'createTime',
      type: 'date'
    } ],
    options: [ {
      name: '审核',
      event: 'approve',
      show: record => record.value.returnOrderStatus === 3
    }, {
      name: '取消',
      event: 'cancel',
      type: 'danger',
      show: record => record.value.returnOrderStatus === 3 || record.value.returnOrderStatus === 0
    } ]
  }
}
