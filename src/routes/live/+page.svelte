<script>
    import { onDestroy, onMount } from "svelte";
    import { user } from "../../store/user";
    import { getPeers } from "$lib/utilities";
    import Eye from "$lib/images/eye.svg"
    import { fly } from "svelte/transition";
    let CreateClient = false
    let lives = []
    let fetchedLives = {}
    let explore = {
        client: false
    }

    onMount( async () => {
        const StartClient = await import("$lib");
        CreateClient = StartClient.default
    })
    onDestroy( () => {
        if( explore.client ) {
            explore.client.destroy()
            explore.client = false
        }
    })

    $: if( $user.id && CreateClient && ! explore.client )
        searchLivestreams()

    const searchLivestreams = () => {
        explore.client = CreateClient($user.id, 'live', 9004)
        explore.client.on('open', async () => {
            console.log('Explore Ready')
            lives = await getPeers('live-explore')
            fetchLive(0)
        })
        explore.client.on('connection', (conn) => {
            console.log(conn)
            conn.on('data', (message) => {
                switch(message.type) {
                    case 'LIVE_INFO':
                        fetchedLives[conn.peer] = message.value
                    break;
                }
            })
        })
    }

    const fetchLive = (i) => {
        console.log(lives[i])
        const conn = explore.client.connect(lives[i])
        conn.on('open', () => {
            console.log(conn)
            conn.send({
                type: 'LIVE_INFO'
            })
        })
    }


</script>

<div class="d-flex flex-column row-gap-3 p-3 h-100 overflow-auto w-100" in:fly>
    <div class="d-flex flex-row justify-content-between align-items-center">
        <h3>Explore Live</h3>
        <a href="/live/create">
            <button 
                class="btn btn-primary"
            >
                Create
            </button>
        </a>
    </div>
    <div class="lives-grid bg-black gap-2 bg-opacity-50 rounded w-100 p-3">
        {#if lives.length }
            {#each lives as live, i }
            <a href="/live/{live}" class="text-white text-decoration-none">
                <div class="d-flex flex-column row-gap-2 p-2 bg-dark rounded">
                    <div class="position-relative">
                        <img class="w-100 rounded" src={fetchedLives[live] ? fetchedLives[live].image : ``} />
                        <div class="position-absolute end-0 bottom-0 m-1 d-flex flex-row column-gap-2 px-2 py-1 bg-dark rounded">
                            <img class="icon" src={Eye} />
                            <span>{fetchedLives[live] ? fetchedLives[live].viewers : 0}</span>
                        </div>
                    </div>
                    <span class="fw-bold">{fetchedLives[live] ? fetchedLives[live].title : ``}</span>
                    <span class="fs-14">{live}</span>
                </div>
            </a>
            {/each}
        {:else}
            {#each Array(3).fill(0) as live, i }
            <div class="text-white text-decoration-none">
                <div class="d-flex flex-column row-gap-2 p-2 bg-dark rounded">
                    <div class="position-relative">
                        <div class="placeholder placeholder-wave w-100 rounded p-5 bg-black bg-opacity-50" />
                    </div>
                    <span class="fw-bold placeholder">Loading</span>
                    <span class="fs-14 placeholder">Loading</span>
                </div>
            </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .lives-grid {
        display: grid;
        grid-template-columns: 25% 25% 25% 25%;
    }
</style>