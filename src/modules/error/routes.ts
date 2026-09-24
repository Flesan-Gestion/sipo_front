import { RouteRecordRaw } from 'vue-router';

export const errorRoutes: RouteRecordRaw[] = [
    {
        name: '404',
        path: '404',
        component: () => import('./404.vue')
    }
]