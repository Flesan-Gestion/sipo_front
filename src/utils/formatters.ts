export const parseMontoCl = (value: string | number | null | undefined): number | null => {
	if (value === null || value === undefined || value === '') return null;
	if (typeof value === 'number') return Math.round(value);
	const raw = String(value).trim();
	if (!raw) return null;
	if (/^\d{1,3}(\.\d{3})+$/.test(raw)) return Number(raw.replace(/\./g, ''));
	if (/^\d+$/.test(raw)) return Number(raw);
	if (/^\d+\.\d{1,2}$/.test(raw)) return Math.round(Number(raw));
	const normalized = raw.replace(/\./g, '').replace(',', '.');
	const num = Number(normalized);
	return Number.isNaN(num) ? null : Math.round(num);
};

export const formatMontoCl = (
	value: string | number | null | undefined,
	empty = '—',
): string => {
	const num = parseMontoCl(value);
	if (num === null) return empty;
	return new Intl.NumberFormat('es-CL', {
		style: 'currency',
		currency: 'CLP',
		maximumFractionDigits: 0,
	}).format(num);
};
