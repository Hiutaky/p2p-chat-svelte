<script>
    import { p2p } from "../store/p2p";

    const setCurrent = (id) => {
        $p2p.current = id
    }
</script>

<div class="w-100 d-flex flex-column row-gap-2 border border-dark rounded p-2">
    <span class="fw-medium fs-13">Chats</span>
    {#if $p2p.incoming && Object.keys($p2p.incoming).length }
        {#each Object.entries($p2p.incoming) as [key,peer],i (i) }
            <div class="p-2 border  bg-dark rounded {$p2p.current === key ? '' : 'border-dark' }" on:click={() => setCurrent(key)}>
                {peer.label}
            </div>
        {/each}
    {/if}
</div>