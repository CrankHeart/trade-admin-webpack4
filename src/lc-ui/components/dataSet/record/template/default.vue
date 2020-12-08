<template>
  <el-form :label-width="record.config.labelWidth || '100px'" class="el-row">
    <el-row :gutter="layout.gutter">
      <template v-for="field of record.fields">
        <el-col
          :xs="(field.config.layout && field.config.layout.xs) || layout.xs"
          :sm="(field.config.layout && field.config.layout.sm) || layout.sm"
          :lg="(field.config.layout && field.config.layout.lg) || layout.lg"
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
    }
  },
  methods: {
    isShow( field ) {
      let show = field.config.show;
      if ( show instanceof Function ) {
        return field.config.show( field.parent, field );
      }
      return field.config.show === false ? false : true;
    },
  }
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