<template>
  <h2 class="title" v-if="text">
    {{text}}
    <slot></slot>
  </h2>
</template>

<script>
export default {
  name: "lc-title",
  props: {
    text: {
      default: ''
    }
  }
};
</script>

<style lang="stylus" scoped>
.title
  margin-bottom 10px
  text-align left
</style>

