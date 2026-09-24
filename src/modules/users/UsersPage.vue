<template>
	<div class="relative w-full flex-1">
		<div class="absolute top-0 bottom-0 left-0 right-0">

			<DataTable :value="users" :rows="dataTableConfig.rows" scrollable paginator
				v-model:filters="dataTableConfig.filters" :paginatorTemplate="dataTableConfig.paginatorTemplate"
				:rowsPerPageOptions="dataTableConfig.rowsPerPageOptions"
				:currentPageReportTemplate="dataTableConfig.currentPageReportTemplate" showGridlines
				class="p-datatable-sm overflow-auto" tableStyle="min-width:50rem" filterDisplay="menu"
				:globalFilterFields="dataTableConfig.globalFilterFields">

				<template #empty>
					<div class="w-full flex justify-content-center">
						<span>No hay registros para mostrar.</span>
					</div>
				</template>

				<template #header>
					<div class="flex flex-column sm:flex-row justify-content-between">
						<Button type="button" severity="success" label="Nuevo Usuario" icon="pi pi-plus"
							@click="toggleUserForm()" />

						<InputGroup class="w-auto sm:w-20rem mt-2 sm:mt-0">
							<InputGroupAddon>
								<i class="pi pi-search"></i>
							</InputGroupAddon>
							<InputText placeholder="Buscador general"
								v-model="dataTableConfig.filters['global'].value" />
						</InputGroup>
					</div>
				</template>

				<Column bodyClass="no-wrap-container max-w-5rem" header="ACCIONES" headerClass="w-5rem">
					<template #body="{ data }">
						<div class="w-full flex justify-content-center gap-2">
							<Button severity="warning" icon="pi pi-pencil" class="w-2rem h-2rem"
								v-tooltip.top="'Editar'" placeholder="Top" @click="toggleUserForm(data)" />
							<Button v-if="data.enable == 1" v-tooltip.top="'Inhabilitar'" placeholder="Top"
								severity="danger" icon="pi pi-lock" class="w-2rem h-2rem" @click="disableUser" />
							<Button v-if="data.enable == 0" severity="success" icon="pi pi-lock-open"
								class="w-2rem h-2rem" v-tooltip.top="'Habilitar'" placeholder="Top"
								@click="enableUser" />
						</div>
					</template>
				</Column>
				<Column field="name" bodyClass="no-wrap-container max-w-8rem" header="NOMBRE" headerClass="w-8rem">
				</Column>
				<Column field="last_name" bodyClass="no-wrap-container max-w-8rem" header="APELLIDOS"
					headerClass="w-8rem"></Column>
				<Column field="email" bodyClass="no-wrap-container max-w-12rem" header="CORREO" headerClass="w-12rem">
				</Column>
				<Column filterField="profile" field="profile" :showFilterMatchModes="false"
					:filterMenuStyle="{ width: '14rem' }" bodyClass="no-wrap-container max-w-8rem" header="PERFIL"
					headerClass="w-8rem">
					<template #body="{ data }">
						<span>{{ data.profile }}</span>
					</template>
					<template #filter="{ filterModel }">
						<MultiSelect v-model="filterModel.value" :options="profiles" placeholder="Cualquiera"
							class="p-column-filter" filter>
						</MultiSelect>
					</template>
				</Column>
				<Column field="enable" bodyClass="no-wrap-container max-w-5rem text-center" header="ESTADO"
					headerClass="w-5rem">
					<template #body="{ data }">
						<Tag :value="data.enable == 1 ? 'ACTIVO' : 'INACTIVO'"
							:severity="data.enable == 1 ? 'success' : 'danger'" class="font-bold"></Tag>
					</template>
				</Column>
			</DataTable>

		</div>
	</div>


	<UserForm :visible="showUserForm" :user="userSelected" :profiles="profiles" @onSaveUser="onSaveUser"
		@closeModal="toggleUserForm"></UserForm>
</template>
<script lang="ts" setup>
// ORDEN RECOMENDADO PARA LA ESTRUCTURACIÓN DE LOS COMPONENTES 
// -estos comentarios son referenciales, luego los borran-

// IMPORTACIONES: Importaciones
import { onMounted, ref } from 'vue';
import { useGlobalStore } from '../../store/global';
import { DataTableConfigInterface } from '../../shared/interfaces/datatable-config.interface';
import { FilterMatchMode } from 'primevue/api';
import { UserInterface } from './interfaces/user.interface';
import { UserService } from './services/UserService';
import UserForm from './components/UserForm.vue';

// GLOBAL STORE: Acceso a los Store de Pinia
const global = useGlobalStore();


// CUSTOM HOOKS (useToast, useConfirm, etc): Normalmente provienen del Primevue los que usaremos


// DEFINIR PROPIEDADES: Definición de propiedades del componente


// DEFINIR EMITS: Definición de emits o también llamado eventos del componente


// CICLO DE VIDA DEL COMPONENTE: Métodos como el onMounted, onUnmounted
// Nota: Ya no hay método created o setup porque ahora, básicamente, todo lo que está dentro de
// esta etiqueta script está en el setup.
onMounted(async () => {
	global.utl.showLoader();
	users.value = await UserService.getUsers();
	loadProfiles();
	global.utl.hiddenLoader();
})


// WATCHERS: Métodos watch que observen el cambio de alguna variable reactiva


// VARIABLES REACTIVAS: Variables de estado 
const dataTableConfig = ref<DataTableConfigInterface>({
	rows: 10,
	rowsPerPageOptions: [10, 20, 50, 100],
	paginatorTemplate: "RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink",
	currentPageReportTemplate: 'Página {currentPage} de {totalPages}',
	globalFilterFields: ['name', 'last_name', 'email', 'profile'],
	filters: {
		global: { value: null, matchMode: FilterMatchMode.CONTAINS },
		profile: { value: null, matchMode: FilterMatchMode.IN },
	}
})
const users = ref<UserInterface[]>([]);
const userSelected = ref<UserInterface | null>(null);
const showUserForm = ref(false);
const profiles = ref<string[]>([]);


// MÉTODOS GENERALES: Métodos varios
const enableUser = () => {
	global.utl.showConfirmation({
		message: 'Se habilitará el usuario seleccionado',
		accept: async () => {
			global.utl.showLoader();
			await global.utl.sleep(3000);
			global.utl.genToast(global.tstType.USER_ENABLED);
			global.utl.hiddenLoader();
		},
		reject: () => { },
	})
}

const disableUser = () => {
	global.utl.showConfirmation({
		message: 'Se deshabilitará el usuario seleccionado',
		accept: async () => {
			global.utl.showLoader();
			await global.utl.sleep(3000);
			global.utl.genToast(global.tstType.USER_ENABLED);
			global.utl.hiddenLoader();
		},
		reject: () => { },
	})
}

const loadProfiles = () => {
	profiles.value = [...new Set(users.value.map(u => u.profile))];
}

const toggleUserForm = (user: UserInterface | null = null) => {
	showUserForm.value = !showUserForm.value;
	userSelected.value = user;
}

const onSaveUser = () => {
	global.utl.genToast(global.tstType.REGISTER_SUCCESS);
	toggleUserForm(null);
	global.utl.hiddenLoader();
}



</script>