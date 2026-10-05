
export interface SidebarItemInterface {
    name: string
    type: SidebarTypeItemEnum
    pathName?: string
    icon?: string
    sipoRolAdminOnly?: boolean
    ocultoSupervisor?: boolean
    children?: SidebarItemChildrenInterface[]
}

export interface SidebarItemChildrenInterface {
    name: string
    pathName: string
    sipoRolAdminOnly?: boolean
}

export enum SidebarTypeItemEnum {
    TITLE = 'TITLE',
    ITEM = 'ITEM',
    DROPDOWN_ITEMS = 'DROPDOWN_ITEMS',
}