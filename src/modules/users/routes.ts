import { RouteRecordRaw } from 'vue-router';

export const userRoutes: RouteRecordRaw[] = [
    {
        name: 'Users',
        path: 'users',
        meta: {
            description: 'Módulo de Usuarios',
            icon: 'pi-user',
        },
        component: () => import('./UsersPage.vue')
    }
]