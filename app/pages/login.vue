<template>
<form @submit.prevent="login">
    <input
        v-model="email"
        type="email"
        placeholder="email"

    />
    <input
        v-model="password"
        type="password"
        placeholder="password"
    />
    <UButton type="submit">
        inloggen

    </UButton>
</form>


</template>
<script setup lang="ts">
const email = ref('')
const password = ref('')

const login = async () => {
    try{
        await $fetch('/../../login',{
            method: 'POST',
            body:{
                email: email.value,
                password: password.value
            }

        })
        await navigateTo('/')
    }catch (error){
        console.error('Inloggen mislukt:', error)
    }
}
</script>