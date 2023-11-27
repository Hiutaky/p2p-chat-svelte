<script>
    import { instance } from "../store/instance";
    import { p2p } from "../store/p2p";
    import AvatarBeam from "./AvatarBeam.svelte";
    import ConnectionPrompt from "./ConnectionPrompt.svelte";

    const setCurrent = (id) => {
        $p2p.current = id
        $instance.view = 'messages'
    }
</script>

<div class="grid bg-black bg-opacity-25">
    <div class="d-flex flex-column row-gap-3 p-3 ">
        <h3 class="fw-medium m-0">Chats</h3>
        {#if $p2p.messages && Object.keys($p2p.messages).length }
            {#each Object.entries($p2p.messages) as [key,peer],i (i) }
                <button class="d-flex flex-row align-items-center gap-3 text-white p-3 py-2 bg-dark rounded {$p2p.current === key ? 'border' : 'border border-dark' }" on:click={() => setCurrent(key)}>
                    <AvatarBeam name={key} />
                    <span>
                        {key}
                    </span>
                </button>
            {/each}
        {:else}
        <div class="p-3 bg-dark rounded">
            There's no chat, create a new one.
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