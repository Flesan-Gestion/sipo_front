<template>
	<Dialog v-model:visible="visible" :pt="global.modalConfig.blur" modal :closable="false" :draggable="false">
		<div class="dialog-width">
			<div class="flex-center flex-column ">
				<div class="bg-primary p-4 border-circle">
					<i class="pi pi-lock text-2xl"></i>
				</div>
				<div class="mt-2 flex flex-column align-items-center text-center">
					<span class="font-bold  text-xl mb-2">Su sesión está por expirar</span>
					<span>En {{ remainingMinutes }} expirará su sesión.</span>
					<span>¿Desea extender el tiempo de su sesión?</span>
				</div>

			</div>
		</div>
		<template #footer>
			<div class="w-full p-2 flex justify-content-between">
				<Button label="Sí, estoy seguro" outlined @click="accept" />
				<Button label="No, no estoy seguro" @click="reject" />
			</div>
		</template>

	</Dialog>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useSecurityStore } from '../store/security';
import { useGlobalStore } from '../store/global';
import { AuthService } from '../modules/auth/services/AuthService';

const global = useGlobalStore();
const security = useSecurityStore();

onMounted(() => {
	security.constantValidateToken();
})

const visible = ref(false);
const remainingMinutes = ref("-");
const alreadyVisible = ref(false);

watch(() => security.tokenExpiryTime, (value) => {
	if (!value) return;
	remainingMinutes.value = formatRemainingMinutes(value)
	if (value < 300 && !alreadyVisible.value) {
		visible.value = true;
		alreadyVisible.value = true;
	}
	if (value < 0) {
		global.utl.genToast(global.tstType.EXPIRED_SESSION)
		visible.value = false;
		global.utl.navigate('Auth');
		security.clear();
	}
})

const formatRemainingMinutes = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes.toString().padStart(2, "0")}m ${remainingSeconds.toString().padStart(2, "0")}s`
}

const accept = async () => {
	global.utl.showLoader();
	const response = await AuthService.extendSession();
	security.setUser(response.data);
	visible.value = false;
	global.utl.hiddenLoader();
}

const reject = () => {
	visible.value = false
}
</script>

<style scoped>
.dialog-width {
	width: 23rem;
}

@media (max-width: 600px) {

	.dialog-width {
		width: 100%;
	}
}
</style>