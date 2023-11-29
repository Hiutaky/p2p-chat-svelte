<script>
    //@ts-nocheck
    import Messages from "../components/Messages.svelte";
    import Chats from "../components/Chats.svelte";
    import LoginDialog from "../components/LoginDialog.svelte";
    import Header from "../components/Header.svelte";
    import BottomBar from "../components/BottomBar.svelte";
    import { instance } from "../store/instance";
    import { onMount } from "svelte";
    import StorageManager from "../components/StorageManager.svelte";
    import Explore from "../components/Explore.svelte";
    import Roulette from "../components/Roulette.svelte";
    import Chat from "../components/Chat.svelte";

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
<div class="grid">
    <Header />
    <div class="position-relative overflow-auto d-flex flex-column row-gap-2 h-100 ">
        <div class="d-flex flex-column row-gap-2 bg-dark h-100 bg-opacity-50 ">
            <div class="d-flex flex-md-row flex-column h-100 gap-2">
                {#if $instance.view === 'chats' }
                    <Chats/>
                {:else if $instance.view === 'chat' }
                    <Chats className={ isDesktop ? `` : `d-none` }/>
                    <Chat />
                {:else if $instance.view === 'explore' }
                    <Explore />
                {:else if $instance.view === 'messages' }
                    <Messages />
                {:else if $instance.view === 'roulette' }
                    <Roulette />
                {/if}
            </div>
        </div>
        <LoginDialog />
    </div>
    <BottomBar/>
</div>

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