
import { Component, Prop } from 'vue-property-decorator'
import API from '../../../API'
import refunding from '../../server/refunding.vue'

@Component( {
  name: 'PortraitDetailService',
  components: {
  }
} )
export default class PortraitDetailService extends refunding {
  @Prop() tenant: any
  // constructor () {
  //   super()
  // }
  showTitle: boolean = false
  isActived: boolean = false

  created () {
    this.formatCondition()
    this.searchServices()
    this.isActived = true
  }
  activated () {
    this.formatCondition()
    this.searchServices()
    this.isActived = true
  }
  search () {
    if ( this.isActived ) {
      this.searchServices()
    }
  }

  formatCondition () {
    this.condition = this.condition.filter( v => v.key !== 'tenant' )
  }

  formatSearchParam () {
    let o = this.dataAdapter()
    delete o.tenantId
    delete o.tenantName
    const { customerId } = this.tenant
    Object.assign( o, { customerId } )
    // let { tenant_id, office_id } = this.$route.query
    // o.applyUserId = `${tenant_id}:${office_id}`
    return o
  }

  searchServices () {
    this.$permissionValidateWithNotify( 771 )

    // 判断customerId是否存在如果不存在 不允许用户发送请求，不然会查出所有数据
    const reqParams = this.formatSearchParam();
    const { customerId } = reqParams;
    if ( !customerId ) {
      console.log( '历史服务单 customerId 不存在' );
      return;
    }
    this.$http( API.getServiceOrders, reqParams ).then( ( { data } ) => {
      data = data.data
      this.page.total = data.total
      this.data = data.serviceOrderList
    }, rej => {
      this.page.total = 0
      this.data = []
    } )
  }
}
