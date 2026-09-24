<template>
    <div class="w-12rem max-w-12rem text-white flex flex-column overflow-hidden">
        <div class="w-full py-2 px-3 flex justify-content-between align-items-center hover-item"
            v-for="(item, index) in settings" @click="item.action">
            <i :class="item.icon"></i>
            <span>{{ item.description }}</span>
        </div>


    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useGlobalStore } from '../../../store/global';
import { useSecurityStore } from '../../../store/security';
import { SettingInterface } from '../interfaces/SettingInterface';

const global = useGlobalStore();
const security = useSecurityStore();

const settings = ref<SettingInterface[]>([
    {
        icon: 'pi pi-sign-out',
        description: 'Cerrar sesión',
        action: () => { logout() }
    }
]);

const logout = () => {
    security.clear();
    global.utl.genToast(global.tstType.LOGOUT_SUCCESS);
    global.utl.navigate('Auth');
}
</script>

<style scoped>
.hover-item {
    transition: var(--sidebar-transition);
    -webkit-transition: var(--sidebar-transition);
    height: 2.5rem;
}

.hover-item:hover {
    cursor: pointer;
    background-color: var(--sidebar-secondary-color);

}
</style>