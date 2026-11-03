
<script setup lang="ts">
import AddUserModal from '../modals/addUserModal.vue'

interface User {
  id: string
  email: string
  username?: string
}

const users = ref<User[]>([])
const loading = ref(false)
const errorMessage = ref('')
const open = ref(false)

const showModalDelete = ref(false)
const selectedUser = ref<User | null>(null)
const successMessage = ref('')

async function fetchUsers() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<User[]>('/api/user/all')

    users.value = response.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username || ''
    }))
  } catch (error) {
    console.error('Fout bij ophalen gebruikers:', error)
    errorMessage.value = 'Gebruikers konden niet worden opgehaald.'
  } finally {
    loading.value = false
  }
}

function refreshUsers() {
  fetchUsers()
}

// Verwijdermodal openen
function openDeleteModal(user: User) {
  selectedUser.value = user
  showModalDelete.value = true
}

// Gebruiker verwijderen
async function confirmDeleteUser() {
  if (!selectedUser.value) {
    return
  }

  try {
    await $fetch(`/api/user/${selectedUser.value.id}`, {
      method: 'DELETE'
    })

    showModalDelete.value = false
    selectedUser.value = null

    await refreshUsers()

    showSuccess('Gebruiker succesvol verwijderd!')
  } catch (error) {
    console.error('Failed to delete user:', error)
    showSuccess('Gebruiker verwijderen mislukt.')
  }
}

// Succesmelding
function showSuccess(message: string) {
  successMessage.value = message

  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="users-page">

    <div class="header">
      <h1>Gebruikers</h1>

      <div class="actions">
        <button @click="refreshUsers">
          Vernieuwen
        </button>

        <button @click="open = true">
          + User toevoegen
        </button>
      </div>
    </div>

    <!-- Succesmelding -->
    <div
      v-if="successMessage"
      class="success-message"
    >
      {{ successMessage }}
    </div>

    <!-- Add User Modal -->
    <AddUserModal
      v-if="open"
      @close="open = false"
      @refresh="refreshUsers"
    />

    <!-- Loading -->
    <p v-if="loading">
      Gebruikers laden...
    </p>

    <!-- Error -->
    <p v-else-if="errorMessage">
      {{ errorMessage }}
    </p>

    <!-- Geen gebruikers -->
    <p v-else-if="users.length === 0">
      Er zijn nog geen gebruikers.
    </p>

    <!-- Gebruikerstabel -->
    <table v-else>
      <thead>
        <tr>
          <th>ID</th>
          <th>Gebruikersnaam</th>
          <th>Email</th>
          <th>Acties</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username || '-' }}</td>
          <td>{{ user.email }}</td>

          <td>
            <button
              class="delete-button"
              @click="openDeleteModal(user)"
            >
              Verwijderen
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showModalDelete" title="Gebruiker verwijderen">
      <template #body>
        <p class="p-4">
          Weet je zeker dat je gebruiker
          <strong>{{ selectedUser?.username || selectedUser?.email }}</strong>
          wilt verwijderen?
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            variant="subtle"
            @click="showModalDelete = false"
          >
            Annuleren
          </UButton>

          <UButton
            color="error"
            @click="confirmDeleteUser"
          >
            Verwijderen
          </UButton>
        </div>
      </template>
    </UModal>

  </div>
</template>
