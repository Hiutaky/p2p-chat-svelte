<script>
    //@ts-nocheck
    import Header from "../components/Header.svelte";
    import BottomBar from "../components/BottomBar.svelte";
    import StorageManager from "../components/StorageManager.svelte";
    import Authentication from "../components/Authentication.svelte";
    import { onMount } from "svelte";

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
        init = true
    })
</script>
{#if init}
<StorageManager />
{/if}
<main >
    <div class="grid">
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
</style>
