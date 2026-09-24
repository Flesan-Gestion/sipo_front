<template>
    <div class="flex flex-column justify-content-center text-center">
        <span class="font-bold text-4xl">Oops!</span>
        <span class="text-md">La página a la que intentas acceder <b>no existe</b></span>
        <span class="text-md">Para regresar al panel haz clic
            <router-link class="" :to="{ name: 'Home' }">aquí</router-link>
        </span>
    </div>
</template>

<style scoped>
a {
    color: black;
    font-weight: bold;
    text-decoration: none;
    color: var(--primary-color);
    transition: var(--sidebar-transition);
}

a:hover {
    color: var(--sidebar-scrollbar-color);
}
</style>