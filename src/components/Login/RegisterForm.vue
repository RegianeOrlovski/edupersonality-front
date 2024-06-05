<template>
  <q-form @submit="register()">
    <div class="page-container column justify-between">
      <div class="justify-center text-center">
        <h1 class="page-title">
          Cadastro
        </h1>
      </div>
      <div>
        <q-input
          v-model="formData.name"
          label="Nome completo"
          type="text"
          dense
          hide-bottom-space
          :rules="[ val => val && val.length > 0 || 'O nome é obrigatório']"
        />
      </div>
      <div>
        <q-input
          v-model="formData.email"
          label="E-mail"
          type="email"
          dense
          hide-bottom-space
          :rules="[ val => val && val.length > 0 || 'O E-mail é obrigatório']"
        />
      </div>
      <div>
        <q-input
          v-model="formData.password"
          :type="passwordHidden ? 'password' : 'text'"
          label="Senha"
          dense
          hide-bottom-space
          :rules="[ val => val && val.length > 0 || 'A senha é obrigatória']"
        >
          <template v-slot:append>
            <q-icon
              :name="passwordHidden ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="passwordHidden = !passwordHidden"
            />
          </template>
        </q-input>
      </div>
      <div>
        <q-input
          v-model="formData.institution"
          label="Instituição"
          type="text"
          dense
          hide-bottom-space
          :rules="[ val => val && val.length > 0 || 'A instituição é obrigatória']"
        />
      </div>
      <div class="row justify-between padding q-pa-sm">
        <q-btn
          type="button"
          class="q-ma-sm"
          color="primary"
          flat
          label="Voltar"
          @click="emit('hide-register')"
        />
        <q-btn
          type="submit"
          class="q-ma-sm"
          color="primary"
          outline
          label="Cadastrar-se"
        />
      </div>
    </div>
  </q-form>
</template>

<script setup>
import { postRegisterUser } from 'src/services/login/login-api.js'
import { onMounted, ref, reactive, defineEmits } from "vue"
import { loggedUser, resetLoggedUser } from "boot/user"
import { useRouter } from "vue-router"
import { Notify, Loading } from "quasar"
import { formatResponseError } from "src/services/utils/error-formatter";

const router = useRouter()

const emit = defineEmits(["hide-register"])

const formData = reactive({
  email: null,
  password: null
})

let passwordHidden = ref(true)

onMounted(() => {
  if (loggedUser.id) {
    resetLoggedUser()
  }
})

const register = async function () {
  formData.email = formData.email.toLowerCase()
  Loading.show()
  try {
    await postRegisterUser(formData)
    Loading.hide()
    emit("hide-register")
  } catch (error) {
    Loading.hide()
    Notify.create({
      message: formatResponseError(error) || "Erro ao registrar-se",
      type: "negative"
    })
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  border-radius: 10px;
  background: white;
  min-height: 50vh;
  display: flex;
  -webkit-box-shadow: 0px 4px 15px 0px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 4px 15px 0px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 4px 15px 0px rgba(0, 0, 0, 0.75);
}

.page-title {
  font-size: 2rem;
  line-height: 1rem;
}
</style>
