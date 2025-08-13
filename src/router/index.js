import AppLayout from '@/layout/AppLayout.vue';
import userAccess from '@/service/settings/userAccess.js';
import Cookies from 'js-cookie';
import { createRouter, createWebHistory } from 'vue-router';
function isAuthenticated() {
    if (!!Cookies.get('token')) {
        console.log('AUTH!!!');
    }
    return !!Cookies.get('token');
}

const router = createRouter({
    history: createWebHistory(),
    routes: [
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
            beforeEnter: (to, from, next) => {
                if (isAuthenticated()) {
                    if (to.name == 'login') {
                        next({ name: 'dashboard' });
                    } else {
                        next();
                    }
                } else {
                    next({ name: 'login' });
                }
            },
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
    ]
});
router.beforeEach((to, from, next) => {
    if (isAuthenticated() && to.name !== 'login' && to.name !== 'self-checkout' && to.name !== 'notfound' && to.name !== 'accessDenied' && to.name !== 'error' && to.path !== '/') {
        checkAccess(to.path);
    }

    if ((isAuthenticated() && to.name === 'login') || (isAuthenticated() && to.path === '/')) {
        next({ name: 'dashboard' });
    } else {
        next();
    }
});

const checkAccess = async (path) => {
    const params = {
        path: path,
        user: Cookies.get('empNo')
    };
    const response = await userAccess.checkUserAccessPath(params);

    if (response.data.length == 0) {
        router.push({ name: 'accessDenied' });
        console.log('Access Denied');
    }
};

export default router;
