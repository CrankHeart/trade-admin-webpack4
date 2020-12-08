//换货状态
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

//是否选择
export const isOrNot = {
  show: 'name',
  key: 'code',
  data: [ {
    name: '是',
    code: 1
  }, {
    name: '否',
    code: 0
  } ]
}

//品牌
export const bland = {
  id: 'getBrandBuyerList',
  queryUrl: '/brandBuyer/getBrandBuyerList',
  show: 'name',
  key: 'id',
  queryFilter: res => res.brandList
}
