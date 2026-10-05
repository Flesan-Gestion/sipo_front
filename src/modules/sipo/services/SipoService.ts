import axios from 'axios';
import { ApiResponse, Data } from '../../../shared/interfaces/api-response.interface';
import {
	SipoCandidato,
	SipoCandidatoSeleccionado,
	SipoCandidatoWritePayload,
	SipoEstadoFiltro,
	SipoMaestrosResponse,
	SipoObraDetail,
	SipoObraListItem,
	SipoObraWritePayload,
	SipoReintegrarItem,
} from '../sipoConstants';

export interface SipoListParams {
	estado?: SipoEstadoFiltro;
	page?: number;
	per_page?: number;
	filterText?: string;
}

export interface SipoExcelExportParams {
	search?: string;
	filterText?: string;
	status?: SipoEstadoFiltro;
	estado?: SipoEstadoFiltro;
	centro_costo?: string;
	empresa?: string;
	filterEmpresa?: string;
	cargo?: string;
	filterCargo?: string;
	fecha_inicio?: string;
	fecha_fin?: string;
}

export class SipoService {
	private static url = import.meta.env.APP_API_URL;

	static async getList(params: SipoListParams = {}): Promise<ApiResponse<Data<SipoObraListItem>>> {
		const response = await axios.get(`${SipoService.url}/sipo/`, {
			params: {
				estado: params.estado ?? 'Activas',
				page: params.page ?? 1,
				per_page: params.per_page ?? 10,
				filterText: params.filterText || undefined,
			},
		});
		return response.data;
	}

	static async exportarExcel(params: SipoExcelExportParams = {}): Promise<Blob> {
		const response = await axios.get(`${SipoService.url}/sipo/exportar-excel/`, {
			params: {
				search: params.search || params.filterText || undefined,
				status: params.status || params.estado || 'Activas',
				centro_costo: params.centro_costo || undefined,
				empresa: params.empresa || params.filterEmpresa || undefined,
				cargo: params.cargo || params.filterCargo || undefined,
				fecha_inicio: params.fecha_inicio || undefined,
				fecha_fin: params.fecha_fin || undefined,
			},
			responseType: 'blob',
		});
		return response.data;
	}

	static async getById(sipId: number): Promise<ApiResponse<SipoObraDetail>> {
		const response = await axios.get(`${SipoService.url}/sipo/${sipId}/`);
		return response.data;
	}

	static async create(payload: SipoObraWritePayload): Promise<ApiResponse<SipoObraDetail>> {
		const response = await axios.post(`${SipoService.url}/sipo/`, payload);
		return response.data;
	}

	static async update(sipId: number, payload: Partial<SipoObraWritePayload>): Promise<ApiResponse<SipoObraDetail>> {
		const response = await axios.patch(`${SipoService.url}/sipo/${sipId}/`, payload);
		return response.data;
	}

	static async cancelar(sipId: number, comentario?: string): Promise<ApiResponse<SipoObraListItem>> {
		const response = await axios.post(`${SipoService.url}/sipo/${sipId}/cancelar/`, {
			comentario: comentario || undefined,
		});
		return response.data;
	}

	static async cambiarEstado(
		sipId: number,
		nuevoEstado: number,
		comentario?: string
	): Promise<ApiResponse<SipoObraDetail>> {
		const response = await axios.post(`${SipoService.url}/sipo/${sipId}/cambiar-estado/`, {
			nuevo_estado: nuevoEstado,
			comentario: comentario || undefined,
		});
		return response.data;
	}

	static async getCandidatos(sipId: number): Promise<ApiResponse<SipoCandidato[]>> {
		const response = await axios.get(`${SipoService.url}/sipo/${sipId}/candidatos/`);
		return response.data;
	}

	static async getCandidatosSeleccionados(
		sipId: number
	): Promise<ApiResponse<SipoCandidatoSeleccionado[]>> {
		const response = await axios.get(`${SipoService.url}/sipo/${sipId}/candidatos-seleccionados/`);
		return response.data;
	}

	static async toggleRevisionDt(
		candidatoId: string
	): Promise<ApiResponse<SipoCandidatoSeleccionado>> {
		const response = await axios.patch(
			`${SipoService.url}/sipo/candidatos/${candidatoId}/toggle-revision-dt/`
		);
		return response.data;
	}

	static async createCandidato(
		sipId: number,
		payload: SipoCandidatoWritePayload
	): Promise<ApiResponse<SipoCandidato>> {
		const response = await axios.post(`${SipoService.url}/sipo/${sipId}/candidatos/`, payload);
		return response.data;
	}

	static async updateCandidato(
		sipId: number,
		candidatoId: string,
		payload: SipoCandidatoWritePayload
	): Promise<ApiResponse<SipoCandidato>> {
		const response = await axios.patch(
			`${SipoService.url}/sipo/${sipId}/candidatos/${candidatoId}/`,
			payload
		);
		return response.data;
	}

	static async deleteCandidato(sipId: number, candidatoId: string): Promise<ApiResponse<{ deleted: boolean }>> {
		const response = await axios.delete(`${SipoService.url}/sipo/${sipId}/candidatos/${candidatoId}/`);
		return response.data;
	}

	static async aprobarContratacion(
		sipId: number
	): Promise<ApiResponse<{ obra: SipoObraDetail } & Record<string, unknown>>> {
		const response = await axios.post(`${SipoService.url}/sipo/${sipId}/aprobar-contratacion/`);
		return response.data;
	}

	static async syncSap(
		sipId: number
	): Promise<ApiResponse<{ message?: string; candidatos_procesados?: number } & Record<string, unknown>>> {
		const response = await axios.post(`${SipoService.url}/sipo/${sipId}/sync-sap/`);
		return response.data;
	}

	static async getMaestros(
		rut?: string,
		externalCodePais?: string
	): Promise<ApiResponse<SipoMaestrosResponse>> {
		const params: Record<string, string> = {};
		if (rut) params.rut = rut;
		if (externalCodePais) params.external_code_pais = externalCodePais;
		const response = await axios.get(`${SipoService.url}/sipo/maestros/`, {
			params: Object.keys(params).length ? params : undefined,
		});
		return response.data;
	}

	static async getReintegrarList(search?: string): Promise<ApiResponse<SipoReintegrarItem[]>> {
		const response = await axios.get(`${SipoService.url}/sipo/candidatos/reintegrar-list/`, {
			params: search ? { search } : undefined,
		});
		return response.data;
	}

	static async getReintegrarDetalle(rut: string): Promise<ApiResponse<SipoCandidato>> {
		const response = await axios.get(
			`${SipoService.url}/sipo/candidatos/reintegrar-detalle/${encodeURIComponent(rut)}/`
		);
		return response.data;
	}

	static async getPersonalPlanta(centroCosto: string): Promise<
		ApiResponse<{ user_id: string; nombre: string; correo: string; label: string }[]>
	> {
		const response = await axios.get(`${SipoService.url}/sipo/maestros/personal-planta/`, {
			params: { centro_costo: centroCosto },
		});
		return response.data;
	}

	static async generarAccesoCandidato(sipId: number, candidatoId: string) {
		const response = await axios.post(
			`${SipoService.url}/sipo/${sipId}/candidatos/${candidatoId}/acceso/`
		);
		return response.data;
	}

	static async getPortalCandidato(token: string) {
		const response = await axios.get(`${SipoService.url}/sipo/public/ficha/${token}/`);
		return response.data;
	}

	static async guardarPortalCandidato(token: string, formData: FormData) {
		const response = await axios.post(
			`${SipoService.url}/sipo/public/ficha/${token}/`,
			formData
		);
		return response.data;
	}

	static async validarCorreo(email: string): Promise<ApiResponse<{ valido: boolean }>> {
		const response = await axios.get(`${SipoService.url}/sipo/candidatos/validar-correo/`, {
			params: { email },
		});
		return response.data;
	}

	static async validarRut(
		rut: string,
		sipId?: number
	): Promise<ApiResponse<{ valido: boolean; activo_ibuilder_sap: boolean; mensaje: string }>> {
		const response = await axios.get(`${SipoService.url}/sipo/candidatos/validar-rut/`, {
			params: { rut, sip_id: sipId },
		});
		return response.data;
	}

	static async getCandidatoMaestros(): Promise<ApiResponse<Record<string, any>>> {
		const response = await axios.get(`${SipoService.url}/sipo/candidatos/maestros/`);
		return response.data;
	}

	static async uploadCandidatoDoc(formData: FormData): Promise<
		ApiResponse<{ url: string; field: string; doc_type: string; filename: string; size?: number }>
	> {
		const response = await axios.post(`${SipoService.url}/sipo/candidatos/upload-doc/`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return response.data;
	}
}
