<template>
  <el-dialog :title="title" v-model="visible" :size="size">
    <slot></slot>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "lc-dialog",
  props: {
    title: {
      default: ''
    },
    size: {
      default: 'small'
    },
    value: {
      default: false
    },
    dataset: '',
    cache: {
      default: false
    }
  },
  computed: {
    visible: {
      get() {
        return this.value
      },
      set( value ) {
        this.$emit( 'input', value )
      }
    }
  },
  methods: {
    close() {
      this.visible = false
      this.clearCache()
    },
    confirm() {
      this.$emit( 'confirm' )
      this.close()
    },
    cancel() {
      this.$emit( 'cancel' )
      this.close()
    },
    clearCache() {
      if ( !this.cache && this.dataset ) {
        if ( this.dataset.isArray ) {
          this.dataset.value = []
        } else {
          this.dataset.value = {}
        }
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
</style>