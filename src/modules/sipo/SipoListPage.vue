<template>
	<div class="relative w-full flex-1">
		<div class="absolute top-0 bottom-0 left-0 right-0">
			<SipoListTable
				:rows="displayedRows"
				:totalRecords="totalRecords"
				:page="page"
				:dataTableConfig="dataTableConfig"
				v-model:estadoFiltro="estadoFiltro"
				v-model:filterText="filterText"
				v-model:filterEmpresa="filterEmpresa"
				:empresaFilterOptions="empresaFilterOptions"
				:canCreate="canCreate"
				:canCancel="canCancel"
				:isExportingExcel="isExportingExcel"
				:canCancelRow="canCancelRow"
				:formatAuditDate="formatAuditDate"
				:showClosedAudit="showClosedAudit"
				@page="onPage"
				@serverFilterChange="onServerFilterChange"
				@empresaFilterChange="onEmpresaFilterChange"
				@exportExcel="onExportExcel"
				@create="goToCreate"
				@detail="goToDetail"
				@cancel="openCancelModal"
			/>
		</div>

		<SipoCambioEstadoModal
			v-model:visible="cancelModalVisible"
			title="Cancelar solicitud"
			:message="cancelModalMessage"
			confirm-label="Cancelar solicitud"
			confirm-severity="danger"
			:saving="cancelSaving"
			@confirm="onConfirmCancel"
		/>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { DataTablePageEvent } from 'primevue/datatable';
import { useGlobalStore } from '../../store/global';
import { useSipoPermissions } from '../../composables/useSipoPermissions';
import { DataTableConfigInterface } from '../../shared/interfaces/datatable-config.interface';
import { ToastSeverityMessageEnum } from '../../shared/interfaces/toast-message.interface';
import SipoCambioEstadoModal from './components/SipoCambioEstadoModal.vue';
import SipoListTable from './components/SipoListTable.vue';
import { SipoService } from './services/SipoService';
import {
	SipoEstadoFiltro,
	SipoMaestroEmpresa,
	SipoObraListItem,
} from './sipoConstants';

const global = useGlobalStore();
const router = useRouter();
const { canCreate, canCancel, canCancelRow } = useSipoPermissions();

const solicitudes = ref<SipoObraListItem[]>([]);
const estadoFiltro = ref<SipoEstadoFiltro>('Activas');
const filterText = ref('');
const filterEmpresa = ref<string | null>(null);
const isExportingExcel = ref(false);
const page = ref(1);
const totalRecords = ref(0);
const empresas = ref<SipoMaestroEmpresa[]>([]);

const dataTableConfig = ref<DataTableConfigInterface>({
	rows: 10,
	rowsPerPageOptions: [10, 20, 50, 100],
	paginatorTemplate:
		'RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
	currentPageReportTemplate: 'Página {currentPage} de {totalPages}',
	globalFilterFields: [],
	filters: {},
});

const empresaFilterOptions = computed(() =>
	empresas.value.map((e) => ({ label: e.nombre, value: e.external_code }))
);

const displayedRows = computed(() => {
	let rows = solicitudes.value;
	if (filterEmpresa.value) {
		rows = rows.filter((r) => (r.cf_rrhh_sip_rut || '') === filterEmpresa.value);
	}
	return rows;
});

const loadMaestros = async (rut?: string) => {
	const response = await SipoService.getMaestros(rut);
	if (response?.status === 200 && !rut) {
		empresas.value = response.data?.empresas ?? [];
	}
};

const loadList = async () => {
	global.utl.showLoader();
	try {
		const response = await SipoService.getList({
			estado: estadoFiltro.value,
			page: page.value,
			per_page: dataTableConfig.value.rows,
			filterText: filterText.value.trim() || undefined,
		});
		if (response?.status === global.statusCodes.OK || response?.status === 200) {
			solicitudes.value = response.data?.items ?? [];
			totalRecords.value = response.data?.pagination?.total_records ?? response.data?.count ?? 0;
		} else {
			solicitudes.value = [];
			totalRecords.value = 0;
		}
	} finally {
		global.utl.hiddenLoader();
	}
};

const onPage = (event: DataTablePageEvent) => {
	page.value = (event.page ?? 0) + 1;
	dataTableConfig.value.rows = event.rows;
	void loadList();
};

const onServerFilterChange = () => {
	page.value = 1;
	void loadList();
};

const onEmpresaFilterChange = async () => {
	if (filterEmpresa.value) await loadMaestros(filterEmpresa.value);
};

const formatAuditDate = (value?: string | null) => {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();
	return `${day}-${month}-${year}`;
};

const showClosedAudit = (row: SipoObraListItem) => {
	const status = Number(row.cf_rrhh_sip_status);
	if (status !== 10 && status !== 11) return false;
	const closedAt = row.closed_at ?? row.cf_rrhh_sip_status_date;
	const closedBy = row.closed_by_email ?? row.cf_rrhh_sip_status_user;
	return Boolean(closedAt || closedBy);
};

const goToDetail = (id: number) => {
	router.push({ name: 'SipoDetail', params: { id } });
};

const goToCreate = () => {
	router.push({ name: 'SipoCreate' });
};

const onExportExcel = async () => {
	if (isExportingExcel.value) return;
	isExportingExcel.value = true;
	try {
		const blob = await SipoService.exportarExcel({
			estado: estadoFiltro.value,
			filterText: filterText.value || undefined,
			filterEmpresa: filterEmpresa.value || undefined,
		});
		const contentType = String(blob.type || '').toLowerCase();
		if (contentType.includes('application/json')) {
			const detail = await blob.text();
			throw new Error(detail || 'No se pudo exportar el informe Excel.');
		}
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = 'Reporte_SIPO_Obra.xlsx';
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
		URL.revokeObjectURL(url);
	} catch {
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.ERROR,
			'Exportación Excel',
			'No se pudo descargar el informe Excel.'
		);
	} finally {
		isExportingExcel.value = false;
	}
};

const cancelModalVisible = ref(false);
const cancelSaving = ref(false);
const cancelTarget = ref<SipoObraListItem | null>(null);

const cancelModalMessage = computed(() =>
	cancelTarget.value
		? `¿Cancelar la Solicitud N°${cancelTarget.value.cf_rrhh_sip_id}? Indique el motivo.`
		: ''
);

const openCancelModal = (row: SipoObraListItem) => {
	cancelTarget.value = row;
	cancelModalVisible.value = true;
};

const onConfirmCancel = async (comentario: string) => {
	const row = cancelTarget.value;
	if (!row) return;
	cancelSaving.value = true;
	global.utl.showLoader();
	try {
		const response = await SipoService.cancelar(row.cf_rrhh_sip_id, comentario);
		if (response?.status === global.statusCodes.OK || response?.status === 200) {
			global.utl.genToast(global.tstType.REGISTER_SUCCESS);
			cancelModalVisible.value = false;
			cancelTarget.value = null;
			await loadList();
			return;
		}
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} finally {
		cancelSaving.value = false;
		global.utl.hiddenLoader();
	}
};

onMounted(async () => {
	await Promise.all([loadList(), loadMaestros()]);
});
</script>
