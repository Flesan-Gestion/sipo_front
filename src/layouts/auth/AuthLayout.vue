<template>
	<div class="h-screen grid p-0 relative">

		<div class="col-12 lg:col-5 flex p-0 flex-column justify-content-between align-items-center relative"
			id="login-panel">
			<div class="flex justify-content-center relative w-full z-2 pt-6">
				<div class="w-18rem" id="login-slot-group-image">
					<img :src="global.utl.getFile(global.assets.LOGO_GRUPO_FLESAN)" class="w-full">
				</div>
			</div>
			<div class="surface-card p-5 shadow-2 border-round w-full sm:w-25rem z-3 " id="login-slot">
				<!-- <div class="w-full h-5rem flex justify-content-center mb-3" id="login-slot-portal-image">
					<img :src="global.utl.getFile(global.assets.LOGO_GRUPO_FLESAN)" class="w-full h-full"
						style="object-fit: contain;">
				</div> -->
				<!-- En este apartado va el logo de tu sistema -->

				<router-view></router-view>
			</div>
			<div class="w-full flex  bg-white z-2">
				<img :src="global.utl.getFile(global.assets.CINTA_LOGOS)" class="w-full">
			</div>

			<div class="absolute left-0 right-0 bottom-0 top-0 z-1" id="images-gray-squares"></div>

		</div>
		<div class="lg:col-7 p-0" id="image-panel">
			<div v-if="images.length == 0"
				class="w-full h-full bg-gray-50 flex justify-content-center align-items-center">
				<ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" animationDuration=".5s"
					aria-label="Custom ProgressSpinner" />
			</div>
			<Carousel v-if="images.length > 0" :value="images" :numVisible="1" :numScroll="1" class="h-full" circular>
				<template #item="slotProps">
					<div class="w-full h-full relative">
						<div class="w-full h-full bg-cover bg-center"
							:style="{ backgroundImage: `url(${slotProps.data.path})` }">

						</div>


						<div id="background-image-title"
							class="absolute right-0 flex flex-column pl-5 py-1 pr-4 color-title-background justify-content-center align-items-center ml-2">
							<div class="font-semibold text-2xl" id="image-title-panel">
								{{ slotProps.data.title }}
							</div>
						</div>
					</div>
				</template>
			</Carousel>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ImageService } from './services/ImageService';
import { ImageInterface } from './interfaces/ImageInterface';
import { onMounted, ref } from 'vue';
import { useGlobalStore } from '../../store/global';

const global = useGlobalStore();

const images = ref<ImageInterface[]>([]);

onMounted(async () => {
	images.value = await ImageService.getImages();
});

</script>

<style>
@import './AuthLayoutStyles.css';
</style>
