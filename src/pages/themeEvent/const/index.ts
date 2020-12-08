export const themeEventTypes = [
  { id: 0, name: '主活动' },
  { id: 1, name: '次活动' }
]

export const themeEventModes = [
  // { id: 0, name: '全部' },
  { id: 0, name: 'pc' },
  { id: 1, name: 'app' }
]

export const status = [
  // { id: 0, name: '全部' },
  { id: 0, name: '有效' },
  { id: 1, name: '无效' }
]

export const templateTypes = [
  // { id: 'productReffer', name: '普通推荐', type: 'productItem' },
  // { id: 'promotion', name: '限时促销', type: 'productItem' },
  // { id: 'trial', name: '试用商品', type: 'productItem' },
  // { id: 'activity', name: '热门活动', type: 'activityItem' },
]
export const floorTypes = [
  { id: 'product', name: '商品推荐', type: 'productItem' },
  { id: 'activity', name: '热门活动', type: 'activityItem' }
]
export const myFloorTypes = [
  { id: 1, name: '限时促销' },
  { id: 4, name: '满赠' },
  { id: 5, name: '满减' },
  { id: 6, name: '折扣' },
  { id: 0, name: '普通推荐' },
  { id: 2, name: '试用商品' },
  { id: 3, name: '自定义推荐' }
]

export const basicProps = [
  'componentId',
  // 'image',
  'floorType',
  'floorTemplateName',
  'floorName',
  'status',
  'floorDesc',
  // 'floorLayout',
  'jumpLink',
  'time',
  'id',
  'floorLayoutDetail',
  'floorProducts',
  'floorContainers',
  'beginTime',
  'endTime',
  'themeEventId',
  // 'myProps'
]
