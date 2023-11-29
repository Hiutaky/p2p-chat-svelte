<script>
    import { instance } from "../store/instance";
    import { serverGlobal } from "../store/serverGlobal";
    import AvatarBeam from "./AvatarBeam.svelte";
    import ConnectionPrompt from "./ConnectionPrompt.svelte";
    export let className = 'grid'
    const setCurrent = (id) => {
        $serverGlobal.current = id
        $instance.view = 'chat'
    }
</script>

<div class="{className} bg-black bg-opacity-25">
    <div class="d-flex flex-column row-gap-3 p-3 ">
        <h3 class="fw-medium m-0">Chats</h3>
        {#if $serverGlobal.messages && Object.keys($serverGlobal.messages).length }
            {#each Object.entries($serverGlobal.messages) as [key,peer],i (i) }
                <button class="d-flex flex-row align-items-center gap-3 text-white p-3 py-2 bg-dark rounded {$serverGlobal.current === key ? 'border' : 'border border-dark' }" on:click={() => setCurrent(key)}>
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