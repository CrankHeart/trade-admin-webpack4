
// 月结客户对账
import { Component, Prop } from 'vue-property-decorator'
import API from '../../../API'
import MonthCustomerAccount from '../../server/monthCustomerAccount.vue'

@Component( {
  name: 'portraitDetailCheckOrders',
  components: {}
} )
export default class PortraitDetailCheckOrders extends MonthCustomerAccount {
  @Prop() tenant: any
  fromPortraitComponent: boolean = true
  tenantId: string = ''
  officeId: string = ''
  isActived: boolean = false

  detailCheckOrderPermissionId = 777
  deleteCheckOrderPermissionId = 779
  checkBankStatePermissionId = 780
  exportPermissionId = 781

  created () {
    this.searchByLifeCycle()
  }

  activated () {
    this.searchByLifeCycle()
  }

  searchByLifeCycle () {
    let { tenant_id, office_id } = this.$route.query
    this.tenantId = tenant_id
    this.officeId = office_id
    this.formatCondition()
    this.searchCheckOrders()
    this.isActived = true
  }

  formatCondition () {
    this.condition = this.condition.filter( v => v.key !== 'office' )
  }

  // 重置父类中的该方法，阻止页面跳转
  routeChange () { }
  search () {
    if ( this.isActived ) {
      this.searchCheckOrders()
    }
  }

  formatSearchParam () {
    this.dataAdapter()
    let o = this.params
    // o.tenantId = this.tenantId
    // o.officeId = this.officeId
    const { customerId } = this.tenant
    Object.assign( o, { customerId } )
    return o
  }

  searchCheckOrders () {
    this.$permissionValidateWithNotify( 777 )

    // 判断customerId是否存在如果不存在 不允许用户发送请求，不然会查出所有数据
    const reqParams = this.formatSearchParam();
    const { customerId } = reqParams;
    if ( !customerId ) {
      console.log( '月结客户对账 customerId 不存在' );
      return;
    }

    this.$http( API.statementList, reqParams ).then(
      ( { data } ) => {
        this.data = data.list
        // 加上导出的状态标识
        this.data = this.data.map( item => {
          return { ...item, exportStatus: 0 }
        } )
        this.page.total = data.total
      },
      rej => {
        this.page.total = 0
        this.data = []
      }
    )
  }

  exportByAccountCheck ( row ) {
    let sn = row.accountCheckSn
    if ( sn.length === 0 ) return
    if ( this.$refs.syncExport ) {
      this.$refs.syncExport.addTask( {
        accountCheckSn: sn,
        tenantId: this.tenantId,
        officeId: this.officeId
      } )
    }
  }
}
