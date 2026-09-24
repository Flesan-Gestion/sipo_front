import axios from 'axios';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import {
	SipoPerfilRol,
	SipoUsuario,
	SipoUsuarioCreatePayload,
	SipoUsuarioUpdatePayload,
} from '../sipoConstants';

export interface SipoUsuariosListParams {
	search?: string;
	cf_rol_id?: number | null;
}

export class SipoUsuariosService {
	private static url = import.meta.env.APP_API_URL;

	static async getUsuarios(
		params: SipoUsuariosListParams = {}
	): Promise<ApiResponse<SipoUsuario[]>> {
		const response = await axios.get(`${SipoUsuariosService.url}/sipo/usuarios/`, {
			params: {
				search: params.search || undefined,
				cf_rol_id: params.cf_rol_id ?? undefined,
			},
		});
		return response.data;
	}

	static async getPerfiles(): Promise<ApiResponse<SipoPerfilRol[]>> {
		const response = await axios.get(`${SipoUsuariosService.url}/sipo/perfiles/`);
		return response.data;
	}

	static async getMiAlcance(): Promise<
		ApiResponse<{
			is_admin: boolean;
			empresas_ids: string[];
			centros_costo_ids: string[];
			empresas: { id: string; nombre: string }[];
			centros_costo: { id: string; nombre: string; empresa_rut?: string }[];
		}>
	> {
		const response = await axios.get(`${SipoUsuariosService.url}/sipo/me/alcance/`);
		return response.data;
	}

	static async createUsuario(payload: SipoUsuarioCreatePayload): Promise<ApiResponse<SipoUsuario>> {
		const response = await axios.post(`${SipoUsuariosService.url}/sipo/usuarios/`, payload);
		return response.data;
	}

	static async updateUsuario(
		id: number,
		payload: SipoUsuarioUpdatePayload
	): Promise<ApiResponse<SipoUsuario>> {
		const response = await axios.patch(`${SipoUsuariosService.url}/sipo/usuarios/${id}/`, payload);
		return response.data;
	}

	static async updateRol(id: number, rol_id: number): Promise<ApiResponse<SipoUsuario>> {
		return SipoUsuariosService.updateUsuario(id, { rol_id });
	}

	static async deleteUsuario(id: number): Promise<ApiResponse<{ id: number; deleted: boolean }>> {
		const response = await axios.delete(`${SipoUsuariosService.url}/sipo/usuarios/${id}/`);
		return response.data;
	}
}
