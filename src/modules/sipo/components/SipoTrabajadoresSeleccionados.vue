<template>
	<div class="sipo-seleccionados-tab flex flex-column gap-3">
		<div class="flex flex-wrap align-items-center justify-content-between gap-2">
			<h5 class="m-0 text-base font-semibold uppercase">Trabajadores Seleccionados</h5>
			<Button
				icon="pi pi-refresh"
				label="Actualizar"
				severity="secondary"
				outlined
				size="small"
				:loading="loading"
				@click="load"
			/>
		</div>

		<div
			v-if="loading && candidatos.length === 0"
			class="flex flex-column align-items-center justify-content-center gap-3 py-6 surface-50 border-1 border-round border-200"
		>
			<ProgressSpinner style="width: 40px; height: 40px" />
			<span class="text-sm text-color-secondary">Cargando trabajadores seleccionados...</span>
		</div>

		<div
			v-else-if="candidatos.length === 0"
			class="text-center text-color-secondary py-5 border-1 border-round border-200"
		>
			No hay trabajadores seleccionados o contratados.
		</div>

		<div v-else class="seleccionados-table-wrapper border-1 border-round border-200 overflow-auto">
			<table class="seleccionados-table w-full">
				<thead>
					<tr class="seleccionados-table__head">
						<th>Detalle</th>
						<th>Candidato</th>
						<th>Cargo</th>
						<th>Sueldo Líquido</th>
						<th>Sueldo Base</th>
						<th>Copia de Cédula</th>
						<th>Certificado Afiliación AFP</th>
						<th>Certificado de Salud</th>
						<th>Certificado de Domicilio</th>
						<th>Revisión DT</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in candidatos" :key="row.cf_rrhh_sip_obra_candidato_id">
						<td>
							<Button
								icon="pi pi-search"
								severity="info"
								text
								rounded
								class="btn-detalle-candidato"
								v-tooltip.top="'Ver ficha'"
								@click="openDetail(row)"
							/>
						</td>
						<td class="text-left">
							<strong class="candidato-nombre">{{ formatCandidatoNombre(row) }}</strong>
							<div class="candidato-rut">{{ formatRut(row.cf_rrhh_sip_obra_candidato_rut) }}</div>
						</td>
						<td>
							<strong class="candidato-cargo">{{ (row.cf_rrhh_sip_obra_candidato_nomcar || '').toUpperCase() }}</strong>
						</td>
						<td>{{ formatMonto(row.cf_rrhh_sip_obra_candidato_sueldo) }}</td>
						<td>{{ formatMonto(row.cf_rrhh_sip_obra_sueldo_base) }}</td>
						<td><DocCell :url="row.cf_rrhh_sip_obra_candidato_ci" /></td>
						<td><DocCell :url="row.cf_rrhh_sip_obra_candidato_afp" /></td>
						<td><DocCell :url="row.cf_rrhh_sip_obra_candidato_salud" /></td>
						<td><DocCell :url="row.cf_rrhh_sip_obra_candidato_domi" /></td>
						<td>
							<Checkbox
								:modelValue="Boolean(row.revision_dt)"
								:binary="true"
								:disabled="!canToggleDt || togglingId === row.cf_rrhh_sip_obra_candidato_id"
								@update:modelValue="() => onToggleDt(row)"
							/>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<SipoCandidatoModal
			v-model:visible="detailVisible"
			:sip-id="sipId"
			:empresa-rut="empresaRut"
			:candidato="detailCandidato"
			read-only
		/>
	</div>
</template>

<script lang="ts" setup>
import { computed, defineComponent, h, PropType, ref, watch } from 'vue';
import { useGlobalStore } from '../../../store/global';
import { formatRut } from '../../../utils/formatRut';
import { formatMontoCl } from '../../../utils/formatters';
import { SipoService } from '../services/SipoService';
import { SipoCandidatoSeleccionado } from '../sipoConstants';
import SipoCandidatoModal from './SipoCandidatoModal.vue';
import { openCandidatoDocument } from '../utils/openCandidatoDocument';

const DocCell = defineComponent({
	name: 'DocCell',
	props: {
		url: { type: String as PropType<string | null>, default: null },
	},
	setup(props) {
		const hasDoc = computed(() => Boolean((props.url || '').trim()));
		const onOpen = () => {
			void openCandidatoDocument(props.url);
		};
		return () =>
			hasDoc.value
				? h(
						'button',
						{
							type: 'button',
							class: 'doc-ver-btn',
							onClick: onOpen,
						},
						[h('i', { class: 'pi pi-file' }), ' VER']
					)
				: h('span', { class: 'doc-empty' }, 'No adjuntado');
	},
});

const props = defineProps<{
	sipId: number;
	empresaRut?: string | null;
	canToggleDt?: boolean;
}>();

const emit = defineEmits<{
	(e: 'changed', count: number): void;
}>();

const global = useGlobalStore();
const candidatos = ref<SipoCandidatoSeleccionado[]>([]);
const loading = ref(false);
const togglingId = ref<string | null>(null);
const detailVisible = ref(false);
const detailCandidato = ref<SipoCandidatoSeleccionado | null>(null);

const formatCandidatoNombre = (row: SipoCandidatoSeleccionado) => {
	const tratamiento = (row.cf_rrhh_sip_obra_candidato_tratamiento || '').trim();
	const parts = [
		row.cf_rrhh_sip_obra_candidato_nombre,
		row.cf_rrhh_sip_obra_candidato_segundo_nombre,
		row.cf_rrhh_sip_obra_candidato_ap,
		row.cf_rrhh_sip_obra_candidato_am,
	]
		.filter(Boolean)
		.join(' ');
	const nombre = (row.nombre_completo || parts).toUpperCase();
	return tratamiento ? `${tratamiento.toUpperCase()} ${nombre}` : nombre;
};

const formatMonto = (value: string | number | null | undefined) => formatMontoCl(value);

const load = async () => {
	if (!props.sipId || props.sipId <= 0) return;
	loading.value = true;
	try {
		const response = await SipoService.getCandidatosSeleccionados(props.sipId);
		if (response?.status === 200) {
			const rows = Array.isArray(response.data) ? response.data : [];
			candidatos.value = rows;
			emit('changed', rows.length);
			return;
		}
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} finally {
		loading.value = false;
	}
};

watch(
	() => props.sipId,
	(id) => {
		if (id && id > 0) load();
	},
	{ immediate: true },
);

const openDetail = (row: SipoCandidatoSeleccionado) => {
	detailCandidato.value = row;
	detailVisible.value = true;
};

const onToggleDt = async (row: SipoCandidatoSeleccionado) => {
	if (!props.canToggleDt) return;
	togglingId.value = row.cf_rrhh_sip_obra_candidato_id;
	try {
		const response = await SipoService.toggleRevisionDt(row.cf_rrhh_sip_obra_candidato_id);
		if (response?.status === 200 && response.data) {
			const idx = candidatos.value.findIndex(
				(c) => c.cf_rrhh_sip_obra_candidato_id === row.cf_rrhh_sip_obra_candidato_id
			);
			if (idx >= 0) {
				candidatos.value[idx] = response.data;
			}
			return;
		}
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} finally {
		togglingId.value = null;
	}
};

defineExpose({ load });
</script>

<style scoped>
.seleccionados-table {
	border-collapse: collapse;
	font-size: 0.875rem;
}

.seleccionados-table__head th {
	background: #252527;
	color: #fff;
	text-align: center;
	font-weight: 700;
	text-transform: uppercase;
	padding: 0.75rem 1rem;
	border: 1px solid #3a3a3c;
	font-size: 0.8rem;
	letter-spacing: 0.02em;
}

.seleccionados-table tbody td {
	text-align: center;
	padding: 0.75rem 1rem;
	border: 1px solid var(--surface-border);
	color: #252527;
	vertical-align: middle;
}

.candidato-nombre {
	display: block;
	text-transform: uppercase;
	font-weight: 700;
	line-height: 1.35;
}

.candidato-rut {
	color: var(--text-color-secondary);
	font-size: 0.8rem;
	margin-top: 0.15rem;
}

.candidato-cargo {
	text-transform: uppercase;
	font-weight: 700;
}

.doc-ver-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.45rem;
	min-width: 5.5rem;
	padding: 0.45rem 0.75rem;
	border: none;
	border-radius: 4px;
	background: #f39c12;
	color: #fff;
	font-size: 0.8rem;
	font-weight: 600;
	text-decoration: none;
	white-space: nowrap;
	cursor: pointer;
}

.doc-ver-btn:hover {
	background: #e08e0b;
	color: #fff;
}

.doc-empty {
	font-size: 0.8rem;
	color: var(--text-color-secondary);
	font-style: italic;
}

.btn-detalle-candidato {
	width: 2.25rem;
	height: 2.25rem;
}
</style>
