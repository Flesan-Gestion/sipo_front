import axios from 'axios';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';

export interface SipoFichaListItem {
	id: number;
	rut: string;
	nombre_colaborador: string;
	centro_costo: string;
	centro_costo_id?: string;
	centro_costo_nombre?: string;
	razon_social: string;
	razon_social_id?: string;
	razon_social_nombre?: string;
	fecha_ingreso: string | null;
	cargo?: string;
	estado?: string;
	estado_label?: string;
	can_aprobar?: boolean;
	can_editar?: boolean;
	can_retroceder?: boolean;
	can_eliminar?: boolean;
	correo_jefe_directo?: string;
	correo_admin_obra?: string;
	created_at?: string;
}

export class SipoFichasService {
	private static url = import.meta.env.APP_API_URL;

	static async list(
		search?: string,
		aprobadas?: boolean,
		razonSocialId?: string | null
	): Promise<ApiResponse<SipoFichaListItem[]>> {
		const response = await axios.get(`${SipoFichasService.url}/sipo/fichas/`, {
			params: {
				search: search || undefined,
				aprobadas: aprobadas ? true : undefined,
				razon_social_id: razonSocialId || undefined,
			},
		});
		return response.data;
	}

	static async create(formData: FormData): Promise<ApiResponse<Record<string, unknown>>> {
		const response = await axios.post(`${SipoFichasService.url}/sipo/fichas/`, formData);
		return response.data;
	}

	static async update(
		id: number,
		formData: FormData
	): Promise<ApiResponse<Record<string, unknown>>> {
		const response = await axios.patch(`${SipoFichasService.url}/sipo/fichas/${id}/`, formData);
		return response.data;
	}

	static async getById(id: number): Promise<ApiResponse<Record<string, unknown>>> {
		const response = await axios.get(`${SipoFichasService.url}/sipo/fichas/${id}/`);
		return response.data;
	}

	static async aprobar(id: number): Promise<ApiResponse<Record<string, unknown>>> {
		const response = await axios.post(`${SipoFichasService.url}/sipo/fichas/${id}/aprobar/`);
		return response.data;
	}

	static async retroceder(id: number): Promise<ApiResponse<Record<string, unknown>>> {
		const response = await axios.post(`${SipoFichasService.url}/sipo/fichas/${id}/retroceder/`);
		return response.data;
	}

	static async rechazar(
		id: number,
		comentario: string
	): Promise<ApiResponse<Record<string, unknown>>> {
		const response = await axios.post(`${SipoFichasService.url}/sipo/fichas/${id}/rechazar/`, {
			comentario,
		});
		return response.data;
	}

	static async generarAcceso(id: number) {
		const response = await axios.post(`${SipoFichasService.url}/sipo/fichas/${id}/acceso/`);
		return response.data;
	}

	static async eliminar(id: number): Promise<ApiResponse<{ id: number; deleted: boolean }>> {
		const response = await axios.delete(`${SipoFichasService.url}/sipo/fichas/${id}/`);
		return response.data;
	}

	static async getPdfBlob(id: number): Promise<Blob> {
		const response = await axios.get(`${SipoFichasService.url}/sipo/fichas/${id}/pdf/`, {
			responseType: 'blob',
		});
		return response.data;
	}

	static pdfUrl(id: number): string {
		return `${SipoFichasService.url}/sipo/fichas/${id}/pdf/`;
	}
}
