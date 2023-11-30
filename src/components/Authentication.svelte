<script>
    //@ts-nocheck
    import { onDestroy, onMount } from "svelte";
    import {user} from "../store/user"
    import {main} from "../store/main"
    import { connect, keysIncludes } from "$lib/p2p";
    import { instance } from "../store/instance";

    $: CreateClient = false
    $: init = false
    onMount(async () => {
        const StartClient = await import("$lib");
        console.log()
        CreateClient = StartClient.default
        init = true
        startConnection()
    })
    //$: startConnection($user.name, P2P_Client)

    let name = ''
    const updateName = () => {
        if( name === '' || ! name )
            return
        $user.name = `${name}-${Math.floor(Math.random() * 10000)}`
    }

    const addMessage = (message, peer, label = false) => {
        $main.messages[peer] = [...$main.messages[peer], {
            peer: peer,
            ...message
        }]
    }

    let startConnection = () => {
        if( ! $user.name || ! CreateClient ) return
        try {
            $main.client = CreateClient($user.name)
        } catch (e) {
            $main.connected = false
            console.error(e)
        }
        $main.client.on('open', () => {
            console.log('Client ready')
            $main.connected = true
            $user.id = $main.client.id
            $main.client.socket.on('message', (message) => {
            })
        })
        
        $main.client.on('connection', (conn) => {
            $main.incoming[conn.peer] = conn
            if( ! keysIncludes( $main.outcoming, conn.peer ) ){
                $main.outcoming[conn.current] = $main.client.connect(conn.current, {
                    label: $user.name
                })
            }
            if( ! Object.keys($main.messages).includes(conn.peer) ) {
                $main.messages[conn.peer] = [{
                    peer: conn.peer,
                    timestamp: new Date().getTime(),
                    content: `${conn.label} started a conversation.`
                }]
            }
            conn.on('data', (message) => {
                console.log( `New Message from ${conn.peer}`, message)
                addMessage(message, conn.peer, conn.label)
            })
        })

        $main.client.on('call', function(call) {
            console.log('Incoming Video Call')
            $main.calls[call.peer] = call
            $main.currentCall = call.peer
            $main.current = call.peer
            $main.ringing = true
            $instance.view = 'chat'
        })
    }

</script>
{#if ! $user.name }
<span class="fs-5 login-modal position-absolute w-100 start-0 top-0 bg-dark d-flex flex-column align-items-center justify-content-center row-gap-2 px-5">
    Enter a name an start chatting!
    <form class="d-flex flex-column row-gap-2 w-100">
        <input 
            type="text" 
            bind:value={name} 
            class="w-100 border border-black rounded bg-black bg-opacity-50 py-2 text-white px-3"
            placeholder="Enter your name"
        >
        <button on:click={updateName} class="btn btn-primary">Start</button>
    </form>
</span>
{/if}
<style>
    .login-modal {
        z-index: 999;
        height: 100%;
    }
</style>