<template>
  <el-dialog :title="title" v-model="visible" :size="size">
    <component v-if="template" ref="comp" :is="template" :props="props"></component>
    <lc-dataset v-else :dataset="props"></lc-dataset>
    <div slot="footer" class="dialog-footer">
      <el-button @click="doCancel">取 消</el-button>
      <el-button type="primary" @click="doConfirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "lc-dialog2",
  props: {
    title: {
      default: ''
    },
    size: {
      default: 'small'
    },
    template: {
      default: ''
    },
    props: {
      default: ''
    },
    confirm: {
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      isDs: false
    }
  },
  watch: {
    visible() {
      if ( this.visible === false ) {
        setTimeout( () => {
          this.$emit( 'close' )
          this.destroy()
        }, 500 )
      }
    }
  },
  methods: {
    async doConfirm() {
      let comp = this.$refs.comp
      let res
      if ( comp && comp.confirm ) {
        res = await comp.confirm()
      } else {
        res = await this.confirm()
      }
      if ( res ) {
        this.visible = false
      }
    },
    doCancel() {
      this.visible = false
    },
    show() {
      this.visible = true
    }
  }
};
</script>

<style lang="stylus" scoped>
</style>