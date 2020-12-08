<script lang="ts">
import CouponCreate from "./create.vue"
import { Component, Prop, Inject } from "vue-property-decorator"
import API from "../../API/"
@Component( {
  name: "coupon-detail",
  template: require( "./template/create.html" ),
  components: {}
} )
export default class CouponDetail extends CouponCreate {
  isViewPage: boolean = true
  activated () {
    this.getData().then( () => {
      this.getLimitUser()
    } )
    // this.getWriteOffList()
  }
  get activityId () {
    return this.$route.params.id
  }
  getData () {
    return this.$http( API.getActivityDetail, {
      activityId: this.activityId
    } ).then( ( { data } ) => {
      let result = data.data
      "activityName,activityRemark,useTimesLimit,couponTotals,command,createBy,type,couponScope,expirationType,expirationDays"
        .split( "," )
        .forEach( v => {
          this.form[ v ] = result[ v ]
        } )
      this.form.time = [
        new Date( result.beginTime.time ),
        new Date( result.endTime.time )
      ]
      this.form.method = !!result.command
      let activityRule = JSON.parse( result.activityRule )
      this[ "ruleInfo" + this.form.type ] = activityRule.ruleInfo
      this.form.limitUser = JSON.parse( result.limitUser || '{}' )
      this.form.amountInterval = activityRule.amountInterval
      this.couponWay = +!!result.couponWay
      this.form.brandProducts = this.decodeProduct( JSON.parse( result.targetProductStr || '[]' ) )
    } )
  }
  page = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 30, 40 ]
  }
  get limitUser () {
    return this.curPageLimitUser
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.getLimitUser()
  }
  curPageLimitUser: any[] = []
  sizeChange ( size ) {
    this.page.num = size
    this.page.cur = 1
    this.getLimitUser()
  }
  getLimitUser () {
    let o: any = {}
    let { cur, num } = this.page
    o.start = ( cur - 1 ) * num
    o.num = num
    o.couponActivityId = this.activityId
    this.$http( API.getPersonalCoupons, o ).then( ( { data = {} } ) => {
      let { rtnList, total } = ( data as any )
      this.curPageLimitUser = rtnList
      // if ( !this.couponWay ) {
      //   this.couponWay = +!!rtnList.length
      // }
      this.page.total = total
    }, () => {
      this.curPageLimitUser = []
      this.page.total = 0
    } )
  }
}
</script>
