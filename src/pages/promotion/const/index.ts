export let states = [
  { id: -1, name: '全部' },
  { id: 2, name: '未发布' },
  { id: 0, name: '已发布( 未开始 / 已开始 / 已过期 )' },
  { id: 1, name: '已失效' }
]

export let types = [
  { name: '全部', id: 'all' },
  { name: '满减', id: '1' },
  { name: '折扣', id: '0' },
  { name: '满赠', id: '2' },
  // { name: '协会价', id: '3' },
  { name: '限时特价', id: '4' },
  { name: '限售', id: '6' }
]

export let discountSubTypes: string[] = [
  '第X件Y折',
  '满X件每件Y折',
  '买x件赠同品Y件'
]

export let giftSubTypes: string[] = [
  '满数量赠送',
  '满金额赠送'
]