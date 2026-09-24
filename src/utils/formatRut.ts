const RUT_FILTER = '1234567890.-K';

/** Filtra caracteres válidos (paridad Rut_colabolador legado). */
export const filterRutInput = (value: string): string => {
	let out = '';
	const upper = String(value ?? '').toUpperCase();
	for (let i = 0; i < upper.length; i += 1) {
		const ch = upper.charAt(i);
		if (RUT_FILTER.includes(ch)) {
			out += ch;
		}
	}
	return out;
};

/**
 * Formatea RUT al estándar legado: 9.676.775-7
 * Quita cero inicial del cuerpo si tiene 8 dígitos (paridad submit legado).
 */
export const formatRut = (rut: string | null | undefined): string => {
	const filtered = filterRutInput(String(rut ?? '').trim());
	if (!filtered) {
		return '';
	}

	const cleanRut = filtered.replace(/\./g, '').replace(/-/g, '');
	if (cleanRut.length < 2) {
		return filtered;
	}

	let body = cleanRut.slice(0, -1);
	const dv = cleanRut.slice(-1);

	if (body.length === 8 && body.startsWith('0')) {
		body = body.substring(1);
	}

	const parts: string[] = [];
	let remaining = body;
	while (remaining) {
		parts.push(remaining.slice(-3));
		remaining = remaining.slice(0, -3);
	}

	return `${parts.reverse().join('.')}-${dv}`;
};

export const isValidRut = (rut: string): boolean => {
	const cleaned = String(rut ?? '')
		.replace(/\./g, '')
		.replace(/-/g, '')
		.replace(/[^\dkK]/gi, '')
		.toUpperCase();
	if (cleaned.length < 8) {
		return false;
	}

	let body = cleaned.slice(0, -1);
	const dv = cleaned.slice(-1);

	if (body.length === 8 && body.startsWith('0')) {
		body = body.substring(1);
	}
	if (body.length < 7 || !/^\d+$/.test(body)) {
		return false;
	}

	let sum = 0;
	let multiplier = 2;
	for (let i = body.length - 1; i >= 0; i -= 1) {
		sum += Number(body[i]) * multiplier;
		multiplier = multiplier === 7 ? 2 : multiplier + 1;
	}

	const expected = 11 - (sum % 11);
	const dvCalc = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);
	return dv === dvCalc;
};
