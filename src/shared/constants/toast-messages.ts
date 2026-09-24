import { ToastMessageInterface, ToastSeverityMessageEnum, ToastTypeMessageEnum } from "../interfaces/toast-message.interface";


export const ToastsMessages: ToastMessageInterface[] = [
  {
    type: ToastTypeMessageEnum.REGISTER_SUCCESS,
    severity: ToastSeverityMessageEnum.SUCCESS,
    summary: 'Operación Exitosa',
    detail: 'El registro ha sido guardado'
  },
  {
    type: ToastTypeMessageEnum.LOGOUT_SUCCESS,
    severity: ToastSeverityMessageEnum.SUCCESS,
    summary: 'Operación Exitosa',
    detail: 'Se ha cerrado su sesión'
  },
  {
    type: ToastTypeMessageEnum.FORM_ERROR,
    severity: ToastSeverityMessageEnum.WARN,
    summary: 'Hubo un problema',
    detail: 'Los campos no están rellenados correctamente'
  },
  {
    type: ToastTypeMessageEnum.SERVER_ERROR,
    severity: ToastSeverityMessageEnum.ERROR,
    summary: 'Hubo un problema interno',
    detail: 'Contacta con la área de sistemas'
  },
  {
    type: ToastTypeMessageEnum.UNKNOWN_ERROR,
    severity: ToastSeverityMessageEnum.ERROR,
    summary: 'Hubo un problema interno',
    detail: 'Hubo un error desconocido'
  },
  {
    type: ToastTypeMessageEnum.USER_DISABLED,
    severity: ToastSeverityMessageEnum.SUCCESS,
    summary: 'Operación Exitosa',
    detail: 'El usuario ha sido deshabilitado'
  },
  {
    type: ToastTypeMessageEnum.USER_ENABLED,
    severity: ToastSeverityMessageEnum.SUCCESS,
    summary: 'Operación Exitosa',
    detail: 'El usuario se ha habilitado'
  },
  {
    type: ToastTypeMessageEnum.CORRUPTED_SESSION,
    severity: ToastSeverityMessageEnum.ERROR,
    summary: 'Sesión Errónea',
    detail: 'Hubo un problema al iniciar su sesión.'
  },
  {
    type: ToastTypeMessageEnum.USER_ALREADY_LOGGED,
    severity: ToastSeverityMessageEnum.INFO,
    summary: 'Hubo un Problema',
    detail: 'Ya ha iniciado sesión.'
  },
  {
    type: ToastTypeMessageEnum.USER_NOT_LOGGED,
    severity: ToastSeverityMessageEnum.WARN,
    summary: 'Hubo un problema',
    detail: 'Aun no ha iniciado sesión'
  },
  {
    type: ToastTypeMessageEnum.PERMISSION_DENIED,
    severity: ToastSeverityMessageEnum.WARN,
    summary: 'Hubo un problema',
    detail: 'No tiene acceso a este recurso'
  },
  {
    type: ToastTypeMessageEnum.SESSION_EXPIRED,
    severity: ToastSeverityMessageEnum.INFO,
    summary: 'Sesión Expirada',
    detail: 'Inicie sesión nuevamente.'
  },
  {
	type: ToastTypeMessageEnum.EXPIRED_SESSION,
	severity: ToastSeverityMessageEnum.INFO,
	summary: 'Sesión Expirada',
	detail: 'Inicie sesión nuevamente'
},
]

