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
        name: 'valid-kiosk',
        component: () => import('@/views/pages/selfCheckout/SelfCheckout.vue'),
        meta: { public: true }
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/pages/auth/Login.vue'),
        meta: { public: true }
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
];``

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const auth = isAuthenticated();

    // Allow public pages without checks
    if (to.meta.public) {
        if (auth && to.name === 'login') {
            return next({ name: 'dashboard' });
        }
        return next();
    }

    // Redirect to login if not authenticated
    if (!auth) {
        return next({ name: 'login' });
    }

    // Check access if logged in
    try {
        const hasAccess = await checkAccess(to.path);
        if (!hasAccess) {
            Cookies.remove('token_valid');
            Cookies.remove('empNo');
            Cookies.remove('name');
            window.location.replace('/login');
        }
    } catch (error) {
        console.warn('Access check skipped due to error:', error);
        // Allow navigation even if the check fails (prevents lockouts)
    }

    next();
});

async function checkAccess(path) {
    const params = {
        path,
        user: Cookies.get('empNo')
    };
    const response = await userAccess.checkUserAccessPath(params);
    return Array.isArray(response.data) && response.data.length > 0;
}

export default router;
