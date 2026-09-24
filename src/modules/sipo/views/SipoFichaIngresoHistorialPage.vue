<template>
	<div class="relative w-full flex-1">
		<FlesanLoaderInline v-if="isPageLoading" class="sipo-page-loader" />
		<div v-show="!isPageLoading" class="absolute top-0 bottom-0 left-0 right-0">
			<DataTable
				:value="fichas"
				dataKey="id"
				:paginator="fichas.length > 10"
				:rows="10"
				scrollable
				showGridlines
				stripedRows
				class="p-datatable-sm overflow-auto"
				tableStyle="min-width: 58rem"
			>
				<template #header>
					<div class="flex flex-wrap align-items-center justify-content-between gap-2 w-full">
						<div>
							<h4 class="m-0 text-xl font-semibold">Historial de Fichas</h4>
							<small class="text-color-secondary">Fichas de ingreso personal creadas</small>
						</div>
						<div class="flex gap-2">
							<Button
								icon="pi pi-refresh"
								severity="secondary"
								outlined
								:loading="loading"
								v-tooltip.top="'Actualizar'"
								@click="loadFichas"
							/>
							<Button
								label="Crear Nueva Ficha"
								icon="pi pi-plus"
								@click="router.push({ name: 'SipoFichaIngresoCreate' })"
							/>
						</div>
					</div>
				</template>
				<template #empty>
					<div class="w-full flex justify-content-center py-4">
						<span>No hay fichas registradas.</span>
					</div>
				</template>
				<Column
					field="id"
					header="ID"
					style="min-width: 5rem"
					headerStyle="text-align: center"
					bodyStyle="text-align: center"
				/>
				<Column field="rut" header="RUT" style="min-width: 8rem" />
				<Column field="nombreColaborador" header="Nombre Colaborador" style="min-width: 14rem" />
				<Column field="centroCosto" header="Centro Costo" style="min-width: 12rem" />
				<Column field="razonSocial" header="Razón Social" style="min-width: 14rem" />
				<Column field="fechaIngreso" header="Fecha Ingreso" style="min-width: 9rem">
					<template #body="{ data }">
						{{ formatFecha(data.fechaIngreso) }}
					</template>
				</Column>
				<Column
					header="Acciones"
					style="min-width: 12rem"
					headerStyle="text-align: center"
					bodyStyle="text-align: center"
				>
					<template #body="{ data }">
						<div class="flex align-items-center justify-content-center gap-1">
							<Button
								icon="pi pi-eye"
								severity="info"
								text
								rounded
								v-tooltip.top="'Ver ficha'"
								@click="onVerFicha(data)"
							/>
							<Button
								v-if="data.canEditar"
								icon="pi pi-pencil"
								severity="warning"
								text
								rounded
								v-tooltip.top="'Editar'"
								@click="onEditarFicha(data)"
							/>
							<Button
								v-if="data.canAprobar"
								icon="pi pi-check"
								severity="success"
								text
								rounded
								:loading="aprobandoId === data.id"
								v-tooltip.top="data.accionAprobarLabel"
								@click="onAprobar(data)"
							/>
							<Button
								v-if="data.canRetroceder"
								icon="pi pi-replay"
								severity="warning"
								text
								rounded
								:loading="retrocediendoId === data.id"
								v-tooltip.top="'Retroceder a pendiente de aprobación'"
								@click="onRetroceder(data)"
							/>
							<Button
								v-if="data.canEliminar"
								icon="pi pi-trash"
								severity="danger"
								text
								rounded
								:loading="eliminandoId === data.id"
								v-tooltip.top="'Eliminar'"
								@click="onEliminar(data)"
							/>
						</div>
					</template>
				</Column>
				<Column
					header="Estado"
					style="min-width: 15rem"
					headerStyle="text-align: center"
					bodyStyle="text-align: center"
				>
					<template #body="{ data }">
						<Tag
							:value="data.estadoLabel"
							:severity="estadoSeverity(data.estado)"
							class="ficha-estado-badge"
						/>
					</template>
				</Column>
			</DataTable>
		</div>

		<SipoFichaDetalleModal
			v-model:visible="detalleVisible"
			:ficha-id="detalleId"
			@eliminada="onFichaEliminada"
			@aprobada="() => loadFichas(false)"
			@retrocedida="() => loadFichas(false)"
		/>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../../../store/global';
import { ToastSeverityMessageEnum } from '../../../shared/interfaces/toast-message.interface';
import { SipoFichasService } from '../services/SipoFichasService';
import SipoFichaDetalleModal from '../components/SipoFichaDetalleModal.vue';
import FlesanLoaderInline from '../../../components/FlesanLoaderInline.vue';

interface FichaHistorialRow {
	id: number;
	rut: string;
	nombreColaborador: string;
	centroCosto: string;
	razonSocial: string;
	fechaIngreso: string;
	estado: string;
	estadoLabel: string;
	canAprobar: boolean;
	canEditar: boolean;
	canRetroceder: boolean;
	canEliminar: boolean;
	accionAprobarLabel: string;
}

const router = useRouter();
const global = useGlobalStore();
const isPageLoading = ref(false);
const loading = ref(false);
const aprobandoId = ref<number | null>(null);
const retrocediendoId = ref<number | null>(null);
const eliminandoId = ref<number | null>(null);
const fichas = ref<FichaHistorialRow[]>([]);
const detalleVisible = ref(false);
const detalleId = ref<number | null>(null);

const formatFecha = (value: string) => {
	const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (!m) return value || '—';
	return `${m[3]}-${m[2]}-${m[1]}`;
};

const estadoSeverity = (estado: string) => {
	switch (String(estado || '').toUpperCase()) {
		case 'PENDIENTE_JEFE_TERRENO':
		case 'PENDIENTE_JEFE':
			return 'warn';
		case 'PENDIENTE_RRHH':
		case 'PENDIENTE_ADMIN':
			return 'info';
		case 'APROBADA':
			return 'success';
		case 'RECHAZADA':
			return 'danger';
		default:
			return 'secondary';
	}
};

const isFichaEditable = (estado: string) => {
	const code = String(estado || '').toUpperCase();
	if (code === 'APROBADA' || code === 'FINALIZADA') return false;
	return (
		code.startsWith('PENDIENTE') ||
		code === 'EN_REVISION' ||
		code === 'PENDIENTE'
	);
};

const normalizeRows = (payload: unknown): any[] => {
	if (Array.isArray(payload)) return payload;
	if (payload && typeof payload === 'object') {
		const obj = payload as Record<string, unknown>;
		if (Array.isArray(obj.items)) return obj.items;
		if (Array.isArray(obj.data)) return obj.data;
	}
	return [];
};

const loadFichas = async (managePageLoader = true) => {
	if (managePageLoader) isPageLoading.value = true;
	loading.value = true;
	try {
		const res = await SipoFichasService.list();
		if (Number(res?.status) !== 200) {
			throw new Error(res?.detail || 'Error al listar fichas');
		}
		const rows = normalizeRows(res.data);
		fichas.value = rows.map((r) => ({
			id: r.id,
			rut: r.rut || '',
			nombreColaborador: r.nombre_colaborador || '',
			centroCosto: r.centro_costo || r.centro_costo_id || '',
			razonSocial: r.razon_social || r.razon_social_nombre || '',
			fechaIngreso: r.fecha_ingreso || '',
			estado: r.estado || 'PENDIENTE_JEFE_TERRENO',
			estadoLabel: r.estado_label || 'Pendiente Jefe de Terreno',
			canAprobar: Boolean(r.can_aprobar),
			canEditar: Boolean(r.can_editar ?? isFichaEditable(r.estado)),
			canRetroceder: Boolean(r.can_retroceder),
			canEliminar: Boolean(r.can_eliminar),
			accionAprobarLabel: r.accion_aprobar_label || 'Aprobar',
		}));
	} catch {
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.ERROR,
			'Historial',
			'No se pudo cargar el historial de fichas.'
		);
		fichas.value = [];
	} finally {
		loading.value = false;
		if (managePageLoader) isPageLoading.value = false;
	}
};

const onVerFicha = (row: FichaHistorialRow) => {
	detalleId.value = row.id;
	detalleVisible.value = true;
};

const onEditarFicha = (row: FichaHistorialRow) => {
	router.push({ name: 'SipoFichaIngresoEdit', params: { id: String(row.id) } });
};

const onFichaEliminada = async () => {
	detalleVisible.value = false;
	detalleId.value = null;
	await loadFichas(false);
};

const onEliminar = (row: FichaHistorialRow) => {
	global.utl.showConfirmation({
		header: 'Eliminar ficha',
		message: `¿Eliminar permanentemente la ficha #${row.id} (${row.nombreColaborador || row.rut})? Esta acción no se puede deshacer.`,
		labelAccept: 'Sí, eliminar',
		labelReject: 'Cancelar',
		accept: async () => {
			eliminandoId.value = row.id;
			try {
				const res = await SipoFichasService.eliminar(row.id);
				if (Number(res?.status) !== 200) {
					throw new Error((res as any)?.detail || 'No se pudo eliminar');
				}
				global.utl.genCustomeToast(
					ToastSeverityMessageEnum.SUCCESS,
					'Eliminar',
					`Ficha #${row.id} eliminada.`
				);
				if (detalleId.value === row.id) {
					detalleVisible.value = false;
					detalleId.value = null;
				}
				await loadFichas(false);
			} catch (err: any) {
				const msg =
					err?.response?.data?.detail ||
					err?.message ||
					`No se pudo eliminar la ficha #${row.id}.`;
				global.utl.genCustomeToast(ToastSeverityMessageEnum.ERROR, 'Eliminar', String(msg));
			} finally {
				eliminandoId.value = null;
			}
		},
		reject: () => {},
	});
};

const onAprobar = (row: FichaHistorialRow) => {
	const estadoPrev = String(row.estado || '').toUpperCase();
	const por =
		estadoPrev.includes('RRHH') || estadoPrev === 'PENDIENTE_ADMIN'
			? 'RRHH'
			: 'Jefe de Terreno';
	global.utl.showConfirmation({
		header: 'Confirmar aprobación',
		message: `¿Aprobar la ficha #${row.id} como ${por}?`,
		labelAccept: 'Sí, aprobar',
		labelReject: 'Cancelar',
		accept: async () => {
			aprobandoId.value = row.id;
			try {
				const res = await SipoFichasService.aprobar(row.id);
				if (Number(res?.status) !== 200) {
					throw new Error((res as any)?.detail || 'No se pudo aprobar');
				}
				global.utl.genCustomeToast(
					ToastSeverityMessageEnum.SUCCESS,
					'Aprobación',
					`Ficha #${row.id} aprobada exitosamente por ${por}.`
				);
				await loadFichas(false);
			} catch (err: any) {
				const msg =
					err?.response?.data?.detail ||
					err?.message ||
					`No se pudo aprobar la ficha #${row.id}.`;
				global.utl.genCustomeToast(ToastSeverityMessageEnum.ERROR, 'Aprobación', String(msg));
			} finally {
				aprobandoId.value = null;
			}
		},
		reject: () => {},
	});
};

const onRetroceder = (row: FichaHistorialRow) => {
	global.utl.showConfirmation({
		header: 'Retroceder aprobación',
		message: `¿Retroceder la ficha #${row.id} a Pendiente Jefe de Terreno para volver a aprobarla?`,
		labelAccept: 'Sí, retroceder',
		labelReject: 'Cancelar',
		accept: async () => {
			retrocediendoId.value = row.id;
			try {
				const res = await SipoFichasService.retroceder(row.id);
				if (Number(res?.status) !== 200) {
					throw new Error((res as any)?.detail || 'No se pudo retroceder');
				}
				global.utl.genCustomeToast(
					ToastSeverityMessageEnum.SUCCESS,
					'Retroceso',
					`Ficha #${row.id} regresó a Pendiente Jefe de Terreno.`
				);
				await loadFichas(false);
			} catch (err: any) {
				const msg =
					err?.response?.data?.detail ||
					err?.message ||
					`No se pudo retroceder la ficha #${row.id}.`;
				global.utl.genCustomeToast(ToastSeverityMessageEnum.ERROR, 'Retroceso', String(msg));
			} finally {
				retrocediendoId.value = null;
			}
		},
		reject: () => {},
	});
};

onMounted(() => {
	loadFichas();
});
</script>

<style scoped>
.ficha-estado-badge {
	font-size: 0.9rem;
	padding: 0.4rem 0.75rem;
	line-height: 1.3;
	white-space: normal;
	text-align: center;
}
</style>
