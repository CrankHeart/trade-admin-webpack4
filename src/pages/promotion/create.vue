<template>
  <CreateWrapper :key="fullPath" :is-detail="isDetail"></CreateWrapper>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import CreateWrapper from './components/createWrapper'

@Component( {
  components: {
    CreateWrapper
  }
} )
export default class Create extends Vue {
  isDetail = false
  get fullPath () {
    return this.$route.fullPath
  }
}
</script>