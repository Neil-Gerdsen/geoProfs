<template>
    <h1>user aanmaken</h1>

    <form @submit.prevent="handelSubmit">
        <input placeholder="username" v-model="form.username" />
        <input placeholder="email" type="email" v-model="form.email" />
        <input placeholder="wachtwoord" type="password" v-model="form.password" />

        <button class="cursor-pointer" type="submit">
            user aanmaken
        </button>
    </form>
</template>

<script setup lang="ts">

const form = ref({
    username: '',
    email: '',
    password: ''
});

const emit = defineEmits<{
    create: [];
    close: [];
}>();

async function handelSubmit() {
    console.log('1. Button aangeklikt / formulier verzonden');

    console.log('2. Formuliergegevens:', {
        username: form.value.username,
        email: form.value.email,
        password: 'INGEVULD'
    });

    try {
        console.log('3. API-aanroep wordt gestart');

        const response = await $fetch('/api/user', {
            method: 'POST',
            body: {
                username: form.value.username,
                email: form.value.email,
                password: form.value.password
            }
        });

        console.log('4. API succesvol aangeroepen:', response);

        emit('create');
        console.log('5. Create-event verstuurd');

        emit('close');
        console.log('6. Close-event verstuurd');

    } catch (err) {
        console.error('FOUT tijdens het aanmaken van de user:', err);
    }
}

</script>