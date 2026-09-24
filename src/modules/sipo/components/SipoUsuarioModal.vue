<template>
	<Dialog
		v-model:visible="visibleProxy"
		modal
		:closable="false"
		:draggable="false"
		:style="{ width: '28rem' }"
		:breakpoints="{ '640px': '95vw' }"
		class="sipo-usuario-modal"
		@hide="onHide"
	>
		<template #header>
			<span class="sip-modal-title-green">NUEVO USUARIO</span>
		</template>

		<div class="flex flex-column gap-3">
			<div class="flex flex-column gap-2">
				<label for="nuevo-email">Correo (*)</label>
				<InputText
					id="nuevo-email"
					v-model="form.correo"
					class="w-full"
					:class="{ 'p-invalid': errors.correo }"
					placeholder="usuario@flesan.cl"
				/>
				<small v-if="errors.correo" class="p-error">{{ errors.correo }}</small>
			</div>
			<div class="flex flex-column gap-2">
				<label for="nuevo-rol">Rol (*)</label>
				<Dropdown
					id="nuevo-rol"
					v-model="form.rol_id"
					:options="perfiles"
					optionLabel="cf_rol_name"
					optionValue="cf_rol_id"
					placeholder="Seleccionar..."
					class="w-full"
					:class="{ 'p-invalid': errors.rol_id }"
				/>
				<small v-if="errors.rol_id" class="p-error">{{ errors.rol_id }}</small>
			</div>
			<small class="text-color-secondary">
				Las razones sociales y centros de costo se asignan desde el botón verde de la tabla (excepto Administrador).
			</small>
		</div>

		<template #footer>
			<div class="flex justify-content-between w-full">
				<Button label="Cancelar" severity="danger" size="small" @click="visibleProxy = false" />
				<Button label="Guardar" severity="success" size="small" :loading="saving" @click="submit" />
			</div>
		</template>
	</Dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import { useGlobalStore } from '../../../store/global';
import { SipoPerfilRol } from '../sipoConstants';
import { SipoUsuariosService } from '../services/SipoUsuariosService';

const CORPORATE_DOMAINS = ['@flesan.cl', '@dls.cl', '@inexchile.com', '@dvc.cl'];

const props = defineProps<{
	visible: boolean;
	perfiles: SipoPerfilRol[];
}>();

const emit = defineEmits<{
	(e: 'update:visible', value: boolean): void;
	(e: 'saved'): void;
}>();

const global = useGlobalStore();
const saving = ref(false);
const errors = reactive<Record<string, string>>({});

const form = reactive({
	correo: '',
	rol_id: null as number | null,
});

const visibleProxy = computed({
	get: () => props.visible,
	set: (value: boolean) => emit('update:visible', value),
});

const resetForm = () => {
	form.correo = '';
	form.rol_id = null;
	Object.keys(errors).forEach((k) => delete errors[k]);
};

const validate = () => {
	Object.keys(errors).forEach((k) => delete errors[k]);
	let ok = true;
	const email = form.correo.trim().toLowerCase();

	if (!email) {
		errors.correo = 'Campo obligatorio.';
		ok = false;
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.correo = 'Formato inválido.';
		ok = false;
	} else if (!CORPORATE_DOMAINS.some((d) => email.endsWith(d))) {
		errors.correo = 'Correo corporativo requerido.';
		ok = false;
	}

	if (!form.rol_id) {
		errors.rol_id = 'Campo obligatorio.';
		ok = false;
	}

	return ok;
};

const submit = async () => {
	if (!validate()) {
		global.utl.genToast(global.tstType.FORM_ERROR);
		return;
	}

	saving.value = true;
	try {
		const response = await SipoUsuariosService.createUsuario({
			correo: form.correo.trim().toLowerCase(),
			rol_id: form.rol_id as number,
			empresas_ids: [],
			centros_costo_ids: [],
		});
		if (response?.status === 200) {
			global.utl.genToast(global.tstType.REGISTER_SUCCESS);
			emit('saved');
			visibleProxy.value = false;
			return;
		}
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} catch (err: any) {
		const detail = err?.response?.data?.detail;
		if (typeof detail === 'object' && detail !== null) {
			Object.entries(detail).forEach(([key, value]) => {
				errors[key] = Array.isArray(value) ? String(value[0]) : String(value);
			});
		}
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} finally {
		saving.value = false;
	}
};

const onHide = () => resetForm();

watch(
	() => props.visible,
	(open) => {
		if (open) resetForm();
	}
);
</script>

<style scoped>
.sip-modal-title-green {
	color: #252527;
	font-weight: 600;
	font-size: 1.1rem;
}
</style>
