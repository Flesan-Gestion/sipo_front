export const LAYOUT_TABLET_BREAKPOINT = 1024;

export const isTabletOrMobileViewport = (): boolean => {
	if (typeof window === 'undefined') return false;
	return window.innerWidth < LAYOUT_TABLET_BREAKPOINT;
};
