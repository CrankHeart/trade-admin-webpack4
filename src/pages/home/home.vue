<template>
  <section id="home">
    <lc-title text="更新历史"></lc-title>
    <p>A -- add 功能新增, F -- fixed bug修复, O -- optimize 代码优化</p>
    <div v-for="record in records" :key="record.date">
      <h3>{{record.date}}</h3>
      <ul v-for="item in record.records" :key="item.title">
        <li>{{item.title}}</li>
        <li v-for="detail in item.detail" :key="detail">- {{detail}}</li>
      </ul>
    </div>
  </section>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import records from './const/records'
import { State } from 'vuex-class'
@Component( {
  name: 'home',
  components: {
    lcTitle
  }
} )
export default class Home extends Vue {
  records = records
  // records = []
  @State( state => state.login.userName ) userName
}
</script>
<style lang="stylus" scoped>
h3
  margin-top 30px
  font-size 14px
  margin-bottom 15px
ul
  margin 10px
  font-size 14px
li
  line-height 20px
  padding 0 30px
  &:first-child
    font-weight bold
    padding-left 10px
</style>

