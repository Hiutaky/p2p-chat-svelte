<script>
    //@ts-nocheck
    import Chats from "../components/Chats.svelte";
    import { onMount } from "svelte";
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
{#if  init }
<Chats/>
<Chat />
{/if}
