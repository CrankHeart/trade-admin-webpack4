import {
  returnGoodsStatus,
  returnGoodsTypes
} from '../../optionConfig/index'
export default {
  queryUrl: '/pms/purchaseReturnOrder/getDetail',
  fields: [ {
    name: "服务单号",
    key: "returnOrderSn"
  },
  {
    name: "采购单号",
    key: "procurementOrderSn"
  }, {
    name: "供应商",
    key: "supplierName"
  },
  {
    name: "退换货状态",
    key: "returnOrderStatus",
    config: returnGoodsStatus
  }, {
    name: "创建人",
    key: "createUserName"
  },
  {
    name: "创建日期",
    key: "createTime",
    type: 'date'
  }, {
    name: "类型",
    key: "returnOrderType",
    config: returnGoodsTypes
  },
  {
    name: "退货原因",
    key: "returnReason"
  }, {
    name: "联系人",
    key: "supplierContactPerson"
  },
  {
    name: "联系电话",
    key: "supplierContactPhone"
  }, {
    name: "联系地址",
    key: "supplierContactFullAddress"
  }
  ],
  layout: {
    lg: 8,
    modules: [ {
      key: 'card1',
      title: '基础信息',
      content: [ 'returnOrderSn', 'procurementOrderSn', 'supplierName', 'returnOrderStatus', 'createUserName', 'createTime', 'returnOrderType', 'returnReason' ]
    }, {
      key: 'card2',
      title: '供应商地址信息'
    } ]
  },
  queryFilter( {
    data
  } ) {
    return {
      ...data,
      ...data.supplierContactInfo
    }
  }
}
