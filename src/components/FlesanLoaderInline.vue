<template>
	<div class="flesan-loader-inline flex flex-1 flex-column justify-content-center align-items-center w-full bg-white">
		<img :src="global.utl.getFile(global.assets.LOADER)" width="180" alt="Cargando" />
		<img
			:src="global.utl.getFile(global.assets.LOGO_GRUPO_FLESAN)"
			class="mt-3"
			height="40"
			alt="Grupo Flesan"
		/>
	</div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '../store/global';

const global = useGlobalStore();
</script>

<style scoped>
.flesan-loader-inline {
	min-height: 60vh;
}

@media screen and (min-width: 768px) {
	.flesan-loader-inline {
		min-height: 70vh;
	}
}
</style>
