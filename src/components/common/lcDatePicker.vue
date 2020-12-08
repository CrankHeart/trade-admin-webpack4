<template>
  <el-date-picker v-model="date" :placeholder="placeholder" :disabled="disabled" :size="size" :type="type"></el-date-picker>
</template>
<script lang="ts">

  import Vue from 'vue'
  import { Component, Prop, Model, Watch } from 'vue-property-decorator'


  @Component({
    name: 'lc-date-picker'
  })
  export default class LcDatePicker extends Vue {
    @Prop()
    placeholder: string
    @Prop({ default: false })
    disabled: boolean
    @Prop()
    type: string
    @Prop()
    size: string
    @Prop({ type: [String, Date] })
    value
    @Watch('date')
    valueWatcher(v, o) {
      this.$emit('input', v)
      if(o){
        
      }
    }
    date: any = null
    create() {
      this.date = this.value
    }
  }
</script>
