export interface UserInterface {
    id: number,
    name: string,
    last_name: string,
    email: string,
    profile: string,
    enable: number,
    sip_rol_id?: number | null,
    sip_rol_name?: string,
    display_name?: string,
    avatar_url?: string,
}
