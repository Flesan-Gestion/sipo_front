<template>
	<div class="relative w-full flex-1">
		<FlesanLoaderInline v-if="isPageLoading" class="sipo-page-loader" />
		<div v-show="!isPageLoading" class="absolute top-0 bottom-0 left-0 right-0">
			<DataTable
				:value="fichasFiltradas"
				dataKey="id"
				:paginator="fichasFiltradas.length > 10"
				:rows="10"
				scrollable
				showGridlines
				stripedRows
				class="p-datatable-sm overflow-auto ficha-historial-table"
				tableStyle="min-width: 58rem"
			>
				<template #header>
					<div class="flex flex-column gap-3 w-full">
						<div class="flex flex-wrap align-items-center justify-content-between gap-2 w-full">
							<div>
								<h4 class="m-0 text-xl font-semibold">Historial de Fichas</h4>
								<small class="text-color-secondary">Fichas de ingreso personal creadas</small>
							</div>
							<div class="flex gap-2">
								<Button
									label="Crear Nueva Ficha"
									icon="pi pi-plus"
									@click="router.push({ name: 'SipoFichaIngresoCreate' })"
								/>
							</div>
						</div>
						<div class="ficha-filtros flex flex-wrap align-items-end gap-2 w-full">
							<div class="ficha-filtro flex flex-column gap-1">
								<label class="text-sm text-color-secondary">Razón Social</label>
								<Dropdown
									v-model="filterRazonSocial"
									:options="razonSocialFilterOptions"
									optionLabel="label"
									optionValue="value"
									placeholder="Todas"
									showClear
									filter
									class="w-full"
									@change="onRazonSocialFilterChange"
								/>
							</div>
							<div class="ficha-filtro flex flex-column gap-1">
								<label class="text-sm text-color-secondary">Centro de Costo</label>
								<Dropdown
									v-model="filterCentroCosto"
									:options="centroCostoFilterOptions"
									optionLabel="label"
									optionValue="value"
									placeholder="Todos"
									showClear
									filter
									class="w-full"
									:disabled="!filterRazonSocial && !centroCostoFilterOptions.length"
								/>
							</div>
							<div class="ficha-filtro flex flex-column gap-1">
								<label class="text-sm text-color-secondary">Estado</label>
								<Dropdown
									v-model="filterEstado"
									:options="estadoFilterOptions"
									optionLabel="label"
									optionValue="value"
									placeholder="Todos"
									showClear
									class="w-full"
								/>
							</div>
							<div class="ficha-filtro flex flex-column gap-1">
								<label class="text-sm text-color-secondary">Buscar</label>
								<InputGroup class="w-full">
									<InputGroupAddon>
										<i class="pi pi-search" />
									</InputGroupAddon>
									<InputText
										v-model="filterSearch"
										class="w-full"
										placeholder="RUT, nombre, creado por…"
									/>
								</InputGroup>
							</div>
							<Button
								v-if="tieneFiltros"
								label="Limpiar"
								icon="pi pi-filter-slash"
								severity="secondary"
								outlined
								class="ficha-filtro-limpiar"
								@click="limpiarFiltros"
							/>
						</div>
					</div>
				</template>
				<template #empty>
					<div class="w-full flex justify-content-center py-4">
						<span>{{ fichas.length ? 'No hay fichas con esos filtros.' : 'No hay fichas registradas.' }}</span>
					</div>
				</template>
				<Column
					field="id"
					header="ID"
					style="min-width: 5rem"
					headerStyle="text-align: center"
					bodyStyle="text-align: center"
				/>
				<Column field="rut" header="RUT" style="min-width: 8rem">
					<template #body="{ data }">
						<span v-if="esPendienteColaborador(data)" class="text-color-secondary">Esperando colaborador</span>
						<span v-else-if="data.rut">{{ data.rut }}</span>
						<span v-else class="text-color-secondary">Sin asignar</span>
					</template>
				</Column>
				<Column field="nombreColaborador" header="Nombre Colaborador" style="min-width: 14rem">
					<template #body="{ data }">
						<span v-if="esPendienteColaborador(data)" class="text-color-secondary">Esperando colaborador</span>
						<span v-else-if="data.nombreColaborador">{{ data.nombreColaborador }}</span>
						<span v-else class="text-color-secondary">Sin asignar</span>
					</template>
				</Column>
				<Column field="centroCosto" header="Centro Costo" style="min-width: 12rem">
					<template #body="{ data }">
						<span v-if="data.centroCosto">{{ data.centroCosto }}</span>
						<span v-else class="text-color-secondary">Sin asignar</span>
					</template>
				</Column>
				<Column field="razonSocial" header="Razón Social" style="min-width: 14rem">
					<template #body="{ data }">
						<span v-if="data.razonSocial">{{ data.razonSocial }}</span>
						<span v-else class="text-color-secondary">Sin asignar</span>
					</template>
				</Column>
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
							<template v-if="isSupervisor">
								<Button
									v-if="esPendienteColaborador(data)"
									icon="pi pi-qrcode"
									severity="help"
									text
									rounded
									v-tooltip.top="'Ver enlace'"
									@click="onEditarFicha(data)"
								/>
								<Button
									v-else
									icon="pi pi-eye"
									severity="info"
									text
									rounded
									v-tooltip.top="'Ver datos del colaborador'"
									@click="onEditarFicha(data)"
								/>
							</template>
							<template v-else-if="esPendienteColaborador(data)">
								<Button
									icon="pi pi-qrcode"
									severity="help"
									text
									rounded
									v-tooltip.top="'Ver enlace'"
									@click="onEditarFicha(data)"
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
							</template>
							<template v-else-if="esPendienteRrhh(data)">
								<Button
									icon="pi pi-user-edit"
									severity="help"
									text
									rounded
									v-tooltip.top="'Completar datos RRHH'"
									@click="onEditarFicha(data)"
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
							</template>
							<template v-else>
								<Button
									icon="pi pi-eye"
									severity="info"
									text
									rounded
									v-tooltip.top="'Ver ficha'"
									@click="onVerFicha(data)"
								/>
								<Button
									v-if="data.canAprobar && esPendienteJefe(data)"
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
							</template>
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
				<Column field="creadoPor" header="Creado por" style="min-width: 14rem">
					<template #body="{ data }">
						<span v-if="data.creadoPor">{{ data.creadoPor }}</span>
						<span v-else class="text-color-secondary">Sin asignar</span>
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
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../../../store/global';
import { useSecurityStore } from '../../../store/security';
import { RolesEnum } from '../../../shared/enums/roles.enum';
import { ToastSeverityMessageEnum } from '../../../shared/interfaces/toast-message.interface';
import { SipoFichasService } from '../services/SipoFichasService';
import SipoFichaDetalleModal from '../components/SipoFichaDetalleModal.vue';
import FlesanLoaderInline from '../../../components/FlesanLoaderInline.vue';

interface FichaHistorialRow {
	id: number;
	rut: string;
	nombreColaborador: string;
	centroCosto: string;
	centroCostoId: string;
	razonSocial: string;
	razonSocialId: string;
	fechaIngreso: string;
	estado: string;
	estadoLabel: string;
	canAprobar: boolean;
	canEditar: boolean;
	canRetroceder: boolean;
	canEliminar: boolean;
	accionAprobarLabel: string;
	creadoPor: string;
}

const router = useRouter();
const global = useGlobalStore();
const security = useSecurityStore();
const isSupervisor = computed(
	() => Number(security.user?.sip_rol_id) === RolesEnum.SUPERVISOR
);
const isPageLoading = ref(false);
const loading = ref(false);
const aprobandoId = ref<number | null>(null);
const retrocediendoId = ref<number | null>(null);
const eliminandoId = ref<number | null>(null);
const fichas = ref<FichaHistorialRow[]>([]);
const filterSearch = ref('');
const filterEstado = ref<string | null>(null);
const filterRazonSocial = ref<string | null>(null);
const filterCentroCosto = ref<string | null>(null);
const detalleVisible = ref(false);
const detalleId = ref<number | null>(null);

const estadoFilterOptions = [
	{ label: 'Pendiente colaborador', value: 'PENDIENTE_DATOS_COLABORADOR' },
	{ label: 'Pendiente RRHH', value: 'PENDIENTE_RRHH' },
	{ label: 'Pendiente Jefe de Terreno', value: 'PENDIENTE_JEFE_TERRENO' },
	{ label: 'Aprobada', value: 'APROBADA' },
	{ label: 'Rechazada', value: 'RECHAZADA' },
];

const estadoCode = (row: FichaHistorialRow) => String(row.estado || '').toUpperCase();

const razonSocialFilterOptions = computed(() => {
	const map = new Map<string, string>();
	for (const row of fichas.value) {
		const id = String(row.razonSocialId || '').trim();
		const label = String(row.razonSocial || '').trim();
		if (!id && !label) continue;
		const key = id || label;
		if (!map.has(key)) map.set(key, label || id);
	}
	return [...map.entries()]
		.map(([value, label]) => ({ value, label }))
		.sort((a, b) => a.label.localeCompare(b.label, 'es'));
});

const centroCostoFilterOptions = computed(() => {
	const rs = String(filterRazonSocial.value || '').trim();
	const map = new Map<string, string>();
	for (const row of fichas.value) {
		if (rs) {
			const rowRs = String(row.razonSocialId || row.razonSocial || '').trim();
			if (rowRs !== rs) continue;
		}
		const id = String(row.centroCostoId || '').trim();
		const label = String(row.centroCosto || '').trim();
		if (!id && !label) continue;
		const key = id || label;
		if (!map.has(key)) map.set(key, label || id);
	}
	return [...map.entries()]
		.map(([value, label]) => ({ value, label }))
		.sort((a, b) => a.label.localeCompare(b.label, 'es'));
});

const tieneFiltros = computed(
	() =>
		Boolean(filterSearch.value.trim()) ||
		Boolean(filterEstado.value) ||
		Boolean(filterRazonSocial.value) ||
		Boolean(filterCentroCosto.value)
);

const fichasFiltradas = computed(() => {
	const q = filterSearch.value.trim().toLowerCase();
	const estado = String(filterEstado.value || '').toUpperCase();
	const rs = String(filterRazonSocial.value || '').trim();
	const cc = String(filterCentroCosto.value || '').trim();
	return fichas.value.filter((row) => {
		if (estado) {
			const code = estadoCode(row);
			const matchEstado =
				code === estado ||
				(estado === 'PENDIENTE_RRHH' && code === 'PENDIENTE_ADMIN') ||
				(estado === 'PENDIENTE_JEFE_TERRENO' && code === 'PENDIENTE_JEFE') ||
				(estado === 'PENDIENTE_DATOS_COLABORADOR' && code === 'BORRADOR_SUPERVISOR');
			if (!matchEstado) return false;
		}
		if (rs) {
			const rowRs = String(row.razonSocialId || row.razonSocial || '').trim();
			if (rowRs !== rs) return false;
		}
		if (cc) {
			const rowCc = String(row.centroCostoId || row.centroCosto || '').trim();
			if (rowCc !== cc) return false;
		}
		if (!q) return true;
		const haystack = [
			row.id,
			row.rut,
			row.nombreColaborador,
			row.centroCosto,
			row.razonSocial,
			row.estadoLabel,
			row.creadoPor,
			row.fechaIngreso,
		]
			.join(' ')
			.toLowerCase();
		return haystack.includes(q);
	});
});

const onRazonSocialFilterChange = () => {
	if (!filterCentroCosto.value) return;
	const allowed = new Set(centroCostoFilterOptions.value.map((o) => o.value));
	if (!allowed.has(filterCentroCosto.value)) {
		filterCentroCosto.value = null;
	}
};

const limpiarFiltros = () => {
	filterSearch.value = '';
	filterEstado.value = null;
	filterRazonSocial.value = null;
	filterCentroCosto.value = null;
};

const esPendienteColaborador = (row: FichaHistorialRow) => {
	const code = estadoCode(row);
	return code === 'PENDIENTE_DATOS_COLABORADOR' || code === 'BORRADOR_SUPERVISOR';
};

const esPendienteRrhh = (row: FichaHistorialRow) => {
	const code = estadoCode(row);
	return code === 'PENDIENTE_RRHH' || code === 'PENDIENTE_ADMIN';
};

const esPendienteJefe = (row: FichaHistorialRow) => {
	const code = estadoCode(row);
	return code === 'PENDIENTE_JEFE_TERRENO' || code === 'PENDIENTE_JEFE';
};

const formatFecha = (value: string) => {
	const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (!m) return value || '—';
	return `${m[3]}-${m[2]}-${m[1]}`;
};

const estadoSeverity = (estado: string) => {
	switch (String(estado || '').toUpperCase()) {
		case 'PENDIENTE_JEFE_TERRENO':
		case 'PENDIENTE_JEFE':
		case 'PENDIENTE_RRHH':
		case 'PENDIENTE_ADMIN':
		case 'PENDIENTE_DATOS_COLABORADOR':
		case 'BORRADOR_SUPERVISOR':
			return 'warn';
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
			centroCostoId: r.centro_costo_id || '',
			razonSocial: r.razon_social || r.razon_social_nombre || '',
			razonSocialId: r.razon_social_id || '',
			fechaIngreso: r.fecha_ingreso || '',
			estado: r.estado || 'PENDIENTE_JEFE_TERRENO',
			estadoLabel: r.estado_label || 'Pendiente Jefe de Terreno',
			canAprobar: Boolean(r.can_aprobar),
			canEditar: Boolean(r.can_editar ?? isFichaEditable(r.estado)),
			canRetroceder: Boolean(r.can_retroceder),
			canEliminar: Boolean(r.can_eliminar),
			accionAprobarLabel: r.accion_aprobar_label || 'Aprobar',
			creadoPor: r.creado_por || '',
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

.ficha-filtro {
	flex: 1 1 0;
	min-width: 11rem;
}

.ficha-historial-table :deep(.p-datatable-header) {
	padding-bottom: 1.25rem;
	margin-bottom: 0.75rem;
	border-bottom: 1px solid var(--surface-border, #dee2e6);
}

.ficha-filtro-limpiar {
	flex: 0 0 auto;
}
</style>
