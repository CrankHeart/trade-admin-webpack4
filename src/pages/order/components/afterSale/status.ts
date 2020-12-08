export interface IDName {
  id: string | number;
  name: string;
}

export const times: Array<IDName> = [
  { id: 'applyTime', name: '申请时间' },
  { id: 'reviewTime', name: '审核时间' },
  { id: 'customerReturnTime', name: '客户退货时间' },
  { id: 'storageReceiptTime', name: '仓库收货时间' },
  { id: 'refundTime', name: '退款时间' },
  { id: 'exchangeTime', name: '换货重新发货时间' },
  { id: 'completeTime', name: '完成时间' },
];

export const serviceType: Array<IDName> = [
  { id: '1', name: '退货 ' },
  { id: '2', name: '换货' },
  { id: '3', name: '退款' },
];

export interface IBaseConfig {
  prop: string;
  label: string;
  width?: string;
  isChecked?: boolean;
  fixed?: string;
  [ key: string ]: any;
}
// 服务单类型 serviceType（1-退货 2-换货 3-退款 ）
// 退货 serviceType=1 returnRecordsBaseConfig
export const returnRecordsBaseConfig: Array<IBaseConfig> = [
  // { prop: "orderSn", label: "订单号", width: "280px" },
  { prop: 'serviceSn', label: '服务单号', width: '220px' }, // 服务单流水号
  // 商品信息(商品名称 goodsName) 商品规格(goodsSpecification) LC编码(goodsLcCode)
  { prop: 'goodsInfo', label: '商品信息', width: '220px' },
  // { prop: 'goodsSharedPrice', label: '退货单价', width: '100px' }, // 商品金额 goodsSharedPrice
  { prop: 'goodsNum', label: '退货数量', width: '100px' }, // 商品数量 goodsNum
  { prop: 'refundAmount', label: '退款金额', width: '160px' },
  // { prop: 'applyTime', label: '申请时间', width: '220px' },
  { prop: 'serviceStatus', label: '审核状态', width: '180px' }, //
  { prop: 'reviewName', label: '审核人', width: '220px' },
  { prop: 'time', label: '时间线', width: '320px' },
  // logisticInfo  快递公司：companyName   快递单号： logisticNo  发货时间  包裹数量
  { prop: 'logisticInfo', label: '物流信息', width: '220px' },
];

// 换货 serviceType=2 exchangeRecordBaseConfig
export const exchangeRecordBaseConfig: Array<IBaseConfig> = [
  { prop: 'serviceSn', label: '服务单号', width: '220px' }, // 服务单流水号
  // 商品信息(商品名称 goodsName) 商品规格(goodsSpecification) LC编码(goodsLcCode)
  { prop: 'goodsInfo', label: '商品信息', width: '220px' },
  // { prop: 'goodsSharedPrice', label: '换货单价', width: '100px' }, // 商品单价 商品金额 goodsSharedPrice
  { prop: 'goodsNum', label: '换货数量', width: '100px' }, // 商品数量 goodsNum
  // { prop: 'refundAmount', label: '退款金额', width: '160px' },
  // { prop: 'applyTime', label: '申请时间', width: '220px' },
  { prop: 'serviceStatus', label: '审核状态', width: '180px' }, //
  { prop: 'reviewName', label: '审核人', width: '220px' },
  { prop: 'time', label: '时间线', width: '320px' },
  // logisticInfo  快递公司：companyName   快递单号： logisticNo  发货时间  包裹数量
  { prop: 'logisticInfo', label: '物流信息', width: '220px' },
];

// 退款 serviceType=3 refundRecordsBaseConfig
export const refundRecordsBaseConfig: Array<IBaseConfig> = [
  { prop: 'serviceSn', label: '服务单号', width: '220px' }, // 服务单流水号
  // 商品信息(商品名称 goodsName) 商品规格(goodsSpecification) LC编码(goodsLcCode)
  { prop: 'goodsInfo', label: '商品信息', width: '220px' },
  // { prop: 'goodsSharedPrice', label: '退货单价', width: '100px' }, // 商品金额 goodsSharedPrice
  { prop: 'goodsNum', label: '退款数量', width: '100px' }, // 商品数量 goodsNum
  { prop: 'refundAmount', label: '退款金额', width: '160px' },
  // { prop: 'applyTime', label: '申请时间', width: '220px' },
  { prop: 'serviceStatus', label: '审核状态', width: '180px' }, //
  { prop: 'reviewName', label: '审核人', width: '220px' },
  { prop: 'time', label: '时间线', width: '320px' },
];

/*
【退货状态】10-申请中 11-待退货 12-已拒绝 13-待入库 14-待退款 15-已退款 19-退款已完成
【换货状态】20-申请中 21-待退货 22-已拒绝 23-待入库 24-待换货 25-已换货 26-收到为残次品，请联系客服处理 29-已完成
【退款状态】30-待审批 31-待退款 32-已退款 38-已拒绝 39-退款已完成
*/
export const serviceStatus: Array<IDName> = [
  // serviceType=1 退货状态
  { id: '10', name: '申请中' },
  { id: '11', name: '待退货' },
  { id: '12', name: '已拒绝' },
  { id: '13', name: '待入库' },
  { id: '14', name: '待退款' },
  { id: '15', name: '已退款' },
  { id: '19', name: '退货已完成' },
  // serviceType=2 换货状态
  { id: '20', name: '申请中' },
  { id: '21', name: '待退货' },
  { id: '22', name: '已拒绝' },
  { id: '23', name: '待入库' },
  { id: '24', name: '待换货' },
  { id: '25', name: '已换货' },
  { id: '26', name: '收到为残次品，请联系客服处理' },
  { id: '29', name: '换货已完成' },
  // serviceType=3 退款状态
  { id: '30', name: '待审批' },
  { id: '31', name: '待退款' },
  { id: '32', name: '已退款' },
  { id: '38', name: '已拒绝' },
  { id: '39', name: '退款已完成' },
];

export function findItem ( id: any, arr: Array<any> ): any {
  let res: any = null;
  arr.some( ( item ) => {
    let r = item.id == id;
    if ( r ) {
      res = item;
    }
    return r;
  } );

  return res;
}
