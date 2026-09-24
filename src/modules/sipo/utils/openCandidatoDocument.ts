import axios from 'axios';
import { useGlobalStore } from '../../../store/global';
import { ToastSeverityMessageEnum } from '../../../shared/interfaces/toast-message.interface';

export const openCandidatoDocument = async (url?: string | null) => {
	const target = (url || '').trim();
	if (!target) return;

	const global = useGlobalStore();
	const isApiDocument = /\/sipo\/\d+\/candidatos\/[^/]+\/documento\//i.test(target);

	try {
		if (isApiDocument) {
			const response = await axios.get(target, { responseType: 'blob' });
			const contentType = String(response.headers['content-type'] || 'application/pdf');
			const blob = new Blob([response.data], { type: contentType });
			const blobUrl = URL.createObjectURL(blob);
			window.open(blobUrl, '_blank', 'noopener,noreferrer');
			window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
			return;
		}

		window.open(target, '_blank', 'noopener,noreferrer');
	} catch {
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.ERROR,
			'Documento',
			'No se pudo abrir el documento adjunto.'
		);
	}
};
