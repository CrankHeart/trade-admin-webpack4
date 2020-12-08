<template>
  <div class="card">
    <div v-if="title" class="title">
      <span class="title-text">{{title}}</span>
      <slot name="title"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "lc-card",
  props: {
    title: ""
  }
};
</script>

<style lang="stylus" scoped>
.card
  padding 10px
  border 1px solid rgba(204, 204, 204, 1)
  border-radius 5px
  margin-bottom 10px
  .title
    position relative
    border-bottom 1px solid rgba(204, 204, 204, 1)
    padding-top 5px
    padding-bottom 10px
    margin-bottom 15px
    .title-text
      padding-right 10px
</style>