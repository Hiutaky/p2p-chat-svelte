<script>
    import { instance } from "../store/instance";
    import { main } from "../store/main";
    import AvatarBeam from "./AvatarBeam.svelte";
    import ConnectionPrompt from "./ConnectionPrompt.svelte";
    export let className = 'grid'
</script>

<div class="{className} bg-black bg-opacity-25">
    <div class="d-flex flex-column row-gap-3 p-3 ">
        <h3 class="fw-medium m-0">Chats</h3>
        {#if $main.messages && Object.keys($main.messages).length }
            {#each Object.entries($main.messages) as [key,peer],i (i) }
                <a href="/chat/{key}" class="d-flex flex-row align-items-center gap-3 text-white p-3 py-2 bg-dark rounded {$main.current === key ? 'border' : 'border border-dark' }">
                    <AvatarBeam name={key} />
                    <span>
                        {key}
                    </span>
                </a>
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