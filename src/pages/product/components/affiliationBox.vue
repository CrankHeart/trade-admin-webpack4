<template>
  <div class="affilication-box">
    <el-checkbox-group v-model="affiliation" @change="update" v-if="isEdit">
      <el-checkbox v-for="item in affiliationList" :key="item.id" :label="item.id">{{item.name}}</el-checkbox>
    </el-checkbox-group>
    <template v-else>
      <span v-for="item in affiliationList" :key="item.id" v-if="affiliation.indexOf(item.id)> -1">{{item.name}}</span>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import API from '../../../API'

@Component( {
  name: 'affilication-box'
} )
export default class AffilicationBox extends Vue {
  @Prop()
  value: number
  @Prop()
  id: number
  @Prop( { default: true } )
  isEdit: boolean
  affiliationList: any = [
    { name: 'ERP', id: 0 },
    { name: 'WMS', id: 1 },
    { name: 'CRM', id: 2 }
  ]
  get affiliation () {
    return this.affiliationList.map( ( { id } ) => {
      return this.value >> id & 1 ? id : ''
    } ).filter( v => v !== '' )
  }
  set affiliation ( v ) {
    let result = this.affiliationList.map( ( { id } ) => v.indexOf( id ) > -1 ? 1 : 0 )

    let affiliation = result.reduce( ( total, prev, index ) => {
      total += prev * ( Math.pow( 2, index ) )
      return total
    }, 0 )
    this.$emit( 'input', affiliation )
  }
  update () {
    this.$http( API.updateSpuNonBusinessInfo, { affiliation: this.value, id: this.id } ).then( res => {
      this.$notify( {
        type: 'success',
        message: '修改成功！'
      } )
    } )
  }
}
</script> 
<style lang="stylus" scoped>
span 
  padding 0 5px
  display inline-block
  + span
    border-left 1px solid #eee
</style>

