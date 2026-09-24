<template>
    <Loader />
    <Toast position="top-left" group="tl" />
    <Toast position="top-right" group="tr" />
    <ConfirmationModal />
    <RefreshSessionModal/>
    <router-view></router-view>
</template>
<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import setLocaleES from './config/primevue.config';
import { useToastStore } from './store/toast';
import { useToast } from "primevue/usetoast";
import { useSidebarStore } from './store/sidebar';

const toastStore = useToastStore();
const toastPrimevue = useToast();
const sidebar = useSidebarStore();

onMounted(() => {
    setLocaleES();
    const siteClass = window.localStorage.getItem('siteClass');
    sidebar.setSiteClass(siteClass ? siteClass : '');
});

watch(() => toastStore.body, () => {
    if (!toastStore.body) return;
    toastPrimevue.add(toastStore.body);
})

</script>