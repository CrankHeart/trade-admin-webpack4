<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import MonthCustomerAccount from './monthCustomerAccount.vue'
import API from '../../API'
import { statementStatus } from './const/serverConstant'

@Component
export default class TrusteeshipAccount extends MonthCustomerAccount {
  title = '托管商家对账单列表'
  storeList: any[] = []
  condition: any[] = [
    { value: undefined, key: 'accountCheckSn', label: '对账流水号', type: 'text' },
    { value: undefined, key: 'orderSn', label: '订单号', type: 'text' },
    { value: undefined, key: 'officeId', label: '托管商家', type: 'select', options: this.storeList },
    { value: 'trusteeship', key: 'tenantId', hide: true },
    { value: [], key: 'initiateDate', label: '核对发起时间', type: 'daterange' },
    { value: undefined, key: 'statementStatus', label: '状态', type: 'radio', col: { lg: 16, sm: 16 }, options: statementStatus },
  ]
  getDataUrl = API.trusteeshipStatements
  dataAdapter () {
    let o: any = {}
    o.start = ( this.page.cur - 1 ) * ( this.page.num )
    o.num = this.page.num
    let route: any = {}
    this.condition.forEach( val => {
      let { key, value } = val
      route[ key ] = value
      if ( key == 'initiateDate' ) {
        route[ key ] = []
        if ( value && value[ 0 ] ) {
          o[ 'initiateDateBegin' ] = route[ 'initiateDateBegin' ] = this.formatMyDate( value[ 0 ], 'yyyy-MM-dd hh:mm:ss' )
          o[ 'initiateDateEnd' ] = route[ 'initiateDateEnd' ] = this.formatMyDate( value[ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
          // delete o[ key ]
        }
      } else {
        if ( value !== undefined ) {
          o[ key ] = value
        } else {
          delete route[ key ]
        }
      }
    } )
    this.params = o
    this.routeChange( route )
  }
  routeChange ( query ) {
    this.$router.push( {
      path: '/server/trusteeshipAccount',
      query
    } )
  }

  created () {
    this.getStoreList()
  }
  getStoreList () {
    this.$http( API.getStoreList, {} ).then( ( { data } ) => {
      this.storeList.push( ...data.data.list.map( v => ( { id: v.id, name: v.storeName } ) ) )
    } )
  }
}
</script>
