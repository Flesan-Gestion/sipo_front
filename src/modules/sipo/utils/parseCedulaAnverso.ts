import { createWorker, type Worker } from 'tesseract.js';

export interface CedulaData {
	rut: string;
	nombres: string;
	apellidoPaterno: string;
	apellidoMaterno: string;
	fechaNacimiento: string; // DD-MM-YYYY
	genero?: string | null;
	nacionalidad?: string | null;
	soloRut?: boolean;
}

const MESES: Record<string, string> = {
	ENE: '01',
	ENERO: '01',
	FEB: '02',
	FEBRERO: '02',
	MAR: '03',
	MARZO: '03',
	ABR: '04',
	ABRIL: '04',
	MAY: '05',
	MAYO: '05',
	JUN: '06',
	JUNIO: '06',
	JUL: '07',
	JULIO: '07',
	AGO: '08',
	AGOSTO: '08',
	SEP: '09',
	SEPT: '09',
	SEPTIEMBRE: '09',
	OCT: '10',
	OCTUBRE: '10',
	NOV: '11',
	NOVIEMBRE: '11',
	DIC: '12',
	DICIEMBRE: '12',
};

const LABEL_NOISE =
	/CHILENA|CHILENO|REPUBLICA|CEDULA|IDENTIDAD|SERVICIO|REGISTRO|CIVIL|NACI[O0]N\w*|APELLIDOS|NOMBRES|SEXO|FECHA|FIRMA|DOCUMENTO|EMISION|VENCIMIENTO|NUMERO|RUN|TITULAR/;

let sharedWorker: Worker | null = null;
let sharedWorkerPromise: Promise<Worker> | null = null;

export async function getOcrWorker(): Promise<Worker> {
	if (sharedWorker) return sharedWorker;
	if (!sharedWorkerPromise) {
		sharedWorkerPromise = (async () => {
			const worker = await createWorker('spa', 1, {
				logger: () => {},
			});
			await worker.setParameters({
				tessedit_pageseg_mode: '6' as any,
				preserve_interword_spaces: '1',
			});
			sharedWorker = worker;
			return worker;
		})();
	}
	return sharedWorkerPromise;
}

export async function terminateOcrWorker() {
	sharedWorkerPromise = null;
	if (!sharedWorker) return;
	const w = sharedWorker;
	sharedWorker = null;
	try {
		await w.terminate();
	} catch {
		/* */
	}
}

function formatRut(raw: string): string {
	const clean = String(raw || '').replace(/[^0-9kK]/g, '');
	if (clean.length < 2) return '';
	const dv = clean.slice(-1).toUpperCase();
	const num = clean.slice(0, -1);
	return `${num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

function isValidRutDv(rut: string): boolean {
	const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
	if (clean.length < 2) return false;
	const body = clean.slice(0, -1);
	const dv = clean.slice(-1);
	let sum = 0;
	let mul = 2;
	for (let i = body.length - 1; i >= 0; i--) {
		sum += Number(body[i]) * mul;
		mul = mul === 7 ? 2 : mul + 1;
	}
	const rest = 11 - (sum % 11);
	const expected = rest === 11 ? '0' : rest === 10 ? 'K' : String(rest);
	return dv === expected;
}

function toTitleCase(s: string): string {
	return String(s || '')
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => {
			const lower = word.toLocaleLowerCase('es-CL');
			const chars = [...lower];
			if (!chars.length) return '';
			chars[0] = chars[0].toLocaleUpperCase('es-CL');
			return chars.join('');
		})
		.join(' ');
}

export function formatPersonName(s: string): string {
	return toTitleCase(s);
}

function normalizeOcrText(text: string): string {
	return String(text || '')
		.replace(/\u00a0/g, ' ')
		.replace(/[|]/g, 'I')
		.replace(/[“”"´`']/g, '')
		.replace(/[€]/g, 'E')
		.toUpperCase();
}

function normalizeFechaOcrChunk(raw: string): string {
	return String(raw || '')
		.toUpperCase()
		.replace(/[|]/g, 'I')
		.replace(/(\d{1,2})\s*[O0QDG]CT(?:UBRE)?\b/g, '$1 OCT')
		.replace(/(\d{2})[O0QDG]CT(\d{4})/g, '$1 OCT $2')
		.replace(/(\d{2})OCT(\d{4})/g, '$1 OCT $2')
		// 19 JUN-1984 / 19-JUN-1984 / 19.JUN.1984
		.replace(/(\d{1,2})\s*[.\-/]\s*([A-Z0-9]{3,10})\s*[.\-/]\s*([O0-9]{4})/g, '$1 $2 $3')
		.replace(/([A-Z]{3,10})\s*[.\-/]\s*([O0-9]{4})/g, '$1 $2')
		.replace(/\b[O0QDG]CT(?:UBRE)?\b/g, 'OCT')
		.replace(/\bN[O0]V(?:IEMBRE)?\b/g, 'NOV')
		.replace(/\bD[I1L]C(?:IEMBRE)?\b/g, 'DIC')
		.replace(/\bE[NM]E(?:RO)?\b/g, 'ENE')
		.replace(/\bFEB(?:RERO)?\b/g, 'FEB')
		.replace(/\bM[A4]R(?:ZO)?\b/g, 'MAR')
		.replace(/\bA[BP8R]R(?:IL)?\b/g, 'ABR')
		.replace(/\bM[A4]Y[O0]?\b/g, 'MAY')
		.replace(/\bJUN(?:IO)?\b/g, 'JUN')
		.replace(/\bJUL(?:IO)?\b/g, 'JUL')
		.replace(/\bA[CG9]O(?:STO)?\b/g, 'AGO')
		.replace(/\bS[E]PT?(?:IEMBRE)?\b/g, 'SEP')
		.replace(/(\d)\s*[O0QDG]CT\b/g, '$1 OCT');
}

function resolveMes(token: string): string | null {
	const t = String(token || '')
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '');
	if (!t) return null;
	if (MESES[t]) return MESES[t];
	if (MESES[t.slice(0, 3)]) return MESES[t.slice(0, 3)];
	const fuzzy: Array<[RegExp, string]> = [
		[/^E[NM]E/, '01'],
		[/^FEB/, '02'],
		[/^M[A4]R/, '03'],
		[/^A[BP8R]R/, '04'],
		[/^M[A4]Y/, '05'],
		[/^JUN/, '06'],
		[/^JUL/, '07'],
		[/^A[CG9]O/, '08'],
		[/^SEP/, '09'],
		[/^[O0QDG]CT/, '10'],
		[/^N[O0]V/, '11'],
		[/^D[I1L]C/, '12'],
	];
	for (const [re, mes] of fuzzy) {
		if (re.test(t)) return mes;
	}
	return null;
}

/** "12 OCT 2002" → "12-10-2002" (también variantes OCR). */
function parseFechaTexto(raw: string): string {
	const cleaned = normalizeFechaOcrChunk(raw);
	const m = cleaned.match(/(\d{1,2})\s*([A-Z0-9]{3,10})\s*([O0-9]{4})/);
	if (m) {
		const mes = resolveMes(m[2]);
		if (!mes) return '';
		const year = m[3].replace(/O/g, '0');
		const day = Number(m[1]);
		const month = Number(mes);
		const y = Number(year);
		if (day < 1 || day > 31 || month < 1 || month > 12 || y < 1920 || y > 2100) return '';
		return `${String(day).padStart(2, '0')}-${mes}-${year}`;
	}
	const num = cleaned.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.]([O0-9]{4})/);
	if (!num) return '';
	const day = Number(num[1]);
	const month = Number(num[2]);
	const year = Number(num[3].replace(/O/g, '0'));
	if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1920 || year > 2100) return '';
	return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
}

function fechaToAge(fecha: string): number | null {
	const p = fecha.split('-');
	if (p.length !== 3) return null;
	const d = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
	if (isNaN(d.getTime())) return null;
	const now = new Date();
	let age = now.getFullYear() - d.getFullYear();
	const m = now.getMonth() - d.getMonth();
	if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
	return age;
}

function isPlausibleBirthDate(fecha: string): boolean {
	const age = fechaToAge(fecha);
	return age != null && age >= 18 && age <= 90;
}

function isCleanNameToken(token: string): boolean {
	const t = token.trim();
	if (t.length < 3 || t.length > 11) return false;
	if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñÜü]+$/.test(t)) return false;
	const up = t.toUpperCase().normalize('NFD').replace(/\p{M}/gu, '');
	if (LABEL_NOISE.test(up)) return false;
	if (/^NACI/.test(up) || /^CHILEN/.test(up)) return false;
	const vowels = (t.match(/[aeiouáéíóúAEIOUÁÉÍÓÚ]/g) || []).length;
	if (vowels < 1) return false;
	return true;
}

function isCleanNamePhrase(value: string, minWords = 1): boolean {
	const parts = String(value || '')
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	if (parts.length < minWords) return false;
	return parts.every(isCleanNameToken);
}

function sanitizeNamePhrase(value: string): string {
	return String(value || '')
		.split(/\s+/)
		.filter(isCleanNameToken)
		.join(' ');
}

function lineAfterLabel(lines: string[], labelRe: RegExp): string {
	for (let i = 0; i < lines.length; i++) {
		if (!labelRe.test(lines[i])) continue;
		const same = lines[i].replace(labelRe, '').trim();
		if (
			same &&
			!/^(NOMBRES?|APELLIDOS?|NACIONALIDAD|SEXO|FECHA|RUN|DOCUMENTO|EMISION|VENCIMIENTO)/i.test(same)
		) {
			return same;
		}
		for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
			const next = lines[j].trim();
			if (!next) continue;
			if (
				/^(NOMBRES?|APELLIDOS?|NACIONALIDAD|SEXO|FECHA|RUN|N[UÚ]MERO|DOCUMENTO|EMISI[OÓ]N|VENCIMIENTO|FIRMA|REP[UÚ]BLICA|C[EÉ]DULA)/i.test(
					next
				)
			) {
				continue;
			}
			return next;
		}
	}
	return '';
}

function isNameLine(line: string): boolean {
	const cleaned = sanitizeNamePhrase(toTitleCase(String(line || '').replace(/\s+/g, ' ')));
	if (cleaned.length < 3 || cleaned.length > 60) return false;
	if (/\d/.test(cleaned)) return false;
	if (LABEL_NOISE.test(cleaned.toUpperCase())) return false;
	return isCleanNamePhrase(cleaned, 1);
}

function extractFechas(text: string): string[] {
	const normalized = normalizeFechaOcrChunk(text);
	const out: string[] = [];
	const seen = new Set<string>();
	const re = /\b(\d{1,2})\s*([A-Z0-9]{3,10})\s*([O0-9]{4})\b/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(normalized))) {
		const f = parseFechaTexto(`${m[1]} ${m[2]} ${m[3]}`);
		if (f && !seen.has(f)) {
			seen.add(f);
			out.push(f);
		}
	}
	const reNum = /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.]([O0-9]{4})\b/g;
	while ((m = reNum.exec(normalized))) {
		const f = parseFechaTexto(`${m[1]}/${m[2]}/${m[3]}`);
		if (f && !seen.has(f)) {
			seen.add(f);
			out.push(f);
		}
	}
	return out;
}

function extractFechaNacimiento(text: string, lines: string[]): string {
	const normalized = normalizeFechaOcrChunk(text);

	// Quitar bloques de emisión/vencimiento para no mezclar días/años
	const sinEmision = normalized
		.replace(
			/FECHA\s*DE\s*EMISI\w*[\s:=\-]*[0-9]{1,2}\s*[A-Z0-9]{3,10}\s*[O0-9]{4}/g,
			' '
		)
		.replace(
			/FECHA\s*DE\s*VENCIM\w*[\s:=\-]*[0-9]{1,2}\s*[A-Z0-9]{3,10}\s*[O0-9]{4}/g,
			' '
		);

	const labelMatch = sinEmision.match(
		/FECHA\s*DE\s*NACIM\w*[\s:=\-]*([0-9]{1,2}\s*[A-Z0-9]{3,10}\s*[O0-9]{4})/
	);
	if (labelMatch) {
		const f = parseFechaTexto(labelMatch[1]);
		if (isPlausibleBirthDate(f)) return f;
	}

	const nacIdx = sinEmision.search(/FECHA\s*DE\s*NACIM|NACIM\w*/);
	if (nacIdx >= 0) {
		let window = sinEmision.slice(nacIdx, nacIdx + 100);
		const cut = window.search(/\bEMISI|\bVENCIM|\bN[UÚ]MERO|\bDOCUMENTO|\bFIRMA|\bRUN\b/);
		if (cut > 10) window = window.slice(0, cut);
		for (const f of extractFechas(window)) {
			if (isPlausibleBirthDate(f)) return f;
		}
		const loose = window.match(/(\d{1,2})\s*([A-Z0-9]{3,10})\s*([O0-9]{4})/);
		if (loose) {
			const f = parseFechaTexto(`${loose[1]} ${loose[2]} ${loose[3]}`);
			if (isPlausibleBirthDate(f)) return f;
		}
	}

	// Solo líneas de nacimiento (nunca "FECHA DE EMISIÓN/VENCIMIENTO")
	for (let i = 0; i < lines.length; i++) {
		const lineNorm = normalizeFechaOcrChunk(lines[i]);
		if (/EMISI|VENCIM/.test(lineNorm)) continue;
		if (!/NACIM/.test(lineNorm)) continue;
		const chunk = [lines[i], lines[i + 1] || ''].join(' ');
		const chunkClean = normalizeFechaOcrChunk(chunk).replace(
			/FECHA\s*DE\s*(EMISI|VENCIM)\w*[\s\S]*/g,
			' '
		);
		for (const f of extractFechas(chunkClean)) {
			if (isPlausibleBirthDate(f)) return f;
		}
	}

	// Fallback: fechas plausibles fuera de emisión/vencimiento; la más antigua
	const candidatas = extractFechas(sinEmision).filter(isPlausibleBirthDate);
	if (!candidatas.length) return '';
	candidatas.sort((a, b) => {
		const [da, ma, ya] = a.split('-').map(Number);
		const [db, mb, yb] = b.split('-').map(Number);
		return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
	});
	return candidatas[0];
}

/** MRZ TD1 (reverso cédula). Ej: 0210122M3210123CHL21051420<1<3 */
function splitMergedGivenNames(raw: string): string {
	const u = String(raw || '')
		.toUpperCase()
		.replace(/[^A-ZÁÉÍÓÚÑ]/g, '');
	if (u.length < 8) return toTitleCase(raw);
	const firsts = [
		'FRANCISCO',
		'ALEJANDRO',
		'SEBASTIAN',
		'CRISTIAN',
		'ANTONIO',
		'IGNACIO',
		'GABRIEL',
		'RODRIGO',
		'EDUARDO',
		'FERNANDO',
		'PATRICIO',
		'MAURICIO',
		'GONZALO',
		'ESTEBAN',
		'NICOLAS',
		'MATIAS',
		'CARLOS',
		'ANDRES',
		'MIGUEL',
		'MANUEL',
		'MARTIN',
		'HECTOR',
		'VICTOR',
		'PABLO',
		'PEDRO',
		'DIEGO',
		'JORGE',
		'FELIPE',
		'TOMAS',
		'DAVID',
		'DANIEL',
		'MARIO',
		'JUAN',
		'JOSE',
		'LUIS',
		'OSCAR',
		'RAUL',
		'IVAN',
		'ALBERTO',
		'RICARDO',
		'SERGIO',
		'CLAUDIO',
		'MARIA',
		'CAMILA',
		'SOFIA',
		'VALENTINA',
		'CATALINA',
		'FRANCISCA',
		'DANIELA',
		'CONSTANZA',
		'ANDREA',
		'NATALIA',
		'JAVIERA',
		'CAROLINA',
		'ALEJANDRA',
		'PAULA',
		'ANA',
	];
	for (const f of firsts) {
		if (!u.startsWith(f) || u.length < f.length + 3) continue;
		let rest = u.slice(f.length);
		const ocrFix: Record<string, string> = {
			SIG: 'IGNACIO',
			SIGI: 'IGNACIO',
			IGNAC: 'IGNACIO',
			GNACIO: 'IGNACIO',
			IGNCIO: 'IGNACIO',
			ALO: 'ALONSO',
			ALONS: 'ALONSO',
			ANTON: 'ANTONIO',
			ANDRE: 'ANDRES',
			SEBAST: 'SEBASTIAN',
			FRANCISC: 'FRANCISCO',
		};
		if (ocrFix[rest]) rest = ocrFix[rest];
		if (firsts.includes(rest) || (rest.length >= 4 && /[AEIOUÁÉÍÓÚ]/.test(rest))) {
			return toTitleCase(`${f} ${rest}`);
		}
	}
	return toTitleCase(raw);
}

/** MRZ TD1 (reverso cédula). Ej: 0210122M3210123CHL21051420<1<3 */
function parseChileanMrz(ocrText: string): Partial<CedulaData> | null {
	const raw = String(ocrText || '').toUpperCase();
	if (!raw.includes('<') && !raw.includes('INCHL') && !raw.includes('IDCHL') && !/CHL\d{7,}/.test(raw.replace(/\s/g, ''))) {
		return null;
	}

	const lines = raw
		.split(/\r?\n/)
		.map((l) => l.replace(/\s+/g, '').replace(/[^A-Z0-9<]/g, ''))
		.filter((l) => l.length >= 18);

	let line2 =
		lines.find((l) => /^[0-9]{6}[0-9][MF][0-9]{6}/.test(l) && l.includes('CHL')) ||
		'';
	let line3 = lines.find((l) => /<</.test(l) && /^[A-Z<]+$/.test(l)) || '';

	if (!line3) {
		const compact = raw.replace(/\s+/g, '').replace(/[^A-Z0-9<]/g, '');
		const nIdx = compact.search(/[A-Z]{2,}<[A-Z]{2,}<<[A-Z]/);
		if (nIdx >= 0) line3 = compact.slice(nIdx, nIdx + 39);
	}

	if (!line2) {
		const compact = raw.replace(/\s+/g, '').replace(/[^A-Z0-9<]/g, '');
		const idx = compact.search(/[0-9]{6}[0-9][MF][0-9]{6}[0-9]CHL/);
		if (idx >= 0) line2 = compact.slice(idx, idx + 30);
	}

	// Permitir solo nombres desde MRZ aunque falte línea 2
	if ((!line2 || line2.length < 18) && !line3) return null;

	let fechaNacimiento = '';
	let rut = '';
	let genero: string | null = null;
	let nacionalidad: string | null = null;

	if (line2 && line2.length >= 18) {
		const birthRaw = line2.slice(0, 6);
		const sexRaw = line2.charAt(7);
		const nat = line2.slice(15, 18);
		const optionalRaw = line2.slice(18);
		const optionalDigits = optionalRaw.replace(/</g, '');

		const yy = Number(birthRaw.slice(0, 2));
		const mm = birthRaw.slice(2, 4);
		const dd = birthRaw.slice(4, 6);
		const year = yy <= 30 ? 2000 + yy : 1900 + yy;
		const fecha = `${dd}-${mm}-${year}`;
		if (isPlausibleBirthDate(fecha)) fechaNacimiento = fecha;

		const withDv = optionalRaw.match(/(\d{7,8})<([0-9K])/);
		if (withDv) {
			rut = formatRut(`${withDv[1]}${withDv[2]}`);
		} else if (optionalDigits.length >= 8) {
			// OCR a veces pierde "<": 191318328 → probar cuerpo 7/8 + DV
			for (const bodyLen of [8, 7]) {
				if (optionalDigits.length < bodyLen) continue;
				const body = optionalDigits.slice(0, bodyLen);
				const maybeDv = optionalDigits.charAt(bodyLen);
				if (maybeDv && isValidRutDv(formatRut(body + maybeDv))) {
					rut = formatRut(body + maybeDv);
					break;
				}
				for (const dv of '0123456789K') {
					const candidate = formatRut(`${body}${dv}`);
					if (isValidRutDv(candidate)) {
						rut = candidate;
						break;
					}
				}
				if (rut) break;
			}
		}
		if (rut && !isValidRutDv(rut)) {
			const bodyOnly = (withDv?.[1] || optionalDigits.slice(0, 8)).slice(0, 8);
			for (const dv of '0123456789K') {
				const candidate = formatRut(`${bodyOnly}${dv}`);
				if (isValidRutDv(candidate)) {
					rut = candidate;
					break;
				}
			}
		}
		if (rut && !isValidRutDv(rut)) rut = '';
		genero = sexRaw === 'F' ? 'F' : sexRaw === 'M' ? 'M' : null;
		nacionalidad = nat === 'CHL' ? 'Chile' : null;
	}

	let apellidoPaterno = '';
	let apellidoMaterno = '';
	let nombres = '';
	if (line3) {
		const namePart = line3.replace(/<+$/g, '');
		const [apellidosBlock = '', nombresBlock = ''] = namePart.split('<<');
		const apellidos = apellidosBlock.split('<').filter(Boolean);
		const noms = nombresBlock.split('<').filter(Boolean);
		apellidoPaterno = toTitleCase(apellidos[0] || '');
		apellidoMaterno = toTitleCase(apellidos[1] || '');
		nombres = toTitleCase(noms.join(' '));
		if (noms.length === 1 && noms[0].length >= 8) {
			nombres = splitMergedGivenNames(noms[0]);
		}
		// MRZ trunca 2º nombre (MARTIN<ALO) → no usar como nombres finales
		const nomParts = nombres.split(/\s+/).filter(Boolean);
		if (nomParts.length >= 2 && nomParts[nomParts.length - 1].length <= 3) {
			nombres = '';
		}
	}

	return {
		rut,
		fechaNacimiento,
		genero,
		nacionalidad,
		apellidoPaterno: isCleanNamePhrase(apellidoPaterno) ? apellidoPaterno : '',
		apellidoMaterno: isCleanNamePhrase(apellidoMaterno) ? apellidoMaterno : '',
		nombres: isCleanNamePhrase(nombres) ? nombres : '',
	};
}

function extractRun(text: string): string {
	const normalized = String(text || '')
		.toUpperCase()
		.replace(/QUN|RJN|RUM|RVN|RIN/g, 'RUN')
		.replace(/[|:;·•﹐]/g, '.')
		.replace(/(\d)\s*[—–_]\s*([0-9K])/g, '$1-$2');

	const patterns = [
		/\bRUN\s*[.:=\-]?\s*(\d{1,2}(?:[.\s]*\d{3}){2}\s*-?\s*[0-9K])\b/,
		/\bRUN\s*[.:=\-]?\s*(\d{7,8}\s*-?\s*[0-9K])\b/,
		/\bR\.?U\.?N\.?\s+(\d{1,2}\.\d{3}\.\d{3}-[0-9K])\b/,
		/(?:^|\s)(\d{1,2}\.\d{3}\.\d{3}-[0-9K])(?:\s|$)/,
		// OCR: 18.112.7244 o 18:112.7244 (sin guión antes del DV)
		/(?:^|\s)(\d{1,2}[.\s]\d{3}[.\s]\d{3}\s*-?\s*[0-9K])(?:\s|$)/,
		/(?:^|\s)(\d{1,2}\.\d{3}\.\d{4})(?:\s|$)/,
	];
	for (const re of patterns) {
		const m = normalized.match(re);
		if (!m) continue;
		const rut = formatRut(m[1]);
		if (rut && isValidRutDv(rut)) return rut;
	}

	// Cerca de "RUN": tomar el bloque numérico siguiente
	const nearRun = normalized.match(
		/\bRUN\b[^0-9K]{0,12}(\d{1,2}(?:[.\s]*\d{3}){2}\s*-?\s*[0-9K]|\d{7,9}[0-9K]?)/
	);
	if (nearRun) {
		const rut = formatRut(nearRun[1]);
		if (rut && isValidRutDv(rut)) return rut;
	}

	// Último recurso: cualquier secuencia 8–9 chars con DV válido
	const chunks = normalized.match(/\d(?:[\d.\s\-]*\d){6,10}[0-9K]?/g) || [];
	for (const chunk of chunks) {
		const clean = chunk.replace(/[^0-9K]/g, '');
		if (clean.length < 8 || clean.length > 9) continue;
		const candidate = formatRut(clean);
		if (candidate && isValidRutDv(candidate)) return candidate;
	}
	return '';
}

function extractSexo(text: string, lines: string[]): string | null {
	const sexoLabel = text.match(/\bSEXO\b[\s:=\-]*([MF])\b/);
	if (sexoLabel) return sexoLabel[1] === 'F' ? 'F' : 'M';

	const chilenaSexo = text.match(/\bCHILENA?\b[\s,./|-]*([MF])\b/);
	if (chilenaSexo) return chilenaSexo[1] === 'F' ? 'F' : 'M';

	for (const line of lines) {
		if (!/CHILENA|NACIONALIDAD|SEXO/.test(line)) continue;
		const m = line.match(/\b([MF])\b/);
		if (m) return m[1] === 'F' ? 'F' : 'M';
	}

	const near = text.match(/NACIONALIDAD[\s\S]{0,40}?([MF])\b/);
	if (near) return near[1] === 'F' ? 'F' : 'M';
	return null;
}

function extractLabeledNameBlock(
	lines: string[],
	startLabel: RegExp,
	stopLabel: RegExp
): string {
	for (let i = 0; i < lines.length; i++) {
		if (!startLabel.test(lines[i])) continue;
		const same = lines[i].replace(startLabel, '').trim();
		const parts: string[] = [];
		if (
			same &&
			!stopLabel.test(same) &&
			!/^(APELLIDOS?|NOMBRES?|NACIONALIDAD|SEXO|FECHA|RUN)/i.test(same)
		) {
			parts.push(same);
		}
		for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
			const next = lines[j].trim();
			if (!next) continue;
			if (
				stopLabel.test(next) ||
				/NACI[O0]N|CHILENA|APELLIDOS?|NOMBRES?|SEXO|FECHA|RUN|N[UÚ]MERO|DOCUMENTO|EMISI|VENCIMIENTO|FIRMA|REP[UÚ]BLICA|C[EÉ]DULA/i.test(
					next
				)
			) {
				break;
			}
			if (/^[A-ZÁÉÍÓÚÑÜ\s'-]+$/.test(next) && !/\d/.test(next)) {
				parts.push(next);
				continue;
			}
			break;
		}
		return sanitizeNamePhrase(toTitleCase(parts.join(' ')));
	}
	return '';
}

function namesConflict(nombres: string, apPat: string, apMat: string): boolean {
	const n = nombres.trim().toLowerCase();
	if (!n) return true;
	const p = apPat.trim().toLowerCase();
	const m = apMat.trim().toLowerCase();
	if (p && (n === p || n.split(/\s+/).every((w) => w === p))) return true;
	if (m && (n === m || n.split(/\s+/).every((w) => w === m))) return true;
	return false;
}

function splitApellidosYNombres(raw: string): {
	apellidoPaterno: string;
	apellidoMaterno: string;
	nombres: string;
} {
	const parts = sanitizeNamePhrase(toTitleCase(raw))
		.split(/\s+/)
		.filter(Boolean);
	if (parts.length === 0) {
		return { apellidoPaterno: '', apellidoMaterno: '', nombres: '' };
	}
	if (parts.length === 1) {
		return { apellidoPaterno: parts[0], apellidoMaterno: '', nombres: '' };
	}
	if (parts.length === 2) {
		return { apellidoPaterno: parts[0], apellidoMaterno: parts[1], nombres: '' };
	}
	// 3+ palabras sin etiqueta NOMBRES: Pat + Mat + resto nombres
	return {
		apellidoPaterno: parts[0],
		apellidoMaterno: parts[1],
		nombres: parts.slice(2).join(' '),
	};
}

export function parseCedulaAnversoText(ocrText: string): CedulaData | null {
	const mrz = parseChileanMrz(ocrText);
	const visualText = stripMrzLines(ocrText);
	const text = normalizeOcrText(visualText);
	const lines = text
		.split(/\r?\n/)
		.map((l) => l.replace(/\s+/g, ' ').trim())
		.filter(Boolean);

	let rut = extractRun(text);
	if (!rut && mrz?.rut) rut = mrz.rut;

	let apellidoPaterno = '';
	let apellidoMaterno = '';
	let nombres = '';

	const apellidosRaw = extractLabeledNameBlock(
		lines,
		/^APELLIDOS?\b/,
		/^(NOMBRES?|NACIONALIDAD|SEXO|FECHA|CHILENA|RUN)\b/
	);
	const nombresRaw = extractLabeledNameBlock(
		lines,
		/^NOMBRES?\b/,
		/^(NACIONALIDAD|SEXO|FECHA|CHILENA|RUN)\b/
	);

	if (apellidosRaw) {
		const split = splitApellidosYNombres(apellidosRaw);
		apellidoPaterno = split.apellidoPaterno;
		apellidoMaterno = split.apellidoMaterno;
		if (!nombresRaw && split.nombres) nombres = split.nombres;
	} else {
		// OCR a veces no ve "APELLIDOS" pero sí las líneas antes de NOMBRES
		const nomIdx = lines.findIndex((l) => /^NOMBRES?\b/.test(l));
		if (nomIdx > 0) {
			const before: string[] = [];
			for (let i = nomIdx - 1; i >= Math.max(0, nomIdx - 3); i--) {
				const l = lines[i];
				if (
					/^(NACIONALIDAD|SEXO|FECHA|RUN|REP[UÚ]BLICA|C[EÉ]DULA|SERVICIO|IDENTIDAD|CHILENA)/i.test(
						l
					)
				) {
					break;
				}
				if (!isNameLine(l)) break;
				before.unshift(sanitizeNamePhrase(toTitleCase(l)));
			}
			if (before.length) {
				const split = splitApellidosYNombres(before.join(' '));
				apellidoPaterno = split.apellidoPaterno;
				apellidoMaterno = split.apellidoMaterno;
				if (!nombresRaw && split.nombres) nombres = split.nombres;
			}
		}
	}

	if (nombresRaw) {
		const nom = sanitizeNamePhrase(toTitleCase(nombresRaw));
		if (isCleanNamePhrase(nom) && !namesConflict(nom, apellidoPaterno, apellidoMaterno)) {
			nombres = nom;
		}
	}

	// Apellido materno contaminado con nombres (ej: "Herrera Martin Alonso")
	if (apellidoMaterno) {
		const matParts = apellidoMaterno.split(/\s+/).filter(Boolean);
		if (matParts.length >= 2) {
			apellidoMaterno = matParts[0];
			const rest = matParts.slice(1).join(' ');
			if (
				isCleanNamePhrase(rest) &&
				!namesConflict(rest, apellidoPaterno, apellidoMaterno)
			) {
				nombres = preferFullName(nombres, rest);
			}
		}
	}

	if (namesConflict(nombres, apellidoPaterno, apellidoMaterno)) {
		nombres = '';
	}

	if (!nombres) {
		const m = text.match(
			/\bNOMBRES?\b[\s:=\-]*([A-ZÁÉÍÓÚÑ]+(?:\s+[A-ZÁÉÍÓÚÑ]+){0,3})/
		);
		if (m) {
			const candidate = sanitizeNamePhrase(toTitleCase(m[1]));
			if (
				isCleanNamePhrase(candidate) &&
				!namesConflict(candidate, apellidoPaterno, apellidoMaterno)
			) {
				nombres = candidate;
			}
		}
	}

	if (!isCleanNamePhrase(apellidoPaterno) && mrz?.apellidoPaterno) {
		apellidoPaterno = mrz.apellidoPaterno;
		if (!apellidoMaterno && mrz.apellidoMaterno) apellidoMaterno = mrz.apellidoMaterno;
	}
	if (!isCleanNamePhrase(apellidoMaterno) && mrz?.apellidoMaterno) {
		apellidoMaterno = mrz.apellidoMaterno;
	}
	if (
		!isCleanNamePhrase(nombres) &&
		mrz?.nombres &&
		isCleanNamePhrase(mrz.nombres) &&
		!namesConflict(mrz.nombres, apellidoPaterno, apellidoMaterno)
	) {
		nombres = mrz.nombres;
	}

	if (!isCleanNamePhrase(apellidoPaterno)) {
		apellidoPaterno = '';
		apellidoMaterno = '';
	}
	if (apellidoMaterno && !isCleanNamePhrase(apellidoMaterno)) apellidoMaterno = '';
	if (!isCleanNamePhrase(nombres) || namesConflict(nombres, apellidoPaterno, apellidoMaterno)) {
		nombres = '';
	}

	let genero = extractSexo(text, lines);
	if (!genero && mrz?.genero) genero = mrz.genero;

	let nacionalidad: string | null = null;
	if (/\bCHILENA?\b/.test(text) || mrz?.nacionalidad === 'Chile') nacionalidad = 'Chile';

	let fechaNacimiento = extractFechaNacimiento(text, lines);
	if (!fechaNacimiento && mrz?.fechaNacimiento) fechaNacimiento = mrz.fechaNacimiento;

	const hasPerson = Boolean(nombres || apellidoPaterno || fechaNacimiento || genero || nacionalidad);
	if (!rut && !hasPerson) return null;

	return {
		rut,
		nombres,
		apellidoPaterno,
		apellidoMaterno,
		fechaNacimiento,
		genero,
		nacionalidad,
		soloRut: Boolean(rut) && !(nombres && apellidoPaterno),
	};
}

function stripMrzLines(ocrText: string): string {
	return String(ocrText || '')
		.split(/\r?\n/)
		.filter((line) => {
			const c = line.replace(/\s+/g, '').replace(/[^A-Z0-9<]/gi, '').toUpperCase();
			if (c.length < 12) return true;
			if (/^(INCHL|IDCHL)/.test(c)) return false;
			if (/^[0-9]{6}[0-9]?[MF]/.test(c) && c.includes('CHL')) return false;
			if (/<</.test(c) && /^[A-Z0-9<]+$/.test(c) && c.length >= 18) return false;
			return true;
		})
		.join('\n');
}

export function isCompleteCedulaRead(data: CedulaData | null): boolean {
	if (!data) return false;
	if (!data.rut || !isValidRutDv(data.rut)) return false;
	if (!isCleanNamePhrase(data.apellidoPaterno)) return false;
	if (!isCleanNamePhrase(data.nombres)) return false;
	if (!data.fechaNacimiento || !isPlausibleBirthDate(data.fechaNacimiento)) return false;
	if (!data.genero) return false;
	return true;
}

export function fingerprintCedula(data: CedulaData): string {
	return [
		data.rut,
		data.apellidoPaterno,
		data.apellidoMaterno,
		data.nombres,
		data.fechaNacimiento,
		data.genero,
		data.nacionalidad,
	]
		.map((x) => String(x || '').toLowerCase())
		.join('|');
}

export function preprocessCedulaFrame(source: HTMLCanvasElement): HTMLCanvasElement {
	const sw = source.width;
	const sh = source.height;
	// Recorta foto (izq.) y se enfoca en zona de texto
	const sx = Math.floor(sw * 0.22);
	const sy = Math.floor(sh * 0.03);
	const swidth = Math.floor(sw * 0.76);
	const sheight = Math.floor(sh * 0.92);

	const scale = Math.max(2.5, 1500 / Math.max(1, swidth));
	const out = document.createElement('canvas');
	out.width = Math.max(1, Math.floor(swidth * scale));
	out.height = Math.max(1, Math.floor(sheight * scale));
	const ctx = out.getContext('2d');
	if (!ctx) return source;

	ctx.imageSmoothingEnabled = true;
	ctx.drawImage(source, sx, sy, swidth, sheight, 0, 0, out.width, out.height);

	const img = ctx.getImageData(0, 0, out.width, out.height);
	const d = img.data;
	for (let i = 0; i < d.length; i += 4) {
		const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
		const v = Math.max(0, Math.min(255, (gray - 128) * 1.55 + 128 - 20));
		d[i] = d[i + 1] = d[i + 2] = v;
	}
	ctx.putImageData(img, 0, 0);
	return out;
}

function preprocessRunStrip(source: HTMLCanvasElement): HTMLCanvasElement {
	const sw = source.width;
	const sh = source.height;
	const sx = Math.floor(sw * 0.01);
	const sy = Math.floor(sh * 0.68);
	const swidth = Math.floor(sw * 0.62);
	const sheight = Math.floor(sh * 0.3);
	const scale = 3.5;
	const out = document.createElement('canvas');
	out.width = Math.max(1, Math.floor(swidth * scale));
	out.height = Math.max(1, Math.floor(sheight * scale));
	const ctx = out.getContext('2d');
	if (!ctx) return source;
	ctx.drawImage(source, sx, sy, swidth, sheight, 0, 0, out.width, out.height);
	const img = ctx.getImageData(0, 0, out.width, out.height);
	const d = img.data;
	for (let i = 0; i < d.length; i += 4) {
		const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
		const v = Math.max(0, Math.min(255, (gray - 128) * 1.9 + 128 - 45));
		d[i] = d[i + 1] = d[i + 2] = v;
	}
	ctx.putImageData(img, 0, 0);
	return out;
}

/** Franja media: fechas (nacimiento suele quedar sobre el cóndor / bajo contraste). */
function preprocessFechaStrip(source: HTMLCanvasElement): HTMLCanvasElement {
	const sw = source.width;
	const sh = source.height;
	const sx = Math.floor(sw * 0.26);
	const sy = Math.floor(sh * 0.34);
	const swidth = Math.floor(sw * 0.7);
	const sheight = Math.floor(sh * 0.42);
	const scale = Math.max(3.2, 1800 / Math.max(1, swidth));
	const out = document.createElement('canvas');
	out.width = Math.max(1, Math.floor(swidth * scale));
	out.height = Math.max(1, Math.floor(sheight * scale));
	const ctx = out.getContext('2d');
	if (!ctx) return source;
	ctx.imageSmoothingEnabled = true;
	ctx.drawImage(source, sx, sy, swidth, sheight, 0, 0, out.width, out.height);
	const img = ctx.getImageData(0, 0, out.width, out.height);
	const d = img.data;
	for (let i = 0; i < d.length; i += 4) {
		const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
		const contrast = (gray - 128) * 2.1 + 128 - 35;
		const v = contrast > 155 ? 255 : contrast < 110 ? 0 : Math.max(0, Math.min(255, contrast));
		d[i] = d[i + 1] = d[i + 2] = v;
	}
	ctx.putImageData(img, 0, 0);
	return out;
}

/** Franja MRZ del reverso: contraste suave + escala alta. */
function preprocessMrzStrip(source: HTMLCanvasElement, topRatio = 0.5): HTMLCanvasElement {
	const sw = source.width;
	const sh = source.height;
	const sx = Math.floor(sw * 0.02);
	const sy = Math.floor(sh * topRatio);
	const swidth = Math.floor(sw * 0.96);
	const sheight = Math.max(8, Math.floor(sh * (1 - topRatio) - 2));
	const scale = Math.max(3.2, 2400 / Math.max(1, swidth));
	const out = document.createElement('canvas');
	out.width = Math.max(1, Math.floor(swidth * scale));
	out.height = Math.max(1, Math.floor(sheight * scale));
	const ctx = out.getContext('2d');
	if (!ctx) return source;
	ctx.imageSmoothingEnabled = true;
	ctx.drawImage(source, sx, sy, swidth, sheight, 0, 0, out.width, out.height);
	const img = ctx.getImageData(0, 0, out.width, out.height);
	const d = img.data;
	for (let i = 0; i < d.length; i += 4) {
		const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
		const v = Math.max(0, Math.min(255, (gray - 128) * 1.8 + 128 - 40));
		d[i] = d[i + 1] = d[i + 2] = v;
	}
	ctx.putImageData(img, 0, 0);
	return out;
}

function upscaleIfSmall(source: HTMLCanvasElement, minW = 1000): HTMLCanvasElement {
	if (source.width >= minW) return source;
	const scale = minW / source.width;
	const out = document.createElement('canvas');
	out.width = Math.floor(source.width * scale);
	out.height = Math.floor(source.height * scale);
	const ctx = out.getContext('2d');
	if (!ctx) return source;
	ctx.imageSmoothingEnabled = true;
	ctx.drawImage(source, 0, 0, out.width, out.height);
	return out;
}

function preferFullName(a?: string | null, b?: string | null): string {
	const aa = String(a || '').trim();
	const bb = String(b || '').trim();
	if (!aa) return bb;
	if (!bb) return aa;
	const score = (s: string) => {
		const words = s.split(/\s+/).filter(Boolean);
		return words.length * 20 + (words.length > 1 ? 30 : 0) + s.length;
	};
	const al = aa.toLowerCase().replace(/\s+/g, '');
	const bl = bb.toLowerCase().replace(/\s+/g, '');
	if (al.startsWith(bl) || bl.startsWith(al)) return score(aa) >= score(bb) ? aa : bb;
	return score(aa) >= score(bb) ? aa : bb;
}

function mergeCedulaData(base: CedulaData | null, extra: CedulaData | null): CedulaData | null {
	if (!base && !extra) return null;
	if (!base) return extra;
	if (!extra) return base;
	return {
		rut: base.rut || extra.rut,
		nombres: preferFullName(base.nombres, extra.nombres),
		apellidoPaterno: preferFullName(base.apellidoPaterno, extra.apellidoPaterno),
		apellidoMaterno: preferFullName(base.apellidoMaterno, extra.apellidoMaterno),
		fechaNacimiento: base.fechaNacimiento || extra.fechaNacimiento,
		genero: base.genero || extra.genero,
		nacionalidad: base.nacionalidad || extra.nacionalidad,
		soloRut: false,
	};
}

export function captureVideoFrame(video: HTMLVideoElement): HTMLCanvasElement | null {
	if (!video.videoWidth || !video.videoHeight) return null;
	const canvas = document.createElement('canvas');
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;
	ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
	return canvas;
}

function cropCanvas(
	source: HTMLCanvasElement,
	sx: number,
	sy: number,
	sw: number,
	sh: number
): HTMLCanvasElement {
	const out = document.createElement('canvas');
	out.width = Math.max(1, Math.floor(sw));
	out.height = Math.max(1, Math.floor(sh));
	const ctx = out.getContext('2d');
	ctx?.drawImage(source, sx, sy, sw, sh, 0, 0, out.width, out.height);
	return out;
}

/** Anverso+reverso apilados o (raro) lado a lado. Ojo: una sola cédula ya mide ~1.58 de ancho. */
function splitAnversoRegion(source: HTMLCanvasElement): {
	anverso: HTMLCanvasElement;
	reverso: HTMLCanvasElement | null;
} {
	const w = source.width;
	const h = source.height;
	const ratioHW = h / Math.max(1, w);
	const ratioWH = w / Math.max(1, h);
	// Dos caras apiladas (PDF/foto típica SIPO)
	if (ratioHW >= 1.2) {
		const mid = Math.floor(h * 0.5);
		return {
			anverso: cropCanvas(source, 0, 0, w, mid),
			reverso: cropCanvas(source, 0, mid, w, h - mid),
		};
	}
	// Dos caras en horizontal: ~3x más ancho que alto (una sola cédula ≈ 1.58)
	if (ratioWH >= 2.35) {
		const mid = Math.floor(w * 0.5);
		return {
			anverso: cropCanvas(source, 0, 0, mid, h),
			reverso: cropCanvas(source, mid, 0, w - mid, h),
		};
	}
	return { anverso: source, reverso: null };
}

export function missingCedulaFields(data: CedulaData | null): string[] {
	if (!data) return ['datos'];
	const miss: string[] = [];
	if (!data.rut) miss.push('RUT');
	if (!data.apellidoPaterno) miss.push('Apellido paterno');
	if (!data.nombres) miss.push('Nombres');
	if (!data.fechaNacimiento) miss.push('Fecha de nacimiento');
	if (!data.genero) miss.push('Sexo');
	return miss;
}

/** Acepta carga aunque falte algún campo menor (p. ej. nombres) para no bloquear. */
export function isUsableCedulaRead(data: CedulaData | null): boolean {
	if (!data) return false;
	if (!data.rut || !isValidRutDv(data.rut)) return false;
	if (!isCleanNamePhrase(data.apellidoPaterno)) return false;
	if (!data.fechaNacimiento || !isPlausibleBirthDate(data.fechaNacimiento)) return false;
	if (!data.genero) return false;
	return true;
}

/** Lectura parcial: hay identidad útil aunque falte RUT u otro campo ilegible. */
export function isPartialCedulaRead(data: CedulaData | null): boolean {
	if (!data) return false;
	const hasApellido = isCleanNamePhrase(data.apellidoPaterno);
	const hasNombres = isCleanNamePhrase(data.nombres || '', 1);
	const hasFecha = Boolean(data.fechaNacimiento && isPlausibleBirthDate(data.fechaNacimiento));
	const hasGenero = Boolean(data.genero);
	const hasRut = Boolean(data.rut && isValidRutDv(data.rut));
	const signals = [hasApellido || hasNombres, hasFecha, hasGenero, hasRut].filter(Boolean).length;
	return signals >= 2;
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		if (!canvas.width || !canvas.height) {
			reject(new Error('Canvas vacío'));
			return;
		}
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('No se pudo exportar imagen'))),
			'image/png'
		);
	});
}

async function ocrCanvas(
	worker: Worker,
	canvas: HTMLCanvasElement | null | undefined
): Promise<string> {
	if (!canvas || canvas.width < 8 || canvas.height < 8) return '';
	try {
		const dataUrl = canvas.toDataURL('image/png');
		const r = await worker.recognize(dataUrl);
		return r.data.text || '';
	} catch {
		try {
			const blob = await canvasToPngBlob(canvas);
			const r = await worker.recognize(blob);
			return r.data.text || '';
		} catch {
			try {
				const r = await worker.recognize(canvas);
				return r.data.text || '';
			} catch {
				return '';
			}
		}
	}
}

function assembleCedulaFromTexts(texts: string[]): CedulaData | null {
	let data: CedulaData | null = null;
	for (const t of texts) {
		if (!t?.trim()) continue;
		const partial = parseCedulaAnversoText(t);
		if (!partial) continue;
		data = mergeCedulaData(data, partial);
	}
	if (data) {
		// Preferir nombres visuales completos sobre MRZ truncado/pegado
		let bestNombres = data.nombres;
		for (const t of texts) {
			const p = parseCedulaAnversoText(t);
			if (!p?.nombres) continue;
			if (isCleanNamePhrase(p.nombres, 2)) {
				bestNombres = preferFullName(bestNombres, p.nombres);
			}
		}
		if (isCleanNamePhrase(bestNombres)) data.nombres = bestNombres;
		else if (data.nombres) {
			const fixed = splitMergedGivenNames(data.nombres.replace(/\s+/g, ''));
			if (isCleanNamePhrase(fixed, 2)) data.nombres = fixed;
		}
		data.soloRut = Boolean(data.rut) && !(data.nombres && data.apellidoPaterno);
	}
	return data;
}

export async function recognizeCedulaImage(
	source: HTMLCanvasElement | File | Blob | string,
	opts?: { preprocess?: boolean }
): Promise<{ text: string; data: CedulaData | null }> {
	let fullCanvas: HTMLCanvasElement | null = null;
	let originalFile: File | Blob | null = null;
	if (source instanceof HTMLCanvasElement) {
		fullCanvas = source;
	} else if (source instanceof File || source instanceof Blob) {
		originalFile = source;
		const bmp = await createImageBitmap(source);
		fullCanvas = document.createElement('canvas');
		fullCanvas.width = bmp.width;
		fullCanvas.height = bmp.height;
		const ctx = fullCanvas.getContext('2d');
		ctx?.drawImage(bmp, 0, 0);
		bmp.close();
	}

	const worker = await getOcrWorker();
	const texts: string[] = [];

	if (fullCanvas && opts?.preprocess !== false) {
		fullCanvas = upscaleIfSmall(fullCanvas, 1200);
		const { anverso, reverso } = splitAnversoRegion(fullCanvas);

		// 1) MRZ primero (en fotos apiladas baja-res es lo más fiable)
		if (reverso) {
			for (const top of [0.48, 0.55, 0.62]) {
				texts.push(await ocrCanvas(worker, preprocessMrzStrip(reverso, top)));
			}
			texts.push(await ocrCanvas(worker, reverso));
			const early = assembleCedulaFromTexts(texts);
			if (isUsableCedulaRead(early) || isCompleteCedulaRead(early)) {
				// Completar nombres desde anverso si se puede
				texts.push(await ocrCanvas(worker, preprocessCedulaFrame(anverso)));
				texts.push(await ocrCanvas(worker, anverso));
				const data = assembleCedulaFromTexts(texts);
				return { text: texts.join('\n'), data };
			}
		} else {
			// Una sola cara: también buscar MRZ por si es foto del reverso
			texts.push(await ocrCanvas(worker, preprocessMrzStrip(fullCanvas, 0.55)));
		}

		// 2) Anverso / archivo original
		texts.push(await ocrCanvas(worker, preprocessCedulaFrame(anverso)));
		texts.push(await ocrCanvas(worker, preprocessFechaStrip(anverso)));
		texts.push(await ocrCanvas(worker, preprocessRunStrip(anverso)));
		texts.push(await ocrCanvas(worker, anverso));
		if (originalFile) {
			try {
				const r = await worker.recognize(originalFile);
				texts.push(r.data.text || '');
			} catch {
				/* */
			}
		}

		const data = assembleCedulaFromTexts(texts);
		return { text: texts.join('\n'), data };
	}

	if (fullCanvas) {
		texts.push(await ocrCanvas(worker, fullCanvas));
	} else if (typeof source === 'string') {
		const r = await worker.recognize(source);
		texts.push(r.data.text || '');
	} else if (originalFile) {
		const r = await worker.recognize(originalFile);
		texts.push(r.data.text || '');
	}

	const data = assembleCedulaFromTexts(texts);
	return { text: texts.join('\n'), data };
}

/** Varias páginas/imágenes (p. ej. PDF anverso+reverso). Nombres priorizan la 1ª cara con nombre usable. */
export async function recognizeCedulaPages(
	canvases: HTMLCanvasElement[],
	opts?: { preprocess?: boolean }
): Promise<{ text: string; data: CedulaData | null }> {
	if (!canvases.length) return { text: '', data: null };
	if (canvases.length === 1) return recognizeCedulaImage(canvases[0], opts);

	let merged: CedulaData | null = null;
	let namesSource: CedulaData | null = null;
	const texts: string[] = [];

	for (const canvas of canvases) {
		const { text, data } = await recognizeCedulaImage(canvas, opts);
		texts.push(text);
		if (data && isCleanNamePhrase(data.nombres) && isCleanNamePhrase(data.apellidoPaterno)) {
			if (!namesSource) namesSource = data;
		}
		merged = mergeCedulaData(merged, data);
	}

	if (merged && namesSource) {
		merged.nombres = namesSource.nombres;
		merged.apellidoPaterno = namesSource.apellidoPaterno;
		if (namesSource.apellidoMaterno) merged.apellidoMaterno = namesSource.apellidoMaterno;
	}
	if (merged) {
		merged.soloRut = Boolean(merged.rut) && !(merged.nombres && merged.apellidoPaterno);
	}
	return { text: texts.join('\n---\n'), data: merged };
}
