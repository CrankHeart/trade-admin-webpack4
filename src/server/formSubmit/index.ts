import FormSubmit from './formSubmit.vue'

let formSubmitInstance = ( url: string, params: object = {}, target: boolean = false ) => {
  let instance = new FormSubmit( {
    data: {
      url, target, params
    }
  } )

  let vm = instance.$mount()
  document.body.appendChild( vm.$el )
  let form: any = vm.$refs[ 'yexiao-form' ]
  form.submit()
}

export default formSubmitInstance