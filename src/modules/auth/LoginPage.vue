<template>
	<Button label="Iniciar sesión con Google" icon="pi pi-google" severity="secondary" outlined
		@click="() => login()" class="w-full"></Button>
	<div v-ripple class="p-2 bg-primary mt-2 border-round  p-ripple text-center select-none ">
		<img :src="global.utl.getFile(global.assets.CHROME)" width="12">
		<span class="ml-2 text-sm">Sistema optimizado para navegador Google Chrome.</span>
	</div>
</template>

<script lang="ts" setup>
import { AuthCodeFlowSuccessResponse, useTokenClient } from 'vue3-google-signin';
import { useGlobalStore } from '../../store/global';
import { useSecurityStore } from '../../store/security';
import { AuthService } from './services/AuthService';
import { onMounted } from 'vue';

const global = useGlobalStore();
const security = useSecurityStore();

onMounted(() => {
	global.utl.hiddenLoader();
})

const handleOnSuccess = async (response: AuthCodeFlowSuccessResponse) => {
	global.utl.showLoader();
	const authResponse = await AuthService.googleLoginWithAccessToken(response.access_token);
	if (authResponse.status == global.statusCodes.BAD_REQUEST) {
		global.utl.hiddenLoader();
		global.utl.genToast(global.tstType.USER_DOESNT_HAVE_ACCESS);
		return
	}
	security.setUser(authResponse.data);
	global.utl.hiddenLoader();
	global.utl.navigate('SipoList');
};

const handleOnError = () => { };

const { isReady, login } = useTokenClient({
	onSuccess: handleOnSuccess,
	onError: handleOnError,
});
</script>