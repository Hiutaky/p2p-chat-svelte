<script>
    //@ts-nocheck
    import {user} from "../store/user"
    import ConnectionPrompt from "../components/ConnectionPrompt.svelte";
    import Messages from "../components/Messages.svelte";
    import ChatList from "../components/ChatList.svelte";
    import LoginDialog from "../components/LoginDialog.svelte";
    import Header from "../components/Header.svelte";
    import BottomBar from "../components/BottomBar.svelte";
    import { instance } from "../store/instance";
    import { onMount } from "svelte";

    let isDesktop;
    onMount( () => {
        const checkDevice = () => {
            if (window.innerWidth > 800) {
                isDesktop = true;
            } else {
                isDesktop = false;
            }
        };
        checkDevice();
    })
</script>
<div class="grid">
    <Header />
    <div class="position-relative d-flex flex-column row-gap-2 h-100 ">
        <div class="d-flex flex-column row-gap-2 bg-dark h-100 bg-opacity-50 ">
            <div class="d-flex flex-md-row flex-column h-100 gap-2">
                {#if isDesktop }
                    <div class="desk-grid">
                        <ChatList />
                        <Messages />
                    </div>
                {:else if $instance.view === 'chats' }
                    <ChatList />
                {:else if $instance.view === 'messages' }
                    <Messages />
                {/if}
            </div>
        </div>
        {#if ! $user.name}
            <LoginDialog />
        {/if }
    </div>
    <BottomBar/>
</div>

<style>
    .desk-grid {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 66%;
    }
    @media (min-width: 986px) {
        .desk-grid {
            grid-template-columns: 1fr 75%;
        }
    }
    .grid {
        display: grid;
        grid-template-rows: min-content 1fr min-content;
        max-height: 100vh;
        height: 100vh;
    }
</style>