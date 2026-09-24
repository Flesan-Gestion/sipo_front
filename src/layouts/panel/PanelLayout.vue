<template>
    <div id="page" :class="`site ${sidebar.siteClass}`">
        <Sidebar></Sidebar>
        <div class="main">
            <div class="container">
                <Header></Header>
                <div class="panel">
                    <router-view></router-view>
                </div>
                <Footer></Footer>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './sidebar/Sidebar.vue';
import Footer from './footer/Footer.vue';
import Header from './header/Header.vue';
import { useSidebarStore } from '../../store/sidebar';
import { isTabletOrMobileViewport } from '../../shared/constants/layout';

const sidebar = useSidebarStore();
const route = useRoute();

const syncLayoutForViewport = () => {
	if (!isTabletOrMobileViewport() && sidebar.siteClass === 'floatnav') {
		sidebar.setSiteClass('');
	}
	if (isTabletOrMobileViewport() && sidebar.siteClass === 'mininav') {
		sidebar.setSiteClass('');
	}
};

watch(
	() => route.fullPath,
	() => {
		if (sidebar.siteClass === 'floatnav') {
			sidebar.setSiteClass('');
		}
	},
);

onMounted(() => {
	syncLayoutForViewport();
	window.addEventListener('resize', syncLayoutForViewport);
});

onUnmounted(() => {
	window.removeEventListener('resize', syncLayoutForViewport);
});
</script>

<style>
@import './sidebar/SidebarStyles.css';
@import './PanelStyles.css';
</style>