<template>
	<Dialog
		v-model:visible="visibleProxy"
		modal
		:draggable="false"
		:style="{ width: 'min(1100px, 96vw)' }"
		:breakpoints="{ '960px': '98vw' }"
		class="sipo-ficha-detalle-modal"
		@hide="onHide"
	>
		<template #header>
			<span class="font-semibold">Ficha de Ingreso #{{ fichaId }}</span>
		</template>

		<div v-if="loading" class="flex justify-content-center align-items-center py-6">
			<ProgressSpinner style="width: 40px; height: 40px" />
		</div>

		<div v-else-if="ficha" class="ficha-detalle-body ficha-readonly flex flex-column gap-3">
			<div class="ficha-doc-header border-1 border-300 border-round bg-white p-3">
				<div class="ficha-doc-brand flex flex-column sm:flex-row justify-content-between align-items-center gap-3 mb-3">
					<img :src="logoGrupoFicha" alt="Grupo Flesan" class="ficha-logo-grupo" />
					<div class="text-right text-sm line-height-3 flex-shrink-0">
						<div><strong>Cód:</strong> P-RH-01</div>
						<div><strong>Anexo:</strong> 02</div>
						<div class="mt-2">
							<Tag
								:value="display(ficha.estado_label || ficha.estado)"
								:severity="estadoSeverity(ficha.estado)"
							/>
						</div>
					</div>
				</div>
				<h2 class="m-0 text-center text-xl font-bold uppercase text-900">
					Ficha de Ingreso de Personal
				</h2>
			</div>

			<section class="ficha-section border-1 border-300 border-round bg-white p-3">
				<h3 class="ficha-section__title">
					1. Datos a completar por Recursos Humanos y Área Solicitante
				</h3>
				<div class="grid formgrid p-fluid">
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Razón Social</label>
						<InputText :modelValue="display(ficha.razon_social_nombre)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Obra</label>
						<InputText :modelValue="display(ficha.obra)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Centro de Costo</label>
						<InputText :modelValue="display(ficha.centro_costo_id)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Descripción Centro Costo</label>
						<InputText :modelValue="display(ficha.centro_costo_nombre)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Cargo</label>
						<InputText :modelValue="display(ficha.cargo)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Fecha de ingreso</label>
						<InputText :modelValue="formatFecha(ficha.fecha_ingreso)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Jefe Directo</label>
						<InputText
							:modelValue="jefeDirectoLabel"
							class="w-full"
							readonly
						/>
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Correo Jefe Directo</label>
						<InputText :modelValue="display(ficha.correo_jefe_directo)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Correo Administrador de Obra</label>
						<InputText :modelValue="display(ficha.correo_admin_obra)" class="w-full" readonly />
					</div>
				</div>
			</section>

			<section class="ficha-section border-1 border-300 border-round bg-white p-3">
				<h3 class="ficha-section__title">2. Datos a completar por Nuevo Colaborador</h3>
				<div class="grid formgrid p-fluid">
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Nombres</label>
						<InputText :modelValue="display(ficha.nombres)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Primer Apellido</label>
						<InputText :modelValue="display(ficha.apellido_paterno)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Segundo Apellido</label>
						<InputText :modelValue="display(ficha.apellido_materno)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">RUT</label>
						<InputText :modelValue="display(ficha.rut)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">AFP</label>
						<InputText :modelValue="display(ficha.afp)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Isapre / Fonasa</label>
						<InputText :modelValue="display(ficha.isapre_fonasa)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Jubilado</label>
						<InputText :modelValue="ficha.jubilado ? 'Sí' : 'No'" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Estado Civil</label>
						<InputText :modelValue="display(ficha.estado_civil)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Tratamiento</label>
						<InputText :modelValue="display(ficha.tratamiento)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Género</label>
						<InputText :modelValue="display(ficha.genero)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Fecha de Nacimiento</label>
						<InputText :modelValue="formatFecha(ficha.fecha_nacimiento)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Edad</label>
						<InputText :modelValue="display(ficha.edad)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">País de nacimiento</label>
						<InputText :modelValue="display(ficha.pais_nacimiento)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Región de nacimiento</label>
						<InputText :modelValue="display(ficha.region_nacimiento)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Nacionalidad</label>
						<InputText :modelValue="display(ficha.nacionalidad)" class="w-full" readonly />
					</div>
					<div v-if="showNacionalidadExt" class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Nacionalidad extranjera</label>
						<InputText :modelValue="display(ficha.nacionalidad_ext)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Teléfono Particular o Celular</label>
						<InputText :modelValue="display(ficha.telefono)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Nombre calle</label>
						<InputText :modelValue="display(ficha.domicilio)" class="w-full" readonly />
					</div>
					<div v-if="hasValue(ficha.villa)" class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Villa / población</label>
						<InputText :modelValue="display(ficha.villa)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Número dirección</label>
						<InputText :modelValue="display(ficha.numero_direccion)" class="w-full" readonly />
					</div>
					<div v-if="hasValue(ficha.num_depto)" class="field col-12 md:col-4">
						<label class="font-semibold text-sm">N° departamento</label>
						<InputText :modelValue="display(ficha.num_depto)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Región</label>
						<InputText :modelValue="display(ficha.region)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Ciudad</label>
						<InputText :modelValue="display(ficha.ciudad)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Comuna</label>
						<InputText :modelValue="display(ficha.comuna)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">E-mail Personal</label>
						<InputText :modelValue="display(ficha.email_personal)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Método de pago</label>
						<InputText :modelValue="display(ficha.metodo_pago)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Banco</label>
						<InputText :modelValue="display(ficha.banco)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">N° Cta. Bancaria</label>
						<InputText :modelValue="display(ficha.numero_cuenta)" class="w-full" readonly />
					</div>
				</div>
			</section>

			<section class="ficha-section border-1 border-300 border-round bg-white p-3">
				<h3 class="ficha-section__title">3. Datos de Contratación y Documentos</h3>
				<div class="grid formgrid p-fluid">
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Sueldo Líquido (NO costo empresa)</label>
						<InputText :modelValue="formatMontoCl(ficha.sueldo_liquido)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Cuenta de gasto</label>
						<InputText :modelValue="display(ficha.cuenta_gasto)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Tipo de contrato</label>
						<InputText :modelValue="display(ficha.tipo_contrato)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">{{ isObraFaena ? 'HITO' : 'Término contrato' }}</label>
						<InputText
							:modelValue="
								isPlazoFijo
									? formatFecha(ficha.termino_contrato)
									: display(ficha.termino_contrato)
							"
							class="w-full"
							readonly
						/>
					</div>
					<div v-if="isObraFaena" class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Fecha término HITO</label>
						<InputText :modelValue="formatFecha(ficha.fecha_termino_ito)" class="w-full" readonly />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">Horario</label>
						<InputText :modelValue="display(ficha.horario)" class="w-full" readonly />
					</div>
				</div>

				<div class="mt-3">
					<h4 class="ficha-subsection__title">Documentos Adjuntos</h4>
					<div class="grid formgrid">
						<div v-for="doc in documentos" :key="doc.key" class="field col-12 md:col-6">
							<label class="font-semibold text-sm">{{ doc.label }}</label>
							<div class="flex align-items-center gap-2">
								<InputText
									:modelValue="doc.url ? doc.filename : 'Sin documento'"
									class="w-full"
									readonly
								/>
								<Button
									v-if="doc.url"
									icon="pi pi-external-link"
									text
									rounded
									severity="info"
									v-tooltip.top="'Abrir documento'"
									@click="openDoc(doc.url)"
								/>
							</div>
						</div>
					</div>
				</div>

				<div class="field mt-3">
					<label class="font-semibold text-sm">Observaciones</label>
					<Textarea :modelValue="display(ficha.observaciones)" rows="4" class="w-full" readonly autoResize />
				</div>
			</section>
		</div>

		<template #footer>
			<div class="flex justify-content-end gap-2 w-full">
				<Button label="Cerrar" severity="secondary" outlined @click="visibleProxy = false" />
				<Button
					v-if="ficha?.can_aprobar"
					:label="ficha?.accion_aprobar_label || 'Aprobar'"
					icon="pi pi-check"
					severity="success"
					:loading="aprobando"
					@click="onAprobar"
				/>
				<Button
					v-if="ficha?.can_editar"
					label="Editar"
					icon="pi pi-pencil"
					severity="warning"
					@click="onEditar"
				/>
				<Button
					v-if="ficha?.can_retroceder"
					label="Retroceder aprobación"
					icon="pi pi-replay"
					severity="warning"
					:loading="retrocediendo"
					@click="onRetroceder"
				/>
				<Button
					v-if="ficha?.can_eliminar"
					label="Eliminar"
					icon="pi pi-trash"
					severity="danger"
					:loading="eliminando"
					:disabled="!fichaId"
					@click="onEliminar"
				/>
			</div>
		</template>
	</Dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useGlobalStore } from '../../../store/global';
import { ToastSeverityMessageEnum } from '../../../shared/interfaces/toast-message.interface';
import { formatMontoCl } from '../../../utils/formatters';
import { SipoFichasService } from '../services/SipoFichasService';
import logoGrupoFicha from '../../../assets/img/logo_grupo_flesan.png';

const props = defineProps<{
	visible: boolean;
	fichaId: number | null;
}>();

const emit = defineEmits<{
	(e: 'update:visible', value: boolean): void;
	(e: 'eliminada'): void;
	(e: 'aprobada'): void;
	(e: 'retrocedida'): void;
}>();

const global = useGlobalStore();
const router = useRouter();
const loading = ref(false);
const aprobando = ref(false);
const retrocediendo = ref(false);
const eliminando = ref(false);
const ficha = ref<Record<string, any> | null>(null);

const visibleProxy = computed({
	get: () => props.visible,
	set: (value: boolean) => emit('update:visible', value),
});

const display = (value: unknown) => {
	if (value === null || value === undefined || value === '') return '—';
	return String(value);
};

const jefeDirectoLabel = computed(() => {
	const nombre = String(ficha.value?.jefe_nombre || '').trim();
	const correo = String(ficha.value?.jefe_correo || '').trim();
	if (nombre && correo) return `${nombre} (${correo})`;
	return nombre || correo || '—';
});

const hasValue = (value: unknown) =>
	value !== null && value !== undefined && String(value).trim() !== '';

const showNacionalidadExt = computed(() => {
	const nac = String(ficha.value?.nacionalidad || '');
	return nac === 'Extranjero' || nac === 'Extranjero-Definitiva';
});

const isObraFaena = computed(
	() => String(ficha.value?.tipo_contrato || '') === 'Obra o Faena'
);

const isPlazoFijo = computed(
	() => String(ficha.value?.tipo_contrato || '') === 'Plazo Fijo'
);

const formatFecha = (value: unknown) => {
	const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (!m) return display(value);
	return `${m[3]}-${m[2]}-${m[1]}`;
};

const estadoSeverity = (estado: unknown) => {
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

const fileNameFromUrl = (url?: string | null) => {
	if (!url) return '';
	try {
		const path = decodeURIComponent(url.split('?')[0] || '');
		const parts = path.split('/');
		return parts[parts.length - 1] || 'documento';
	} catch {
		return 'documento';
	}
};

const fileNameFromField = (value?: string | null) => {
	if (!value) return '';
	const parts = String(value).split('/');
	return parts[parts.length - 1] || '';
};

const documentos = computed(() => [
	{
		key: 'domicilio',
		label: 'Comprobante de Domicilio',
		url: ficha.value?.doc_domicilio_url as string | null,
		filename: fileNameFromField(ficha.value?.doc_domicilio) || fileNameFromUrl(ficha.value?.doc_domicilio_url),
	},
	{
		key: 'titulo',
		label: 'Certificado de Título',
		url: ficha.value?.doc_titulo_url as string | null,
		filename: fileNameFromField(ficha.value?.doc_titulo) || fileNameFromUrl(ficha.value?.doc_titulo_url),
	},
	{
		key: 'afp',
		label: 'Certificado AFP',
		url: ficha.value?.doc_afp_url as string | null,
		filename: fileNameFromField(ficha.value?.doc_afp) || fileNameFromUrl(ficha.value?.doc_afp_url),
	},
	{
		key: 'salud',
		label: 'Certificado Salud',
		url: ficha.value?.doc_salud_url as string | null,
		filename: fileNameFromField(ficha.value?.doc_salud) || fileNameFromUrl(ficha.value?.doc_salud_url),
	},
	{
		key: 'cedula',
		label: 'Cédula de Identidad',
		url: ficha.value?.doc_cedula_url as string | null,
		filename: fileNameFromField(ficha.value?.doc_cedula) || fileNameFromUrl(ficha.value?.doc_cedula_url),
	},
]);

const openDoc = async (url: string) => {
	try {
		const response = await axios.get(url, { responseType: 'blob' });
		if (response?.status && Number(response.status) >= 400) {
			throw new Error('HTTP error');
		}
		const contentType = String(response.headers['content-type'] || 'application/octet-stream');
		const blobUrl = URL.createObjectURL(new Blob([response.data], { type: contentType }));
		window.open(blobUrl, '_blank', 'noopener,noreferrer');
		window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
	} catch {
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.ERROR,
			'Documento',
			'No se pudo abrir el documento adjunto.'
		);
	}
};

const loadDetalle = async (id: number) => {
	loading.value = true;
	ficha.value = null;
	try {
		const res = await SipoFichasService.getById(id);
		if (Number(res?.status) !== 200 || !res?.data) {
			throw new Error(res?.detail || 'Error al cargar ficha');
		}
		ficha.value = res.data as Record<string, any>;
	} catch {
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.ERROR,
			'Ficha',
			`No se pudo cargar la ficha #${id}.`
		);
		visibleProxy.value = false;
	} finally {
		loading.value = false;
	}
};

const onEditar = () => {
	if (!props.fichaId) return;
	visibleProxy.value = false;
	router.push({ name: 'SipoFichaIngresoEdit', params: { id: String(props.fichaId) } });
};

const onAprobar = () => {
	if (!props.fichaId) return;
	const id = props.fichaId;
	const estadoPrev = String(ficha.value?.estado || '').toUpperCase();
	const por =
		estadoPrev.includes('RRHH') || estadoPrev === 'PENDIENTE_ADMIN'
			? 'RRHH'
			: 'Jefe de Terreno';
	global.utl.showConfirmation({
		header: 'Confirmar aprobación',
		message: `¿Aprobar la ficha #${id} como ${por}?`,
		labelAccept: 'Sí, aprobar',
		labelReject: 'Cancelar',
		accept: async () => {
			aprobando.value = true;
			try {
				const res = await SipoFichasService.aprobar(id);
				if (Number(res?.status) !== 200 || !res?.data) {
					throw new Error(res?.detail || 'No se pudo aprobar');
				}
				ficha.value = res.data as Record<string, any>;
				global.utl.genCustomeToast(
					ToastSeverityMessageEnum.SUCCESS,
					'Aprobación',
					`Ficha #${id} aprobada exitosamente por ${por}.`
				);
				emit('aprobada');
			} catch {
				global.utl.genCustomeToast(
					ToastSeverityMessageEnum.ERROR,
					'Aprobación',
					`No se pudo aprobar la ficha #${id}.`
				);
			} finally {
				aprobando.value = false;
			}
		},
		reject: () => {},
	});
};

const onRetroceder = () => {
	if (!props.fichaId) return;
	const id = props.fichaId;
	global.utl.showConfirmation({
		header: 'Retroceder aprobación',
		message: `¿Retroceder la ficha #${id} a Pendiente Jefe de Terreno para volver a aprobarla?`,
		labelAccept: 'Sí, retroceder',
		labelReject: 'Cancelar',
		accept: async () => {
			retrocediendo.value = true;
			try {
				const res = await SipoFichasService.retroceder(id);
				if (Number(res?.status) !== 200 || !res?.data) {
					throw new Error(res?.detail || 'No se pudo retroceder');
				}
				ficha.value = res.data as Record<string, any>;
				global.utl.genCustomeToast(
					ToastSeverityMessageEnum.SUCCESS,
					'Retroceso',
					`Ficha #${id} regresó a Pendiente Jefe de Terreno.`
				);
				emit('retrocedida');
			} catch {
				global.utl.genCustomeToast(
					ToastSeverityMessageEnum.ERROR,
					'Retroceso',
					`No se pudo retroceder la ficha #${id}.`
				);
			} finally {
				retrocediendo.value = false;
			}
		},
		reject: () => {},
	});
};

const onEliminar = () => {
	if (!props.fichaId) return;
	const id = props.fichaId;
	const nombre = String(ficha.value?.nombre_colaborador || ficha.value?.rut || '').trim();
	global.utl.showConfirmation({
		header: 'Eliminar ficha',
		message: `¿Eliminar permanentemente la ficha #${id}${nombre ? ` (${nombre})` : ''}? Esta acción no se puede deshacer.`,
		labelAccept: 'Sí, eliminar',
		labelReject: 'Cancelar',
		accept: async () => {
			eliminando.value = true;
			try {
				const res = await SipoFichasService.eliminar(id);
				if (Number(res?.status) !== 200) {
					throw new Error((res as any)?.detail || 'No se pudo eliminar');
				}
				global.utl.genCustomeToast(
					ToastSeverityMessageEnum.SUCCESS,
					'Eliminar',
					`Ficha #${id} eliminada.`
				);
				visibleProxy.value = false;
				emit('eliminada');
			} catch (err: any) {
				const msg =
					err?.response?.data?.detail ||
					err?.message ||
					`No se pudo eliminar la ficha #${id}.`;
				global.utl.genCustomeToast(ToastSeverityMessageEnum.ERROR, 'Eliminar', String(msg));
			} finally {
				eliminando.value = false;
			}
		},
		reject: () => {},
	});
};

const onHide = () => {
	ficha.value = null;
};

watch(
	() => [props.visible, props.fichaId] as const,
	([visible, id]) => {
		if (visible && id) loadDetalle(id);
	}
);
</script>

<style scoped>
.ficha-logo-grupo {
	display: block;
	height: 2.55rem;
	width: auto;
	max-width: min(16.5rem, 100%);
	object-fit: contain;
	border-radius: 6px;
}

.ficha-section__title {
	margin: 0 0 1rem;
	font-size: 0.95rem;
	font-weight: 700;
	text-transform: uppercase;
	color: #252527;
	border-bottom: 2px solid #dc2626;
	padding-bottom: 0.35rem;
}

.ficha-subsection__title {
	margin: 0 0 0.75rem;
	font-size: 0.85rem;
	font-weight: 700;
	text-transform: uppercase;
	color: #374151;
}

.ficha-readonly :deep(input),
.ficha-readonly :deep(textarea) {
	background: #f8fafc;
	cursor: default;
}

.ficha-detalle-body {
	max-height: min(75vh, 820px);
	overflow: auto;
	padding-right: 0.25rem;
}
</style>
