<template>
	<div class="sipo-trabajadores-tab flex flex-column gap-3">
		<div class="flex flex-wrap align-items-center justify-content-between gap-2">
			<h5 class="m-0 text-base font-semibold uppercase">Shortlist de Candidatos</h5>
			<div class="flex gap-2">
				<Button
					v-if="showEnviarAprobacion"
					:label="enviarAprobacionLabel"
					icon="pi pi-send"
					severity="info"
					size="small"
					:loading="sendingApproval"
					@click="confirmEnviarAprobacion"
				/>
				<Button
					v-if="showAprobarContratacion"
					label="APROBAR CONTRATACIÓN"
					icon="pi pi-check-circle"
					class="btn-aprobar-contratacion"
					size="small"
					:loading="approving"
					@click="confirmAprobarContratacion"
				/>
				<Button
					v-if="canEdit"
					label="Agregar Candidato"
					icon="pi pi-plus"
					size="small"
					@click="openCreate"
				/>
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
		</div>

		<div
			v-if="loading && candidatos.length === 0"
			class="flex flex-column align-items-center justify-content-center gap-3 py-6 surface-50 border-1 border-round border-200"
		>
			<ProgressSpinner style="width: 40px; height: 40px" />
			<span class="text-sm text-color-secondary">Cargando shortlist de candidatos...</span>
		</div>

		<div v-else class="shortlist-table-wrapper border-1 border-round border-200 overflow-auto">
			<table class="shortlist-table w-full">
				<thead>
					<tr class="shortlist-table__head">
						<th style="width: 100px">Acciones</th>
						<th class="text-left">Candidato</th>
						<th>Cargo</th>
						<th>Sueldo líquido</th>
						<th>Fecha de Ingreso</th>
						<th>Tipo de contrato</th>
						<th>Duración del contrato</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="loading">
						<td colspan="7" class="text-center py-4">
							<ProgressSpinner style="width: 32px; height: 32px" />
						</td>
					</tr>
					<tr v-else-if="candidatos.length === 0">
						<td colspan="7" class="text-center text-color-secondary py-4">
							No hay candidatos registrados en esta solicitud.
						</td>
					</tr>
					<tr
						v-for="row in candidatos"
						v-else
						:key="row.cf_rrhh_sip_obra_candidato_id"
						class="shortlist-table__row"
					>
						<td>
							<div class="flex flex-row align-items-center justify-content-center gap-2">
								<button
									v-if="canEdit"
									type="button"
									class="action-btn action-btn--edit p-2"
									title="Editar candidato"
									@click="openEdit(row)"
								>
									<i class="pi pi-pencil text-base" />
								</button>
								<button
									v-if="canEdit"
									type="button"
									class="action-btn action-btn--delete p-2"
									title="Eliminar candidato"
									@click="confirmDelete(row)"
								>
									<i class="pi pi-trash text-base" />
								</button>
							</div>
						</td>
						<td class="text-left">
							<strong class="candidato-nombre">{{ displayNombre(row) }}</strong>
							<div class="candidato-rut">{{ formatRut(row.cf_rrhh_sip_obra_candidato_rut) || '-' }}</div>
						</td>
						<td>{{ row.cf_rrhh_sip_obra_candidato_nomcar || '-' }}</td>
						<td>{{ formatSueldo(row.cf_rrhh_sip_obra_candidato_sueldo) }}</td>
						<td>{{ formatDate(row.cf_rrhh_sip_obra_candidato_fecha_ingreso) }}</td>
						<td class="uppercase">{{ row.cf_rrhh_sip_obra_candidato_tipo_contrato || '-' }}</td>
						<td>{{ formatDate(row.cf_rrhh_sip_obra_candidato_termino_contrato) }}</td>
					</tr>
				</tbody>
			</table>
		</div>

		<SipoCandidatoModal
			v-model:visible="showDialog"
			:sip-id="sipId"
			:empresa-rut="empresaRut"
			:cargo-options="cargoOptions"
			:candidato="editingCandidato"
			@saved="load"
		/>

		<SipoCambioEstadoModal
			v-model:visible="cambioEstadoVisible"
			:title="cambioEstadoTitle"
			:message="cambioEstadoMessage"
			:confirm-label="cambioEstadoConfirmLabel"
			:confirm-severity="cambioEstadoSeverity"
			:saving="sendingApproval"
			@confirm="onConfirmCambioEstado"
		/>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useGlobalStore } from '../../../store/global';
import { formatRut } from '../../../utils/formatRut';
import { formatMontoCl } from '../../../utils/formatters';
import { SipoService } from '../services/SipoService';
import {
	SIPO_ESTADOS_APROBAR_CONTRATACION,
	SIPO_STATUS_EN_ESPERA,
	SipoAccionEstado,
	SipoCandidato,
} from '../sipoConstants';
import SipoCambioEstadoModal from './SipoCambioEstadoModal.vue';
import SipoCandidatoModal from './SipoCandidatoModal.vue';

const props = defineProps<{
	sipId: number;
	canEdit: boolean;
	canApproveContratacion?: boolean;
	obraStatus?: number | null;
	accionesEstado?: SipoAccionEstado[];
	cargoOptions?: { label: string; value: string }[];
	empresaRut?: string | null;
}>();

const emit = defineEmits<{
	(e: 'changed', count: number): void;
	(e: 'approved'): void;
	(e: 'estado-changed'): void;
}>();

const global = useGlobalStore();
const candidatos = ref<SipoCandidato[]>([]);
const loading = ref(false);
const approving = ref(false);
const sendingApproval = ref(false);
const showDialog = ref(false);
const editingCandidato = ref<SipoCandidato | null>(null);
const cambioEstadoVisible = ref(false);
const pendingEstadoAction = ref<SipoAccionEstado | null>(null);

const pasarRevisionAction = computed(() =>
	(props.accionesEstado ?? []).find((a) => a.codigo === 'pasar_revision')
);

const cambioEstadoTitle = computed(() => pendingEstadoAction.value?.label || 'Cambio de estado');
const cambioEstadoMessage = computed(() => {
	if (pendingEstadoAction.value?.codigo === 'pasar_revision') {
		return 'La solicitud pasará a estado En Revisión. Indique un comentario / observación.';
	}
	return 'Indique un comentario / observación para el cambio de estado.';
});
const cambioEstadoConfirmLabel = computed(() => pendingEstadoAction.value?.label || 'Confirmar');
const cambioEstadoSeverity = computed(
	() => pendingEstadoAction.value?.severity || 'info'
);

const showAprobarContratacion = computed(() => {
	if (!props.canApproveContratacion) return false;
	if (candidatos.value.length < 1) return false;
	const status = Number(props.obraStatus ?? 0);
	return (SIPO_ESTADOS_APROBAR_CONTRATACION as readonly number[]).includes(status);
});

const showEnviarAprobacion = computed(
	() => Boolean(pasarRevisionAction.value) && candidatos.value.length >= 1
);

const enviarAprobacionLabel = computed(() =>
	Number(props.obraStatus) === SIPO_STATUS_EN_ESPERA
		? 'ENVIAR A APROBACIÓN'
		: pasarRevisionAction.value?.label ?? 'Pasar a Revisión'
);

const displayNombre = (row: SipoCandidato) =>
	(row.nombre_completo || '').trim().toUpperCase() || '-';

const formatDate = (value: string | null | undefined) => {
	if (!value) return '-';
	const raw = String(value).trim();
	const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`;
	const dmy = raw.match(/^(\d{2})-(\d{2})-(\d{4})/);
	if (dmy) return raw.slice(0, 10);
	const date = new Date(raw);
	if (Number.isNaN(date.getTime())) return raw;
	const d = String(date.getDate()).padStart(2, '0');
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const y = date.getFullYear();
	return `${d}-${m}-${y}`;
};

const formatSueldo = (value: string | null | undefined) => formatMontoCl(value, '-');

const load = async () => {
	if (!props.sipId) return;
	loading.value = true;
	try {
		const response = await SipoService.getCandidatos(props.sipId);
		if (response?.status === 200) {
			candidatos.value = response.data ?? [];
			emit('changed', candidatos.value.length);
		}
	} finally {
		loading.value = false;
	}
};

const openCreate = () => {
	editingCandidato.value = null;
	showDialog.value = true;
};

const openEdit = (row: SipoCandidato) => {
	editingCandidato.value = row;
	showDialog.value = true;
};

const confirmDelete = (row: SipoCandidato) => {
	global.utl.showConfirmation({
		message: `¿Eliminar a ${row.nombre_completo || row.cf_rrhh_sip_obra_candidato_rut}?`,
		accept: async () => {
			global.utl.showLoader();
			const response = await SipoService.deleteCandidato(
				props.sipId,
				row.cf_rrhh_sip_obra_candidato_id
			);
			global.utl.hiddenLoader();
			if (response?.status === 200) {
				global.utl.genToast(global.tstType.REGISTER_SUCCESS);
				await load();
				return;
			}
			global.utl.genToast(global.tstType.SERVER_ERROR);
		},
		reject: () => {},
	});
};

const confirmAprobarContratacion = () => {
	const total = candidatos.value.length;
	global.utl.showConfirmation({
		message: `Se procesará la contratación y envío a SAP de todos los candidatos activos en el shortlist (${total} candidato(s)).`,
		accept: async () => {
			approving.value = true;
			global.utl.showLoader();
			try {
				const response = await SipoService.aprobarContratacion(props.sipId);
				if (response?.status === 200) {
					global.utl.genToast(global.tstType.REGISTER_SUCCESS);
					await load();
					emit('approved');
					return;
				}
				global.utl.genToast(global.tstType.SERVER_ERROR);
			} finally {
				approving.value = false;
				global.utl.hiddenLoader();
			}
		},
		reject: () => {},
	});
};

const confirmEnviarAprobacion = () => {
	const action = pasarRevisionAction.value;
	if (!action) return;
	pendingEstadoAction.value = action;
	cambioEstadoVisible.value = true;
};

const onConfirmCambioEstado = async (comentario: string) => {
	const action = pendingEstadoAction.value;
	if (!action) return;
	sendingApproval.value = true;
	global.utl.showLoader();
	try {
		const response = await SipoService.cambiarEstado(
			props.sipId,
			action.nuevo_estado,
			comentario
		);
		if (response?.status === 200) {
			global.utl.genToast(global.tstType.REGISTER_SUCCESS);
			cambioEstadoVisible.value = false;
			pendingEstadoAction.value = null;
			emit('estado-changed');
			return;
		}
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} finally {
		sendingApproval.value = false;
		global.utl.hiddenLoader();
	}
};

watch(
	() => props.sipId,
	() => {
		void load();
	}
);

onMounted(() => {
	void load();
});

defineExpose({ load });
</script>

<style scoped>
.shortlist-table {
	border-collapse: collapse;
	font-size: 0.875rem;
}

.shortlist-table__head th {
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

.shortlist-table tbody td {
	text-align: center;
	padding: 0.75rem 1rem;
	border: 1px solid var(--surface-border);
	color: #252527;
	vertical-align: middle;
}

.shortlist-table__row:nth-child(even) {
	background: var(--surface-50);
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

.action-btn {
	border: none;
	border-radius: 0.25rem;
	color: #fff;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	line-height: 1;
}

.action-btn--edit {
	background-color: #00a65a;
}

.action-btn--delete {
	background-color: #dc2626;
}

:deep(.btn-aprobar-contratacion) {
	background-color: #2563eb !important;
	border-color: #2563eb !important;
}
</style>
