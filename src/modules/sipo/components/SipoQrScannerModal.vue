<template>
	<Dialog
		v-model:visible="visibleProxy"
		modal
		:closable="true"
		header="Escanear Cédula de Identidad"
		:style="{ width: '480px', maxWidth: '95vw' }"
		@hide="onHide"
	>
		<div class="cedula-upload flex flex-column gap-3 pb-3">
			<div
				class="cedula-dropzone"
				:class="{ 'cedula-dropzone--active': dragOver, 'cedula-dropzone--busy': ocrLoading }"
				@dragover.prevent="dragOver = true"
				@dragleave.prevent="dragOver = false"
				@drop.prevent="onDrop"
				@click="!ocrLoading && fileInputRef?.click()"
			>
				<input
					ref="fileInputRef"
					type="file"
					accept="image/*"
					class="cedula-dropzone__input"
					:disabled="ocrLoading"
					@change="onFileChange"
				/>
				<div v-if="ocrLoading" class="flex flex-column align-items-center gap-2">
					<ProgressSpinner style="width: 40px; height: 40px" />
					<span class="text-sm font-medium">{{ ocrLoadingMessage }}</span>
				</div>
				<template v-else>
					<i class="pi pi-id-card cedula-dropzone__icon" />
					<p class="cedula-dropzone__title m-0">Sube foto del frente de la cédula</p>
					<p class="cedula-dropzone__hint m-0">
						Solo anverso (frontal). La cédula debe ocupar casi toda la imagen y con buena
						iluminación.
					</p>
					<Button
						label="Seleccionar imagen"
						icon="pi pi-upload"
						size="small"
						class="mt-2"
						@click.stop="fileInputRef?.click()"
					/>
				</template>
			</div>

			<div v-if="statusMessage" :class="['text-sm p-2 border-round', statusClass]">
				{{ statusMessage }}
			</div>

			<small class="text-color-secondary line-height-3">
				Formatos: JPG, PNG o WebP. Usa solo el frente de la cédula (no el reverso), bien iluminada
				y ocupando el mayor espacio posible de la foto.
			</small>

			<div class="flex justify-content-end mb-2">
				<Button label="Cancelar" severity="secondary" outlined @click="visibleProxy = false" />
			</div>
		</div>
	</Dialog>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
	isCompleteCedulaRead,
	isPartialCedulaRead,
	isUsableCedulaRead,
	missingCedulaFields,
	recognizeCedulaImage,
	terminateOcrWorker,
	type CedulaData,
} from '../utils/parseCedulaAnverso';

export type { CedulaData };

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
	(e: 'update:visible', v: boolean): void;
	(e: 'scanned', data: CedulaData): void;
}>();

const visibleProxy = computed({
	get: () => props.visible,
	set: (v) => emit('update:visible', v),
});

const statusMessage = ref('');
const statusClass = ref('');
const ocrLoading = ref(false);
const ocrLoadingMessage = ref('Procesando imagen...');
const fileInputRef = ref<HTMLInputElement | null>(null);
const dragOver = ref(false);

function emptyCedula(): CedulaData {
	return {
		rut: '',
		nombres: '',
		apellidoPaterno: '',
		apellidoMaterno: '',
		fechaNacimiento: '',
		genero: null,
		nacionalidad: null,
		soloRut: false,
	};
}

function mapSexo(raw: string): string | null {
	const s = String(raw || '').trim().toUpperCase();
	if (s === 'M' || s === 'MASCULINO' || s === 'H') return 'M';
	if (s === 'F' || s === 'FEMENINO' || s === 'MUJER') return 'F';
	return null;
}

function mapNacionalidadFromTypeOrCode(raw: string): string | null {
	const t = String(raw || '').trim().toUpperCase();
	if (!t) return null;
	if (t === 'CEDULA' || t === 'CHL' || t === 'CHILE' || t === 'CHILENA') return 'Chile';
	if (t.includes('EXT') || (t.length === 3 && t !== 'CHL')) return 'Extranjero';
	return null;
}

function formatRut(raw: string): string {
	const clean = raw.replace(/[^0-9kK]/g, '');
	if (clean.length < 2) return raw;
	const dv = clean.slice(-1).toUpperCase();
	const num = clean.slice(0, -1);
	return `${num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

function formatFechaNaci(raw: string): string {
	const clean = String(raw || '').replace(/[^0-9]/g, '');
	if (clean.length === 8) {
		if (Number(clean.slice(0, 2)) > 31) return formatFechaYyMmDd(clean.slice(2));
		return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4)}`;
	}
	return raw || '';
}

function formatFechaYyMmDd(raw: string): string {
	const clean = String(raw || '').replace(/[^0-9]/g, '');
	if (clean.length !== 6) return '';
	const yy = Number(clean.slice(0, 2));
	const mm = clean.slice(2, 4);
	const dd = clean.slice(4, 6);
	const year = yy <= 30 ? 2000 + yy : 1900 + yy;
	return `${dd}-${mm}-${year}`;
}

function toTitleCase(s: string): string {
	return String(s || '')
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseTd1Mrz(raw: string): Partial<CedulaData> | null {
	const compact = String(raw || '').replace(/\s+/g, '').toUpperCase();
	if (!compact.includes('<') || compact.length < 60) return null;
	let line1 = '';
	let line2 = '';
	let line3 = '';
	if (compact.length >= 90) {
		line1 = compact.slice(0, 30);
		line2 = compact.slice(30, 60);
		line3 = compact.slice(60, 90);
	} else {
		const lines = String(raw)
			.toUpperCase()
			.split(/[\r\n]+/)
			.map((l) => l.trim())
			.filter(Boolean);
		if (lines.length < 3) return null;
		line1 = lines[0].padEnd(30, '<').slice(0, 30);
		line2 = lines[1].padEnd(30, '<').slice(0, 30);
		line3 = lines[2].padEnd(30, '<').slice(0, 30);
	}
	const birthRaw = line2.slice(0, 6);
	const sexRaw = line2.slice(7, 8);
	const nationalityCode = line2.slice(15, 18);
	const optional = line2.slice(18, 29).replace(/</g, '');
	const namePart = line3.replace(/<+$/g, '');
	const [apellidosBlock = '', nombresBlock = ''] = namePart.split('<<');
	const apellidos = apellidosBlock.split('<').filter(Boolean);
	const nombres = nombresBlock.split('<').filter(Boolean);
	const rutFromOptional = optional.match(/(\d{6,8}[0-9K])/);
	const rutFromLine1 = line1.slice(5, 14).replace(/</g, '');
	return {
		rut: formatRut(rutFromOptional?.[1] || rutFromLine1 || ''),
		apellidoPaterno: toTitleCase(apellidos[0] || ''),
		apellidoMaterno: toTitleCase(apellidos[1] || ''),
		nombres: toTitleCase(nombres.join(' ')),
		fechaNacimiento: formatFechaYyMmDd(birthRaw),
		genero: mapSexo(sexRaw),
		nacionalidad: mapNacionalidadFromTypeOrCode(nationalityCode),
	};
}

function parseCedulaQr(raw: string): CedulaData | null {
	try {
		const text = String(raw || '').trim();
		if (!text) return null;
		const fromMrz = parseTd1Mrz(text);
		if (fromMrz?.nombres || fromMrz?.apellidoPaterno) {
			return {
				...emptyCedula(),
				...fromMrz,
				rut: fromMrz.rut || '',
				nombres: fromMrz.nombres || '',
				apellidoPaterno: fromMrz.apellidoPaterno || '',
				apellidoMaterno: fromMrz.apellidoMaterno || '',
				fechaNacimiento: fromMrz.fechaNacimiento || '',
				soloRut: false,
			};
		}
		if (/^https?:\/\//i.test(text) || /registrocivil\.cl/i.test(text)) {
			const url = new URL(text.startsWith('http') ? text : `https://${text}`);
			const params = url.searchParams;
			const run = params.get('RUN') || params.get('run') || '';
			const name = params.get('NAME') || params.get('name') || params.get('NOMBRE') || '';
			const fechaNaci =
				params.get('FECHA_NACI') || params.get('fecha_naci') || params.get('FECHA_NACIMIENTO') || '';
			const sexo = params.get('SEXO') || params.get('sexo') || params.get('SEX') || '';
			const tipo = params.get('type') || params.get('TYPE') || '';
			const mrzParam = params.get('mrz') || params.get('MRZ') || '';
			if (!run && !name && !mrzParam) return null;
			const mrzData = parseTd1Mrz(mrzParam);
			const parts = name.trim().split(/[+\s]+/).filter(Boolean);
			const apellidoPaterno = toTitleCase(parts[0] || mrzData?.apellidoPaterno || '');
			const apellidoMaterno = toTitleCase(parts[1] || mrzData?.apellidoMaterno || '');
			const nombres = toTitleCase(parts.slice(2).join(' ') || mrzData?.nombres || '');
			const fecha =
				fechaNaci.length === 8
					? `${fechaNaci.slice(0, 2)}-${fechaNaci.slice(2, 4)}-${fechaNaci.slice(4)}`
					: formatFechaNaci(fechaNaci) || mrzData?.fechaNacimiento || '';
			const hasPersonData = Boolean(nombres || apellidoPaterno || fecha || sexo || mrzData?.genero);
			return {
				rut: formatRut(run || mrzData?.rut || ''),
				nombres,
				apellidoPaterno,
				apellidoMaterno,
				fechaNacimiento: fecha,
				genero: mapSexo(sexo) || mrzData?.genero || null,
				nacionalidad:
					mapNacionalidadFromTypeOrCode(tipo) ||
					mrzData?.nacionalidad ||
					(tipo.toUpperCase() === 'CEDULA' ? 'Chile' : null),
				soloRut: Boolean(run) && !hasPersonData,
			};
		}
		if (text.includes('@')) {
			const p = text.split('@');
			const sexoIdx = mapSexo(p[4] || '') ? 4 : -1;
			const fechaRaw = sexoIdx >= 0 ? p[5] || '' : p[4] || p[5] || '';
			return {
				rut: formatRut(p[0] || ''),
				apellidoPaterno: toTitleCase(p[1] || ''),
				apellidoMaterno: toTitleCase(p[2] || ''),
				nombres: toTitleCase(p[3] || ''),
				fechaNacimiento: formatFechaNaci(fechaRaw),
				genero: sexoIdx >= 0 ? mapSexo(p[4] || '') : null,
				nacionalidad: 'Chile',
				soloRut: false,
			};
		}
		if (text.includes(',')) {
			const p = text.split(',');
			return {
				rut: formatRut(p[0] || ''),
				apellidoPaterno: toTitleCase(p[1] || ''),
				apellidoMaterno: toTitleCase(p[2] || ''),
				nombres: toTitleCase(p[3] || ''),
				fechaNacimiento: formatFechaNaci(p[6] || p[5] || ''),
				genero: mapSexo(p[4] || ''),
				nacionalidad: 'Chile',
				soloRut: false,
			};
		}
	} catch {
		/* */
	}
	return null;
}

async function processFile(file: File) {
	if (!file.type.startsWith('image/')) {
		statusMessage.value = 'Solo se aceptan imágenes (JPG, PNG o WebP) del frente de la cédula.';
		statusClass.value = 'bg-yellow-50 text-yellow-700';
		return;
	}

	ocrLoading.value = true;
	ocrLoadingMessage.value = 'Procesando imagen...';
	statusMessage.value = '';
	try {
		let tmp = document.getElementById('sipo-qr-file-reader-tmp');
		if (!tmp) {
			tmp = document.createElement('div');
			tmp.id = 'sipo-qr-file-reader-tmp';
			tmp.style.display = 'none';
			document.body.appendChild(tmp);
		}
		try {
			const qr = new Html5Qrcode('sipo-qr-file-reader-tmp', {
				formatsToSupport: [
					Html5QrcodeSupportedFormats.QR_CODE,
					Html5QrcodeSupportedFormats.PDF_417,
				],
				verbose: false,
			});
			const result = await qr.scanFile(file, false);
			const data = parseCedulaQr(result);
			if (data && !data.soloRut) {
				emit('scanned', data);
				visibleProxy.value = false;
				return;
			}
		} catch {
			/* OCR fallback */
		}

		ocrLoadingMessage.value = 'Leyendo anverso con OCR...';

		let data: CedulaData | null = null;
		const runOcr = async () => (await recognizeCedulaImage(file)).data;

		try {
			data = await runOcr();
		} catch (firstErr: any) {
			const msg = String(firstErr?.message || firstErr);
			if (/read image|attempting to read/i.test(msg)) {
				await terminateOcrWorker();
				ocrLoadingMessage.value = 'Reintentando lectura...';
				data = await runOcr();
			} else {
				throw firstErr;
			}
		}

		if (
			!data ||
			(!isCompleteCedulaRead(data) && !isUsableCedulaRead(data) && !isPartialCedulaRead(data))
		) {
			const miss = missingCedulaFields(data).join(', ') || 'datos';
			statusMessage.value = `No se pudo leer: ${miss}. Sube una foto nítida del frente, bien iluminada y ocupando casi toda la imagen.`;
			statusClass.value = 'bg-yellow-50 text-yellow-700';
			return;
		}
		emit('scanned', data);
		visibleProxy.value = false;
	} catch (err: any) {
		statusMessage.value = `No se pudo procesar la imagen: ${err?.message || err}`;
		statusClass.value = 'bg-red-50 text-red-700';
		void terminateOcrWorker();
	} finally {
		ocrLoading.value = false;
		dragOver.value = false;
		if (fileInputRef.value) fileInputRef.value.value = '';
	}
}

async function onFileChange(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	await processFile(file);
}

async function onDrop(event: DragEvent) {
	dragOver.value = false;
	if (ocrLoading.value) return;
	const file = event.dataTransfer?.files?.[0];
	if (!file || !file.type.startsWith('image/')) {
		statusMessage.value = 'Selecciona una imagen (JPG, PNG o WebP).';
		statusClass.value = 'bg-yellow-50 text-yellow-700';
		return;
	}
	await processFile(file);
}

function onHide() {
	statusMessage.value = '';
	dragOver.value = false;
}

onBeforeUnmount(() => {
	void terminateOcrWorker();
});
</script>

<style scoped>
.cedula-dropzone {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.35rem;
	min-height: 220px;
	padding: 1.5rem 1rem;
	border: 2px dashed #d1d5db;
	border-radius: 12px;
	background: #fafafa;
	cursor: pointer;
	transition:
		border-color 0.15s ease,
		background 0.15s ease;
	text-align: center;
}
.cedula-dropzone:hover,
.cedula-dropzone--active {
	border-color: var(--primary-color, #ff0000);
	background: #fff5f5;
}
.cedula-dropzone--busy {
	cursor: default;
	pointer-events: none;
	border-style: solid;
	border-color: #e5e7eb;
	background: #fff;
}
.cedula-dropzone__input {
	display: none;
}
.cedula-dropzone__icon {
	font-size: 2.25rem;
	color: var(--primary-color, #ff0000);
	margin-bottom: 0.25rem;
}
.cedula-dropzone__title {
	font-weight: 600;
	font-size: 0.95rem;
	color: #1f2937;
}
.cedula-dropzone__hint {
	font-size: 0.8rem;
	color: #6b7280;
	max-width: 320px;
}
</style>
