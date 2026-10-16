
export interface SidebarItemInterface {
    name: string
    type: SidebarTypeItemEnum
    pathName?: string
    icon?: string
    sipoRolAdminOnly?: boolean
    ocultoSupervisor?: boolean
    ocultoJefeTerreno?: boolean
    ocultoUsuarioObra?: boolean
    children?: SidebarItemChildrenInterface[]
}

export interface SidebarItemChildrenInterface {
    name: string
    pathName: string
    sipoRolAdminOnly?: boolean
    ocultoJefeTerreno?: boolean
    ocultoUsuarioObra?: boolean
}

export enum SidebarTypeItemEnum {
    TITLE = 'TITLE',
    ITEM = 'ITEM',
    DROPDOWN_ITEMS = 'DROPDOWN_ITEMS',
}