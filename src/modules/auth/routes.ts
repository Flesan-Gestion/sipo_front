import { RouteRecordRaw } from 'vue-router';

export const authRoutes: RouteRecordRaw[] = [
    {
        name: 'Auth',
        path: '',
        component: () => import('./LoginPage.vue')
    }
]