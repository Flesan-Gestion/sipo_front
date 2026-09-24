<template>
	<div class="relative w-full flex-1">
		<div class="flex flex-column gap-3 p-3">
			<div class="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-2">
				<div>
					<div class="flex align-items-center gap-2 flex-wrap">
						<h4 class="m-0 text-xl font-semibold">{{ pageTitle }}</h4>
						<Tag
							v-if="!isCreate && detail?.cf_rrhh_sip_status != null"
							:value="getSipoEstadoConfig(detail.cf_rrhh_sip_status).label"
							:severity="getSipoEstadoConfig(detail.cf_rrhh_sip_status).severity"
							class="font-bold text-xs"
						/>
					</div>
					<small class="text-color-secondary">{{ pageSubtitle }}</small>
				</div>
				<div class="flex align-items-center gap-2 flex-wrap">
					<Button
						v-if="showSyncSap"
						label="Sincronizar SAP"
						icon="pi pi-sync"
						severity="help"
						outlined
						:loading="syncingSap"
						@click="onSyncSap"
					/>
					<Button
						v-if="isCreate"
						label="Guardar"
						icon="pi pi-save"
						@click="submit"
					/>
					<Button
						label="Volver al listado"
						icon="pi pi-arrow-left"
						severity="secondary"
						outlined
						@click="goBack"
					/>
				</div>
			</div>

			<TabView
				v-if="!isCreate && detail"
				v-model:activeIndex="activeTab"
				class="sipo-detail-tabs"
				@tab-change="onDetailTabChange"
			>
				<TabPanel header="DATOS">
					<Accordion :activeIndex="0">
						<AccordionTab header="ANTECEDENTES DEL SOLICITANTE">
							<div class="grid formgrid">
								<FormGroup
									:control="form.controls.rut"
									:showRequiredMark="false"
									customClass="field col-12 md:col-6 lg:col-3"
								>
									<template #label>
										<span class="font-bold text-sm">(*) Razón Social</span>
									</template>
									<Dropdown
										v-model="form.controls.rut.value"
										:options="empresaOptions"
										optionLabel="label"
										optionValue="value"
										filter
										showClear
										placeholder="Seleccionar razón social"
										class="w-full"
										:disabled="isHeaderStructureLocked || !canSubmit"
										:class="form.controls.rut.getClass()"
										@change="onEmpresaChange"
									/>
								</FormGroup>

								<FormGroup
									:control="form.controls.uni"
									:showRequiredMark="false"
									customClass="field col-12 md:col-6 lg:col-3"
								>
									<template #label>
										<span class="font-bold text-sm">(*) Unidad de Negocio</span>
									</template>
									<Dropdown
										v-model="form.controls.uni.value"
										:options="unidadOptions"
										optionLabel="label"
										optionValue="value"
										filter
										showClear
										placeholder="Seleccionar unidad de negocio"
										class="w-full"
										:disabled="isHeaderStructureLocked || !canSubmit || !form.controls.rut.value"
										:class="form.controls.uni.getClass()"
										@change="onUnidadChange"
									/>
								</FormGroup>

								<FormGroup
									:control="form.controls.dep"
									:showRequiredMark="false"
									customClass="field col-12 md:col-6 lg:col-3"
								>
									<template #label>
										<span class="font-bold text-sm">(*) Departamento</span>
									</template>
									<Dropdown
										v-model="form.controls.dep.value"
										:options="departamentoOptions"
										optionLabel="label"
										optionValue="value"
										filter
										showClear
										placeholder="Seleccionar departamento"
										class="w-full"
										:disabled="isHeaderStructureLocked || !canSubmit || !form.controls.uni.value"
										:class="form.controls.dep.getClass()"
										@change="onDepartamentoChange"
									/>
								</FormGroup>

								<FormGroup
									:control="form.controls.cc"
									:showRequiredMark="false"
									customClass="field col-12 md:col-6 lg:col-3"
								>
									<template #label>
										<span class="font-bold text-sm">(*) Centro de Costo</span>
									</template>
									<Dropdown
										v-model="form.controls.cc.value"
										:options="centroOptions"
										optionLabel="label"
										optionValue="value"
										filter
										showClear
										placeholder="Seleccionar centro de costo"
										class="w-full"
										:disabled="isHeaderStructureLocked || !canSubmit || !form.controls.dep.value"
										:class="form.controls.cc.getClass()"
										@change="onCentroChange"
									/>
								</FormGroup>

								<FormGroup
									:control="form.controls.adm"
									:showRequiredMark="false"
									customClass="field col-12 md:col-6 lg:col-3"
								>
									<template #label>
										<span class="font-bold text-sm">(*) Administrador de Obra</span>
									</template>
									<InputText
										v-model="form.controls.adm.value"
										type="email"
										class="w-full"
										:disabled="isHeaderStructureLocked || !canSubmit"
										:class="form.controls.adm.getClass()"
										placeholder="correo@empresa.cl"
										maxlength="100"
									/>
									<small class="sipo-field-hint">
										DEBE INGRESAR EL CORREO DEL ADMINISTRADOR DE OBRA DE LA UNIDAD
									</small>
								</FormGroup>

								<FormGroup
									:control="form.controls.asistente"
									:showRequiredMark="false"
									customClass="field col-12 md:col-6 lg:col-3"
								>
									<template #label>
										<span class="font-bold text-sm">(*) Asistente</span>
									</template>
									<InputGroup class="w-full sipo-input-group">
										<InputText
											v-model="form.controls.asistente.value"
											type="email"
											class="w-full"
											:disabled="!canEditPartialHeader"
											:class="form.controls.asistente.getClass()"
											placeholder="correo@empresa.cl"
											maxlength="100"
										/>
										<Button
											v-if="canEditPartialHeader"
											icon="pi pi-check"
											severity="success"
											:loading="savingAsistente"
											:disabled="savingAsistente"
											@click="guardarAsistente"
										/>
									</InputGroup>
									<small class="sipo-field-hint">
										DEBE INGRESAR EL CORREO DEL ASISTENTE DE LA UNIDAD
									</small>
								</FormGroup>

								<FormGroup
									:control="form.controls.ubicacion"
									:showRequiredMark="false"
									customClass="field col-12 md:col-6 lg:col-3"
								>
									<template #label>
										<span class="font-bold text-sm">(*) Ubicación</span>
									</template>
									<InputGroup class="w-full sipo-input-group">
										<Dropdown
											v-model="form.controls.ubicacion.value"
											:options="ubicacionOptions"
											optionLabel="label"
											optionValue="value"
											filter
											showClear
											placeholder="Seleccionar ubicación"
											class="flex-1 w-full"
											:disabled="!canEditPartialHeader || !form.controls.rut.value"
											:class="form.controls.ubicacion.getClass()"
										/>
										<Button
											v-if="canEditPartialHeader"
											icon="pi pi-check"
											severity="success"
											:loading="savingUbicacion"
											:disabled="savingUbicacion"
											@click="guardarUbicacion"
										/>
									</InputGroup>
								</FormGroup>
							</div>
						</AccordionTab>
					</Accordion>

					<div class="mt-3">
						<SipoHistorialEstadoPanel :items="detail?.historial ?? []" />
					</div>
				</TabPanel>

				<TabPanel header="TRABAJADORES">
					<SipoCandidatosPanel
						:sip-id="sipId"
						:can-edit="canSubmit"
						:can-approve-contratacion="canApprove"
						:obra-status="detail?.cf_rrhh_sip_status ?? null"
						:acciones-estado="detail?.acciones_estado ?? []"
						:cargo-options="cargoOptions"
						:empresa-rut="form.controls.rut.value || detail?.cf_rrhh_sip_rut || null"
						@changed="onCandidatosChanged"
						@approved="onContratacionAprobada"
						@estado-changed="onEstadoChanged"
					/>
				</TabPanel>

				<TabPanel v-if="showTabSeleccionados" header="TRABAJADORES SELECCIONADOS">
					<SipoTrabajadoresSeleccionados
						ref="seleccionadosPanelRef"
						:sip-id="sipId"
						:empresa-rut="form.controls.rut.value || detail?.cf_rrhh_sip_rut || null"
						:can-toggle-dt="canApprove"
						@changed="onSeleccionadosChanged"
					/>
				</TabPanel>
			</TabView>

			<div v-else-if="!isCreate && !loading" class="text-color-secondary">
				No se encontró la solicitud solicitada.
			</div>

			<Accordion v-else-if="isCreate" :activeIndex="0">
				<AccordionTab header="ANTECEDENTES DEL SOLICITANTE">
					<div class="grid formgrid">
						<FormGroup
							:control="form.controls.rut"
							:showRequiredMark="false"
							customClass="field col-12 md:col-6 lg:col-3"
						>
							<template #label>
								<span class="font-bold text-sm">(*) Razón Social</span>
							</template>
							<Dropdown
								v-model="form.controls.rut.value"
								:options="empresaOptions"
								optionLabel="label"
								optionValue="value"
								filter
								showClear
								placeholder="Seleccionar razón social"
								class="w-full"
								:disabled="!canSubmit"
								:class="form.controls.rut.getClass()"
								@change="onEmpresaChange"
							/>
						</FormGroup>

						<FormGroup
							:control="form.controls.uni"
							:showRequiredMark="false"
							customClass="field col-12 md:col-6 lg:col-3"
						>
							<template #label>
								<span class="font-bold text-sm">(*) Unidad de Negocio</span>
							</template>
							<Dropdown
								v-model="form.controls.uni.value"
								:options="unidadOptions"
								optionLabel="label"
								optionValue="value"
								filter
								showClear
								placeholder="Seleccionar unidad de negocio"
								class="w-full"
								:disabled="!canSubmit || !form.controls.rut.value"
								:class="form.controls.uni.getClass()"
								@change="onUnidadChange"
							/>
						</FormGroup>

						<FormGroup
							:control="form.controls.dep"
							:showRequiredMark="false"
							customClass="field col-12 md:col-6 lg:col-3"
						>
							<template #label>
								<span class="font-bold text-sm">(*) Departamento</span>
							</template>
							<Dropdown
								v-model="form.controls.dep.value"
								:options="departamentoOptions"
								optionLabel="label"
								optionValue="value"
								filter
								showClear
								placeholder="Seleccionar departamento"
								class="w-full"
								:disabled="!canSubmit || !form.controls.uni.value"
								:class="form.controls.dep.getClass()"
								@change="onDepartamentoChange"
							/>
						</FormGroup>

						<FormGroup
							:control="form.controls.cc"
							:showRequiredMark="false"
							customClass="field col-12 md:col-6 lg:col-3"
						>
							<template #label>
								<span class="font-bold text-sm">(*) Centro de Costo</span>
							</template>
							<Dropdown
								v-model="form.controls.cc.value"
								:options="centroOptions"
								optionLabel="label"
								optionValue="value"
								filter
								showClear
								placeholder="Seleccionar centro de costo"
								class="w-full"
								:disabled="!canSubmit || !form.controls.dep.value"
								:class="form.controls.cc.getClass()"
								@change="onCentroChange"
							/>
						</FormGroup>

						<FormGroup
							:control="form.controls.adm"
							:showRequiredMark="false"
							customClass="field col-12 md:col-6 lg:col-3"
						>
							<template #label>
								<span class="font-bold text-sm">(*) Administrador de Obra</span>
							</template>
							<InputText
								v-model="form.controls.adm.value"
								type="email"
								class="w-full"
								:disabled="!canSubmit"
								:class="form.controls.adm.getClass()"
								placeholder="correo@empresa.cl"
								maxlength="100"
							/>
							<small class="sipo-field-hint">
								DEBE INGRESAR EL CORREO DEL ADMINISTRADOR DE OBRA DE LA UNIDAD
							</small>
						</FormGroup>

						<FormGroup
							:control="form.controls.asistente"
							:showRequiredMark="false"
							customClass="field col-12 md:col-6 lg:col-3"
						>
							<template #label>
								<span class="font-bold text-sm">(*) Asistente</span>
							</template>
							<InputText
								v-model="form.controls.asistente.value"
								type="email"
								class="w-full"
								:disabled="!canSubmit"
								:class="form.controls.asistente.getClass()"
								placeholder="correo@empresa.cl"
								maxlength="100"
							/>
							<small class="sipo-field-hint">
								DEBE INGRESAR EL CORREO DEL ASISTENTE DE LA UNIDAD
							</small>
						</FormGroup>

						<FormGroup
							:control="form.controls.ubicacion"
							:showRequiredMark="false"
							customClass="field col-12 md:col-6 lg:col-3"
						>
							<template #label>
								<span class="font-bold text-sm">(*) Ubicación</span>
							</template>
							<Dropdown
								v-model="form.controls.ubicacion.value"
								:options="ubicacionOptions"
								optionLabel="label"
								optionValue="value"
								filter
								showClear
								placeholder="Seleccionar ubicación"
								class="w-full"
								:disabled="!canSubmit || !form.controls.rut.value"
								:class="form.controls.ubicacion.getClass()"
							/>
						</FormGroup>
					</div>
				</AccordionTab>
			</Accordion>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSipoPermissions } from '../../../composables/useSipoPermissions';
import { useGlobalStore } from '../../../store/global';
import { EssentialForm } from '../../../shared/classes/EssentialForm';
import { ToastSeverityMessageEnum } from '../../../shared/interfaces/toast-message.interface';
import SipoCandidatosPanel from '../components/SipoCandidatosPanel.vue';
import SipoHistorialEstadoPanel from '../components/SipoHistorialEstadoPanel.vue';
import SipoTrabajadoresSeleccionados from '../components/SipoTrabajadoresSeleccionados.vue';
import { SipoService } from '../services/SipoService';
import {
	EXTERNAL_CODE_PAIS_CHILE,
	EXTERNAL_CODE_PAIS_GRUPO_2,
	getSipoEstadoConfig,
	SipoMaestroEmpresa,
	SipoObraDetail,
	SipoObraWritePayload,
} from '../sipoConstants';

const global = useGlobalStore();
const route = useRoute();
const router = useRouter();
const { canApprove } = useSipoPermissions();

const isCreate = computed(() => route.name === 'SipoCreate' || route.path.endsWith('/nueva'));
const sipId = computed(() => Number(route.params.id || 0));
const pageTitle = computed(() =>
	isCreate.value ? 'Nueva Solicitud de Incorporación Personal' : `Solicitud de Obra N° ${sipId.value}`
);
const pageSubtitle = computed(() =>
	isCreate.value
		? 'Complete los antecedentes del solicitante para iniciar el proceso de obra'
		: 'Detalle de la solicitud de incorporación de obra'
);

const showTabSeleccionados = computed(() => {
	const count = detail.value?.candidatos_seleccionados_count ?? 0;
	const status = detail.value?.cf_rrhh_sip_status ?? 0;
	const closed = status === 8 || status === 10 || status === 11;
	return count > 0 || closed;
});

const showSyncSap = computed(() => {
	if (isCreate.value || !canApprove.value || !detail.value) return false;
	const status = Number(detail.value.cf_rrhh_sip_status ?? 0);
	const seleccionados = Number(detail.value.candidatos_seleccionados_count ?? 0);
	return status === 8 || status === 10 || status === 11 || seleccionados > 0;
});

const seleccionadosTabIndex = computed(() => (showTabSeleccionados.value ? 2 : -1));

const onDetailTabChange = (event: { index: number }) => {
	if (event.index === seleccionadosTabIndex.value) {
		seleccionadosPanelRef.value?.load?.();
	}
};

const isHeaderStructureLocked = computed(() => !isCreate.value);
const canEditPartialHeader = computed(() => !isCreate.value && canSubmit.value);

const detail = ref<SipoObraDetail | null>(null);
const loading = ref(false);
const syncingSap = ref(false);
const savingAsistente = ref(false);
const savingUbicacion = ref(false);
const canSubmit = ref(true);
const activeTab = ref(0);
const seleccionadosPanelRef = ref<InstanceType<typeof SipoTrabajadoresSeleccionados> | null>(null);
const empresas = ref<SipoMaestroEmpresa[]>([]);
const selectedPais = ref(EXTERNAL_CODE_PAIS_GRUPO_2);
const ubicaciones = ref<{ external_code: string; nombre: string }[]>([]);
const cargos = ref<{ external_code: string; nombre: string }[]>([]);

const form = reactive<EssentialForm>(
	global.sstForm({
		rut: global.sstFormControl(null, [global.sstRule.REQUIRED]),
		razonsocial: global.sstFormControl(null, [global.sstRule.REQUIRED]),
		uni: global.sstFormControl(null, [global.sstRule.REQUIRED]),
		nombre_uni: global.sstFormControl(null, [global.sstRule.REQUIRED]),
		dep: global.sstFormControl(null, [global.sstRule.REQUIRED]),
		nombre_dep: global.sstFormControl(null, [global.sstRule.REQUIRED]),
		cc: global.sstFormControl(null, [global.sstRule.REQUIRED]),
		nombre_cc: global.sstFormControl(null, [global.sstRule.REQUIRED]),
		adm: global.sstFormControl(null, [global.sstRule.REQUIRED, global.sstRule.EMAIL]),
		asistente: global.sstFormControl(null, [global.sstRule.REQUIRED, global.sstRule.EMAIL]),
		ubicacion: global.sstFormControl(null, [global.sstRule.REQUIRED]),
	})
);

const empresaOptions = computed(() =>
	empresas.value.map((e) => ({ label: e.nombre, value: e.external_code }))
);

const selectedEmpresa = computed(() =>
	empresas.value.find((e) => e.external_code === form.controls.rut.value) || null
);

const unidadOptions = computed(() =>
	(selectedEmpresa.value?.unidades ?? []).map((u) => ({
		label: u.nombre || u.external_code,
		value: u.external_code,
	}))
);

const selectedUnidad = computed(() =>
	selectedEmpresa.value?.unidades.find((u) => u.external_code === form.controls.uni.value) || null
);

const departamentoOptions = computed(() =>
	(selectedUnidad.value?.departamentos ?? []).map((d) => ({
		label: d.nombre || d.external_code,
		value: d.external_code,
	}))
);

const selectedDepartamento = computed(() =>
	selectedUnidad.value?.departamentos.find((d) => d.external_code === form.controls.dep.value) || null
);

const centroOptions = computed(() =>
	(selectedDepartamento.value?.centros_costo ?? []).map((c) => ({
		label: `${c.external_code} ${c.nombre}`.trim(),
		value: c.external_code,
	}))
);

const ubicacionOptions = computed(() =>
	ubicaciones.value.map((u) => ({ label: u.nombre, value: u.external_code || u.nombre }))
);

const cargoOptions = computed(() =>
	cargos.value.map((c) => ({ label: c.nombre, value: c.nombre || c.external_code }))
);

const loadMaestros = async (rut?: string, pais?: string) => {
	const paisActivo = pais || selectedPais.value;
	const response = await SipoService.getMaestros(rut, paisActivo);
	if (response?.status === 200) {
		empresas.value = response.data?.empresas ?? [];
		ubicaciones.value = response.data?.ubicaciones ?? [];
		cargos.value = response.data?.cargos ?? [];
	}
};

const loadCreatePage = async () => {
	detail.value = null;
	canSubmit.value = true;
	activeTab.value = 0;
	selectedPais.value = EXTERNAL_CODE_PAIS_GRUPO_2;
	form.reset();
	global.utl.showLoader();
	try {
		await loadMaestros(undefined, EXTERNAL_CODE_PAIS_GRUPO_2);
	} catch {
		empresas.value = [];
		ubicaciones.value = [];
		cargos.value = [];
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} finally {
		global.utl.hiddenLoader();
	}
};

const onEmpresaChange = async () => {
	const empresa = selectedEmpresa.value;
	form.set('razonsocial', empresa?.nombre ?? null);
	form.set('uni', null);
	form.set('nombre_uni', null);
	form.set('dep', null);
	form.set('nombre_dep', null);
	form.set('cc', null);
	form.set('nombre_cc', null);
	form.set('ubicacion', null);
	if (isCreate.value) {
		selectedPais.value = EXTERNAL_CODE_PAIS_GRUPO_2;
	}
	if (empresa?.external_code) {
		await loadMaestros(empresa.external_code, selectedPais.value);
	} else {
		cargos.value = [];
		ubicaciones.value = [];
	}
};

const onUnidadChange = () => {
	form.set('nombre_uni', selectedUnidad.value?.nombre ?? null);
	form.set('dep', null);
	form.set('nombre_dep', null);
	form.set('cc', null);
	form.set('nombre_cc', null);
};

const onDepartamentoChange = () => {
	form.set('nombre_dep', selectedDepartamento.value?.nombre ?? null);
	form.set('cc', null);
	form.set('nombre_cc', null);
};

const onCentroChange = () => {
	const centro = selectedDepartamento.value?.centros_costo.find(
		(c) => c.external_code === form.controls.cc.value
	);
	form.set('nombre_cc', centro?.nombre ?? null);
};

const buildPayload = (): SipoObraWritePayload => ({
	cf_rrhh_sip_rut: form.get('rut'),
	cf_rrhh_sip_razonsocial: form.get('razonsocial'),
	cf_rrhh_sip_uni: form.get('uni'),
	cf_rrhh_sip_nombre_uni: form.get('nombre_uni'),
	cf_rrhh_sip_dep: form.get('dep'),
	cf_rrhh_sip_nombre_dep: form.get('nombre_dep'),
	cf_rrhh_sip_cc: form.get('cc'),
	cf_rrhh_sip_nombre_cc: form.get('nombre_cc'),
	cf_rrhh_sip_adm: form.get('adm'),
	cf_rrhh_sip_as: form.get('asistente'),
	cf_rrhh_sip_ubicacion: form.get('ubicacion'),
	external_code_pais: isCreate.value ? EXTERNAL_CODE_PAIS_GRUPO_2 : selectedPais.value,
});

const resolvePaisForDetail = async (item: SipoObraDetail) => {
	selectedPais.value = EXTERNAL_CODE_PAIS_CHILE;
	await loadMaestros(item.cf_rrhh_sip_rut || undefined, EXTERNAL_CODE_PAIS_CHILE);
	const foundChile = empresas.value.some((e) => e.external_code === item.cf_rrhh_sip_rut);
	if (foundChile) return;
	selectedPais.value = EXTERNAL_CODE_PAIS_GRUPO_2;
	await loadMaestros(item.cf_rrhh_sip_rut || undefined, EXTERNAL_CODE_PAIS_GRUPO_2);
};

const fillFromDetail = async (item: SipoObraDetail) => {
	detail.value = item;
	canSubmit.value = Boolean(item.can_edit);
	await resolvePaisForDetail(item);
	form.matchValue({
		rut: item.cf_rrhh_sip_rut,
		razonsocial: item.cf_rrhh_sip_razonsocial,
		uni: item.cf_rrhh_sip_uni,
		nombre_uni: item.cf_rrhh_sip_nombre_uni,
		dep: item.cf_rrhh_sip_dep,
		nombre_dep: item.cf_rrhh_sip_nombre_dep,
		cc: item.cf_rrhh_sip_cc,
		nombre_cc: item.cf_rrhh_sip_nombre_cc,
		adm: item.cf_rrhh_sip_adm,
		asistente: item.cf_rrhh_sip_as,
		ubicacion: item.cf_rrhh_sip_ubicacion,
	});
};

const loadDetail = async () => {
	loading.value = true;
	detail.value = null;
	global.utl.showLoader();
	try {
		const response = await SipoService.getById(sipId.value);
		if (response?.status === 200 && response.data) {
			await fillFromDetail(response.data);
			return;
		}
		global.utl.genToast(global.tstType.SERVER_ERROR);
		goBack();
	} finally {
		loading.value = false;
		global.utl.hiddenLoader();
	}
};

const onCandidatosChanged = (count: number) => {
	if (detail.value) {
		detail.value = { ...detail.value, candidatos_count: count };
	}
};

const onSeleccionadosChanged = (count: number) => {
	if (detail.value) {
		detail.value = { ...detail.value, candidatos_seleccionados_count: count };
	}
};

const onContratacionAprobada = async () => {
	await reloadDetail();
	seleccionadosPanelRef.value?.load?.();
};

const onSyncSap = async () => {
	if (!sipId.value) return;
	syncingSap.value = true;
	try {
		const response = await SipoService.syncSap(sipId.value);
		if (response?.status === 200) {
			global.utl.genCustomeToast(
				ToastSeverityMessageEnum.SUCCESS,
				'SAP SuccessFactors',
				String(response.data?.message || 'Sincronización con SAP ejecutada correctamente')
			);
			await reloadDetail();
			seleccionadosPanelRef.value?.load?.();
			return;
		}
		const detailMsg =
			(response as any)?.detail ||
			(response as any)?.data?.detail ||
			'No se pudo sincronizar con SAP.';
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.ERROR,
			'SAP SuccessFactors',
			String(detailMsg)
		);
	} catch (err: any) {
		const msg =
			err?.response?.data?.detail ||
			err?.message ||
			'Error de conexión con SAP.';
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.ERROR,
			'SAP SuccessFactors',
			String(msg)
		);
	} finally {
		syncingSap.value = false;
	}
};

const onEstadoChanged = async () => {
	await reloadDetail();
};

const reloadDetail = async () => {
	if (!sipId.value) return;
	const response = await SipoService.getById(sipId.value);
	if (response?.status === 200 && response.data) {
		await fillFromDetail(response.data);
	}
};

const guardarAsistente = async () => {
	const asistente = String(form.get('asistente') || '').trim();
	if (!asistente) {
		global.utl.genToast(global.tstType.FORM_ERROR);
		return;
	}

	savingAsistente.value = true;
	try {
		const response = await SipoService.update(sipId.value, { cf_rrhh_sip_as: asistente });
		if (response?.status === 200 && response.data) {
			if (detail.value) {
				detail.value = { ...detail.value, cf_rrhh_sip_as: response.data.cf_rrhh_sip_as };
			}
			form.matchValue({ asistente: response.data.cf_rrhh_sip_as });
			global.utl.genCustomeToast(
				ToastSeverityMessageEnum.SUCCESS,
				'Actualización exitosa',
				'Asistente actualizado correctamente'
			);
			return;
		}
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} finally {
		savingAsistente.value = false;
	}
};

const guardarUbicacion = async () => {
	const ubicacion = String(form.get('ubicacion') || '').trim();
	if (!ubicacion) {
		global.utl.genToast(global.tstType.FORM_ERROR);
		return;
	}

	savingUbicacion.value = true;
	try {
		const response = await SipoService.update(sipId.value, { cf_rrhh_sip_ubicacion: ubicacion });
		if (response?.status === 200 && response.data) {
			if (detail.value) {
				detail.value = { ...detail.value, cf_rrhh_sip_ubicacion: response.data.cf_rrhh_sip_ubicacion };
			}
			form.matchValue({ ubicacion: response.data.cf_rrhh_sip_ubicacion });
			global.utl.genCustomeToast(
				ToastSeverityMessageEnum.SUCCESS,
				'Actualización exitosa',
				'Ubicación actualizada correctamente'
			);
			return;
		}
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} finally {
		savingUbicacion.value = false;
	}
};

const savePayload = async () => {
	global.utl.showLoader();
	const payload = buildPayload();
	const response = isCreate.value
		? await SipoService.create(payload)
		: await SipoService.update(sipId.value, payload);
	global.utl.hiddenLoader();

	if (response?.status === 200 && response.data) {
		global.utl.genToast(global.tstType.REGISTER_SUCCESS);
		router.push({ name: 'SipoDetail', params: { id: response.data.cf_rrhh_sip_id } });
		if (!isCreate.value) {
			await fillFromDetail(response.data);
		}
		return;
	}
	global.utl.genToast(global.tstType.SERVER_ERROR);
};

const submit = async () => {
	if (!form.validateAll()) {
		global.utl.genToast(global.tstType.FORM_ERROR);
		return;
	}
	if (isCreate.value) {
		global.utl.showConfirmation({
			header: 'Confirmar creación',
			message: '¿Desea crear la solicitud de obra?',
			accept: () => {
				void savePayload();
			},
			reject: () => {},
		});
		return;
	}
	await savePayload();
};

const goBack = () => {
	router.push({ name: 'SipoList' });
};

watch(
	() => route.fullPath,
	async () => {
		if (isCreate.value) {
			await loadCreatePage();
			return;
		}
		if (sipId.value) {
			await loadDetail();
		}
	}
);

onMounted(async () => {
	form.applyWatchers();
	if (isCreate.value) {
		await loadCreatePage();
		return;
	}
	await loadDetail();
});
</script>

<style scoped>
.sipo-field-hint {
	display: block;
	margin-top: 0.5rem;
	font-size: 0.625rem;
	font-weight: 500;
	letter-spacing: 0.02em;
	text-transform: uppercase;
	color: #9ca3af;
}

:deep(.p-accordion .p-accordion-header .p-accordion-header-link) {
	background: #f9fafb;
	border-color: #e5e7eb;
	color: #6b7280;
	font-weight: 600;
	font-size: 0.875rem;
	text-transform: uppercase;
}

:deep(.p-accordion .p-accordion-content) {
	border-color: #e5e7eb;
	padding-top: 1.25rem;
}

:deep(.sipo-detail-tabs.p-tabview .p-tabview-nav li .p-tabview-nav-link),
:deep(.sipo-detail-tabs.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
	font-weight: 700;
	color: #afabbb !important;
}

:deep(.sipo-detail-tabs.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
	border-color: #ff0000;
}

:deep(.sipo-input-group) {
	display: flex;
	width: 100%;
}

:deep(.sipo-input-group .p-inputtext) {
	flex: 1 1 auto;
	min-width: 0;
	width: 100%;
}

:deep(.sipo-input-group .p-dropdown) {
	flex: 1 1 auto;
	width: 100%;
}

:deep(.p-inputgroup .p-dropdown .p-dropdown-label) {
	width: 100%;
}
</style>
