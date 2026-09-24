<template>
    <li v-if="item.type == SidebarTypeItemEnum.TITLE" class="small">{{ item.name }}</li>
    <li v-if="item.type == SidebarTypeItemEnum.ITEM">
        <router-link :to="{ name: item.pathName }">
            <i :class="`pi ${item.icon} font-bold`"></i>
            <span>{{ item.name }}</span>
        </router-link>
    </li>
    <li v-if="item.type == SidebarTypeItemEnum.DROPDOWN_ITEMS" class="has-child hidden-items">
        <a :class="isParent(item.children) ? 'parent-selected' : ''">
            <i :class="`pi ${item.icon} font-bold`"></i>
            <span>{{ item.name }}</span>
            <i class="pi pi-chevron-left font-bold"></i>
        </a>
        <ul>
            <li v-for="(i, index) in item.children" :key="index" class="flex">
                <router-link :to="{ name: i.pathName }" class="pl-6">
                    <i class="pi pi-circle-fill " style="font-size: .5rem !important; "></i>
                    {{ i.name }}
                </router-link>
            </li>
        </ul>
    </li>
</template>

<script lang="ts" setup>
import { SidebarItemChildrenInterface, SidebarItemInterface, SidebarTypeItemEnum } from "../../../shared/interfaces/sidebar-item.interface";
import { useSidebarStore } from '../../../store/sidebar';

defineProps<{
    item: SidebarItemInterface
}>();

const sidebar = useSidebarStore();

const isParent = (children: SidebarItemChildrenInterface[] | undefined) => {
    if (!children) return;
    return children.find(i => i.pathName == sidebar.currentRoute);
}
</script>