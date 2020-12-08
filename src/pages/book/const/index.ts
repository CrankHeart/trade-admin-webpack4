
import { salesStatus as mySaleStatus } from '../../procurement/const/'

export const salesStatus = mySaleStatus

export const spuProps = [
  { prop: 'name', label: '名称', edit: true },
  { prop: 'subtitle', label: '副标题', edit: true },
  { prop: 'lcSpuCode', label: 'LC编码', edit: false },
  { prop: 'category', label: '类目', edit: false }, // 三级类目
  { prop: 'brandName', label: '品牌', edit: false },
  { prop: 'introduction', label: '商品介绍', edit: true },
  { prop: 'qrCode', label: '二维码', edit: true },
  { prop: 'image', label: '图片', edit: true },
  { prop: 'pageNumber', label: '页码', edit: true },
  { prop: 'sort', label: '排序', edit: true }
]

export const skuProps = [
  { prop: 'specification', label: '商品规格', edit: true },
  { prop: 'lcSkuCode', label: 'SKU编码', edit: false },
  { prop: 'unit', label: '单位', edit: false },
  { prop: 'boxBin', label: '箱规', edit: true },
  { prop: 'attribute', label: '属性', edit: true },
  { prop: 'salesPrice', label: '价格', edit: true },
  { prop: 'activityPrice', label: '活动价', edit: true },
  { prop: 'activityEndTime', label: '活动截止时间', edit: true },
  { prop: 'origin', label: '产地', edit: false },
  { prop: 'version', label: '版本号', edit: false }
]

// export const salesStatus = [
//   // { id: 0, name: '全部' },
//   { id: 0, name: '可售' },
//   { id: 1, name: '停售' },
//   { id: 2, name: '作废' }
// ]