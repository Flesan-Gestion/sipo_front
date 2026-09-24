export interface ToastMessageInterface {
	type: ToastTypeMessageEnum
	severity: ToastSeverityMessageEnum
	summary: string
	detail: string
}

export interface ToastBodyInterface {
	severity: ToastSeverityMessageEnum,
	summary: string,
	detail: string,
	life: number,
	group: string
}

export enum ToastSeverityMessageEnum {
	INFO = 'info',
	SUCCESS = 'success',
	WARN = 'warn',
	ERROR = 'error'
}

export enum ToastGroupEnum {
	TOP_RIGHT = 'tr',
	TOP_LEFT = 'tl',
}

export enum ToastTypeMessageEnum {
	REGISTER_SUCCESS = 'REGISTER_SUCCESS',
	LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',
	FORM_ERROR = 'FORM_ERROR',
	SERVER_ERROR = 'SERVER_ERROR',
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
	USER_DISABLED = 'USER_DISABLED',
	USER_ENABLED = 'USER_ENABLED',
	CORRUPTED_SESSION = 'CORRUPTED_SESSION',
	USER_ALREADY_LOGGED = 'USER_ALREADY_LOGGED',
	USER_NOT_LOGGED = 'USER_NOT_LOGGED',
	PERMISSION_DENIED = 'PERMISSION_DENIED',
	SESSION_EXPIRED = 'SESSION_EXPIRED',
	EXPIRED_SESSION = 'EXPIRED_SESSION',
	USER_DOESNT_HAVE_ACCESS = 'USER_DOESNT_HAVE_ACCESS',
}

