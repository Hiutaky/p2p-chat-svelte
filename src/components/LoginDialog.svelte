<script>
    //@ts-nocheck
    import { onDestroy, onMount } from "svelte";
    import {user} from "../store/user"
    import {serverGlobal} from "../store/serverGlobal"
    import { connect, keysIncludes } from "$lib/p2p";
    import { instance } from "../store/instance";

    $: CreateClient = false
    $: init = false
    onMount(async () => {
        const { StartClient } = await import("$lib");
        CreateClient = StartClient
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
        $serverGlobal.messages[peer] = [...$serverGlobal.messages[peer], {
            peer: peer,
            ...message
        }]
    }

    let startConnection = () => {
        if( ! $user.name || ! CreateClient ) return
        console.log('Client open')
        $serverGlobal.client = CreateClient($user.name)
        $serverGlobal.client.on('open', () => {
            $user.id = $serverGlobal.client.id
            console.log(`Ready to receive Connection`)
            $serverGlobal.client.socket.on('message', (message) => {
                console.log(message)
            })
        })

        $serverGlobal.client.listAllPeers( (peers) => { $serverGlobal.peers = peers.filter( (peer) => peer !== $user.name) })
        
        $serverGlobal.client.on('connection', (conn) => {
            $serverGlobal.incoming[conn.peer] = conn
            if( ! keysIncludes( $serverGlobal.outcoming, conn.peer ) ){
                $serverGlobal.outcoming[conn.current] = $serverGlobal.client.connect(conn.current, {
                    label: $user.name
                })
            }
            if( ! Object.keys($serverGlobal.messages).includes(conn.peer) ) {
                $serverGlobal.messages[conn.peer] = [{
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

        $serverGlobal.client.on('call', function(call) {
            console.log('Incoming Video Call', call)
            $serverGlobal.calls[call.peer] = call
            $serverGlobal.currentCall = call.peer
            $serverGlobal.current = call.peer
            $serverGlobal.ringing = true
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