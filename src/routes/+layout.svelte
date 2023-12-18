<script>
    //@ts-nocheck
    import Header from "../components/Header.svelte";
    import BottomBar from "../components/BottomBar.svelte";
    import StorageManager from "../components/StorageManager.svelte";
    import Authentication from "../components/Authentication.svelte";
    import { onDestroy, onMount } from "svelte";
    import { notifier } from "../store/notifier";
    import { fade } from "svelte/transition";
    let mainEl = false
    let isDesktop;
    let init = false
    onMount( () => {
        const checkDevice = () => {
            if (window.innerWidth > 800) {
                isDesktop = true;
            } else {
                isDesktop = false;
            }
        };
        checkDevice();
        mainEl.addEventListener('click', (e) => {
            maybeCloseNotifier(e)
        })
        init = true
    })
    onDestroy( () => {
        if( mainEl )
            mainEl.removeEventListener('click')
    })

    $: maybeCloseNotifier = (e) => {
        if( 
            ! e.srcElement.offsetParent?.classList.contains('notifications-wrapper') &&
            ! e.srcElement.classList.contains('notification-icon-wrapper') &&
            ! e.srcElement.offsetParent?.classList.contains('notification-icon-wrapper') &&
            $notifier.open
        )
            $notifier.open = false
    }
</script>
{#if init}
<StorageManager />
{/if}
<main bind:this={mainEl}>
    <div class="grid overflow-x-hidden">
        <Header />
        <div class="position-relative overflow-auto d-flex flex-column row-gap-2 h-100 ">
            <div class="d-flex flex-column row-gap-2 bg-dark h-100 bg-opacity-50 ">
                <div class="d-flex flex-md-row flex-column h-100 gap-2">
                    <slot />
                </div>
            </div>
            <Authentication />
        </div>
        <BottomBar/>
    </div>
</main>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,500;0,600;0,700;1,600&display=swap');
    @media (min-width: 768px) {
        .desk-grid {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 66%;
        }
    }
    @media (min-width: 986px) {
        .desk-grid {
            grid-template-columns: 1fr 75%;
        }
    }
    .grid {
        display: grid;
        grid-template-rows: auto 1fr auto;
        max-height: 100vh;
        overflow: auto;
        height: 100vh;
    }
    * {
        font-family: 'Lato', sans-serif !important;
    }
</style>
