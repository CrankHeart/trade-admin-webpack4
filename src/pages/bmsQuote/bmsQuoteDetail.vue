<template>
  <div></div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class bmsQuoteDetail extends Vue {
  // associationAuditStatuses

  // http://localhost:6061/#/bmsQuote/detail/?quoteId=1089&auditStatus=0&tenantId=e8a5b2d4-4ff9-4bad-b0fe-dbfca2d95deb&officeId=4&applyType=5

  // http://localhost:6061/#/vip/quoteDetail/1089?status=0&tenantId=e8a5b2d4-4ff9-4bad-b0fe-dbfca2d95deb&officeId=4&applyType=5
  viewDetail () {
    let { tenantId, tenantName, officeId, applyType, quoteId, auditStatus = 0 } = this.$route.query
    if ( +applyType == 5 || +applyType == 7 ) {
      this.$router.push( `/vip/quoteDetail/${quoteId}?status=${auditStatus}&tenantId=${tenantId}&officeId=${officeId}&applyType=${applyType}&&client=bms` )
    } else {
      this.$router.push( '/404' )
    }
  }
  created () {
    this.viewDetail()
  }
}
</script>
