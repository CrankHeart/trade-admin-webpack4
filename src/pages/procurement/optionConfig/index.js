// 退货状态
export const returnGoodsStatus = {
  show: 'name',
  key: 'code',
  data: [ {
    name: '待审核',
    code: 3
  },
  {
    name: '待退货出库',
    code: 0
  },
  {
    name: '已完成',
    code: 1
  },
  {
    name: '已取消',
    code: 2
  }
  ]
}

// 退货类型
export const returnGoodsTypes = {
  show: 'name',
  key: 'code',
  data: [ {
    name: '已入库退货',
    code: 1
  },
  {
    name: '未入库退货',
    code: 2
  }
  ]
}

// 供应商
export const supplierList = {
  id: 'getSupplierInfos',
  queryUrl: '/supplierInfoController/getSupplierInfos',
  show: 'supplierName',
  key: 'id'
}

// 换货状态
export const changeGoodsStatus = {
  show: 'name',
  key: 'code',
  data: [ {
    name: '待审核',
    code: '1'
  },
  {
    name: '待换货出库',
    code: '2'
  },
  {
    name: '待换货入库',
    code: '3'
  },
  {
    name: '换货部分入库',
    code: '4'
  },
  {
    name: '已完成',
    code: '5'
  },
  {
    name: '已取消',
    code: '6'
  }
  ]
}

// 库存状态
export const skuTypes = {
  show: 'name',
  key: 'code',
  data: [ {
    name: '正品',
    code: 0
  },
  {
    name: '临期',
    code: 1
  },
  {
    name: '次品',
    code: 2
  }
  ]
}
