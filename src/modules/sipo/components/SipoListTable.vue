<template>
	<DataTable
		:value="rows"
		dataKey="cf_rrhh_sip_id"
		lazy
		scrollable
		paginator
		:rows="dataTableConfig.rows"
		:totalRecords="totalRecords"
		:first="(page - 1) * dataTableConfig.rows"
		:paginatorTemplate="dataTableConfig.paginatorTemplate"
		:rowsPerPageOptions="dataTableConfig.rowsPerPageOptions"
		:currentPageReportTemplate="dataTableConfig.currentPageReportTemplate"
		showGridlines
		class="p-datatable-sm overflow-auto sipo-list-datatable"
		tableStyle="min-width: 70rem"
		@page="(event) => emit('page', event)"
	>
		<template #empty>
			<div class="w-full flex justify-content-center py-4">
				<span>No existen solicitudes de incorporación de obra ingresadas.</span>
			</div>
		</template>

		<template #header>
			<div class="flex flex-column gap-3 w-full">
				<div class="flex justify-content-between align-items-start">
					<div>
						<h4 class="m-0 text-xl font-semibold">SOLICITUD DE INCORPORACIÓN PERSONAL EN OBRA</h4>
						<small class="text-color-secondary">Listado histórico de solicitudes</small>
					</div>
					<div class="flex gap-2 flex-shrink-0">
						<Button
							label="Exportar Excel"
							icon="pi pi-download"
							severity="success"
							:loading="isExportingExcel"
							@click="emit('exportExcel')"
						/>
						<Button
							v-if="canCreate"
							label="Nueva Solicitud"
							icon="pi pi-plus"
							severity="success"
							@click="emit('create')"
						/>
					</div>
				</div>

				<div class="sipo-filters-bar flex flex-wrap align-items-center gap-2 mb-4 w-full">
					<Dropdown
						:modelValue="estadoFiltro"
						:options="estadoFiltroOptions"
						optionLabel="label"
						optionValue="value"
						placeholder="Filtrar por estado"
						class="sipo-filter-dropdown"
						@update:modelValue="(value) => emit('update:estadoFiltro', value)"
						@change="emit('serverFilterChange')"
					/>
					<Dropdown
						:modelValue="filterEmpresa"
						:options="empresaFilterOptions"
						optionLabel="label"
						optionValue="value"
						placeholder="Empresa"
						showClear
						filter
						class="sipo-filter-dropdown"
						@update:modelValue="(value) => emit('update:filterEmpresa', value)"
						@change="emit('empresaFilterChange')"
					/>
					<InputGroup class="sipo-search-input">
						<InputGroupAddon>
							<i class="pi pi-search"></i>
						</InputGroupAddon>
						<InputText
							:modelValue="filterText"
							placeholder="Buscar en el listado..."
							@update:modelValue="(value) => emit('update:filterText', value)"
							@keyup.enter="emit('serverFilterChange')"
						/>
					</InputGroup>
				</div>
			</div>
		</template>

		<Column header="ACCIONES" bodyClass="no-wrap-container text-center" headerClass="w-10rem text-center">
			<template #body="{ data }">
				<div class="w-full flex justify-content-center align-items-center gap-1">
					<Button
						icon="pi pi-search"
						severity="danger"
						size="small"
						@click="emit('detail', data.cf_rrhh_sip_id)"
					/>
					<template v-if="canCancel">
						<Button
							v-if="canCancelRow(data.cf_rrhh_sip_status)"
							icon="pi pi-times"
							severity="success"
							size="small"
							v-tooltip.top="'Cancelar solicitud'"
							@click="emit('cancel', data)"
						/>
						<Button
							v-else
							icon="pi pi-times"
							severity="danger"
							size="small"
							disabled
						/>
					</template>
				</div>
			</template>
		</Column>

		<Column header="CARGO" bodyClass="sipo-cargo-cell" headerClass="w-16rem">
			<template #body="{ data }">
				<div class="flex flex-column gap-1">
					<div class="flex align-items-center gap-2 flex-nowrap sipo-cargo-title-row">
						<Tag
							:value="getSipoEstadoConfig(data.cf_rrhh_sip_status).label"
							:severity="getSipoEstadoConfig(data.cf_rrhh_sip_status).severity"
							class="font-bold text-xs white-space-nowrap flex-shrink-0"
						/>
						<span class="font-semibold white-space-nowrap flex-shrink-0">{{ data.cf_rrhh_sip_razonsocial || data.cargo_display }}</span>
					</div>
					<small class="text-color-secondary line-height-2">
						{{ formatSipoCargoSubtext(data) }}
					</small>
				</div>
			</template>
		</Column>

		<Column header="N° SOLICITUD" :sortable="true" bodyClass="no-wrap-container" headerClass="w-8rem">
			<template #body="{ data }">
				Solicitud N° {{ data.cf_rrhh_sip_id }}
			</template>
		</Column>

		<Column
			field="cf_rrhh_sip_adm"
			header="ADM. OBRA"
			:sortable="true"
			bodyClass="no-wrap-container"
			headerClass="w-10rem"
		/>

		<Column
			field="cf_rrhh_sip_as"
			header="ASISTENTE"
			:sortable="true"
			bodyClass="no-wrap-container"
			headerClass="w-10rem"
		/>

		<Column
			field="cf_rrhh_sip_razonsocial"
			header="RAZÓN SOCIAL"
			:sortable="true"
			bodyClass="no-wrap-container"
			headerClass="w-12rem"
		/>

		<Column header="AUDITORÍA" bodyClass="no-wrap-container text-left" headerClass="w-14rem">
			<template #body="{ data }">
				<div class="flex flex-column align-items-start gap-1 text-sm">
					<span>
						Creada: {{ formatAuditDate(data.created_at ?? data.cf_rrhh_sip_create_date) }}
						por {{ data.created_by_email ?? data.cf_rrhh_sip_create_user ?? '—' }}
					</span>
					<span v-if="showClosedAudit(data)" class="text-color-secondary">
						Finalizada: {{ formatAuditDate(data.closed_at) }}
						por {{ data.closed_by_email ?? '—' }}
					</span>
				</div>
			</template>
		</Column>
	</DataTable>
</template>

<script lang="ts" setup>
import { DataTablePageEvent } from 'primevue/datatable';
import { DataTableConfigInterface } from '../../../shared/interfaces/datatable-config.interface';
import {
	estadoFiltroOptions,
	formatSipoCargoSubtext,
	getSipoEstadoConfig,
	SipoEstadoFiltro,
	SipoObraListItem,
} from '../sipoConstants';

defineProps<{
	rows: SipoObraListItem[];
	totalRecords: number;
	page: number;
	dataTableConfig: DataTableConfigInterface;
	estadoFiltro: SipoEstadoFiltro;
	filterText: string;
	filterEmpresa: string | null;
	empresaFilterOptions: { label: string; value: string }[];
	canCreate: boolean;
	canCancel: boolean;
	isExportingExcel: boolean;
	canCancelRow: (status: number | null | undefined) => boolean;
	formatAuditDate: (value?: string | null) => string;
	showClosedAudit: (row: SipoObraListItem) => boolean;
}>();

const emit = defineEmits<{
	page: [event: DataTablePageEvent];
	'update:estadoFiltro': [value: SipoEstadoFiltro];
	'update:filterText': [value: string];
	'update:filterEmpresa': [value: string | null];
	serverFilterChange: [];
	empresaFilterChange: [];
	exportExcel: [];
	create: [];
	detail: [id: number];
	cancel: [row: SipoObraListItem];
}>();
</script>

<style scoped>
.sipo-filters-bar {
	min-width: 0;
}

.sipo-filter-dropdown {
	flex: 0 0 15rem;
	width: 15rem;
	max-width: 100%;
}

.sipo-search-input {
	flex: 0 0 20rem;
	width: 20rem;
	max-width: 100%;
	margin-left: auto;
}

.sipo-filters-bar :deep(.p-dropdown),
.sipo-filters-bar :deep(.p-inputgroup) {
	width: 100%;
}

:deep(.sipo-cargo-cell) {
	white-space: normal;
}

.sipo-cargo-title-row {
	white-space: nowrap;
}

@media screen and (max-width: 767px) {
	.sipo-filters-bar {
		flex-direction: column;
		align-items: stretch;
	}

	.sipo-filter-dropdown,
	.sipo-search-input {
		flex: 1 1 100%;
		width: 100%;
		margin-left: 0;
	}
}
</style>
