<template>
  <div></div>
</template>
<script>
import oidc from 'oidc-client'
export default {
  name: 'silent',
  data() {
    return {
    }
  },
  created() {
    let options = {
      userStore: new oidc.WebStorageStateStore( { store: window.localStorage } )
    }
    new oidc.UserManager( options ).signinSilentCallback().catch( ( err ) => {
    } )
  }
}
</script>
<style lang="stylus" scoped></style>

