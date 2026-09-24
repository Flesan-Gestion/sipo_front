import { RouteRecordRaw } from 'vue-router';
import { authRoutes } from '../modules/auth/routes';
import { errorRoutes } from '../modules/error/routes';
import { homeRoutes } from '../modules/home/routes';
import { userRoutes } from '../modules/users/routes';
import { sipoRoutes } from '../modules/sipo/routes';


export const routes:RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/panel/sipo'
    },
    {
        path: '/panel',
        redirect: '/panel/sipo',
        component: () => import('../layouts/panel/PanelLayout.vue'),
        children: [
            ...homeRoutes,
            ...sipoRoutes,
            ...userRoutes
        ],
    },
    {
        path: '/auth',
        component: () => import('../layouts/auth/AuthLayout.vue'),
        children: [
            ...authRoutes
        ],
    },
    {
        path: '/error',
        component: () => import('../layouts/auth/AuthLayout.vue'),
        children: [
            ...errorRoutes
        ]
    },
    {
        path: '/:catchAll(.*)',
        redirect: '/error/404'
    }
]