<script>
    import AloneGif from "$lib/images/alone.gif"
    import { fly } from "svelte/transition";
    import { main } from "../store/main";
    import AvatarBeam from "./AvatarBeam.svelte";
    import ConnectionPrompt from "./ConnectionPrompt.svelte";
    $: onlineUsers = $main.peers.length+1
</script>

<div class="vertical-grid bg-black bg-opacity-25 h-100 overflow-auto" in:fly>
    <div class="d-flex flex-column row-gap-3 p-3 overflow-auto">
        <h3 class="fw-medium m-0">Explore</h3>
        <span>{onlineUsers} user{onlineUsers > 1 ? `s` : ``} online</span>
        {#if $main.peers && $main.peers.length }
            {#each $main.peers as peer,i (i) }
                <a href="/chat/{peer}" class="d-flex border border-dark flex-row align-items-center  justify-content-between gap-3 text-white p-3 py-2 bg-dark rounded">
                    <span class="d-flex flex-row align-items-center gap-3">
                        <AvatarBeam name={peer} />
                        <span>
                            {peer}
                        </span>
                    </span>
                    <div class="bg-success pulse justify-self-end online-pointer">
                        
                    </div>
                </a>
            {/each}
        {:else}
        <div class="d-flex flex-column gap-2 p-3 bg-dark rounded">
            Nobody is online.
            <img src={AloneGif} />
        </div>
        {/if}
    </div>
    <ConnectionPrompt />
</div>
<style>
    .grid {
        display: grid;
        grid-template-rows: 1fr max-content;
        height: inherit;
    }
</style>