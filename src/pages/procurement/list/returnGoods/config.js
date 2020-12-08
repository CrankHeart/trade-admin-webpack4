export default {
  saveUrl: '/pms/purchaseOrder/returnPurchaseOrder',
  labelWidth: '120px',
  fields: [ {
    name: '退换货类型',
    key: 'serviceType',
    editor: 'radio',
    required: true,
    config: {
      key: 'code',
      show: 'name',
      data: [ {
        code: 1,
        name: '退货'
      }
        // ,
        //  {
        //   code: 2,
        //   name: '换货'
        // } 
      ]
    }
  }, {
    name: '退货原因',
    key: 'returnReason',
    editor: 'input',
    type: 'textarea',
    required: true
  }, {
    name: '供应商名称',
    key: 'supplierName',
    required: true
  }, {
    name: '联系人',
    key: 'supplierContactPerson',
    editor: 'input',
    required: true
  }, {
    name: '联系电话',
    key: 'supplierContactPhone',
    editor: 'input',
    required: true
  }, {
    name: '联系地址',
    key: 'supplierContactAddress',
    editor: 'cascader',
    clearable: true,
    filterable: true,
    required: true,
    config: {
      id: "ProcumentAddress",
      queryUrl: "/supplierInfoController/getAreaList",
      key: "id",
      show: "name",
      children: "result"
    }
  }, {
    key: 'supplierContactFullAddress',
    editor: 'input',
    layout: {
      lg: 16
    }
  } ],
  layout: {
    modules: [ {
      key: "card1",
      title: '基础信息',
      content: [ 'serviceType', 'returnReason' ]
    },
    {
      key: "card2",
      title: '供应商地址信息',
      lg: 8
    }
    ]
  }
}
