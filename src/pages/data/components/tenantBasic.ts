
import { tenantMonthlyGmvTypes, tenantMonthlyUserTypes, numTypes, gmvTypes } from '../const/index'
export default {
  props: [ 'year', 'month', 'type', 'userType', 'isSaleCity', 'city', 'province', 'curTab', 'region', 'isHistory' ],
  data () {
    return {
      allData: [],
      myTimer: null,
      limitPromission: [ 724 ]
    }
  },
  computed: {
    ajaxOption () {
      let o: any = {
        year: this.year,
        month: this.month,
        email: this.realEmail,
        type: this.type,
        userType: this.userType,
        isSaleCity: this.isSaleCity,
        region: this.region,
        curTab: this.curTab,
        salesDepartments: this.salesDepartmentsType
      }

      if ( this.isHistory ) {
        o.isHistory = true
      }
      if ( this.regionProvince ) {
        if ( this.isSaleCity ) {
          o.salesCity = this.regionProvince
        } else {
          o.province = o.regionProvince = this.regionProvince
        }
      }
      let province = ( this.province || {} ).name
      if ( province ) {
        if ( !/[省|市|区]$/.test( province ) ) {
          o.province = this.formatProvinceName( province )
        } else {
          o.province = province
        }
      }
      Object.keys( o ).forEach( v => {
        if ( o[ v ] === null ) {
          delete o[ v ]
        }
      } )
      let typeProp = this.curTab ? 'numType' : 'gmvType'
      return {
        ...o,
        [ typeProp ]: o.type,
        regionType: +o.isSaleCity
      }
    }
  },
  watch: {
    ajaxOption: {
      handler () {
        if ( this.myTimer ) {
          clearTimeout( this.myTimer )
        }
        this.myTimer = setTimeout( () => {
          this.getData()
          clearTimeout( this.myTimer )
        }, 100 )
      },
      deep: true
    }
  },
  methods: {
    formatTypes ( type ) {

      let types = this.curTab ? numTypes : gmvTypes
      let types2 = this.curTab ? tenantMonthlyUserTypes : tenantMonthlyGmvTypes
      // if (type === '3,4' && !this.isHistory) {
      if ( type === 2 && !this.isHistory ) {
        return this.curTab ? '用户' : 'GMV'
      }
      let prop
      Object.keys( types ).forEach( v => {
        if ( types[ v ] == type ) {
          // if (type === '3,4') {
          if ( type === 2 ) {
            prop = 'hostryNum'
          } else {
            prop = v
          }
        }
      } )
      let ty = types2[ prop ] || {}
      return ty.name || ''
    }
  }
}
