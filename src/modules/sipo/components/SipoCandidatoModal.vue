<template>
	<Dialog
		v-model:visible="visibleProxy"
		modal
		:header="dialogTitle"
		:style="{ width: '56rem' }"
		:breakpoints="{ '1200px': '95vw' }"
		@hide="onHide"
	>
		<div class="flex flex-column gap-3" :class="{ 'candidato-readonly': readOnly }">
			<div v-if="!readOnly" class="field">
				<label class="font-bold text-sm">(*) Tipo candidato</label>
				<Dropdown
					v-model="tipoCandidato"
					:options="TIPO_CANDIDATO_OPTIONS"
					optionLabel="label"
					optionValue="value"
					placeholder="Seleccionar"
					class="w-full"
					:disabled="Boolean(editingId)"
					@change="onTipoChange"
				/>
			</div>

			<div v-if="tipoCandidato === 'reintegrar' && !editingId && !readOnly" class="field">
				<label class="font-bold text-sm">(*) Cargar trabajador</label>
				<Dropdown
					v-model="reintegrarRut"
					:options="reintegrarOptions"
					optionLabel="label"
					optionValue="value"
					filter
					filterPlaceholder="Buscar por nombre o RUT"
					placeholder="Seleccionar"
					class="w-full"
					:loading="loadingReintegrar"
					@filter="onReintegrarFilter"
					@change="onReintegrarSelect"
				/>
			</div>

			<div v-if="tipoCandidato === 'ficha' && !editingId && !readOnly" class="field">
				<label class="font-bold text-sm">(*) Seleccionar Ficha de Ingreso</label>
				<Dropdown
					v-model="fichaId"
					:options="fichaOptions"
					optionLabel="label"
					optionValue="value"
					filter
					filterPlaceholder="Buscar por RUT o nombre"
					placeholder="Seleccionar ficha aprobada"
					class="w-full"
					:loading="loadingFichas"
					@filter="onFichaFilter"
					@change="onFichaSelect"
				/>
				<small class="text-color-secondary block mt-1">
					Solo fichas Aprobadas de la misma razón social de la solicitud.
				</small>
			</div>

			<div
				v-if="fichaCamposFaltantes.length && tipoCandidato === 'ficha' && showForm && !readOnly"
				class="p-3 border-1 border-orange-200 border-round bg-orange-50"
			>
				<div class="font-semibold text-sm mb-2 text-orange-800">
					Campos a completar manualmente
				</div>
				<ul class="m-0 pl-3 text-sm text-orange-900 line-height-3">
					<li v-for="campo in fichaCamposFaltantes" :key="campo">{{ campo }}</li>
				</ul>
			</div>

			<template v-if="showForm">
				<Accordion :activeIndex="accordionActiveIndex" multiple>
					<AccordionTab header="DATOS PERSONALES Y CONTACTO">
						<div class="grid formgrid">
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Tratamiento</label>
								<Dropdown v-model="form.cf_rrhh_sip_obra_candidato_tratamiento" :options="TRATAMIENTO_OPTIONS" optionLabel="label" optionValue="value" :class="fc('cf_rrhh_sip_obra_candidato_tratamiento')" placeholder="Seleccionar" />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Primer nombre</label>
								<InputText v-model="form.cf_rrhh_sip_obra_candidato_nombre" :class="fc('cf_rrhh_sip_obra_candidato_nombre')" />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">Segundo nombre</label>
								<InputText v-model="form.cf_rrhh_sip_obra_candidato_segundo_nombre" class="w-full" />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Primer Apellido</label>
								<InputText v-model="form.cf_rrhh_sip_obra_candidato_ap" :class="fc('cf_rrhh_sip_obra_candidato_ap')" />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Segundo Apellido</label>
								<InputText v-model="form.cf_rrhh_sip_obra_candidato_am" :class="fc('cf_rrhh_sip_obra_candidato_am')" />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Género</label>
								<Dropdown v-model="form.cf_rrhh_sip_obra_candidato_genero" :options="GENERO_OPTIONS" optionLabel="label" optionValue="value" :class="fc('cf_rrhh_sip_obra_candidato_genero')" placeholder="Seleccionar" />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) RUT</label>
								<InputText
									v-model="form.cf_rrhh_sip_obra_candidato_rut"
									class="w-full"
									:class="{ 'p-invalid': rutWarning || fieldErrors.cf_rrhh_sip_obra_candidato_rut }"
									maxlength="13"
									@input="onRutInput"
									@blur="onRutBlur"
								/>
								<small v-if="rutWarning" class="p-error block">{{ rutWarning }}</small>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Fecha de nacimiento</label>
								<Calendar v-model="form.cf_rrhh_sip_obra_candidato_fecha_nacimiento" dateFormat="dd-mm-yy" showIcon :class="fc('cf_rrhh_sip_obra_candidato_fecha_nacimiento')" />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Estado civil</label>
								<Dropdown v-model="form.cf_rrhh_sip_obra_candidato_estado_civil" :options="maestros.estados_civiles" optionLabel="label" optionValue="value" :class="fc('cf_rrhh_sip_obra_candidato_estado_civil')" placeholder="Seleccionar" filter />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Teléfono del candidato</label>
								<div class="flex w-full telefono-input-group">
									<span class="telefono-prefix">569</span>
									<InputText
										:value="telefonoLocal"
										:class="['w-full', 'telefono-input', { 'p-invalid': fieldErrors.cf_rrhh_sip_obra_candidato_telefono }]"
										inputmode="numeric"
										maxlength="8"
										placeholder="12345678"
										@input="onTelefonoInput"
									/>
								</div>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) País de nacimiento</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_pais_nacimiento"
									:options="paisNacimientoOptions"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_pais_nacimiento')"
									placeholder="Seleccionar"
									filter
									@change="onPaisNacimientoChange"
								/>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Región de nacimiento</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_region_nacimiento"
									:options="regionNacimientoOptions"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_region_nacimiento')"
									placeholder="Seleccionar"
									filter
									:disabled="!form.cf_rrhh_sip_obra_candidato_pais_nacimiento"
								/>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Nacionalidad</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_nacionalidad"
									:options="maestros.nacionalidades"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_nacionalidad')"
									placeholder="Seleccione Nacionalidad"
									@change="onNacionalidadChange"
								/>
							</div>
							<div v-if="showNacionalidadExt" class="field col-12 md:col-6">
								<label class="text-sm">(*) Nacionalidad Extranjera</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_nacionalidad_ext"
									:options="maestros.nacionalidades_extranjeras"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_nacionalidad_ext')"
									placeholder="Seleccionar"
									filter
								/>
							</div>
						</div>
					</AccordionTab>

					<AccordionTab header="DIRECCIÓN Y UBICACIÓN">
						<div class="grid formgrid">
							<div class="field col-12 md:col-4">
								<label class="text-sm">(*) Región</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_region"
									:options="maestros.regiones"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_region')"
									placeholder="Seleccionar"
									filter
									@change="onRegionChange"
								/>
							</div>
							<div class="field col-12 md:col-4">
								<label class="text-sm">(*) Ciudad</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_ciudad"
									:options="ciudadOptions"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_ciudad')"
									placeholder="Seleccionar"
									filter
									:disabled="!form.cf_rrhh_sip_obra_candidato_region"
									@change="onCiudadChange"
								/>
							</div>
							<div class="field col-12 md:col-4">
								<label class="text-sm">(*) Comuna</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_comuna"
									:options="comunaOptions"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_comuna')"
									placeholder="Seleccionar"
									filter
									:disabled="!form.cf_rrhh_sip_obra_candidato_ciudad"
								/>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">Villa o población</label>
								<InputText v-model="form.cf_rrhh_sip_obra_candidato_villa" class="w-full" />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Nombre calle</label>
								<InputText v-model="form.cf_rrhh_sip_obra_candidato_direccion" :class="fc('cf_rrhh_sip_obra_candidato_direccion')" />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Número</label>
								<InputText v-model="form.cf_rrhh_sip_obra_candidato_numero_dire" :class="fc('cf_rrhh_sip_obra_candidato_numero_dire')" />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">Número departamento</label>
								<InputText v-model="form.cf_rrhh_sip_obra_candidato_num_depto" class="w-full" />
							</div>
						</div>
					</AccordionTab>

					<AccordionTab header="INFORMACIÓN BANCARIA Y PREVISIONAL">
						<div class="grid formgrid">
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Método de pago</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_metodo_pago"
									:options="metodoPagoOptions"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_metodo_pago')"
									placeholder="Seleccionar"
									showClear
									@change="onMetodoPagoChange"
								/>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Banco</label>
								<Dropdown v-model="form.cf_rrhh_sip_obra_candidato_banco" :options="maestros.bancos" optionLabel="label" optionValue="value" :class="fc('cf_rrhh_sip_obra_candidato_banco')" placeholder="Seleccionar" filter showClear />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Número de cuenta</label>
								<InputText
									v-model="form.cf_rrhh_sip_obra_candidato_numcta"
									:class="fc('cf_rrhh_sip_obra_candidato_numcta')"
								/>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Nombre AFP</label>
								<Dropdown v-model="form.cf_rrhh_sip_obra_candidato_nom_afp" :options="maestros.afps" optionLabel="label" optionValue="value" :class="fc('cf_rrhh_sip_obra_candidato_nom_afp')" placeholder="Seleccionar" filter showClear />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Tipo salud</label>
								<Dropdown v-model="form.cf_rrhh_sip_obra_candidato_nom_salud" :options="maestros.sistemas_salud" optionLabel="label" optionValue="value" :class="fc('cf_rrhh_sip_obra_candidato_nom_salud')" placeholder="Seleccionar" filter showClear />
							</div>
							<div v-if="showValorPlan" class="field col-12 md:col-6">
								<label class="text-sm">(*) Valor plan de salud</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_valor_plan"
									:options="maestros.valores_plan"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_valor_plan')"
									placeholder="Seleccionar"
								/>
							</div>
							<div v-if="showValorUf" class="field col-12 md:col-6">
								<label class="text-sm">(*) Valor en UF</label>
								<InputText v-model="form.cf_rrhh_sip_obra_candidato_valor_uf" :class="fc('cf_rrhh_sip_obra_candidato_valor_uf')" />
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Jubilado</label>
								<Dropdown v-model="form.cf_rrhh_sip_obra_candidato_jubilado" :options="maestros.si_no" optionLabel="label" optionValue="value" :class="fc('cf_rrhh_sip_obra_candidato_jubilado')" placeholder="Seleccionar" showClear />
							</div>
						</div>
					</AccordionTab>

					<AccordionTab header="1. CONDICIONES CONTRACTUALES (RRHH)">
						<div class="grid formgrid">
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Jefe Directo</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_jefe_user_id"
									:options="jefesOptions"
									optionLabel="label"
									optionValue="user_id"
									filter
									showClear
									placeholder="Seleccionar"
									:class="fc('cf_rrhh_sip_obra_candidato_jefe_user_id')"
									:loading="loadingJefes"
									emptyMessage="Sin personal activo en este centro de costo"
									emptyFilterMessage="Sin resultados"
									@change="onJefeChange"
								/>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Horario de trabajo</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_horario_trabajo"
									:options="maestros.horarios"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_horario_trabajo')"
									placeholder="Seleccionar"
									filter
									showClear
								/>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Sueldo líquido pactado</label>
								<InputText
									v-model="form.cf_rrhh_sip_obra_candidato_sueldo"
									:class="fc('cf_rrhh_sip_obra_candidato_sueldo')"
									@blur="onSueldoBlur"
								/>
								<small v-if="sueldoWarning" class="p-error block mt-1">{{ sueldoWarning }}</small>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Cuenta de gastos</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_cuenta_gasto"
									:options="maestros.cuentas_gasto"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_cuenta_gasto')"
									placeholder="Seleccionar"
									filter
									showClear
								/>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Tipo de contrato</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_tipo_contrato"
									:options="tiposContratoOptions"
									optionLabel="label"
									optionValue="value"
									:class="fc('cf_rrhh_sip_obra_candidato_tipo_contrato')"
									@change="onTipoContratoChange"
								/>
							</div>
							<div v-if="isObraFaena" class="field col-12 md:col-6">
								<label class="text-sm">(*) HITO</label>
								<InputText v-model="hitoTexto" :class="fc('hitoTexto')" />
							</div>
							<div v-if="isObraFaena" class="field col-12 md:col-6">
								<label class="text-sm">(*) Fecha de término HITO</label>
								<Calendar
									v-model="fechaTerminoHito"
									dateFormat="dd-mm-yy"
									showIcon
									:class="fc('fechaTerminoHito')"
									:minDate="minFechaTermino"
									@date-select="validateFechasContrato"
								/>
								<small v-if="fechaTerminoHitoError" class="p-error block">{{ fechaTerminoHitoError }}</small>
							</div>
							<div v-if="isPlazoFijo" class="field col-12 md:col-6">
								<label class="text-sm">(*) Fecha término plazo fijo</label>
								<Calendar
									v-model="plazoFijoFecha"
									dateFormat="dd-mm-yy"
									showIcon
									:class="fc('plazoFijoFecha')"
									:minDate="minFechaTermino"
									@date-select="validateFechasContrato"
								/>
								<small v-if="plazoFijoError" class="p-error block">{{ plazoFijoError }}</small>
							</div>
						</div>
					</AccordionTab>

					<AccordionTab header="2. CARGO, INGRESO Y CORREO (SUPERVISOR)">
						<div class="grid formgrid">
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Nombre del cargo</label>
								<Dropdown
									v-model="form.cf_rrhh_sip_obra_candidato_nomcar"
									:options="cargoDropdownOptions"
									optionLabel="label"
									optionValue="value"
									filter
									showClear
									placeholder="Seleccionar"
									:class="fc('cf_rrhh_sip_obra_candidato_nomcar')"
									:loading="loadingCargos"
									emptyMessage="Sin cargos para esta razón social"
									emptyFilterMessage="Sin resultados"
								/>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Fecha de ingreso</label>
								<Calendar
									v-model="form.cf_rrhh_sip_obra_candidato_fecha_ingreso"
									dateFormat="dd-mm-yy"
									showIcon
									:class="fc('cf_rrhh_sip_obra_candidato_fecha_ingreso')"
									@date-select="validateFechasContrato"
								/>
							</div>
							<div class="field col-12 md:col-6">
								<label class="text-sm">(*) Correo Electrónico del Colaborador</label>
								<InputText
									v-model="form.cf_rrhh_sip_obra_candidato_correo"
									type="email"
									:class="{ 'p-invalid': correoError || fieldErrors.cf_rrhh_sip_obra_candidato_correo }"
									placeholder="correo@empresa.cl"
									:disabled="isValidatingEmail"
									@input="onCorreoInput"
									@blur="onCorreoBlur"
								/>
								<small v-if="isValidatingEmail" class="text-xs text-color-secondary block mt-1">
									Verificando correo...
								</small>
								<small v-else-if="correoError" class="p-error block mt-1">{{ correoError }}</small>
							</div>
						</div>
					</AccordionTab>

					<AccordionTab v-if="!readOnly" header="DOCUMENTOS ADJUNTOS">
						<div class="grid formgrid">
							<div v-for="doc in docSlots" :key="doc.key" class="field col-12 md:col-6">
								<label class="text-sm">{{ doc.label }}</label>
								<div class="flex flex-column gap-2">
									<input
										type="file"
										accept=".pdf,.png,.jpg,.jpeg,.webp"
										:class="['w-full', { 'p-invalid': fieldErrors[doc.field] }]"
										:disabled="uploadingDoc === doc.key"
										@change="(e) => onFileSelected(e, doc.key)"
									/>
									<small v-if="docMeta[doc.key]" class="text-color-secondary">
										{{ docMeta[doc.key].name }}
										<span v-if="docMeta[doc.key].sizeMb"> · {{ docMeta[doc.key].sizeMb }} MB</span>
									</small>
									<small v-if="docErrors[doc.key]" class="p-error">{{ docErrors[doc.key] }}</small>
									<div v-if="uploadingDoc === doc.key" class="flex align-items-center gap-2">
										<ProgressSpinner style="width: 20px; height: 20px" />
										<span class="text-sm">Subiendo...</span>
									</div>
								</div>
							</div>
						</div>
						<small class="text-color-secondary">Máximo 4 MB · Formatos: pdf, png, jpg, jpeg, webp</small>
					</AccordionTab>
				</Accordion>
			</template>
		</div>

		<template #footer>
			<Button label="Cerrar" severity="secondary" text @click="visibleProxy = false" />
			<Button
				v-if="showForm && !readOnly && !isLoadingDetail"
				:label="editingId ? 'Actualizar' : 'Agregar'"
				icon="pi pi-check"
				:loading="saving"
				:disabled="saving || isValidatingEmail"
				@click="submit"
			/>
		</template>
	</Dialog>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, reactive, ref, watch } from 'vue';
import { useGlobalStore } from '../../../store/global';
import { ToastGroupEnum, ToastSeverityMessageEnum } from '../../../shared/interfaces/toast-message.interface';
import { useToastStore } from '../../../store/toast';
import { formatRut, filterRutInput, isValidRut } from '../../../utils/formatRut';
import { formatMontoCl, parseMontoCl } from '../../../utils/formatters';
import { SipoService } from '../services/SipoService';
import { SipoFichasService, SipoFichaListItem } from '../services/SipoFichasService';
import { mapFichaToCandidatoForm } from '../utils/mapFichaToCandidato';
import {
	GENERO_OPTIONS,
	resolveSueldoWarning,
	SipoCandidato,
	SipoCandidatoWritePayload,
	SipoReintegrarItem,
	TIPO_CANDIDATO_OPTIONS,
	TRATAMIENTO_OPTIONS,
} from '../sipoConstants';

const props = defineProps<{
	visible: boolean;
	sipId: number;
	empresaRut?: string | null;
	cargoOptions?: { label: string; value: string }[];
	candidato?: SipoCandidato | null;
	readOnly?: boolean;
	centroCosto?: string | null;
}>();

const emit = defineEmits<{
	(e: 'update:visible', value: boolean): void;
	(e: 'saved'): void;
}>();

const global = useGlobalStore();
const tipoCandidato = ref<'nuevo' | 'reintegrar' | 'ficha'>('nuevo');
const reintegrarRut = ref<string | null>(null);
const reintegrarItems = ref<SipoReintegrarItem[]>([]);
const loadingReintegrar = ref(false);
const fichaId = ref<number | null>(null);
const fichaItems = ref<SipoFichaListItem[]>([]);
const loadingFichas = ref(false);
const fichaCamposFaltantes = ref<string[]>([]);
const loadingCargos = ref(false);
const loadingJefes = ref(false);
const jefesOptions = ref<{ user_id: string; nombre: string; correo: string; label: string }[]>([]);
const isLoadingDetail = ref(false);
const cargosLocal = ref<{ label: string; value: string }[]>([]);
const saving = ref(false);
const generandoQr = ref(false);
const qrVisible = ref(false);
const qrData = ref<{ url: string; qr_base64: string; estado?: string } | null>(null);
let portalPoll: ReturnType<typeof setInterval> | null = null;
const correoError = ref('');
const isValidatingEmail = ref(false);
const telefonoLocal = ref('');
const TELEFONO_PREFIX = '569';
const rutWarning = ref('');
const fechaTerminoHitoError = ref('');
const plazoFijoError = ref('');
const editingId = ref<string | null>(null);
const uploadingDoc = ref<string | null>(null);
const docErrors = reactive<Record<string, string>>({});
const docMeta = reactive<Record<string, { name: string; sizeMb: string }>>({});

const maestros = reactive<Record<string, any[]>>({
	bancos: [],
	horarios: [],
	cuentas_gasto: [],
	estados_civiles: [],
	nacionalidades: [],
	nacionalidades_extranjeras: [],
	regiones: [],
	afps: [],
	sistemas_salud: [],
	metodos_pago: [],
	tipos_contrato: [],
	si_no: [],
	paises_nacimiento: [],
	paises_region_nacimiento: [],
	regiones_nacimiento: [],
	valores_plan: [],
});

const docSlots = [
	{ key: 'ci', label: '(*) Cédula de identidad', field: 'cf_rrhh_sip_obra_candidato_ci' },
	{ key: 'afp', label: '(*) Certificado AFP', field: 'cf_rrhh_sip_obra_candidato_afp' },
	{ key: 'salud', label: '(*) Certificado salud', field: 'cf_rrhh_sip_obra_candidato_salud' },
	{ key: 'domi', label: '(*) Comprobante domicilio', field: 'cf_rrhh_sip_obra_candidato_domi' },
] as const;

const ALLOWED_EXT = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp']);
const MAX_MB = 4;

const accordionActiveIndex = computed(() =>
	props.readOnly ? [0, 1, 2, 3] : [0, 1, 2, 3, 4]
);

const emptyForm = (): Record<string, any> => ({
	cf_rrhh_sip_obra_candidato_tratamiento: null,
	cf_rrhh_sip_obra_candidato_nombre: null,
	cf_rrhh_sip_obra_candidato_segundo_nombre: null,
	cf_rrhh_sip_obra_candidato_ap: null,
	cf_rrhh_sip_obra_candidato_am: null,
	cf_rrhh_sip_obra_candidato_genero: null,
	cf_rrhh_sip_obra_candidato_rut: null,
	cf_rrhh_sip_obra_candidato_fecha_nacimiento: null,
	cf_rrhh_sip_obra_candidato_pais_nacimiento: null,
	cf_rrhh_sip_obra_candidato_region_nacimiento: null,
	cf_rrhh_sip_obra_candidato_nacionalidad: null,
	cf_rrhh_sip_obra_candidato_nacionalidad_ext: null,
	cf_rrhh_sip_obra_candidato_region: null,
	cf_rrhh_sip_obra_candidato_ciudad: null,
	cf_rrhh_sip_obra_candidato_comuna: null,
	cf_rrhh_sip_obra_candidato_villa: null,
	cf_rrhh_sip_obra_candidato_direccion: null,
	cf_rrhh_sip_obra_candidato_numero_dire: null,
	cf_rrhh_sip_obra_candidato_num_depto: null,
	cf_rrhh_sip_obra_candidato_estado_civil: null,
	cf_rrhh_sip_obra_candidato_telefono: null,
	cf_rrhh_sip_obra_candidato_correo: null,
	cf_rrhh_sip_obra_candidato_metodo_pago: null,
	cf_rrhh_sip_obra_candidato_banco: null,
	cf_rrhh_sip_obra_candidato_numcta: null,
	cf_rrhh_sip_obra_candidato_anticipo: 'Sí',
	cf_rrhh_sip_obra_candidato_nomcar: null,
	cf_rrhh_sip_obra_candidato_jefe_user_id: null,
	cf_rrhh_sip_obra_candidato_jefe_nombre: null,
	cf_rrhh_sip_obra_candidato_jefe_correo: null,
	cf_rrhh_sip_obra_candidato_horario_trabajo: null,
	cf_rrhh_sip_obra_candidato_sueldo: null,
	cf_rrhh_sip_obra_candidato_cuenta_gasto: null,
	cf_rrhh_sip_obra_candidato_tipo_contrato: 'Plazo Fijo',
	cf_rrhh_sip_obra_candidato_fecha_ingreso: null,
	cf_rrhh_sip_obra_candidato_termino_contrato: null,
	cf_rrhh_sip_obra_candidato_fecha_termino_ito: null,
	cf_rrhh_sip_obra_candidato_jubilado: null,
	cf_rrhh_sip_obra_candidato_nom_afp: null,
	cf_rrhh_sip_obra_candidato_nom_salud: null,
	cf_rrhh_sip_obra_candidato_valor_plan: null,
	cf_rrhh_sip_obra_candidato_valor_uf: null,
	cf_rrhh_sip_obra_candidato_seguro_covid: null,
	cf_rrhh_sip_obra_candidato_ci: null,
	cf_rrhh_sip_obra_candidato_afp: null,
	cf_rrhh_sip_obra_candidato_salud: null,
	cf_rrhh_sip_obra_candidato_domi: null,
	cf_rrhh_sip_obra_candidato_copia_seguro_covid: null,
});

const form = reactive(emptyForm());
const hitoTexto = ref('');
const plazoFijoFecha = ref<Date | null>(null);
const fechaTerminoHito = ref<Date | null>(null);
const fieldErrors = reactive<Record<string, string>>({});

const isEmptyValue = (value: unknown): boolean => {
	if (value === null || value === undefined) return true;
	if (value instanceof Date) return Number.isNaN(value.getTime());
	if (typeof value === 'string') return value.trim() === '';
	return false;
};

const clearFieldErrors = () => {
	Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k]);
};

const fc = (key: string) => ['w-full', { 'p-invalid': Boolean(fieldErrors[key]) }];

const showObligatoriosToast = () => {
	useToastStore().show({
		severity: ToastSeverityMessageEnum.WARN,
		summary: 'Campos obligatorios',
		detail: 'Por favor complete todos los campos obligatorios (*) antes de continuar.',
		life: 7000,
		group: ToastGroupEnum.TOP_RIGHT,
	});
};

const markRequired = (key: string, value: unknown) => {
	if (isEmptyValue(value)) {
		fieldErrors[key] = 'Campo obligatorio';
		return false;
	}
	delete fieldErrors[key];
	return true;
};

const validateRequiredFields = (): boolean => {
	clearFieldErrors();
	let ok = true;
	const checks: Array<[string, unknown]> = [
		['cf_rrhh_sip_obra_candidato_tratamiento', form.cf_rrhh_sip_obra_candidato_tratamiento],
		['cf_rrhh_sip_obra_candidato_nombre', form.cf_rrhh_sip_obra_candidato_nombre],
		['cf_rrhh_sip_obra_candidato_ap', form.cf_rrhh_sip_obra_candidato_ap],
		['cf_rrhh_sip_obra_candidato_am', form.cf_rrhh_sip_obra_candidato_am],
		['cf_rrhh_sip_obra_candidato_genero', form.cf_rrhh_sip_obra_candidato_genero],
		['cf_rrhh_sip_obra_candidato_rut', form.cf_rrhh_sip_obra_candidato_rut],
		['cf_rrhh_sip_obra_candidato_fecha_nacimiento', form.cf_rrhh_sip_obra_candidato_fecha_nacimiento],
		['cf_rrhh_sip_obra_candidato_estado_civil', form.cf_rrhh_sip_obra_candidato_estado_civil],
		['cf_rrhh_sip_obra_candidato_telefono', telefonoLocal.value],
		['cf_rrhh_sip_obra_candidato_correo', form.cf_rrhh_sip_obra_candidato_correo],
		['cf_rrhh_sip_obra_candidato_pais_nacimiento', form.cf_rrhh_sip_obra_candidato_pais_nacimiento],
		['cf_rrhh_sip_obra_candidato_region_nacimiento', form.cf_rrhh_sip_obra_candidato_region_nacimiento],
		['cf_rrhh_sip_obra_candidato_nacionalidad', form.cf_rrhh_sip_obra_candidato_nacionalidad],
		['cf_rrhh_sip_obra_candidato_region', form.cf_rrhh_sip_obra_candidato_region],
		['cf_rrhh_sip_obra_candidato_ciudad', form.cf_rrhh_sip_obra_candidato_ciudad],
		['cf_rrhh_sip_obra_candidato_comuna', form.cf_rrhh_sip_obra_candidato_comuna],
		['cf_rrhh_sip_obra_candidato_direccion', form.cf_rrhh_sip_obra_candidato_direccion],
		['cf_rrhh_sip_obra_candidato_numero_dire', form.cf_rrhh_sip_obra_candidato_numero_dire],
		['cf_rrhh_sip_obra_candidato_metodo_pago', form.cf_rrhh_sip_obra_candidato_metodo_pago],
		['cf_rrhh_sip_obra_candidato_banco', form.cf_rrhh_sip_obra_candidato_banco],
		['cf_rrhh_sip_obra_candidato_numcta', form.cf_rrhh_sip_obra_candidato_numcta],
		['cf_rrhh_sip_obra_candidato_nom_afp', form.cf_rrhh_sip_obra_candidato_nom_afp],
		['cf_rrhh_sip_obra_candidato_nom_salud', form.cf_rrhh_sip_obra_candidato_nom_salud],
		['cf_rrhh_sip_obra_candidato_jubilado', form.cf_rrhh_sip_obra_candidato_jubilado],
		['cf_rrhh_sip_obra_candidato_nomcar', form.cf_rrhh_sip_obra_candidato_nomcar],
		['cf_rrhh_sip_obra_candidato_jefe_user_id', form.cf_rrhh_sip_obra_candidato_jefe_user_id],
		['cf_rrhh_sip_obra_candidato_horario_trabajo', form.cf_rrhh_sip_obra_candidato_horario_trabajo],
		['cf_rrhh_sip_obra_candidato_sueldo', form.cf_rrhh_sip_obra_candidato_sueldo],
		['cf_rrhh_sip_obra_candidato_cuenta_gasto', form.cf_rrhh_sip_obra_candidato_cuenta_gasto],
		['cf_rrhh_sip_obra_candidato_tipo_contrato', form.cf_rrhh_sip_obra_candidato_tipo_contrato],
		['cf_rrhh_sip_obra_candidato_fecha_ingreso', form.cf_rrhh_sip_obra_candidato_fecha_ingreso],
	];
	for (const [key, value] of checks) {
		if (!markRequired(key, value)) ok = false;
	}
	if (showNacionalidadExt.value) {
		if (!markRequired('cf_rrhh_sip_obra_candidato_nacionalidad_ext', form.cf_rrhh_sip_obra_candidato_nacionalidad_ext)) {
			ok = false;
		}
	}
	if (showValorPlan.value) {
		if (!markRequired('cf_rrhh_sip_obra_candidato_valor_plan', form.cf_rrhh_sip_obra_candidato_valor_plan)) {
			ok = false;
		}
	}
	if (showValorUf.value) {
		if (!markRequired('cf_rrhh_sip_obra_candidato_valor_uf', form.cf_rrhh_sip_obra_candidato_valor_uf)) {
			ok = false;
		}
	}
	if (isObraFaena.value) {
		if (!markRequired('hitoTexto', hitoTexto.value)) ok = false;
		if (!markRequired('fechaTerminoHito', fechaTerminoHito.value)) ok = false;
	}
	if (isPlazoFijo.value) {
		if (!markRequired('plazoFijoFecha', plazoFijoFecha.value)) ok = false;
	}
	if (!editingId.value) {
		for (const doc of docSlots) {
			if (!markRequired(doc.field, form[doc.field])) ok = false;
		}
	}
	return ok;
};

const visibleProxy = computed({
	get: () => props.visible,
	set: (v: boolean) => emit('update:visible', v),
});

const dialogTitle = computed(() => {
	if (props.readOnly) return 'Detalle candidato';
	return editingId.value ? 'Editar candidato' : 'Agregar candidato';
});

const showForm = computed(
	() =>
		props.readOnly ||
		Boolean(editingId.value) ||
		tipoCandidato.value === 'nuevo' ||
		Boolean(reintegrarRut.value) ||
		Boolean(fichaId.value)
);

const reintegrarOptions = computed(() =>
	reintegrarItems.value.map((i) => ({
		label: `${i.nombre_completo} ${formatRut(i.rut)}`,
		value: i.rut,
	}))
);

const fichaOptions = computed(() =>
	fichaItems.value.map((f) => ({
		label: `${f.nombre_colaborador || '—'} · ${formatRut(f.rut || '')} · ${f.cargo || 'Sin cargo'}`,
		value: f.id,
	}))
);

const ciudadOptions = computed(() => {
	const region = (maestros.regiones || []).find(
		(r) => r.value === form.cf_rrhh_sip_obra_candidato_region
	);
	return region?.ciudades || [];
});

const comunaOptions = computed(() => {
	const ciudad = ciudadOptions.value.find(
		(c: any) => c.value === form.cf_rrhh_sip_obra_candidato_ciudad
	);
	return ciudad?.comunas || [];
});

const paisNacimientoOptions = computed(() => {
	if (maestros.paises_region_nacimiento?.length) {
		return maestros.paises_region_nacimiento;
	}
	return maestros.paises_nacimiento || [];
});

const regionNacimientoOptions = computed(() => {
	const pais = (maestros.paises_region_nacimiento || []).find(
		(p: any) => p.value === form.cf_rrhh_sip_obra_candidato_pais_nacimiento
	);
	return pais?.regiones || [];
});

const sueldoWarning = computed(() =>
	resolveSueldoWarning(
		form.cf_rrhh_sip_obra_candidato_sueldo,
		form.cf_rrhh_sip_obra_candidato_nomcar,
		form.cf_rrhh_sip_obra_candidato_horario_trabajo
	)
);

const onSueldoBlur = () => {
	const n = parseMontoCl(form.cf_rrhh_sip_obra_candidato_sueldo);
	form.cf_rrhh_sip_obra_candidato_sueldo = n == null ? null : formatMontoCl(n);
};

const isObraFaena = computed(
	() => form.cf_rrhh_sip_obra_candidato_tipo_contrato === 'Obra o Faena'
);
const isPlazoFijo = computed(
	() => form.cf_rrhh_sip_obra_candidato_tipo_contrato === 'Plazo Fijo'
);
const metodoPagoOptions = computed(() => maestros.metodos_pago || []);
const tiposContratoOptions = computed(() =>
	(maestros.tipos_contrato || []).filter((o) => String(o.value) !== 'Indefinido')
);
const isCuentaRut = computed(() =>
	String(form.cf_rrhh_sip_obra_candidato_metodo_pago || '')
		.toLowerCase()
		.replace(/\s+/g, '')
		.includes('cuentarut')
);

const rutBodySinDv = (rut: string) => {
	const clean = String(rut || '').replace(/[^0-9kK]/g, '');
	if (clean.length < 2) return '';
	return clean.slice(0, -1);
};

const applyCuentaRutNumero = () => {
	if (!isCuentaRut.value) return;
	form.cf_rrhh_sip_obra_candidato_numcta = rutBodySinDv(
		String(form.cf_rrhh_sip_obra_candidato_rut || '')
	);
};

const onMetodoPagoChange = () => {
	if (isCuentaRut.value) {
		applyCuentaRutNumero();
		return;
	}
	form.cf_rrhh_sip_obra_candidato_numcta = '';
};

const cargoDropdownOptions = computed(() => {
	if (cargosLocal.value.length) return cargosLocal.value;
	return props.cargoOptions || [];
});
const FONASA_SIN_PLAN = new Set(['005', '014', '015']);

const showValorPlan = computed(() => {
	const salud = form.cf_rrhh_sip_obra_candidato_nom_salud;
	return Boolean(salud) && !FONASA_SIN_PLAN.has(salud);
});
const showValorUf = computed(
	() => showValorPlan.value && form.cf_rrhh_sip_obra_candidato_valor_plan === 'UF'
);
const showNacionalidadExt = computed(() => {
	const nac = form.cf_rrhh_sip_obra_candidato_nacionalidad;
	return nac === 'Extranjero' || nac === 'Extranjero-Definitiva';
});

const onNacionalidadChange = () => {
	if (!showNacionalidadExt.value) {
		form.cf_rrhh_sip_obra_candidato_nacionalidad_ext = null;
	}
};

const minFechaTermino = computed(() => {
	const ingreso = form.cf_rrhh_sip_obra_candidato_fecha_ingreso;
	if (!ingreso || !(ingreso instanceof Date)) return undefined;
	const min = new Date(ingreso);
	min.setHours(0, 0, 0, 0);
	min.setDate(min.getDate() + 1);
	return min;
});

const validateFechasContrato = () => {
	fechaTerminoHitoError.value = '';
	plazoFijoError.value = '';
	const ingreso = form.cf_rrhh_sip_obra_candidato_fecha_ingreso as Date | null;
	if (!ingreso) return;

	if (isObraFaena.value && fechaTerminoHito.value) {
		const termino = new Date(fechaTerminoHito.value);
		termino.setHours(0, 0, 0, 0);
		const ing = new Date(ingreso);
		ing.setHours(0, 0, 0, 0);
		if (termino <= ing) {
			fechaTerminoHitoError.value =
				'La fecha término HITO debe ser posterior a la fecha de ingreso';
		}
	}
	if (isPlazoFijo.value && plazoFijoFecha.value) {
		const termino = new Date(plazoFijoFecha.value);
		termino.setHours(0, 0, 0, 0);
		const ing = new Date(ingreso);
		ing.setHours(0, 0, 0, 0);
		if (termino <= ing) {
			plazoFijoError.value =
				'La fecha término plazo fijo debe ser posterior a la fecha de ingreso';
		}
	}
};

const parseDateInput = (value: string | null | undefined): Date | null => {
	if (!value) return null;
	const iso = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
	const dmy = String(value).match(/^(\d{2})-(\d{2})-(\d{4})/);
	if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
};

const cleanAddressField = (val: string | null | undefined): string => {
	if (!val) return '';
	const text = String(val).trim();
	if (!text || text === '|') return '';
	if (text.includes('|')) {
		const parts = text.split('|').map((p) => p.trim()).filter(Boolean);
		return parts[0] || '';
	}
	return text.replace(/\|/g, '').trim();
};

const parseNumeroDepto = (
	numeroRaw: string | null | undefined,
	deptoRaw: string | null | undefined
): { numero: string; depto: string } => {
	let depto = cleanAddressField(deptoRaw);
	const rawNum = String(numeroRaw || '').trim();
	if (rawNum.includes('|')) {
		const parts = rawNum.split('|').map((p) => p.trim()).filter(Boolean);
		const numero = parts[0] || '';
		if (parts.length > 1 && !depto) depto = parts[1];
		return { numero, depto };
	}
	return { numero: cleanAddressField(numeroRaw), depto };
};

const toDateStr = (value: unknown): string | null => {
	if (!value) return null;
	if (typeof value === 'string') {
		const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
		const dmy = value.match(/^(\d{2})-(\d{2})-(\d{4})/);
		if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
		return value.slice(0, 10);
	}
	if (value instanceof Date) {
		const y = value.getFullYear();
		const m = String(value.getMonth() + 1).padStart(2, '0');
		const d = String(value.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}
	return String(value).slice(0, 10);
};

const loadMaestros = async () => {
	const response = await SipoService.getCandidatoMaestros();
	if (response?.status === 200 && response.data) {
		Object.assign(maestros, response.data);
	}
};

const loadCargosByEmpresa = async () => {
	const rut = (props.empresaRut || '').trim();
	cargosLocal.value = [];
	if (!rut) return;
	loadingCargos.value = true;
	try {
		const response = await SipoService.getMaestros(rut);
		if (response?.status === 200) {
			cargosLocal.value = (response.data?.cargos ?? []).map((c) => ({
				label: c.nombre,
				value: c.nombre || c.external_code,
			}));
			syncCargoSelection();
		}
	} finally {
		loadingCargos.value = false;
	}
};

const onJefeChange = () => {
	const uid = String(form.cf_rrhh_sip_obra_candidato_jefe_user_id || '');
	const item = jefesOptions.value.find((j) => j.user_id === uid);
	form.cf_rrhh_sip_obra_candidato_jefe_nombre = item?.nombre || null;
	form.cf_rrhh_sip_obra_candidato_jefe_correo = item?.correo || null;
};

const ensureJefeOption = () => {
	const uid = String(form.cf_rrhh_sip_obra_candidato_jefe_user_id || '').trim();
	if (!uid) return;
	if (jefesOptions.value.some((j) => j.user_id === uid)) return;
	const nombre = String(form.cf_rrhh_sip_obra_candidato_jefe_nombre || '').trim();
	const correo = String(form.cf_rrhh_sip_obra_candidato_jefe_correo || '').trim();
	const label = nombre && correo ? `${nombre} (${correo})` : nombre || correo || uid;
	jefesOptions.value = [{ user_id: uid, nombre, correo, label }, ...jefesOptions.value];
};

const loadJefes = async () => {
	const cc = (props.centroCosto || '').trim();
	jefesOptions.value = [];
	if (!cc) {
		ensureJefeOption();
		return;
	}
	loadingJefes.value = true;
	try {
		const response = await SipoService.getPersonalPlanta(cc);
		if (response?.status === 200) {
			jefesOptions.value = response.data || [];
		}
	} finally {
		loadingJefes.value = false;
		ensureJefeOption();
	}
};

const syncCargoSelection = (opts?: { warnIfMissing?: boolean }) => {
	const current = String(form.cf_rrhh_sip_obra_candidato_nomcar || '').trim();
	if (!current) return;
	const options = cargosLocal.value.length
		? cargosLocal.value
		: props.cargoOptions || [];
	const match = options.find(
		(o) =>
			o.value === current ||
			o.label === current ||
			String(o.value).trim() === current ||
			String(o.label).trim() === current
	);
	if (match) {
		form.cf_rrhh_sip_obra_candidato_nomcar = match.value;
		return;
	}
	form.cf_rrhh_sip_obra_candidato_nomcar = null;
	if (opts?.warnIfMissing) {
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.WARN,
			'Cargo',
			'El cargo de la ficha no está asignado a esta razón social. Selecciona uno válido.'
		);
	}
};

const fillFromCandidato = (row: SipoCandidato) => {
	const tipo = row.cf_rrhh_sip_obra_candidato_tipo_contrato || 'Plazo Fijo';
	const terminoRaw = row.cf_rrhh_sip_obra_candidato_termino_contrato;
	const { numero, depto } = parseNumeroDepto(
		row.cf_rrhh_sip_obra_candidato_numero_dire,
		row.cf_rrhh_sip_obra_candidato_num_depto
	);
	Object.assign(form, emptyForm(), {
		cf_rrhh_sip_obra_candidato_tratamiento: row.cf_rrhh_sip_obra_candidato_tratamiento,
		cf_rrhh_sip_obra_candidato_nombre: row.cf_rrhh_sip_obra_candidato_nombre,
		cf_rrhh_sip_obra_candidato_segundo_nombre: row.cf_rrhh_sip_obra_candidato_segundo_nombre,
		cf_rrhh_sip_obra_candidato_ap: row.cf_rrhh_sip_obra_candidato_ap,
		cf_rrhh_sip_obra_candidato_am: row.cf_rrhh_sip_obra_candidato_am,
		cf_rrhh_sip_obra_candidato_genero: row.cf_rrhh_sip_obra_candidato_genero,
		cf_rrhh_sip_obra_candidato_rut: formatRut(row.cf_rrhh_sip_obra_candidato_rut || ''),
		cf_rrhh_sip_obra_candidato_fecha_nacimiento: parseDateInput(row.cf_rrhh_sip_obra_candidato_fecha_nacimiento),
		cf_rrhh_sip_obra_candidato_pais_nacimiento: row.cf_rrhh_sip_obra_candidato_pais_nacimiento,
		cf_rrhh_sip_obra_candidato_region_nacimiento: row.cf_rrhh_sip_obra_candidato_region_nacimiento,
		cf_rrhh_sip_obra_candidato_nacionalidad: row.cf_rrhh_sip_obra_candidato_nacionalidad,
		cf_rrhh_sip_obra_candidato_nacionalidad_ext: row.cf_rrhh_sip_obra_candidato_nacionalidad_ext,
		cf_rrhh_sip_obra_candidato_region: row.cf_rrhh_sip_obra_candidato_region,
		cf_rrhh_sip_obra_candidato_ciudad: row.cf_rrhh_sip_obra_candidato_ciudad,
		cf_rrhh_sip_obra_candidato_comuna: row.cf_rrhh_sip_obra_candidato_comuna,
		cf_rrhh_sip_obra_candidato_villa: cleanAddressField(row.cf_rrhh_sip_obra_candidato_villa),
		cf_rrhh_sip_obra_candidato_direccion: cleanAddressField(row.cf_rrhh_sip_obra_candidato_direccion),
		cf_rrhh_sip_obra_candidato_numero_dire: numero || null,
		cf_rrhh_sip_obra_candidato_num_depto: depto || null,
		cf_rrhh_sip_obra_candidato_estado_civil: row.cf_rrhh_sip_obra_candidato_estado_civil,
		cf_rrhh_sip_obra_candidato_telefono: row.cf_rrhh_sip_obra_candidato_telefono,
		cf_rrhh_sip_obra_candidato_correo: row.cf_rrhh_sip_obra_candidato_correo,
		cf_rrhh_sip_obra_candidato_metodo_pago: row.cf_rrhh_sip_obra_candidato_metodo_pago,
		cf_rrhh_sip_obra_candidato_banco: row.cf_rrhh_sip_obra_candidato_banco,
		cf_rrhh_sip_obra_candidato_numcta: row.cf_rrhh_sip_obra_candidato_numcta,
		cf_rrhh_sip_obra_candidato_anticipo: row.cf_rrhh_sip_obra_candidato_anticipo,
		cf_rrhh_sip_obra_candidato_nomcar: row.cf_rrhh_sip_obra_candidato_nomcar,
		cf_rrhh_sip_obra_candidato_jefe_user_id: row.cf_rrhh_sip_obra_candidato_jefe_user_id || null,
		cf_rrhh_sip_obra_candidato_jefe_nombre: row.cf_rrhh_sip_obra_candidato_jefe_nombre || null,
		cf_rrhh_sip_obra_candidato_jefe_correo: row.cf_rrhh_sip_obra_candidato_jefe_correo || null,
		cf_rrhh_sip_obra_candidato_horario_trabajo: row.cf_rrhh_sip_obra_candidato_horario_trabajo,
		cf_rrhh_sip_obra_candidato_sueldo: (() => {
			const n = parseMontoCl(row.cf_rrhh_sip_obra_candidato_sueldo);
			return n == null ? row.cf_rrhh_sip_obra_candidato_sueldo : formatMontoCl(n);
		})(),
		cf_rrhh_sip_obra_candidato_cuenta_gasto: row.cf_rrhh_sip_obra_candidato_cuenta_gasto,
		cf_rrhh_sip_obra_candidato_tipo_contrato: tipo,
		cf_rrhh_sip_obra_candidato_fecha_ingreso: parseDateInput(row.cf_rrhh_sip_obra_candidato_fecha_ingreso),
		cf_rrhh_sip_obra_candidato_termino_contrato: terminoRaw,
		cf_rrhh_sip_obra_candidato_fecha_termino_ito: row.cf_rrhh_sip_obra_candidato_fecha_termino_ito,
		cf_rrhh_sip_obra_candidato_jubilado: row.cf_rrhh_sip_obra_candidato_jubilado,
		cf_rrhh_sip_obra_candidato_nom_afp: row.cf_rrhh_sip_obra_candidato_nom_afp,
		cf_rrhh_sip_obra_candidato_nom_salud: row.cf_rrhh_sip_obra_candidato_nom_salud,
		cf_rrhh_sip_obra_candidato_valor_plan: row.cf_rrhh_sip_obra_candidato_valor_plan,
		cf_rrhh_sip_obra_candidato_valor_uf: row.cf_rrhh_sip_obra_candidato_valor_uf,
		cf_rrhh_sip_obra_candidato_seguro_covid: row.cf_rrhh_sip_obra_candidato_seguro_covid,
		cf_rrhh_sip_obra_candidato_ci: row.cf_rrhh_sip_obra_candidato_ci,
		cf_rrhh_sip_obra_candidato_afp: row.cf_rrhh_sip_obra_candidato_afp,
		cf_rrhh_sip_obra_candidato_salud: row.cf_rrhh_sip_obra_candidato_salud,
		cf_rrhh_sip_obra_candidato_domi: row.cf_rrhh_sip_obra_candidato_domi,
		cf_rrhh_sip_obra_candidato_copia_seguro_covid: row.cf_rrhh_sip_obra_candidato_copia_seguro_covid,
	});
	hitoTexto.value = tipo === 'Obra o Faena' ? String(terminoRaw || '') : '';
	plazoFijoFecha.value =
		tipo === 'Plazo Fijo' ? parseDateInput(terminoRaw as string | null) : null;
	fechaTerminoHito.value = parseDateInput(row.cf_rrhh_sip_obra_candidato_fecha_termino_ito);
	telefonoLocal.value = parseTelefonoLocal(row.cf_rrhh_sip_obra_candidato_telefono);
	syncTelefonoForm();
};

const resetForm = () => {
	Object.assign(form, emptyForm());
	hitoTexto.value = '';
	plazoFijoFecha.value = null;
	fechaTerminoHito.value = null;
	correoError.value = '';
	isValidatingEmail.value = false;
	telefonoLocal.value = '';
	rutWarning.value = '';
	fechaTerminoHitoError.value = '';
	plazoFijoError.value = '';
	reintegrarRut.value = null;
	fichaId.value = null;
	fichaCamposFaltantes.value = [];
	Object.keys(docErrors).forEach((k) => delete docErrors[k]);
	Object.keys(docMeta).forEach((k) => delete docMeta[k]);
};

const onTipoContratoChange = () => {
	hitoTexto.value = '';
	plazoFijoFecha.value = null;
	fechaTerminoHito.value = null;
	form.cf_rrhh_sip_obra_candidato_termino_contrato = null;
	form.cf_rrhh_sip_obra_candidato_fecha_termino_ito = null;
};

const loadReintegrar = async (search?: string) => {
	loadingReintegrar.value = true;
	try {
		const response = await SipoService.getReintegrarList(search);
		if (response?.status === 200) {
			reintegrarItems.value = response.data ?? [];
		}
	} finally {
		loadingReintegrar.value = false;
	}
};

let filterTimer: ReturnType<typeof setTimeout> | null = null;
const onReintegrarFilter = (event: { value: string }) => {
	if (filterTimer) clearTimeout(filterTimer);
	filterTimer = setTimeout(() => {
		void loadReintegrar(event.value);
	}, 300);
};

const onTipoChange = () => {
	resetForm();
	if (tipoCandidato.value === 'reintegrar') {
		void loadReintegrar();
	}
	if (tipoCandidato.value === 'ficha') {
		void loadFichasAprobadas();
	}
};

const onRegionChange = () => {
	form.cf_rrhh_sip_obra_candidato_ciudad = null;
	form.cf_rrhh_sip_obra_candidato_comuna = null;
};

const onPaisNacimientoChange = () => {
	form.cf_rrhh_sip_obra_candidato_region_nacimiento = null;
};

const onCiudadChange = () => {
	form.cf_rrhh_sip_obra_candidato_comuna = null;
};

const onReintegrarSelect = async () => {
	if (!reintegrarRut.value) return;
	global.utl.showLoader();
	try {
		const response = await SipoService.getReintegrarDetalle(reintegrarRut.value);
		if (response?.status === 200 && response.data) {
			fillFromCandidato(response.data);
			form.cf_rrhh_sip_obra_candidato_nomcar = null;
			form.cf_rrhh_sip_obra_candidato_horario_trabajo = null;
			form.cf_rrhh_sip_obra_candidato_fecha_ingreso = null;
			form.cf_rrhh_sip_obra_candidato_tipo_contrato = 'Plazo Fijo';
			form.cf_rrhh_sip_obra_candidato_termino_contrato = null;
			form.cf_rrhh_sip_obra_candidato_fecha_termino_ito = null;
			form.cf_rrhh_sip_obra_candidato_cuenta_gasto = null;
			hitoTexto.value = '';
			plazoFijoFecha.value = null;
			fechaTerminoHito.value = null;
		}
	} finally {
		global.utl.hiddenLoader();
	}
};

const loadFichasAprobadas = async (search?: string) => {
	loadingFichas.value = true;
	try {
		const response = await SipoFichasService.list(
			search,
			true,
			props.empresaRut || null
		);
		if (response?.status === 200) {
			const rows = Array.isArray(response.data) ? response.data : [];
			fichaItems.value = rows;
		}
	} finally {
		loadingFichas.value = false;
	}
};

let fichaFilterTimer: ReturnType<typeof setTimeout> | null = null;
const onFichaFilter = (event: { value: string }) => {
	if (fichaFilterTimer) clearTimeout(fichaFilterTimer);
	fichaFilterTimer = setTimeout(() => {
		void loadFichasAprobadas(event.value);
	}, 300);
};

const onFichaSelect = async () => {
	if (!fichaId.value) return;
	global.utl.showLoader();
	try {
		const response = await SipoFichasService.getById(fichaId.value);
		if (Number(response?.status) !== 200 || !response.data) {
			throw new Error('No se pudo cargar la ficha');
		}
		const mapped = mapFichaToCandidatoForm(response.data as Record<string, any>, maestros);
		Object.assign(form, emptyForm(), mapped.formPatch);
		telefonoLocal.value = parseTelefonoLocal(mapped.formPatch.cf_rrhh_sip_obra_candidato_telefono);
		syncTelefonoForm();

		const tipo = mapped.formPatch.cf_rrhh_sip_obra_candidato_tipo_contrato || 'Plazo Fijo';
		const terminoRaw = mapped.formPatch.cf_rrhh_sip_obra_candidato_termino_contrato;
		hitoTexto.value = tipo === 'Obra o Faena' ? String(terminoRaw || '') : '';
		plazoFijoFecha.value =
			tipo === 'Plazo Fijo' ? parseDateInput(terminoRaw as string | null) : null;
		fechaTerminoHito.value = mapped.formPatch.cf_rrhh_sip_obra_candidato_fecha_termino_ito || null;
		form.cf_rrhh_sip_obra_candidato_anticipo = 'Sí';
		ensureJefeOption();

		if (mapped.formPatch.cf_rrhh_sip_obra_candidato_ci) {
			docMeta.ci = { name: String(mapped.formPatch.cf_rrhh_sip_obra_candidato_ci).split('/').pop() || 'cédula', sizeMb: '' };
		}
		if (mapped.formPatch.cf_rrhh_sip_obra_candidato_afp) {
			docMeta.afp = { name: String(mapped.formPatch.cf_rrhh_sip_obra_candidato_afp).split('/').pop() || 'afp', sizeMb: '' };
		}
		if (mapped.formPatch.cf_rrhh_sip_obra_candidato_salud) {
			docMeta.salud = { name: String(mapped.formPatch.cf_rrhh_sip_obra_candidato_salud).split('/').pop() || 'salud', sizeMb: '' };
		}
		if (mapped.formPatch.cf_rrhh_sip_obra_candidato_domi) {
			docMeta.domi = { name: String(mapped.formPatch.cf_rrhh_sip_obra_candidato_domi).split('/').pop() || 'domicilio', sizeMb: '' };
		}

		syncCargoSelection({ warnIfMissing: true });

		const faltantes = mapped.camposFaltantes;
		fichaCamposFaltantes.value = faltantes;
		if (faltantes.length) {
			global.utl.genCustomeToast(
				ToastSeverityMessageEnum.INFO,
				'Ficha de Ingreso',
				`Se completaron ${mapped.camposCompletados.length} campos obligatorios. Revisa los pendientes.`
			);
		} else {
			global.utl.genCustomeToast(
				ToastSeverityMessageEnum.SUCCESS,
				'Ficha de Ingreso',
				'Se completaron todos los campos obligatorios desde la ficha.'
			);
		}
	} catch {
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.ERROR,
			'Ficha de Ingreso',
			'No se pudo cargar la ficha seleccionada.'
		);
		fichaId.value = null;
		fichaCamposFaltantes.value = [];
	} finally {
		global.utl.hiddenLoader();
	}
};

const parseTelefonoLocal = (value: string | null | undefined): string => {
	const digits = String(value || '').replace(/\D/g, '');
	if (digits.startsWith('569')) return digits.slice(3, 11);
	if (digits.startsWith('56')) return digits.slice(2, 10);
	return digits.slice(0, 8);
};

const formatTelefonoFull = (local: string): string => {
	const digits = local.replace(/\D/g, '').slice(0, 8);
	return digits ? `${TELEFONO_PREFIX}${digits}` : '';
};

const syncTelefonoForm = () => {
	form.cf_rrhh_sip_obra_candidato_telefono = formatTelefonoFull(telefonoLocal.value);
};

const onTelefonoInput = (event: Event) => {
	const target = event.target as HTMLInputElement;
	telefonoLocal.value = target.value.replace(/\D/g, '').slice(0, 8);
	syncTelefonoForm();
};

const onCorreoInput = () => {
	if (correoError.value) correoError.value = '';
};

const onCorreoBlur = async () => {
	correoError.value = '';
	const correo = String(form.cf_rrhh_sip_obra_candidato_correo || '').trim();
	if (!correo) return;

	isValidatingEmail.value = true;
	try {
		const response = await SipoService.validarCorreo(correo);
		if (response?.status === 200 && response.data?.valido === false) {
			correoError.value = 'El correo no existe, favor ingresar un correo válido';
		}
	} catch {
		correoError.value = 'No se pudo verificar el correo. Intente nuevamente.';
	} finally {
		isValidatingEmail.value = false;
	}
};

const onRutInput = (event: Event) => {
	const target = event.target as HTMLInputElement;
	form.cf_rrhh_sip_obra_candidato_rut = filterRutInput(target.value);
	rutWarning.value = '';
};

const showRutAlert = (message: string) => {
	useToastStore().show({
		severity: ToastSeverityMessageEnum.WARN,
		summary: 'Alerta',
		detail: message,
		life: 9000,
		group: ToastGroupEnum.TOP_RIGHT,
	});
};

const onRutBlur = async () => {
	rutWarning.value = '';
	const raw = String(form.cf_rrhh_sip_obra_candidato_rut || '').trim();
	if (!raw) return;

	const formatted = formatRut(raw);
	form.cf_rrhh_sip_obra_candidato_rut = formatted;

	if (!isValidRut(formatted)) {
		rutWarning.value = 'RUT inválido. Verifique el dígito verificador.';
		return;
	}

	try {
		const response = await SipoService.validarRut(formatted, props.sipId);
		if (response?.status !== 200) {
			return;
		}
		const data = response.data;
		if (data?.activo_ibuilder_sap && data.mensaje) {
			rutWarning.value = data.mensaje;
			showRutAlert(data.mensaje);
		}
	} catch {
		useToastStore().show({
			severity: ToastSeverityMessageEnum.ERROR,
			summary: 'Validación RUT',
			detail: 'No se pudo verificar el RUT en iBuilder/SAP. Intente nuevamente.',
			life: 6000,
			group: ToastGroupEnum.TOP_RIGHT,
		});
	}
};

const onFileSelected = async (event: Event, docType: string) => {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	docErrors[docType] = '';
	if (!file) return;

	const ext = file.name.split('.').pop()?.toLowerCase() || '';
	if (!ALLOWED_EXT.has(ext)) {
		docErrors[docType] = 'Extensión no permitida (pdf, png, jpg, jpeg, webp).';
		input.value = '';
		return;
	}
	const sizeMb = file.size / (1024 * 1024);
	if (sizeMb > MAX_MB) {
		docErrors[docType] = 'No puede subir un archivo que pese más de 4 MB.';
		input.value = '';
		return;
	}

	docMeta[docType] = { name: file.name, sizeMb: sizeMb.toFixed(2) };
	uploadingDoc.value = docType;
	try {
		const fd = new FormData();
		fd.append('file', file);
		fd.append('doc_type', docType);
		fd.append('sip_id', String(props.sipId));
		fd.append('rut', String(form.cf_rrhh_sip_obra_candidato_rut || ''));
		const response = await SipoService.uploadCandidatoDoc(fd);
		if (response?.status === 200 && (response.data?.path || response.data?.url)) {
			const field =
				response.data.field ||
				docSlots.find((d) => d.key === docType)?.field ||
				(docType === 'seguro_covid' ? 'cf_rrhh_sip_obra_candidato_copia_seguro_covid' : null);
			if (field) form[field] = response.data.path || response.data.url;
		} else {
			docErrors[docType] = 'No se pudo subir el archivo.';
		}
	} catch {
		docErrors[docType] = 'Error al subir el archivo.';
	} finally {
		uploadingDoc.value = null;
	}
};

const resolveTerminoContrato = (): string | null => {
	const tipo = form.cf_rrhh_sip_obra_candidato_tipo_contrato;
	if (tipo === 'Obra o Faena') return String(hitoTexto.value || '').trim() || null;
	if (tipo === 'Plazo Fijo') return toDateStr(plazoFijoFecha.value);
	return null;
};

const buildPayload = (): SipoCandidatoWritePayload => ({
	cf_rrhh_sip_obra_candidato_tratamiento: form.cf_rrhh_sip_obra_candidato_tratamiento,
	cf_rrhh_sip_obra_candidato_rut: form.cf_rrhh_sip_obra_candidato_rut,
	cf_rrhh_sip_obra_candidato_nombre: form.cf_rrhh_sip_obra_candidato_nombre,
	cf_rrhh_sip_obra_candidato_segundo_nombre: form.cf_rrhh_sip_obra_candidato_segundo_nombre,
	cf_rrhh_sip_obra_candidato_ap: form.cf_rrhh_sip_obra_candidato_ap,
	cf_rrhh_sip_obra_candidato_am: form.cf_rrhh_sip_obra_candidato_am,
	cf_rrhh_sip_obra_candidato_genero: form.cf_rrhh_sip_obra_candidato_genero,
	cf_rrhh_sip_obra_candidato_fecha_nacimiento: toDateStr(form.cf_rrhh_sip_obra_candidato_fecha_nacimiento),
	cf_rrhh_sip_obra_candidato_pais_nacimiento: form.cf_rrhh_sip_obra_candidato_pais_nacimiento,
	cf_rrhh_sip_obra_candidato_region_nacimiento: form.cf_rrhh_sip_obra_candidato_region_nacimiento,
	cf_rrhh_sip_obra_candidato_nacionalidad: form.cf_rrhh_sip_obra_candidato_nacionalidad,
	cf_rrhh_sip_obra_candidato_nacionalidad_ext: showNacionalidadExt.value
		? form.cf_rrhh_sip_obra_candidato_nacionalidad_ext
		: null,
	cf_rrhh_sip_obra_candidato_region: form.cf_rrhh_sip_obra_candidato_region,
	cf_rrhh_sip_obra_candidato_ciudad: form.cf_rrhh_sip_obra_candidato_ciudad,
	cf_rrhh_sip_obra_candidato_comuna: form.cf_rrhh_sip_obra_candidato_comuna,
	cf_rrhh_sip_obra_candidato_villa: form.cf_rrhh_sip_obra_candidato_villa,
	cf_rrhh_sip_obra_candidato_direccion: form.cf_rrhh_sip_obra_candidato_direccion,
	cf_rrhh_sip_obra_candidato_numero_dire: form.cf_rrhh_sip_obra_candidato_numero_dire,
	cf_rrhh_sip_obra_candidato_num_depto: form.cf_rrhh_sip_obra_candidato_num_depto,
	cf_rrhh_sip_obra_candidato_estado_civil: form.cf_rrhh_sip_obra_candidato_estado_civil,
	cf_rrhh_sip_obra_candidato_telefono: formatTelefonoFull(telefonoLocal.value),
	cf_rrhh_sip_obra_candidato_correo: form.cf_rrhh_sip_obra_candidato_correo,
	cf_rrhh_sip_obra_candidato_metodo_pago: form.cf_rrhh_sip_obra_candidato_metodo_pago,
	cf_rrhh_sip_obra_candidato_banco: form.cf_rrhh_sip_obra_candidato_banco,
	cf_rrhh_sip_obra_candidato_numcta: form.cf_rrhh_sip_obra_candidato_numcta,
	cf_rrhh_sip_obra_candidato_anticipo: 'Sí',
	cf_rrhh_sip_obra_candidato_nomcar: form.cf_rrhh_sip_obra_candidato_nomcar,
	cf_rrhh_sip_obra_candidato_jefe_user_id: form.cf_rrhh_sip_obra_candidato_jefe_user_id,
	cf_rrhh_sip_obra_candidato_jefe_nombre: form.cf_rrhh_sip_obra_candidato_jefe_nombre,
	cf_rrhh_sip_obra_candidato_jefe_correo: form.cf_rrhh_sip_obra_candidato_jefe_correo,
	cf_rrhh_sip_obra_candidato_horario_trabajo: form.cf_rrhh_sip_obra_candidato_horario_trabajo,
	cf_rrhh_sip_obra_candidato_sueldo: String(parseMontoCl(form.cf_rrhh_sip_obra_candidato_sueldo) ?? ''),
	cf_rrhh_sip_obra_candidato_cuenta_gasto: form.cf_rrhh_sip_obra_candidato_cuenta_gasto,
	cf_rrhh_sip_obra_candidato_tipo_contrato: form.cf_rrhh_sip_obra_candidato_tipo_contrato,
	cf_rrhh_sip_obra_candidato_fecha_ingreso: toDateStr(form.cf_rrhh_sip_obra_candidato_fecha_ingreso) || '',
	cf_rrhh_sip_obra_candidato_termino_contrato: resolveTerminoContrato(),
	cf_rrhh_sip_obra_candidato_fecha_termino_ito: isObraFaena.value
		? toDateStr(fechaTerminoHito.value)
		: null,
	cf_rrhh_sip_obra_candidato_jubilado: form.cf_rrhh_sip_obra_candidato_jubilado,
	cf_rrhh_sip_obra_candidato_nom_afp: form.cf_rrhh_sip_obra_candidato_nom_afp,
	cf_rrhh_sip_obra_candidato_nom_salud: form.cf_rrhh_sip_obra_candidato_nom_salud,
	cf_rrhh_sip_obra_candidato_valor_plan: showValorPlan.value
		? form.cf_rrhh_sip_obra_candidato_valor_plan
		: null,
	cf_rrhh_sip_obra_candidato_valor_uf: showValorUf.value
		? form.cf_rrhh_sip_obra_candidato_valor_uf
		: null,
	cf_rrhh_sip_obra_candidato_seguro_covid: null,
	cf_rrhh_sip_obra_candidato_ci: form.cf_rrhh_sip_obra_candidato_ci,
	cf_rrhh_sip_obra_candidato_afp: form.cf_rrhh_sip_obra_candidato_afp,
	cf_rrhh_sip_obra_candidato_salud: form.cf_rrhh_sip_obra_candidato_salud,
	cf_rrhh_sip_obra_candidato_domi: form.cf_rrhh_sip_obra_candidato_domi,
	cf_rrhh_sip_obra_candidato_copia_seguro_covid: null,
});

const submit = async () => {
	if (!validateRequiredFields()) {
		showObligatoriosToast();
		return;
	}
	validateFechasContrato();
	if (fechaTerminoHitoError.value || plazoFijoError.value) {
		showObligatoriosToast();
		return;
	}
	if (isValidatingEmail.value || sueldoWarning.value || correoError.value || rutWarning.value) {
		global.utl.genToast(global.tstType.FORM_ERROR);
		return;
	}

	const rutFormatted = formatRut(form.cf_rrhh_sip_obra_candidato_rut);
	if (!isValidRut(rutFormatted)) {
		rutWarning.value = 'RUT inválido. Verifique el dígito verificador.';
		global.utl.genToast(global.tstType.FORM_ERROR);
		return;
	}
	form.cf_rrhh_sip_obra_candidato_rut = rutFormatted;
	try {
		const rutCheck = await SipoService.validarRut(rutFormatted, props.sipId);
		if (rutCheck?.status !== 200) {
			rutWarning.value = 'No se pudo verificar el RUT en SAP. Intente nuevamente.';
			global.utl.genToast(global.tstType.FORM_ERROR);
			return;
		}
		if (rutCheck.data?.activo_ibuilder_sap) {
			rutWarning.value = rutCheck.data.mensaje || 'El trabajador aún está activo en SAP.';
			showRutAlert(rutWarning.value);
			global.utl.genToast(global.tstType.FORM_ERROR);
			return;
		}
	} catch {
		rutWarning.value = 'No se pudo verificar el RUT en SAP. Intente nuevamente.';
		global.utl.genToast(global.tstType.FORM_ERROR);
		return;
	}

	saving.value = true;
	global.utl.showLoader();
	const payload = buildPayload();
	try {
		const response = editingId.value
			? await SipoService.updateCandidato(props.sipId, editingId.value, payload)
			: await SipoService.createCandidato(props.sipId, payload);
		if (response?.status === 200) {
			clearFieldErrors();
			global.utl.genToast(global.tstType.REGISTER_SUCCESS);
			visibleProxy.value = false;
			emit('saved');
			return;
		}
		global.utl.genToast(global.tstType.SERVER_ERROR);
	} finally {
		saving.value = false;
		global.utl.hiddenLoader();
	}
};

const stopPortalPoll = () => {
	if (portalPoll) {
		clearInterval(portalPoll);
		portalPoll = null;
	}
};

const refrescarDesdePortal = async () => {
	if (!editingId.value) return;
	const response = await SipoService.getCandidatos(props.sipId);
	const row = (response.data || []).find((c) => c.cf_rrhh_sip_obra_candidato_id === editingId.value);
	if (row) fillFromCandidato(row);
};

const abrirPortalQr = async () => {
	if (!editingId.value) return;
	generandoQr.value = true;
	try {
		const response = await SipoService.generarAccesoCandidato(props.sipId, editingId.value);
		qrData.value = response.data;
		qrVisible.value = true;
		stopPortalPoll();
		portalPoll = setInterval(() => {
			void refrescarDesdePortal();
		}, 5000);
	} finally {
		generandoQr.value = false;
	}
};

const copiarEnlace = async () => {
	const url = qrData.value?.url;
	if (!url) return;
	await navigator.clipboard.writeText(url);
	useToastStore().show({
		severity: ToastSeverityMessageEnum.SUCCESS,
		summary: 'Enlace copiado',
		life: 2500,
	});
};

onUnmounted(stopPortalPoll);

watch(qrVisible, (open) => {
	if (!open) stopPortalPoll();
});

const onHide = () => {
	stopPortalPoll();
	qrVisible.value = false;
	resetForm();
	tipoCandidato.value = 'nuevo';
	editingId.value = null;
	isLoadingDetail.value = false;
	global.utl.hiddenLoader();
};

watch(
	() => form.cf_rrhh_sip_obra_candidato_nom_salud,
	(salud) => {
		if (!salud || FONASA_SIN_PLAN.has(salud)) {
			form.cf_rrhh_sip_obra_candidato_valor_plan = null;
			form.cf_rrhh_sip_obra_candidato_valor_uf = null;
		}
	}
);

watch(
	() => form.cf_rrhh_sip_obra_candidato_valor_plan,
	(plan) => {
		if (plan !== 'UF') form.cf_rrhh_sip_obra_candidato_valor_uf = null;
	}
);

watch(
	() => form.cf_rrhh_sip_obra_candidato_rut,
	() => {
		applyCuentaRutNumero();
	}
);

watch(
	() => props.visible,
	async (open) => {
		if (!open) return;

		const candidato = props.candidato;
		const hasCandidato = Boolean(candidato?.cf_rrhh_sip_obra_candidato_id);
		isLoadingDetail.value = hasCandidato;
		resetForm();

		if (hasCandidato && candidato) {
			editingId.value = candidato.cf_rrhh_sip_obra_candidato_id;
			tipoCandidato.value = 'nuevo';
			global.utl.showLoader();
		} else {
			editingId.value = null;
			tipoCandidato.value = 'nuevo';
		}

		try {
			await Promise.all([loadMaestros(), loadCargosByEmpresa(), loadJefes()]);
			if (hasCandidato && candidato) {
				fillFromCandidato(candidato);
				syncCargoSelection();
				ensureJefeOption();
			}
		} finally {
			isLoadingDetail.value = false;
			if (hasCandidato) global.utl.hiddenLoader();
		}
	}
);
</script>

<style scoped>
.candidato-readonly :deep(input),
.candidato-readonly :deep(textarea),
.candidato-readonly :deep(.p-inputtext),
.candidato-readonly :deep(.p-dropdown),
.candidato-readonly :deep(.p-calendar),
.candidato-readonly :deep(.p-checkbox),
.candidato-readonly :deep(.p-radiobutton),
.candidato-readonly :deep(.p-autocomplete),
.candidato-readonly :deep(.p-multiselect),
.candidato-readonly :deep(button:not(.p-dialog-header-close)) {
	pointer-events: none;
}

.candidato-readonly {
	opacity: 0.95;
}

.telefono-input-group {
	border: 1px solid var(--surface-border);
	border-radius: 6px;
	overflow: hidden;
	background: var(--surface-0);
}

.telefono-prefix {
	display: inline-flex;
	align-items: center;
	padding: 0 0.75rem;
	background: var(--surface-100);
	color: var(--text-color-secondary);
	font-size: 0.875rem;
	font-weight: 600;
	border-right: 1px solid var(--surface-border);
	user-select: none;
}

.telefono-input-group :deep(.telefono-input) {
	border: none;
	border-radius: 0;
	box-shadow: none;
}
</style>
