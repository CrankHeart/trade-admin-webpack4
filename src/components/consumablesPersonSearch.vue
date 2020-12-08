<template>
  <div class="consumables-person-search">
    <el-autocomplete v-model="consumablesPerson" :size="size" :trigger-on-focus="false" @select="changeValue" ref="autocomplete" :fetch-suggestions="querySearchAsync" placeholder="请输入名称" @keydown.enter.stop="stopSubmit">
    </el-autocomplete>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import API from '../API'
import { debounce } from '../utils'
@Component( {
  name: 'consumables-person-search',
} )
export default class ConsumablesPersonSearch extends Vue {
  @Prop()
  value: string
  @Prop( { default: 'normal' } )
  size: string
  @Prop( { default: 'userName:emailAddress' } )
  formatter: string
  consumablesPerson: string = '' 
  created () {
    this.consumablesPerson = this.value
  }
  @Watch( 'value' )
  valueWatcher ( v ) {
    this.consumablesPerson = this.value
  }
  @Watch( 'consumablesPerson' )
  consumablesPersonWatcher ( v ) {
    if ( v === '' ) {
      this.$emit( 'input', v )
      this.$emit( 'change', v )
    }
  }

  changeValue ( { value } ) {
    this.consumablesPerson = value
    this.$emit( 'input', value )
    this.$emit( 'change', value )
  }
  consumablesPersons: any = []

  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  queryString: any = ''

  cb: any = ''

  suggestions: any = ''


  stopSubmit () {
    return false
  }
  querySearchAsync ( queryString = '', cb ) {
    // if ( this.queryString !== queryString ) {
    this.page.cur = 1
    this.consumablesPersons = []
    // }
    console.log( 'querySearchAsync' )
    this.queryString = queryString
    this.cb = cb
    queryString = queryString.trim()
    this.getConsumablesPersons( queryString, cb )
  }
  @Watch( 'suggestions' )
  suggestionsWatcher () {
    this.suggestions && this.suggestions.addEventListener( 'scroll', debounce( () => {
      console.log( 'suggestionsWatcher' )
      let { cur } = this.page
      let { scrollTop, offsetHeight } = this.suggestions
      let maxHeight = this.suggestions.childNodes[ 0 ].offsetHeight

      if ( maxHeight - scrollTop <= offsetHeight + 30 ) {
        this.page.cur = cur + 1
        this.getAllUsers( this.queryString, this.cb )
      }
    }, 60, true ) )
  }
  getConsumablesPersons: ( queryString: string, cb: string ) => void = debounce( function ( queryString, cb ) {
    console.log( 'getConsumablesPersons' )
    if ( this.consumablesPersons[ queryString ] ) {
      cb( this.consumablesPersons[ queryString ] )
      return
    }
    this.getAllUsers( queryString, cb ).then( res => {
      try {
        this.suggestions = this.$refs[ 'autocomplete' ] && this.$refs[ 'autocomplete' ].$refs && this.$refs[ 'autocomplete' ].$refs[ 'suggestions' ].$children[ 0 ].$el.childNodes[ 0 ]
      } catch ( e ) {
        console.log( e )
      }
    } )
  }, 900, true )

  getAllUsers ( queryString, cb ) {
    let { cur, num, total } = this.page
    let start = ( cur - 1 ) * num
    console.log( 'getAllUsers' )
    if ( !start ) {
      this.consumablesPersons = []
    }
    if ( start && start >= total ) {
      return Promise.reject( 'has get all' )
    }

    let params = Object.assign( {}, { usrName: queryString }, { start, num } )
    return this.$http( API.getAllUsers, params ).then(
      ( { data } ) => {
        if ( !data.hasOwnProperty( 'data' ) || data.data.list.length == 0 ) {
          cb( [] )
          return false
        }
        this.page.total = data.data.total

        let arr = data.data.list.forEach( val => {
          let value = this.formatter
          Object.keys( val ).forEach( k => {
            value = value.replace( k, val[ k ] )
          } )
          this.consumablesPersons.push( { ...val, value } )
        } )

        cb( this.consumablesPersons )

        return arr
      },
      rej => {
        cb( [] )
      }
    )
  }
}
</script>
<style lang="stylus" >
.consumables-person-search
  .el-autocomplete
    width 100%
</style>
