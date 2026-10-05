<template>
	<div class="sidebar">
		<div class="brand gap-3">
			<div class="logo flex-1">
				<img :src="logoSipo" alt="SIPO" class="sidebar-logo" />
			</div>
			<div class="trigger">
				<a href="#" @click="toggleSidebar">
					<i name="menu-outline" class="pi pi-align-justify font-bold"></i>
					<i name="chevron-back-outline" class="pi pi-chevron-left font-bold"></i>
				</a>
			</div>
		</div>
		<nav class="navbar">
			<ul>
				<SidebarItem v-for="(item, index) in items" :key="index" :item="item"></SidebarItem>
			</ul>
		</nav>

		<div class="sign-out p-2 ">
			<div class="flex-1 flex align-items-center no-wrap-container">
				<div class="sign-out-avatar flex-none">
					<img
						v-if="userAvatarUrl && !avatarLoadFailed"
						:src="userAvatarUrl"
						:alt="displayName"
						class="sign-out-info-image w-3rem h-3rem flex-none border-round"
						@error="avatarLoadFailed = true"
					/>
					<div
						v-else
						class="sign-out-info-image sign-out-avatar-fallback w-3rem h-3rem flex-none border-round flex align-items-center justify-content-center text-white font-bold text-lg uppercase select-none"
						aria-hidden="true"
					>
						{{ userInitial }}
					</div>
				</div>
				<div class="sign-out-info-name flex-auto flex flex-column justify-content-center no-wrap-container">
					<span class="pl-2 no-wrap-container">{{ displayName }}</span>
					<span class="pl-2 text-md font-bold no-wrap-container">{{ security.user?.sip_rol_name || security.user?.profile || '' }}</span>
				</div>
			</div>
			<div class="sign-out-settings w-1rem flex">
				<i class="pi pi-cog" @click="openSettings($event)"></i>
				<OverlayPanel class="sign-out-overlay" ref="settings">
					<Settings />
				</OverlayPanel>
			</div>

		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { SidebarItems } from "../../../shared/constants/sidebar-items";
import { isTabletOrMobileViewport, LAYOUT_TABLET_BREAKPOINT } from "../../../shared/constants/layout";
import { useSidebarStore } from "../../../store/sidebar";
import Settings from "../settings/Settings.vue"
import SidebarItem from "./SidebarItem.vue";
import { SidebarItemInterface, SidebarTypeItemEnum } from "../../../shared/interfaces/sidebar-item.interface";
import { useGlobalStore } from "../../../store/global";
import logoSipo from "../../../assets/img/logo_sipo.png";
import { useSecurityStore } from "../../../store/security";
import { RolesEnum } from "../../../shared/enums/roles.enum";

const sidebar = useSidebarStore();
const global = useGlobalStore();
const security = useSecurityStore();
const avatarLoadFailed = ref(false);

const isAdmin = computed(() => Number(security.user?.sip_rol_id) === RolesEnum.ADMIN);
const isSupervisor = computed(() => Number(security.user?.sip_rol_id) === RolesEnum.SUPERVISOR);

const filterSidebarItems = (source: SidebarItemInterface[]): SidebarItemInterface[] =>
	source
		.filter((item) => (!item.sipoRolAdminOnly || isAdmin.value) && !(item.ocultoSupervisor && isSupervisor.value))
		.map((item) => {
			if (!item.children?.length) return item;
			return {
				...item,
				children: item.children.filter((child) => !child.sipoRolAdminOnly || isAdmin.value),
			};
		})
		.filter((item) => item.type !== SidebarTypeItemEnum.DROPDOWN_ITEMS || (item.children && item.children.length > 0));

const displayName = computed(() => {
	const user = security.user;
	if (user?.display_name?.trim()) return user.display_name.trim();
	if (user?.name?.trim()) return user.name.trim();
	if (user?.email?.trim()) return user.email.trim();
	return 'Usuario';
});

const userAvatarUrl = computed(() => {
	const user = security.user;
	return (
		user?.avatar_url?.trim()
		|| user?.avatar?.trim()
		|| user?.picture?.trim()
		|| ''
	);
});

const userInitial = computed(() => {
	const name = displayName.value.trim();
	return name ? name.charAt(0).toUpperCase() : 'U';
});

const items = ref<SidebarItemInterface[]>(filterSidebarItems(SidebarItems));
const settings = ref();

onMounted(() => {
	initializeSidebar();
	syncLayoutForViewport();
	window.addEventListener('resize', syncLayoutForViewport);
});

onUnmounted(() => {
	window.removeEventListener('resize', syncLayoutForViewport);
});

watch(() => security.user, async () => {
	avatarLoadFailed.value = false;
	items.value = filterSidebarItems(SidebarItems);
	await global.utl.sleep(500);
	initializeSidebar();
}, {
	deep: true
})

watch(
	() => security.user?.avatar_url,
	() => {
		avatarLoadFailed.value = false;
	},
);
const initializeSidebar = () => {
	const submenu = document.querySelectorAll(".has-child > a");

	submenu.forEach((menu) => {
		menu.addEventListener('click', function () {
			if (!this.parentNode.classList.contains("collapse")) {
				this.parentNode.classList.remove("hidden-items");
				setTimeout(() => {
					this.parentNode.classList.add("collapse");
				}, 10);
			} else {
				this.parentNode.classList.remove("collapse");
				setTimeout(() => {
					this.parentNode.classList.add("hidden-items");
				}, 400);
			}
		});
		createResizeEvent();
		window.onresize = () => {
			createResizeEvent();
		};
	})
}

const syncLayoutForViewport = () => {
	const width =
		window.innerWidth ||
		document.documentElement.clientWidth ||
		document.body.clientWidth;

	if (width < LAYOUT_TABLET_BREAKPOINT && sidebar.siteClass === 'mininav') {
		sidebar.setSiteClass('');
		return;
	}

	if (width >= LAYOUT_TABLET_BREAKPOINT && sidebar.siteClass === 'floatnav') {
		sidebar.setSiteClass('');
	}
};

const toggleSidebar = () => {
	if (isTabletOrMobileViewport()) {
		sidebar.setSiteClass(sidebar.siteClass === 'floatnav' ? '' : 'floatnav');
		return;
	}
	sidebar.setSiteClass(sidebar.siteClass === 'mininav' ? '' : 'mininav');
};

const createResizeEvent = () => {
	syncLayoutForViewport();
};

const openSettings = (event: any) => {
	settings.value.toggle(event)
}

</script>

<style scoped>
.brand {
	height: 118px;
	padding-top: 16px;
	padding-bottom: 12px;
}

.sidebar-logo {
	display: block;
	height: 4.15rem;
	width: auto;
	max-width: 100%;
	object-fit: contain;
	border-radius: 6px;
}

.sign-out-avatar-fallback {
	background-color: #4caf50;
	object-fit: cover;
}

.sign-out-info-image {
	object-fit: cover;
}
</style>
