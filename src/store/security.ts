import { defineStore } from "pinia";
import { UserInterface } from "../modules/users/interfaces/user.interface";
import { RolInterface } from "../shared/interfaces/security.interface";

export interface SecurityState {
    user: UserInterface | null,
    roles: RolInterface[] | null,
    token: string | null,
    tokenExpiryTime: number | null
}

interface TokenUserPayload {
    id_aplicacion_usuario?: number;
    nombres?: string;
    apellidos?: string;
    username?: string;
    estado_sesion?: number;
    sip_rol_id?: number | null;
    sip_rol_name?: string;
    display_name?: string;
    avatar_url?: string;
    roles?: Array<{ rol?: { nombre?: string } }>;
}

const CORP_DOMAINS = ['@flesan.cl', '@inexchile.com', '@dvc.cl', '@atleticocolina.cl'];

function isCorporateEmail(email?: string | null): boolean {
    const normalized = (email || '').trim().toLowerCase();
    return CORP_DOMAINS.some((domain) => normalized.endsWith(domain));
}

function buildDisplayName(name: string, lastName: string): string {
    const firstName = name.trim().split(/\s+/)[0] ?? '';
    const firstLast = lastName.trim().split(/\s+/)[0] ?? '';
    if (firstName && firstLast) return `${firstName} ${firstLast}`;
    const parts = `${name} ${lastName}`.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
    return parts[0] ?? '';
}

function mapTokenUser(tokenUser: TokenUserPayload, fallbackRolId?: number | null): UserInterface {
    const name = tokenUser.nombres ?? '';
    const lastName = tokenUser.apellidos ?? '';
    const sipRolId =
        tokenUser.sip_rol_id !== null && tokenUser.sip_rol_id !== undefined
            ? Number(tokenUser.sip_rol_id)
            : fallbackRolId ?? (isCorporateEmail(tokenUser.username) ? 0 : 0);

    return {
        id: tokenUser.id_aplicacion_usuario ?? 0,
        name,
        last_name: lastName,
        email: tokenUser.username ?? '',
        profile: tokenUser.sip_rol_name || tokenUser.roles?.[0]?.rol?.nombre || '',
        enable: tokenUser.estado_sesion ?? 1,
        sip_rol_id: sipRolId,
        sip_rol_name: tokenUser.sip_rol_name || tokenUser.roles?.[0]?.rol?.nombre || '',
        display_name: tokenUser.display_name?.trim() || buildDisplayName(name, lastName) || tokenUser.username || '',
        avatar_url: tokenUser.avatar_url?.trim() ?? '',
    };
}

export const useSecurityStore = defineStore('security', {
    state: () => (
        {
            user: null,
            roles: null,
            supplier: null,
            token: null,
            tokenExpiryTime: null,
        } as SecurityState
    ),
    actions: {
        clear() {
            this.$reset()
            localStorage.removeItem('token');
        },
        getPayload() {
            const tokenPayload = this.token!.split(".")[1];
            const decodedPayload = atob(tokenPayload);
            const decodedUnicodePayload = decodeURIComponent(escape(decodedPayload));
            return JSON.parse(decodedUnicodePayload);
        },
        validateToken() {
            try {
                if (!this.token) return false;
                this.getPayload();
                return true;
            } catch {
                return false;
            }
        },
        setUser(token: string | null): UserInterface | null {
            if (!token) {
                this.clear();
                return null;
            }

            this.token = token;

            if (!this.validateToken()) {
                this.clear();
                return null;
            }

            try {
                const payload = this.getPayload();
                localStorage.setItem('token', token);

                const tokenUser = payload.user as TokenUserPayload | undefined;
                const resolvedRolId =
                    tokenUser?.sip_rol_id ??
                    payload.sip_rol_id ??
                    (isCorporateEmail(tokenUser?.username || payload.email) ? 0 : null);

                if (tokenUser?.username) {
                    this.user = mapTokenUser(tokenUser, resolvedRolId);
                    return this.user;
                }

                this.clear();
                return null;
            } catch {
                this.clear();
                return null;
            }
        },
        constantValidateToken() {
            setInterval(() => {
                if (!this.validateToken()) return;
                const payload = this.getPayload();
                const expirationTimestamp = payload.exp;
                const currentTime = Math.floor(Date.now() / 1000);
                this.tokenExpiryTime = expirationTimestamp - currentTime;
            }, 1000)
        }
    }
})
