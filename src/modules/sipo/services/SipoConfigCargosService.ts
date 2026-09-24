import axios from 'axios';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';

export interface SipoConfigEmpresa {
	id: string;
	rut: string;
	razon_social: string;
	cargos_asignados?: number;
	horarios_asignados?: number;
}

export interface SipoConfigCargo {
	id: number;
	nombre: string;
	external_code?: string;
	area_personal?: string;
	estado?: string;
	activo: boolean;
}

export interface SipoConfigCargoCatalogo {
	external_code: string;
	nombre: string;
	area_personal?: string;
	area_personal_code?: string;
}

export interface SipoConfigHorario {
	external_code: string;
	descripcion: string;
	dias_trabajo?: number | string | null;
	hora_entrada?: string;
	hora_salida?: string;
	tiempo_colacion?: string | null;
	horas_semanales?: number | string | null;
	detalle?: string;
	empresa_id?: string;
	activo?: boolean;
}

export class SipoConfigCargosService {
	private static url = import.meta.env.APP_API_URL;

	static async getEmpresas(): Promise<ApiResponse<SipoConfigEmpresa[]>> {
		const response = await axios.get(`${SipoConfigCargosService.url}/sipo/config/empresas/`);
		return response.data;
	}

	static async getCargos(empresaId: string): Promise<
		ApiResponse<{ cargos: SipoConfigCargo[]; catalogo: SipoConfigCargoCatalogo[] }>
	> {
		const response = await axios.get(`${SipoConfigCargosService.url}/sipo/config/cargos/`, {
			params: { empresa_id: empresaId },
		});
		return response.data;
	}

	static async assignCargo(payload: {
		empresa_id: string;
		external_code: string;
		nombre?: string;
		area_personal?: string;
	}): Promise<ApiResponse<SipoConfigCargo>> {
		const response = await axios.post(`${SipoConfigCargosService.url}/sipo/config/cargos/`, payload);
		return response.data;
	}

	static async toggleCargo(payload: {
		empresa_id: string;
		id: number;
		activo: boolean;
	}): Promise<ApiResponse<{ ok: boolean }>> {
		const response = await axios.put(`${SipoConfigCargosService.url}/sipo/config/cargos/`, payload);
		return response.data;
	}

	static async getHorarios(empresaId: string): Promise<
		ApiResponse<{ horarios: SipoConfigHorario[]; catalogo: SipoConfigHorario[] }>
	> {
		const response = await axios.get(`${SipoConfigCargosService.url}/sipo/config/horarios/`, {
			params: { empresa_id: empresaId },
		});
		return response.data;
	}

	static async assignHorario(payload: {
		empresa_id: string;
		external_code: string;
		descripcion?: string;
	}): Promise<ApiResponse<SipoConfigHorario>> {
		const response = await axios.post(`${SipoConfigCargosService.url}/sipo/config/horarios/`, payload);
		return response.data;
	}

	static async removeHorario(payload: {
		empresa_id: string;
		external_code: string;
	}): Promise<ApiResponse<{ ok: boolean }>> {
		const response = await axios.put(`${SipoConfigCargosService.url}/sipo/config/horarios/`, payload);
		return response.data;
	}
}
