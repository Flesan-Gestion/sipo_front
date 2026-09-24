<template>
    <div
        :class="`fast-transition fixed bottom-0 left-0 right-0 top-0 super-position ${showLoader ? 'block' : 'hidden'}`">
        <div :class="`fast-transition relative w-full h-full ${showBlur ? 'bg-blur' : ''}`">
            <div class="opacity-80 absolute bottom-0 left-0 right-0 top-0 "></div>
            <div
                :class="`fast-transition flex flex-column absolute bottom-0 left-0 right-0 top-0 flex justify-content-center align-items-center ${showLogo ? 'opacity-100' : 'opacity-0'}`">
                <img :src="global.utl.getFile(global.assets.LOADER)" width="180">
                <img :src="global.utl.getFile(global.assets.LOGO_GRUPO_FLESAN)"
                    :class="`fast-transition mb-2 ${showNameCompany ? 'opacity-100' : 'opacity-0'}`" height="40">
                <span :class="`text-md font-bold fast-transition mb-7 ${showMessage ? 'opacity-100' : 'opacity-0'}`">{{
                    message }}</span>

            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useGlobalStore } from '../store/global';
import { useLoaderStore } from '../store/loader';

const showLoader = ref<boolean>(false);
const showLogo = ref<boolean>(false);
const showNameCompany = ref<boolean>(false);
const showBlur = ref<boolean>(false);
const showMessage = ref<boolean>(false);
const message = ref<string | null>(null);

const global = useGlobalStore();
const loader = useLoaderStore();

watch(() => loader.visible, async (newValue, oldValue) => {
    if (loader.visible) {
        showLoader.value = true;
        message.value = loader.message;
        await global.utl.sleep(200);
        showBlur.value = true;
        await global.utl.sleep(200);
        showLogo.value = true;
        showNameCompany.value = true;
        showMessage.value = message.value != null;
    } else {
        showMessage.value = false;
        showNameCompany.value = false;
        showLogo.value = false;
        await global.utl.sleep(200);
        showBlur.value = false;
        await global.utl.sleep(200);
        showLoader.value = false;
    }
});
</script>
<style scoped>
.super-position {
    z-index: 9000;
}

.fast-transition {
    transition: all .4s ease;
}

.bg-blur {
    transition: var(--sidebar-transition);
    backdrop-filter: blur(5px);
}
</style>