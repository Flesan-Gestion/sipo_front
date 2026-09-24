<template>
    <div class="header">
        <div class="header-leading">
            <div class="header-toggle-nav" @click="toggleFloatNav">
                <i :class="`pi pi-align-justify font-bold text-primary`"></i>
            </div>
            <div class="header-title">
                <i :class="`pi ${icon} pr-2 font-bold text-primary`"></i>
                <span class="line-height-1 text-gray-800 font-bold">
                    {{ description }}
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useSidebarStore } from '../../../store/sidebar';
import { useRoute } from 'vue-router';
import { isTabletOrMobileViewport } from '../../../shared/constants/layout';

const icon = ref<string | undefined>('');
const description = ref<string | undefined>('');

const sidebar = useSidebarStore();
const route = useRoute();

onMounted(() => {
    getData();
})

watch(() => route.fullPath, () => {
    getData();
})

const getData = () => {
    const matched = route.matched
        .filter((record) => record.meta?.description)
        .at(-1);
    icon.value = (matched?.meta?.icon as string) ?? 'pi-users';
    description.value = (matched?.meta?.description as string) ?? 'Solicitudes de Obra';
}

const toggleFloatNav = () => {
	if (!isTabletOrMobileViewport()) return;
	sidebar.setSiteClass(sidebar.siteClass === 'floatnav' ? '' : 'floatnav');
};
</script>

<style scoped>
@import './HeaderStyles.css';
</style>
