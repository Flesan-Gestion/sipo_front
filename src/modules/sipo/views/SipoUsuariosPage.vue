<template>
	<div class="relative w-full flex-1">
		<FlesanLoaderInline v-if="isPageLoading" class="sipo-page-loader" />
		<div v-show="!isPageLoading" class="absolute top-0 bottom-0 left-0 right-0">
			<DataTable
				:value="usuarios"
				dataKey="id"
				:rows="rowsPerPage"
				scrollable
				paginator
				:paginatorTemplate="dataTableConfig.paginatorTemplate"
				:rowsPerPageOptions="dataTableConfig.rowsPerPageOptions"
				:currentPageReportTemplate="dataTableConfig.currentPageReportTemplate"
				showGridlines
				stripedRows
				class="p-datatable-sm overflow-auto sip-perfiles-table"
				tableStyle="min-width: 50rem"
			>
				<template #empty>
					<div class="w-full flex justify-content-center py-4">
						<span>¡No existen usuarios registrados!</span>
					</div>
				</template>

				<template #header>
					<div class="flex flex-column gap-3 w-full sip-table-header">
						<div class="flex justify-content-between align-items-start flex-wrap gap-2 w-full">
							<div>
								<h4 class="m-0 text-xl font-semibold sip-perfiles-title">
									SOLICITUD DE INCORPORACIÓN PERSONAL
								</h4>
								<small class="text-color-secondary">Configuración de Perfiles de Usuario</small>
							</div>
							<Button
								label="Agregar usuario"
								icon="pi pi-plus"
								severity="success"
								class="sip-btn-add-user"
								@click="openCreate"
							/>
						</div>

						<div class="grid m-0 gap-2 align-items-center sip-filters-row">
							<div class="col-12 md:col-6 lg:col-4 p-0">
								<InputGroup class="w-full">
									<InputGroupAddon>
										<i class="pi pi-search" />
									</InputGroupAddon>
									<InputText
										v-model="searchEmail"
										placeholder="Buscar por correo..."
										@keyup.enter="reload"
									/>
								</InputGroup>
							</div>
							<div class="col-12 md:col-6 lg:col-4 p-0">
								<Dropdown
									v-model="filterRolId"
									:options="rolFilterOptions"
									optionLabel="label"
									optionValue="value"
									placeholder="Filtrar por rol"
									showClear
									class="w-full"
									@change="reload"
								/>
							</div>
						</div>
					</div>
				</template>

				<Column header="" style="width: 4.5rem" bodyClass="text-left">
					<template #body="{ data }">
						<Button
							icon="pi pi-trash"
							severity="danger"
							size="small"
							:loading="deletingId === data.id"
							v-tooltip.top="'Eliminar'"
							@click="confirmDelete(data)"
						/>
					</template>
				</Column>

				<Column field="correo" header="Correo" sortable bodyClass="text-left">
					<template #body="{ data }">
						<span class="lowercase">{{ data.correo }}</span>
					</template>
				</Column>

				<Column header="Rol" bodyClass="text-left" style="min-width: 14rem">
					<template #body="{ data }">
						<Dropdown
							:modelValue="data.rol_id"
							:options="perfiles"
							optionLabel="cf_rol_name"
							optionValue="cf_rol_id"
							class="w-full sip-rol-dropdown"
							:disabled="updatingId === data.id"
							@update:modelValue="(value: number) => onRolChange(data, value)"
						/>
					</template>
				</Column>

				<Column
					header="Razón Social"
					headerClass="sip-col-razon-social text-center"
					bodyClass="sip-col-razon-social text-center"
				>
					<template #body="{ data }">
						<div class="flex justify-content-center align-items-center w-full">
							<span v-if="isAdminUser(data)" class="text-color-secondary">—</span>
							<Button
								v-else
								icon="pi pi-refresh"
								severity="success"
								size="small"
								v-tooltip.top="'Asignar Razón Social / Centros de Costo'"
								@click="openAlcance(data)"
							/>
						</div>
					</template>
				</Column>
			</DataTable>
		</div>

		<SipoUsuarioModal
			v-model:visible="modalVisible"
			:perfiles="perfiles"
			@saved="onModalSaved"
		/>

		<Dialog
			v-model:visible="alcanceVisible"
			modal
			:style="{ width: '36rem' }"
			:breakpoints="{ '640px': '95vw' }"
			:draggable="false"
			@hide="closeAlcance"
		>
			<template #header>
				<span class="sip-modal-title-green">Asignar Razón Social</span>
			</template>

			<div v-if="alcanceUsuario" class="flex flex-column gap-3">
				<small class="text-color-secondary lowercase">{{ alcanceUsuario.correo }}</small>

				<div class="flex flex-column gap-2">
					<label class="sip-label-uppercase">Razones sociales (*)</label>
					<MultiSelect
						v-model="alcanceForm.empresas_ids"
						:options="empresaOptions"
						optionLabel="label"
						optionValue="value"
						filter
						display="chip"
						placeholder="Seleccione razón social"
						class="w-full"
						:loading="loadingMaestros"
						@change="onEmpresasChange"
					/>
				</div>

				<div class="flex flex-column gap-2">
					<label class="sip-label-uppercase">Centros de costo (*)</label>
					<MultiSelect
						v-model="alcanceForm.centros_costo_ids"
						:options="centroOptions"
						optionLabel="label"
						optionValue="value"
						filter
						display="chip"
						placeholder="Seleccione centros de costo"
						class="w-full"
						:disabled="!alcanceForm.empresas_ids.length"
						:loading="loadingMaestros"
					/>
				</div>

				<hr class="sip-modal-divider" />

				<div v-if="assignedEmpresas.length || assignedCentros.length" class="sip-partida-table">
					<div class="sip-partida-header">Lista</div>
					<div
						v-for="item in assignedEmpresas"
						:key="`e-${item.value}`"
						class="sip-partida-row"
					>
						<strong>{{ item.label }}</strong>
						<small class="text-color-secondary">Razón social</small>
					</div>
					<div
						v-for="item in assignedCentros"
						:key="`c-${item.value}`"
						class="sip-partida-row"
					>
						<strong>{{ item.nombre || item.label }}</strong>
						<small class="text-color-secondary">Centro de costo</small>
					</div>
				</div>
				<div v-else class="sip-empty-razones">
					<p class="m-0">¡No existe Razón social Asociada!</p>
				</div>
			</div>

			<template #footer>
				<div class="flex justify-content-between w-full">
					<Button label="Cerrar" severity="secondary" size="small" @click="alcanceVisible = false" />
					<Button
						label="Guardar"
						severity="success"
						size="small"
						:loading="savingAlcance"
						@click="saveAlcance"
					/>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useGlobalStore } from '../../../store/global';
import FlesanLoaderInline from '../../../components/FlesanLoaderInline.vue';
import { DataTableConfigInterface } from '../../../shared/interfaces/datatable-config.interface';
import SipoUsuarioModal from '../components/SipoUsuarioModal.vue';
import { SipoService } from '../services/SipoService';
import { SipoUsuariosService } from '../services/SipoUsuariosService';
import { SipoMaestroEmpresa, SipoPerfilRol, SipoUsuario } from '../sipoConstants';

const ROL_ADMIN = 1;
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

const usuarios = ref<SipoUsuario[]>([]);
const perfiles = ref<SipoPerfilRol[]>([]);
const empresas = ref<SipoMaestroEmpresa[]>([]);
const isPageLoading = ref(false);
const modalVisible = ref(false);
const alcanceVisible = ref(false);
const alcanceUsuario = ref<SipoUsuario | null>(null);
const loadingMaestros = ref(false);
const savingAlcance = ref(false);
const deletingId = ref<number | null>(null);
const updatingId = ref<number | null>(null);
const searchEmail = ref('');
const filterRolId = ref<number | null>(null);
const rowsPerPage = ref(20);

const alcanceForm = reactive({
	empresas_ids: [] as string[],
	centros_costo_ids: [] as string[],
});

const isAdminUser = (row: SipoUsuario) => Number(row.rol_id) === ROL_ADMIN;

const rolFilterOptions = computed(() =>
	perfiles.value.map((rol) => ({
		label: rol.cf_rol_name,
		value: rol.cf_rol_id,
	}))
);

const empresaOptions = computed(() =>
	empresas.value.map((e) => ({
		label: e.nombre,
		value: e.external_code,
		nombre: e.nombre,
	}))
);

const centroOptions = computed(() => {
	const selected = new Set(alcanceForm.empresas_ids);
	const options: { label: string; value: string; nombre: string; empresa_rut: string }[] = [];
	for (const empresa of empresas.value) {
		if (!selected.has(empresa.external_code)) continue;
		for (const uni of empresa.unidades || []) {
			for (const dep of uni.departamentos || []) {
				for (const cc of dep.centros_costo || []) {
					options.push({
						label: `${cc.external_code} — ${cc.nombre}`,
						value: cc.external_code,
						nombre: cc.nombre,
						empresa_rut: empresa.external_code,
					});
				}
			}
		}
	}
	return options;
});

const assignedEmpresas = computed(() =>
	empresaOptions.value.filter((e) => alcanceForm.empresas_ids.includes(e.value))
);

const assignedCentros = computed(() =>
	centroOptions.value.filter((c) => alcanceForm.centros_costo_ids.includes(c.value))
);

const loadPerfiles = async () => {
	const response = await SipoUsuariosService.getPerfiles();
	if (response?.status === 200) {
		perfiles.value = response.data ?? [];
	}
};

const loadMaestros = async () => {
	loadingMaestros.value = true;
	try {
		const response = await SipoService.getMaestros();
		if (response?.status === 200) {
			empresas.value = response.data?.empresas ?? [];
		}
	} finally {
		loadingMaestros.value = false;
	}
};

const load = async (managePageLoader = true) => {
	if (managePageLoader) isPageLoading.value = true;
	try {
		const response = await SipoUsuariosService.getUsuarios({
			search: searchEmail.value.trim() || undefined,
			cf_rol_id: filterRolId.value,
		});
		if (response?.status === 200) {
			usuarios.value = response.data ?? [];
		}
	} finally {
		if (managePageLoader) isPageLoading.value = false;
	}
};

const reload = async () => {
	await load();
};

const openCreate = () => {
	modalVisible.value = true;
};

const onModalSaved = async () => {
	await reload();
};

const onEmpresasChange = () => {
	const allowed = new Set(centroOptions.value.map((c) => c.value));
	alcanceForm.centros_costo_ids = alcanceForm.centros_costo_ids.filter((id) => allowed.has(id));
};

const openAlcance = async (row: SipoUsuario) => {
	alcanceUsuario.value = row;
	alcanceForm.empresas_ids = [...(row.empresas_ids || [])];
	alcanceForm.centros_costo_ids = [...(row.centros_costo_ids || [])];
	alcanceVisible.value = true;
	if (!empresas.value.length) await loadMaestros();
};

const closeAlcance = () => {
	alcanceUsuario.value = null;
	alcanceForm.empresas_ids = [];
	alcanceForm.centros_costo_ids = [];
};

const saveAlcance = async () => {
	if (!alcanceUsuario.value) return;
	if (!alcanceForm.empresas_ids.length || !alcanceForm.centros_costo_ids.length) {
		global.utl.genToast(global.tstType.FORM_ERROR);
		return;
	}

	const empresas_meta: Record<string, string> = {};
	empresaOptions.value.forEach((e) => {
		if (alcanceForm.empresas_ids.includes(e.value)) empresas_meta[e.value] = e.nombre;
	});
	const centros_meta: Record<string, { nombre?: string; empresa_rut?: string }> = {};
	centroOptions.value.forEach((c) => {
		if (alcanceForm.centros_costo_ids.includes(c.value)) {
			centros_meta[c.value] = { nombre: c.nombre, empresa_rut: c.empresa_rut };
		}
	});

	savingAlcance.value = true;
	try {
		const response = await SipoUsuariosService.updateUsuario(alcanceUsuario.value.id, {
			empresas_ids: alcanceForm.empresas_ids,
			centros_costo_ids: alcanceForm.centros_costo_ids,
			empresas_meta,
			centros_meta,
		});
		if (response?.status === 200 && response.data) {
			const idx = usuarios.value.findIndex((u) => u.id === alcanceUsuario.value!.id);
			if (idx >= 0) usuarios.value[idx] = response.data;
			global.utl.genToast(global.tstType.REGISTER_SUCCESS);
			alcanceVisible.value = false;
			return;
		}
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} catch {
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} finally {
		savingAlcance.value = false;
	}
};

const onRolChange = async (row: SipoUsuario, rolId: number) => {
	if (rolId === row.rol_id) return;

	const previousRolId = row.rol_id;
	row.rol_id = rolId;
	updatingId.value = row.id;

	try {
		const response = await SipoUsuariosService.updateRol(row.id, rolId);
		if (response?.status === 200 && response.data) {
			const idx = usuarios.value.findIndex((u) => u.id === row.id);
			if (idx >= 0) usuarios.value[idx] = response.data;
			global.utl.genToast(global.tstType.REGISTER_SUCCESS);
			return;
		}
		row.rol_id = previousRolId;
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} catch {
		row.rol_id = previousRolId;
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} finally {
		updatingId.value = null;
	}
};

const confirmDelete = (row: SipoUsuario) => {
	global.utl.showConfirmation({
		message: `¿Eliminar el perfil de ${row.correo}?`,
		accept: async () => {
			deletingId.value = row.id;
			try {
				const response = await SipoUsuariosService.deleteUsuario(row.id);
				if (response?.status === 200) {
					global.utl.genToast(global.tstType.REGISTER_SUCCESS);
					await load();
					return;
				}
				global.utl.genToast(global.tstType.SERVER_ERROR);
			} finally {
				deletingId.value = null;
			}
		},
		reject: () => {},
	});
};

onMounted(async () => {
	isPageLoading.value = true;
	try {
		await Promise.all([loadPerfiles(), load(false)]);
	} finally {
		isPageLoading.value = false;
	}
});
</script>

<style scoped>
.sip-perfiles-title {
	letter-spacing: 0.02em;
}

.sip-perfiles-table :deep(.p-datatable-thead > tr > th) {
	background-color: #f3f4f6;
	color: #252527;
	font-weight: 600;
	border-color: #e5e7eb;
}

.sip-perfiles-table :deep(.p-datatable-thead > tr > th.sip-col-razon-social) {
	min-width: 11rem;
	white-space: nowrap;
	text-align: center;
}

.sip-perfiles-table :deep(.p-datatable-tbody > tr > td.sip-col-razon-social) {
	min-width: 11rem;
	width: 11rem;
	text-align: center;
}

.sip-btn-add-user {
	border-radius: 0.5rem;
	font-weight: 600;
	padding: 0.5rem 1.25rem;
	white-space: nowrap;
}

.sip-btn-add-user :deep(.p-button-icon) {
	font-size: 0.85rem;
}

.sip-table-header {
	padding-bottom: 0.5rem;
}

.sip-filters-row {
	margin-bottom: 0.25rem;
}

.sip-rol-dropdown :deep(.p-dropdown-label) {
	font-size: 0.85rem;
	padding-top: 0.35rem;
	padding-bottom: 0.35rem;
}

.sip-modal-title-green {
	color: #252527;
	font-weight: 600;
	font-size: 1.1rem;
}

.sip-label-uppercase {
	font-size: 0.8rem;
	font-weight: 600;
	letter-spacing: 0.03em;
}

.sip-modal-divider {
	border: 0;
	border-top: 1px solid #e0e0e0;
	margin: 0.25rem 0 0.5rem;
}

.sip-partida-table {
	border: 1px solid #e0e0e0;
	border-radius: 2px;
	overflow: hidden;
}

.sip-partida-header {
	background-color: #f3f4f6;
	color: #252527;
	text-align: center;
	font-weight: 600;
	padding: 0.55rem 0.75rem;
}

.sip-partida-row {
	display: flex;
	flex-direction: column;
	gap: 0.15rem;
	padding: 0.55rem 0.75rem;
	background: #fff;
	border-bottom: 1px solid #f0f0f0;
}

.sip-partida-row:last-child {
	border-bottom: none;
}

.sip-empty-razones {
	background: #f2dede;
	border: 1px solid #ebccd1;
	color: #a94442;
	padding: 0.75rem 1rem;
	border-radius: 2px;
}
</style>
