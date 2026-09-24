<template>
    <div v-if="control?.visible == null ? true : control.visible"
        :class="`${spaceBottom ? 'mb-1' : ''} ${customClass}`">
        <div class="flex flex-column">

            <div class="flex align-items-center gap-1">
                <slot name="label">
                    <span v-if="label" class="font-bold">{{ label }}</span>
                </slot>
                <span v-show="showRequiredMark && control && control.rules.some((r: any) => r == global.sstRule.REQUIRED)"
                    class="text-red-600 font-bold">*</span>
                <i v-show="tooltip" :class="`pi ${tooltipIcon} font-bold`" v-tooltip.top="tooltip"></i>
            </div>

            <div class="mt-1">
            </div>

            <slot></slot>

            <span v-if="control?.existError && showErrorMessage" class="text-red-600 font-bold">{{
                control?.error.message
            }}</span>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useGlobalStore } from '../store/global';


const global = useGlobalStore();

const props = withDefaults(defineProps<{
    spaceBottom?: Boolean;
    showErrorMessage?: Boolean;
    showRequiredMark?: Boolean;
    customClass?: String;
    control?: any;
    label?: String;
    tooltip?: String;
    tooltipIcon?: String;
}>(), {
    spaceBottom: () => true,
    required: () => true,
    showErrorMessage: () => true,
    showRequiredMark: () => true,
    customClass: () => '',
    tooltipIcon: () => 'pi-question-circle',
});


</script>