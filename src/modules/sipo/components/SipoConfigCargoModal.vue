<template>
	<Dialog
		v-model:visible="visible"
		modal
		header="NUEVO CARGO"
		:style="{ width: '32rem' }"
		@hide="onHide"
	>
		<div class="flex flex-column gap-3">
			<label class="text-sm font-semibold">Nombre Cargo (*)</label>
			<Dropdown
				v-model="selectedCode"
				:options="options"
				optionLabel="label"
				optionValue="value"
				placeholder="Seleccionar"
				filter
				class="w-full"
				:invalid="submitted && !selectedCode"
			/>
		</div>
		<template #footer>
			<Button label="Cancelar" severity="danger" text @click="visible = false" />
			<Button label="Guardar" severity="success" :loading="saving" @click="onSave" />
		</template>
	</Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { SipoConfigCargoCatalogo } from '../services/SipoConfigCargosService';

const props = defineProps<{
	modelValue: boolean;
	catalogo: SipoConfigCargoCatalogo[];
	saving?: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'save', payload: SipoConfigCargoCatalogo): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: (value: boolean) => emit('update:modelValue', value),
});

const selectedCode = ref<string | null>(null);
const submitted = ref(false);

const options = computed(() =>
	props.catalogo.map((item) => ({
		label: item.nombre,
		value: item.external_code,
		item,
	}))
);

watch(
	() => props.modelValue,
	(open) => {
		if (open) {
			selectedCode.value = null;
			submitted.value = false;
		}
	}
);

const onHide = () => {
	submitted.value = false;
	selectedCode.value = null;
};

const onSave = () => {
	submitted.value = true;
	if (!selectedCode.value) return;
	const item = props.catalogo.find((c) => c.external_code === selectedCode.value);
	if (!item) return;
	emit('save', item);
};
</script>
