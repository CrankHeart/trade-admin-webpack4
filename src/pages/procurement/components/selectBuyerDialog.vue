<template>
  <el-dialog v-model="visible" title="编辑">
    <el-form :model="formData">
      <el-form-item label="采购负责人">
        <el-select v-model="formData.buyer" placeholder="请选择采购负责人">
          <el-option v-for="item in list" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import API from "../../../API";

@Component({
  name: "select-buyer-dialog"
})
export default class selectBuyerDialog extends Vue {
  @Prop({ default: false })
  value: boolean;
  @Prop({ default: {} })
  row: object;
  @Prop({ default: [{}]})
  list: object[];

  get visible() {
    return this.value;
  }

  set visible(v) {
    this.$emit("input", v);
  }

  get formData() {
    if(this.row.buyer === 0){
      this.row.buyer = ''
    }
    return this.row
  }

  confirm(){
    let param = {
      id: this.row.id,
      buyer: this.row.buyer
    }
    this.$http(API.editBrandBuyer,param).then(({ data }) => {
      this.visible = false;
      this.$emit("editSucess")
    });
  }
}
</script>


<style lang="stylus" scoped>
</style>

