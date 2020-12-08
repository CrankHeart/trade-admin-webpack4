import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import API from '../../../API';

@Component( {
  name: 'refill-goods'
} )
export default class RefillGoodsMixins extends Vue {
  @State( state => state.procurement.commonSkuList ) commonSkuList
  @State( state => state.supplier.supplierList ) supplierList

  @Mutation( 'procurement/setOrderSelectedSkuList' ) setOrderSelectedSkuList
  @Mutation( 'procurement/addCommonSkuList' ) addCommonSkuList
  @Mutation( 'procurement/delCommonSkuList' ) delCommonSkuList

  visibleSupplierDialog: boolean = false
  currSkuGoods: any = {}
  tableList: any[] = []

  activated () {
    this.setSkuIsAdded()
  }

  setSkuIsAdded () {
    let existedSkuList = [ ...this.commonSkuList ].map( v => v.lcSkuCode ) || []
    this.tableList.forEach( item => {
      Vue.set( item, 'isAdded', existedSkuList.includes( item.lcSkuCode ) )
    } )
  }

  showSupplierDialog ( index ) {
    // TODO：在HTML中加权限
    this.currSkuGoods = this.tableList[ index ]
    this.visibleSupplierDialog = true
  }

  changeCurrSupplier ( supplierName?: string = '', supper?: object = {} ) {
    this.visibleSupplierDialog = false
    // if ( supplierName.length > 0 ) {
    //   this.currSkuGoods.supplierName = supplierName
    // }
    this.modifySupplier( supper )
  }
  modifySupplier ( supper, supplierName ) {
    this.$http( API.modifySupplier, { type: 1, supplierId: supper.supplierId, supplierName: supper.supplierName, taskIds: [ this.currSkuGoods.id ] } ).then( ( { data } ) => {
      this.search()
    } );
  }
  addRefillSkuListItem ( v ) {
    if ( !v.isAdded ) {
      v.isAdded = true
      this.addCommonSkuList( { result: v, isFormat: true } )
      this.$notify( {
        type: 'success',
        message: '添加成功'
      } )
    }
  }
  delRefillSkuListItem ( v, nonConfirm?: boolean ) {
    if ( nonConfirm === true ) {
      v.isAdded = false
      this.delCommonSkuList( v.lcSkuCode )
    } else {
      this.$confirm( '确定删除该商品吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      } ).then( () => {
        v.isAdded = false
        this.delCommonSkuList( v.lcSkuCode )
      } )
    }
  }

}
