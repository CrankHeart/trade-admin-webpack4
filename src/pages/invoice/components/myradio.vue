<template>
  <div class="myradio item-warp" :class="{'item-disable':disable}" @click="handleclick">
    <div class="myradio-left" v-if="checkable">
      <template v-if="selected">
        <span class="myradio__select"></span>
      </template>
     <template v-else>
        <span class="myradio__noselect"></span>
      </template>
    </div>
    <div class="myradio-right">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'myradio',
  props: {
    value: {
      type: Number
    },
    disable: {
      type: Boolean
    },
    clicked: {
      type: Boolean,
      default: false
    },
    toggle: { // 是否可以选中切换
      type: Boolean,
      default: true
    },
    checkable: { // 是否显示单选按钮
      type: Boolean,
      default: true
    }
  },
  computed: {
  },
  data() {
    return {
      myValue: false,
      selected: false
    }
  },
  methods: {
    subCall( msg ) {
      if ( msg.value == null ) {
        this.selected = false
      } else {
        if ( msg.value != this.value ) {
          this.selected = false
        } else {
          this.selected = true
        }
      }
    },
    handleclick( event ) {
      if ( this.disable ) {
        return
      }
      // 如果允许切换,则可以选中与否切换
      if ( this.toggle ) {
        this.selected = !this.selected
      }
      this.$parent.eventHub.$emit( 'radioclick', { event, value: ( this.selected ) ? this.value : null } )
    },
  },
  created() {
    this.myValue = this.clicked
  }
}
</script>
<style lang="stylus" scoped>

.myradio__select
  width 18px
  height 18px
  border-radius  50%
  background #20a0ff
  border 1px solid #bfcbd9
  display inline-block
  position relative
  &&::after
    content " "
    background #fff
    width 6px
    height 6px
    border-radius  50%
    position absolute
    top 50%
    left 50%
    transform translate(-50%,-50%)
.myradio__noselect
  width 18px
  height 18px
  border-radius  50%
  background #ffffff
  border 1px solid #bfcbd9
  display inline-block
  position relative
  &&::after
    content " "
    background #fff
    width 6px
    height 6px
    border-radius  50%
    position absolute
    top 50%
    left 50%
    transform translate(-50%,-50%)
.myradio
  display flex
  flex-direction row
.myradio-left
  width 50px
  display flex
  justify-content center
  align-items center
.myradio-right
  flex 1
.item-warp
  cursor pointer
.item-disable
  cursor not-allowed
  background #F8F8FF
  .myradio__noselect
     background #e1e1e1
</style>


