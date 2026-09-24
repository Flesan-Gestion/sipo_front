<template>
    <div class="w-full flex flex-column align-items-center gap-2">
        <h1>Home Page</h1>
        <Button label="Show Loader" severity="info" @click="onClick" />
        <Checkbox v-model="checked" :binary="true" />
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useGlobalStore } from '../../store/global';

const global = useGlobalStore();

const checked = ref(false);

const onClick = async () => {
    global.utl.showLoader();
    await global.utl.sleep(3000);
    global.utl.hiddenLoader();
}
</script>