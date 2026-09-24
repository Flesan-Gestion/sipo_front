<template>
	<div class="relative w-full flex-1">
		<FlesanLoaderInline v-if="isPageLoading" class="sipo-page-loader" />
		<div v-show="!isPageLoading" class="absolute top-0 bottom-0 left-0 right-0">
			<DataTable
				:value="cargos"
				dataKey="id"
				:rows="dataTableConfig.rows"
				scrollable
				paginator
				:paginatorTemplate="dataTableConfig.paginatorTemplate"
				:rowsPerPageOptions="dataTableConfig.rowsPerPageOptions"
				:currentPageReportTemplate="dataTableConfig.currentPageReportTemplate"
				showGridlines
				stripedRows
				class="p-datatable-sm overflow-auto sip-config-cargos-table"
				tableStyle="min-width: 40rem"
			>
				<template #empty>
					<div class="w-full flex justify-content-center py-4">
						<span v-if="!empresaId">Seleccione una empresa para gestionar cargos.</span>
						<span v-else>¡No existen cargos asignados para esta empresa!</span>
					</div>
				</template>

				<template #header>
					<div class="flex flex-column gap-3 w-full sip-table-header">
						<div class="flex justify-content-between align-items-start flex-wrap gap-2 w-full">
							<div>
								<h4 class="m-0 text-xl font-semibold text-gray-900 sip-config-title">
									SOLICITUD DE INCORPORACIÓN PERSONAL
								</h4>
								<small class="text-xs text-gray-500 font-semibold">
									Configuración de Cargos por Empresa
								</small>
							</div>
							<div class="flex align-items-center gap-2 flex-shrink-0">
								<Button
									label="Agregar cargo"
									icon="pi pi-plus"
									severity="success"
									class="sip-btn-add-cargo"
									:disabled="!empresaId"
									@click="cargoModalVisible = true"
								/>
							</div>
						</div>

						<div class="grid m-0 gap-2 align-items-center sip-filters-row">
							<div class="col-12 md:col-6 lg:col-4 p-0">
								<Dropdown
									v-model="empresaId"
									:options="empresaOptions"
									optionLabel="label"
									optionValue="value"
									placeholder="Seleccione la empresa a gestionar cargos"
									filter
									showClear
									appendTo="body"
									class="w-full"
									:disabled="isPageLoading"
									:emptyMessage="empresasError || 'No hay empresas disponibles'"
									@change="onEmpresaChange"
								/>
								<small v-if="empresasError" class="text-red-500 mt-1 block">{{ empresasError }}</small>
							</div>
						</div>
					</div>
				</template>

				<Column headerClass="sip-th-center" style="width: 6rem" bodyClass="sip-td-center">
					<template #header>
						<span class="sip-th-label">ACCIONES</span>
					</template>
					<template #body="{ data }">
						<Button
							icon="pi pi-trash"
							severity="danger"
							size="small"
							:disabled="!empresaId"
							v-tooltip.top="'Eliminar'"
							@click="onRemoveCargo(data)"
						/>
					</template>
				</Column>

				<Column headerClass="sip-th-center" bodyClass="sip-td-center">
					<template #header>
						<span class="sip-th-label">NOMBRE CARGO</span>
					</template>
					<template #body="{ data }">
						{{ data.nombre }}
						<span v-if="data.estado" class="text-color-secondary"> ({{ data.estado }})</span>
					</template>
				</Column>
			</DataTable>
		</div>

		<SipoConfigCargoModal
			v-model="cargoModalVisible"
			:catalogo="cargoCatalogo"
			:saving="savingCargo"
			@save="onAssignCargo"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useGlobalStore } from '../../../store/global';
import FlesanLoaderInline from '../../../components/FlesanLoaderInline.vue';
import { DataTableConfigInterface } from '../../../shared/interfaces/datatable-config.interface';
import SipoConfigCargoModal from '../components/SipoConfigCargoModal.vue';
import {
	SipoConfigCargo,
	SipoConfigCargoCatalogo,
	SipoConfigCargosService,
	SipoConfigEmpresa,
} from '../services/SipoConfigCargosService';

const global = useGlobalStore();

const dataTableConfig = ref<DataTableConfigInterface>({
	rows: 20,
	rowsPerPageOptions: [10, 20, 50],
	paginatorTemplate:
		'RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
	currentPageReportTemplate: 'Página {currentPage} de {totalPages}',
	globalFilterFields: [],
	filters: {},
});

const empresaId = ref<string | null>(null);
const empresas = ref<SipoConfigEmpresa[]>([]);
const cargos = ref<SipoConfigCargo[]>([]);
const cargoCatalogo = ref<SipoConfigCargoCatalogo[]>([]);

const isPageLoading = ref(false);
const empresasError = ref('');
const savingCargo = ref(false);
const cargoModalVisible = ref(false);

const empresaOptions = computed(() =>
	empresas.value.map((e) => ({
		label: `${e.razon_social} - (${e.rut})`,
		value: e.id,
	}))
);

const loadEmpresas = async (managePageLoader = true) => {
	if (managePageLoader) isPageLoading.value = true;
	empresasError.value = '';
	try {
		const response = await SipoConfigCargosService.getEmpresas();
		if (response?.status === 200) {
			empresas.value = Array.isArray(response.data) ? response.data : [];
			if (!empresas.value.length) {
				empresasError.value = 'No se encontraron razones sociales en el catálogo.';
			}
			return;
		}
		empresasError.value = `Error al cargar empresas (${response?.status ?? 'desconocido'}).`;
	} catch (error: unknown) {
		console.error('Error GET /api/sipo/config/empresas/:', error);
		const status = (error as { response?: { status?: number } })?.response?.status;
		if (status === 401 || status === 403) {
			empresasError.value = 'No tiene permisos para ver el catálogo de empresas.';
		} else {
			empresasError.value = 'No se pudo cargar el listado de empresas.';
		}
	} finally {
		if (managePageLoader) isPageLoading.value = false;
	}
};

const loadCargos = async () => {
	if (!empresaId.value) return;
	try {
		const response = await SipoConfigCargosService.getCargos(empresaId.value);
		if (response?.status === 200) {
			cargos.value = response.data?.cargos ?? [];
			cargoCatalogo.value = response.data?.catalogo ?? [];
		}
	} catch (error: unknown) {
		console.error('Error GET /api/sipo/config/cargos/:', error);
	}
};

const onEmpresaChange = async () => {
	cargos.value = [];
	if (!empresaId.value) return;
	isPageLoading.value = true;
	try {
		await loadCargos();
	} finally {
		isPageLoading.value = false;
	}
};

const onAssignCargo = async (item: SipoConfigCargoCatalogo) => {
	if (!empresaId.value) return;
	savingCargo.value = true;
	try {
		const response = await SipoConfigCargosService.assignCargo({
			empresa_id: empresaId.value,
			external_code: item.external_code,
			nombre: item.nombre,
			area_personal: item.area_personal,
		});
		if (response?.status === 200) {
			global.utl.genToast(global.tstType.REGISTER_SUCCESS);
			cargoModalVisible.value = false;
			await loadCargos();
		} else {
			global.utl.genToast(global.tstType.SERVER_ERROR);
		}
	} finally {
		savingCargo.value = false;
	}
};

const onRemoveCargo = (row: SipoConfigCargo) => {
	if (!empresaId.value) return;
	global.utl.showConfirmation({
		message: `¿Eliminar el cargo ${row.nombre} de la empresa?`,
		accept: async () => {
			const response = await SipoConfigCargosService.toggleCargo({
				empresa_id: empresaId.value!,
				id: row.id,
				activo: false,
			});
			if (response?.status === 200) {
				global.utl.genToast(global.tstType.REGISTER_SUCCESS);
				await loadCargos();
			} else {
				global.utl.genToast(global.tstType.SERVER_ERROR);
			}
		},
		reject: () => {},
	});
};

onMounted(() => {
	void loadEmpresas();
});
</script>

<style scoped>
.sip-config-title {
	letter-spacing: 0.02em;
}

.sip-config-cargos-table :deep(.p-datatable-thead > tr > th) {
	background-color: #f3f4f6;
	color: #252527;
	font-weight: 600;
	border-color: #e5e7eb;
	text-transform: uppercase;
}

.sip-config-cargos-table :deep(th.sip-th-center),
.sip-config-cargos-table :deep(td.sip-td-center) {
	text-align: center !important;
}

.sip-config-cargos-table :deep(th.sip-th-center .p-column-header-content) {
	display: flex !important;
	justify-content: center !important;
	align-items: center;
	width: 100%;
}

.sip-config-cargos-table :deep(.p-datatable-scrollable .p-datatable-thead > tr > th.sip-th-center) {
	text-align: center !important;
}

.sip-th-label {
	display: block;
	width: 100%;
	text-align: center;
	font-weight: 600;
}

.sip-btn-add-cargo {
	border-radius: 0.5rem;
	font-weight: 600;
	padding: 0.5rem 1.25rem;
	white-space: nowrap;
}

.sip-btn-add-cargo :deep(.p-button-icon) {
	font-size: 0.85rem;
}

.sip-table-header {
	padding-bottom: 0.5rem;
}

.sip-filters-row {
	margin-bottom: 0.25rem;
}
</style>
