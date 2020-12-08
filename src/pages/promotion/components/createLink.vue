<template>
  <span v-if="hasPermission">
    <router-link :to="`/promotion/create?type=${item.id}`" tag="button" v-for="(item,index) in types" :key="index" class="el-button el-button--primary">
      {{item.name}}
    </router-link>
  </span>
</template> 
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { types } from '../const'

@Component( {
  name: 'create-link'
} )
export default class CreateLink extends Vue {
  @Prop()
  text: string
  get types () {
    return types.filter( val => val.id !== 'all' && +val.id !== 3 )
  }
  get hasPermission () {
    return this.$permissionValidate( 400 )
  }
}

</script>

