<template>
  <div class="dataset">
    <lc-title v-if="dataSet.title" :text="dataSet.title"></lc-title>
    <lc-record v-for="record of records" :key="record.id" :record="record">
      <template slot="card-title" slot-scope="{card}">
        <slot name="card-title" :card="card"></slot>
      </template>
      <template slot="card-bottom" slot-scope="{card}">
        <slot name="card-bottom" :card="card"></slot>
      </template>
    </lc-record>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    records: {
      default() {
        return "";
      }
    },
    dataSet: {
      default() {
        return "";
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
.dataset
  padding 5px
</style>