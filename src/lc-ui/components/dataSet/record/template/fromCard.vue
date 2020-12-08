<template>
  <div>
    <div v-for="card in cards" :key="card.key">
      <lc-card :title="card.title">
        <el-form
          :label-width="card.labelWidth || record.config.labelWidth || '100px'"
          class="el-row"
        >
          <el-row :gutter="card.gutter || layout.gutter">
            <template v-for="field of card.content">
              <el-col
                :xs="(field.config.layout && field.config.layout.xs) || card.xs || layout.xs"
                :sm="(field.config.layout && field.config.layout.sm) || card.sm || layout.sm"
                :lg="(field.config.layout && field.config.layout.lg) || card.lg || layout.lg"
                v-if="isShow(field)"
                :key="field.key"
              >
                <el-form-item
                  :label="field.name?(field.name+'：'):undefined"
                  :class="{'is-error': field.error, 'is-required':field.required}"
                >
                  <lc-field :field="field"></lc-field>
                  <div v-if="field.error" class="error">{{field.error}}</div>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </el-form>
        <template slot="title">
          <slot name="card-title" :card="card.key"></slot>
        </template>
      </lc-card>
      <slot name="card-bottom" :card="card.key"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    record: {
      default: "",
    },
  },
  computed: {
    layout() {
      let layout = this.record.config.layout
      if ( !layout ) {
        return {
          gutter: 20,
          xs: 24,
          sm: 24,
          lg: 24
        }
      }
      return {
        gutter: layout.gutter || 20,
        xs: layout.xs || 24,
        sm: layout.sm || layout.xs || 24,
        lg: layout.lg || layout.sm || layout.xs || 24
      }
    },
    cards() {
      if ( this.record.fields.length === 0 ) {
        return []
      }
      let cards = this.record.config.layout.modules
      let newArr = []
      let collect = new Set()
      cards.forEach( card => {
        let arr = []
        if ( card.content ) {
          arr = card.content.map( key => {
            let _field = this.record.fields.find( field => field.key === key )
            collect.add( _field )
            return _field
          } )
        } else {
          this.record.fields.forEach( field => {
            if ( !collect.has( field ) ) {
              arr.push( field )
            }
          } )
        }
        let item = {
          key: card.key,
          title: card.title,
          content: arr,
          labelWidth: card.labelWidth,
          gutter: card.gutter,
          xs: card.xs,
          sm: card.sm || card.xs,
          lg: card.lg || card.sm || card.xs
        }
        newArr.push( item )
      } )
      return newArr
    }
  },
  methods: {
    isShow( field ) {
      let show = field.config.show;
      if ( show instanceof Function ) {
        return field.config.show( field.parent.value );
      }
      return field.config.show === false ? false : true;
    },
  },
};
</script>

<style lang="stylus" scoped>
.error {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
  top: 100%;
  left: 0;
}
</style>