<template>
	<div class="sipo-historial-estado border-1 border-round border-200 p-3">
		<h5 class="m-0 mb-3 text-base font-semibold uppercase">Historial de estados</h5>
		<div v-if="!items.length" class="text-sm text-color-secondary">
			Sin cambios de estado registrados.
		</div>
		<ul v-else class="sipo-historial-list m-0 pl-0 list-none flex flex-column gap-3">
			<li
				v-for="row in items"
				:key="row.id"
				class="sipo-historial-item flex flex-column gap-1 pb-3 border-bottom-1 border-200"
			>
				<div class="flex flex-wrap align-items-center gap-2">
					<Tag
						:value="`${row.estado_anterior_label} → ${row.estado_nuevo_label}`"
						severity="secondary"
						class="text-xs"
					/>
					<small class="text-color-secondary">{{ formatFecha(row.fecha_creacion) }}</small>
				</div>
				<small class="font-medium">{{ row.usuario || '—' }}</small>
				<p v-if="row.comentario" class="m-0 text-sm white-space-pre-line">{{ row.comentario }}</p>
				<small v-else class="text-color-secondary">Sin comentario</small>
			</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
import { SipoHistorialEstadoItem } from '../sipoConstants';

defineProps<{
	items: SipoHistorialEstadoItem[];
}>();

const formatFecha = (value: string | null | undefined) => {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString('es-CL', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};
</script>

<style scoped>
.sipo-historial-item:last-child {
	border-bottom: none !important;
	padding-bottom: 0 !important;
}
</style>
