import AppLayout from '@/layout/AppLayout.vue';
import userAccess from '@/service/settings/userAccess.js';
import Cookies from 'js-cookie';
import { createRouter, createWebHistory } from 'vue-router';

function isAuthenticated() {
    return !!Cookies.get('token_valid');
}

const routes = [
    {
        path: '/valid',
        redirect: '/self-checkout'
    },
    {
        path: '/self-checkout',
        name: 'self-checkout',
        component: () => import('@/views/pages/selfCheckout/SelfCheckout.vue')
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/pages/auth/Login.vue')
    },
    {
        path: '/',
        component: AppLayout,
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/views/pages/Dashboard.vue')
            },
            {
                path: 'client-verification',
                name: 'client-verification',
                component: () => import('@/views/pages/clientVerification/ClientVerification.vue')
            },
            {
                path: 'masterlist',
                name: 'masterlist',
                component: () => import('@/views/pages/masterlist/generateReports.vue')
            },
            {
                path: 'settings/user-access',
                name: 'user-access',
                component: () => import('@/views/pages/settings/UserAccess/UserAccess.vue')
            },
            {
                path: 'settings/queue-manager',
                name: 'queue-manager',
                component: () => import('@/views/pages/settings/QueueManager/QueueManager.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const auth = isAuthenticated();

    // Public routes
    const publicRoutes = ['login', 'self-checkout'];

    if (!auth && !publicRoutes.includes(to.name)) {
        return next({ name: 'login' });
    }

    if (auth && to.name === 'login') {
        return next({ name: 'dashboard' });
    }

    // Check access only if logged in and route is not public
    if (auth && !publicRoutes.includes(to.name)) {
        const hasAccess = await checkAccess(to.path);
        if (!hasAccess) {
            return next({ name: 'accessDenied' });
        }
    }

    next();
});

const checkAccess = async (path) => {
    try {
        const params = {
            path,
            user: Cookies.get('empNo')
        };
        const response = await userAccess.checkUserAccessPath(params);
        return response.data.length > 0;
    } catch (error) {
        console.error('Access check failed:', error);
        return false;
    }
};

export default router;
