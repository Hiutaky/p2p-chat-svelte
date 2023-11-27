<script>
    import ChatIcon from "$lib/images/chats.svg"
    import SettingsIcon from "$lib/images/settings.svg"
    import ShareIcon from "$lib/images/share.svg"
    import { instance } from "../store/instance";

</script>

<div class="position bottom-0 start-0 w-100 p-2 bg-black bg-opacity-50 d-flex flex-row justify-content-evenly">
    <div 
        class="d-flex flex-column align-items-center row-gap-1  justify-content-center p-1"
        on:click={ () => $instance.view = 'chats' }
    >
        <img src={ChatIcon} class="icon">
        <span class="fs-13">Chats</span>
    </div>
    <div 
        class="d-flex  flex-column row-gap-1 align-items-center justify-content-center"
        on:click={() => $instance.view = 'chats' }
    >
        <img src={SettingsIcon} class="icon">
        <span class="fs-13">Settings</span>
    </div>
    <div 
        class="d-flex  flex-column row-gap-1 align-items-center justify-content-center"
        on:click={() => $instance.view = 'chats' }
    >
        <img src={ShareIcon} class="icon">
        <span class="fs-13">Share</span>
    </div>
</div>