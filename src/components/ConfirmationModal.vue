<template>
	<Dialog v-model:visible="confirmation.visible" :pt="global.modalConfig.blur" modal :closable="false"
		:draggable="false">
		<div class="dialog-width">
			<div class="flex-center flex-column ">
				<div class="bg-primary p-4 border-circle">
					<i class="pi pi-question text-2xl"></i>
				</div>
				<div class="mt-2 flex flex-column align-items-center text-center">
					<span class="font-bold  text-xl mb-2">{{ confirmation.header }}</span>
					<span>{{ confirmation.message }}</span>
				</div>

			</div>
		</div>
		<template #footer>
			<div class="w-full p-2 flex justify-content-between">
				<Button :label="confirmation.labelAccept" outlined @click="accept" />
				<Button :label="confirmation.labelReject" @click="reject" />
			</div>
		</template>

	</Dialog>
</template>
<script lang="ts" setup>
import { useConfirmationStore } from '../store/confirmation';
import { useGlobalStore } from '../store/global';

const global = useGlobalStore();
const confirmation = useConfirmationStore();

const accept = async () => {
	await confirmation.accept();
	confirmation.hidden();
}

const reject = async () => {
	await confirmation.reject();
	confirmation.hidden();
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