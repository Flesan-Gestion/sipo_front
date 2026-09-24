<template>
	<Dialog
		v-model:visible="visibleProxy"
		modal
		:closable="false"
		:draggable="false"
		:style="{ width: '28rem' }"
		:breakpoints="{ '640px': '95vw' }"
		@hide="onHide"
	>
		<template #header>
			<span class="font-semibold">{{ title }}</span>
		</template>

		<div class="flex flex-column gap-3">
			<p v-if="message" class="m-0 text-sm text-color-secondary">{{ message }}</p>
			<div class="flex flex-column gap-2">
				<label for="cambio-estado-comentario">Comentario / Observación (*)</label>
				<Textarea
					id="cambio-estado-comentario"
					v-model="comentario"
					rows="4"
					class="w-full"
					:class="{ 'p-invalid': error }"
					placeholder="Ingrese el motivo o observación del cambio de estado"
					autoResize
				/>
				<small v-if="error" class="p-error">{{ error }}</small>
			</div>
		</div>

		<template #footer>
			<div class="flex justify-content-between w-full">
				<Button label="Cancelar" severity="secondary" outlined size="small" :disabled="saving" @click="close" />
				<Button
					:label="confirmLabel"
					:severity="confirmSeverity"
					size="small"
					:loading="saving"
					@click="submit"
				/>
			</div>
		</template>
	</Dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

const props = withDefaults(
	defineProps<{
		visible: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		confirmSeverity?: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
		saving?: boolean;
		requireComentario?: boolean;
	}>(),
	{
		title: 'Cambio de estado',
		message: '',
		confirmLabel: 'Confirmar',
		confirmSeverity: 'info',
		saving: false,
		requireComentario: true,
	}
);

const emit = defineEmits<{
	(e: 'update:visible', value: boolean): void;
	(e: 'confirm', comentario: string): void;
}>();

const comentario = ref('');
const error = ref('');

const visibleProxy = computed({
	get: () => props.visible,
	set: (value: boolean) => emit('update:visible', value),
});

watch(
	() => props.visible,
	(open) => {
		if (open) {
			comentario.value = '';
			error.value = '';
		}
	}
);

const close = () => {
	emit('update:visible', false);
};

const onHide = () => {
	comentario.value = '';
	error.value = '';
};

const submit = () => {
	const text = comentario.value.trim();
	if (props.requireComentario && !text) {
		error.value = 'Debe ingresar un comentario / observación.';
		return;
	}
	error.value = '';
	emit('confirm', text);
};
</script>
