<template>
	<Dialog header="Formulario de Usuario" :visible="visible" modal :pt="global.modalConfig.blur"
		:breakpoints="global.modalConfig.breakPoints.normal" :closable="false" :draggable="false">
		<div class="grid">
			<FormGroup label="Nombres" :control="formUser.controls.name" customClass="col-6">
				<InputText v-model="formUser.controls.name.value" :class="formUser.controls.name.getClass()" />
			</FormGroup>
			<FormGroup label="Apellidos" :control="formUser.controls.last_name" customClass="col-6">
				<InputText v-model="formUser.controls.last_name.value"
					:class="formUser.controls.last_name.getClass()" />
			</FormGroup>
			<FormGroup label="Correo" :control="formUser.controls.email" customClass="col-6">
				<InputText v-model="formUser.controls.email.value" :class="formUser.controls.email.getClass()" />
			</FormGroup>
			<FormGroup label="Perfil" :control="formUser.controls.profile" customClass="col-6">
				<Dropdown :options="profiles" v-model="formUser.controls.profile.value"
					:class="`${formUser.controls.profile.getClass()} w-full-important`"
					placeholder="Selecciona un Perfil">
				</Dropdown>
			</FormGroup>
		</div>

		<template #footer>
			<div class="w-full p-2 flex justify-content-between">
				<Button label="Cancelar" severity="secondary" icon="pi pi-times" @click="closeModal" />
				<Button label="Guardar" severity="success" icon="pi pi-check" @click="submit" />
			</div>
		</template>
	</Dialog>
</template>

<script lang="ts" setup>
// ORDEN RECOMENDADO PARA LA ESTRUCTURACIÓN DE LOS COMPONENTES 
// -estos comentarios son referenciales, luego los borran-

// IMPORTACIONES: Importaciones
import { onMounted, reactive, ref, watch } from 'vue';
import { useGlobalStore } from '../../../store/global';
import { UserInterface } from '../interfaces/user.interface';
import { EssentialForm } from '../../../shared/classes/EssentialForm';


// GLOBAL STORE: Acceso a los Store de Pinia
const global = useGlobalStore();


// CUSTOM HOOKS (useToast, useConfirm, etc): Normalmente provienen del Primevue los que usaremos


// DEFINIR PROPIEDADES: Definición de propiedades del componente
const props = defineProps<{
	profiles: string[],
	user: UserInterface | null,
	visible: boolean
}>()


// DEFINIR EMITS: Definición de emits o también llamado eventos del componente
const emits = defineEmits(['onSaveUser', 'closeModal'])


// CICLO DE VIDA DEL COMPONENTE: Métodos como el onMounted, onUnmounted
// Nota: Ya no hay método created o setup porque ahora, básicamente, todo lo que está dentro de
// esta etiqueta script está en el setup.
onMounted(() => {
	formUser.applyWatchers();
})


// WATCHERS: Métodos watch que observen el cambio de alguna variable reactiva
watch(() => props.user, (newValue, oldValue) => {
	if (!newValue) return;
	setInitialData(newValue);
})


// VARIABLES REACTIVAS: Variables de estado 
const formUser = reactive<EssentialForm>(
	global.sstForm({
		name: global.sstFormControl(null, [global.sstRule.REQUIRED]),
		last_name: global.sstFormControl(null, [global.sstRule.REQUIRED]),
		email: global.sstFormControl(null, [global.sstRule.REQUIRED, global.sstRule.EMAIL]),
		profile: global.sstFormControl(null, [global.sstRule.REQUIRED]),
	})
)


// MÉTODOS GENERALES: Métodos varios
const setInitialData = (user: UserInterface) => {
	formUser.matchValue({
		name: user.name,
		last_name: user.last_name,
		email: user.email,
		profile: user.profile
	})
}

const submit = async () => {
	if (!formUser.validateAll()) {
		global.utl.genToast(global.tstType.FORM_ERROR);
		return;
	}
	global.utl.showLoader();
	await global.utl.sleep(2000);
	emits('onSaveUser');
}

const closeModal = () => {
	emits('closeModal');
}

</script>