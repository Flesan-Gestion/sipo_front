import { SidebarItemInterface, SidebarTypeItemEnum } from "../interfaces/sidebar-item.interface";




export const SidebarItems: SidebarItemInterface[] = [
    {
        name: 'Opciones',
        type: SidebarTypeItemEnum.TITLE
    },
    {
        name: 'Solicitudes de Obra',
        pathName: 'SipoList',
        icon: 'pi-users',
        type: SidebarTypeItemEnum.ITEM,
        ocultoSupervisor: true,
        ocultoJefeTerreno: true,
    },
    {
        name: 'Ficha Ingreso Personal',
        icon: 'pi-id-card',
        type: SidebarTypeItemEnum.DROPDOWN_ITEMS,
        ocultoUsuarioObra: true,
        children: [
            {
                name: 'Crear Nueva Ficha',
                pathName: 'SipoFichaIngresoCreate',
                ocultoJefeTerreno: true,
                ocultoUsuarioObra: true,
            },
            {
                name: 'Historial de Fichas',
                pathName: 'SipoFichaIngresoHistorial',
                ocultoUsuarioObra: true,
            },
        ],
    },
    {
        name: 'Configuración',
        icon: 'pi-cog',
        type: SidebarTypeItemEnum.DROPDOWN_ITEMS,
        ocultoSupervisor: true,
        ocultoJefeTerreno: true,
        ocultoUsuarioObra: true,
        children: [
            {
                name: 'Usuarios',
                pathName: 'SipoUsuarios',
                sipoRolAdminOnly: true,
            },
            {
                name: 'Cargos y Horarios',
                pathName: 'SipoConfigCargos',
                sipoRolAdminOnly: true,
            }
        ]
    },
]