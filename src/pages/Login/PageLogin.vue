<template>
  <div class="login-page row items-center justify-center">
    <div class="col-xs-12 col-sm-7 col-md-5 col-lg-4">
      <div class="row items-center justify-center">
        <div class="q-pa-md">
          <img
            src="~assets/logo.png"
            alt="Logo image"
            style="max-height:90px;"
          >
        </div>
      </div>
      <login-form
        v-if="!showForgotPassword && !showRegister"
        @show-forgot-password="showForgotPassword = true"
        @show-register="showRegister = true"
      />
      <register-form
        v-if="showRegister"
        @hide-register="showRegister = false"
      />
<!--      <forgot-password-form-->
<!--        v-if="showForgotPassword"-->
<!--        @hide-forgot-password="showForgotPassword = false"-->
<!--      />-->
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import RegisterForm from 'components/Login/RegisterForm'
import LoginForm from 'components/Login/LoginForm'
import ForgotPasswordForm from 'components/Login/ForgotPasswordForm'

let showRegister = ref(false)
let showForgotPassword = ref(false)
</script>
<style scoped>
.login-page {
  min-height: 100vh;
  min-width: 100vw;
  padding: 20px 20px 5px 20px;
  background: radial-gradient(#cee1f8 0%, #98d4f8 100%);
  display: flex;
}
</style>
