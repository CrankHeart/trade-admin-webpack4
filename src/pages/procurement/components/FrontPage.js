class FrontPage {
  constructor () {
    this.datas = []
    this.page = this.page.bind( this );
    this.update = this.update.bind( this );
  }
  init( datas ) {
    this.datas = datas
  }
  /***
   * @param nowPage 页码从1开始
   * @param size 每页多少条
   */
  page( nowPage, size ) {
    let startIndex = ( nowPage - 1 ) * size;
    return this.datas.slice( startIndex, startIndex + size )
  }

  /**
   *
   * @param {*} fb find函数匹配的函数体
   * @param {*} params 变更的数据对象
   */
  update( fb, params ) {
    let operData = this.datas.find( ( item ) => { return fb( item ) } )
    Object.assign( operData, params )
  }

  /**
   * 移除数据
   * @param {*} fb  findIndex函数匹配的函数体
   */
  remove( fb ) {
    let findIndex = this.datas.findIndex( ( item ) => { return fb( item ) } )
    console.log( 'findeIndex', findIndex )
    this.datas.splice( findIndex, 1 )
  }

  /**
   * 新增数据,新增至顶部
   * @param {*} params
   */
  add( params ) {
    this.datas.unshift( params )
  }


  /**
   * 新增多个数据,作为数据库,新增导顶部;
   * @param {*} arr
   */
  addLists( arr ) {
    this.datas = arr.concat(this.datas)
  }

  /**
   * 获取json字符串
   */
  getJson() {
    return JSON.stringify( this.datas )
  }

}

/**
 *
"calculate": 3,
"deliveryDate": null,
"lable": "0",
"lcSkuCode": "2200007622002",
"name": "wz20190719",
"oLock": 5,
"oStock": 130,
"onWay": 0,
"outStockNum": 0,
"price": 0,
"repNum": -119,
"salesStatus": 0,
"skuId": 17688,
"specification": "Z002",
"stockWarning": 3,
"storeId": 5,
"storeName": "\u9886\u5065\u81ea\u8425",
"storeSkuCode": "",
"supplierName": "",
"unit": "\u76d2"


remark: '',
// number: skuNum,
supplierName,
skuId,
lcSkuCode,
name,
specification,
storeSkuCode,
deliveryDate,
unit,
price: '',
storeId,
storeName,
supplyNum,
// oLock,
onWay,
// outStockNum,
// calculate,
oStock
 */
module.exports = FrontPage
