import Vue = require( "vue" );
import "vue-router/types/index.d";

declare module "vue/types/vue" {
  interface Vue {
    $message: Function
    $notify: Function
    $http: Function
    $prompt: Function
    $submit: Function
    $scrollTo: Function
    $alert: Function
    $confirm: Function
    $msgbox: Function
    $permissionValidate: Function
    $permissionValidateWithNotify: Function
    $permissionValidateWithNotifyEnv: Function
    $permissionValidateWithEnv: Function
    $isProduct: boolean
  }
}
