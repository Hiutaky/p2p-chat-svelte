<script>
    import { instance } from "../store/instance";
    import { main } from "../store/main";
    import AvatarBeam from "./AvatarBeam.svelte";
    import ConnectionPrompt from "./ConnectionPrompt.svelte";

</script>

<div class="vertical-grid bg-black bg-opacity-25 h-100 overflow-auto">
    <div class="d-flex flex-column row-gap-3 p-3 overflow-auto">
        <h3 class="fw-medium m-0">Explore</h3>
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
        <div class="p-3 bg-dark rounded">
            Nobody is online.
        </div>
        {/if}
    </div>
    <ConnectionPrompt />
</div>
<style>
    .pulse {
        animation: pulse 1s infinite linear;
    }
    @keyframes pulse {
        33% {
            transform: scale(1);
        }
        66%{
            transform: scale(1.1);
        }
        100% {
            transform: scale(1.0);
        }
    }
    .online-pointer {
        width: 12px;
        height: 12px;
        border-radius: 100%;
    }
    .grid {
        display: grid;
        grid-template-rows: 1fr max-content;
        height: inherit;
    }
</style>