<script>
    import Bell from "$lib/images/bell.svg"
    import NotifierMessage from "./NotifierMessage.svelte";
    import NotifierCall from "./NotifierCall.svelte";
    import { notifier } from "../store/notifier";
</script>

<div class="position-relative">
    <button 
        on:click={ () => $notifier.open = ! $notifier.open}
        class="btn notification-icon-wrapper border-2 bg-dark rounded-5 p-2 d-flex {$notifier.open ? 'active border-dark-subtle' : 'border-dark'}"
    >
        <div class="{$notifier.notifications.length ? '' : 'd-none'} position-absolute circle rounded-5 bg-danger"></div>
        <img src={Bell} class="icon" style="width: 1.2em !important" alt="Notifications"/>
    </button>
    <div class="notifications-wrapper {$notifier.open ? 'active' : '' } mt-2 end-0 position-absolute d-flex flex-column gap-2 p-2 bg-black border border-dark rounded ">
        <span class="fw-bold lh-1 fs-14 ms-1">Notifications</span>
        {#if $notifier.notifications.length}
            {#each $notifier.notifications.sort( (a,b) => true ) as notification, i (i) }
                <div 
                    class="notification p-2 bg-dark rounded d-flex flex-column gap-2"
                >
                {#if notification.type === 'message'}
                    <NotifierMessage notification={notification} index={i} />
                {:else}
                    <NotifierCall notification={notification} index={i}/>
                {/if}
                </div>
            {/each}
        {:else}
        <div 
            class="notification p-2 bg-dark rounded d-flex flex-column gap-2"
        >
            Nothing new here...
        </div>
        {/if}
    </div>
</div>

<style>
    .circle {
        width: 8px;
        height: 8px;
    }
    .notifications-wrapper {
        z-index: 1;
        width: max-content;
        transition: all 0.4s;
        transform: translateX(130%);
    }

    .notifications-wrapper:is(.active) {
        transform: translateX(0%) !important;
    }
    .notification-icon-wrapper {
        transition: all 0.2s;
        cursor: pointer;
    }
    .notification-icon-wrapper.active {
        border-color: white;
    }
    .notification-icon-wrapper:hover {
        transform: scale(1.1);
    }
</style>