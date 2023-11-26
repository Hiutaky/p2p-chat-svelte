<script>
    //@ts-nocheck
    import { onMount } from "svelte";
    import {user} from "../store/user"
    import {p2p} from "../store/p2p"
    import { connect } from "$lib/p2p";
    //const { P2PClient } = await import("$lib");
    let P2P_Client = false
    onMount(async () => {
        const { P2PClient } = await import("$lib");
        P2P_Client = P2PClient
    })

    let name = ''
    const updateName = () => {
        if( name === '' || ! name )
            return
        $user.name = name
    }

    const addMessage = (message, peer, label = false) => {
        $p2p.messages[peer] = [...$p2p.messages[peer], {
            peer: peer,
            ...message
        }]
    }

    const startConnection = async () => {
        updateName()
        $p2p.client = P2P_Client(false)
        $p2p.client.on('open', () => {
            $user.id = $p2p.client.id
            console.log(`Ready to receive Connection`)
        })

        $p2p.client.on('connection', (conn) => {
            $p2p.incoming[conn.peer] = conn
            if( ! Object.keys($p2p.messages).includes(conn.peer) ) {
                $p2p.messages[conn.peer] = [{
                    peer: conn.peer,
                    timestamp: new Date().getTime(),
                    content: `${conn.label} started a conversation.`
                }]
                connect(conn.peer, $user.name)
            }
                /*conn.on('open', () => {
                    'peerConnection' = $p2p.client.connect(conn.peer)
                })*/
            conn.on('data', (message) => {
                console.log( `New Message from ${conn.peer}`, message)
                addMessage(message, conn.peer, conn.label)
            })
        })
    }


</script>
<span class="d-flex flex-column row-gap-1">
    {#if $user.name}
        Connected as {$user.name} with sid {$user.id}
    {:else}
        Enter a name an start chatting!
        <form class="d-flex flex-row column-gap-2">
            <input 
                type="text" 
                bind:value={name} 
                class="w-100 border border-black rounded bg-dark text-white px-2"
                placeholder="Enter your name"
            >
            <button on:click={startConnection} class="btn btn-primary">Start</button>
        </form>
    {/if}
</span>