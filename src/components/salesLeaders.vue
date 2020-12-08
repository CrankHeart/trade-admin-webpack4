<template>
  <div class="store-search">
    <el-select v-model="saleId" filterable clearable :disabled="disabled" @change="saleChange">
      <el-option
        v-for="sale in salesLists"
        :key="sale.id"
        :label="sale.name"
        :value="sale.emailAddress"
      ></el-option>
    </el-select>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import { Mutation, State, Action, Getter } from "vuex-class";
import API from "../API/";

@Component( {
  name: "sales-leaders",
  components: {}
} )
export default class salesLeaders extends Vue {
  @Prop( { type: [ String, Number ] } )
  value;
  @Prop( { type: Boolean } )
  disabled;
  get saleId () {
    return this.value;
  }
  set saleId ( v ) {
    let selectInfo = this.salesLists.find( item => item.emailAddress == v );
    this.$emit( "input", v );
    this.$emit( "change", v );
    this.$emit( "selectInfo", selectInfo );
  }
  salesLists = [];
  created () {
    this.$http( API.getPersonInCharge, {} )
      .then( ( { data } ) => {
        this.salesLists = data.data;
        // this.salesLists.length = 10
        // if (process.env.NODE_ENV !== 'production') {
        // }
      } )
      .catch( err => {
        // console.log(err.data);
        this.$message( {
          message: err.data.msg,
          type: "error"
        } );
      } );
  }
  saleChange ( id ) {
    this.$emit( "changeSaleId", id );
  }
}
</script>
