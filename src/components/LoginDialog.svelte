<script>
    //@ts-nocheck
    import { onDestroy, onMount } from "svelte";
    import {user} from "../store/user"
    import {p2p} from "../store/p2p"
    import { connect, keysIncludes } from "$lib/p2p";
    //const { P2PClient } = await import("$lib");
    $: P2P_Client = false
    $: init = false
    onMount(async () => {
        const { P2PClient } = await import("$lib");
        P2P_Client = P2PClient
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
        $p2p.messages[peer] = [...$p2p.messages[peer], {
            peer: peer,
            ...message
        }]
    }

    let startConnection = () => {
        console.log( P2P_Client, $user.name )
        if( ! $user.name || ! P2P_Client ) return
        console.log('Client open')
        $p2p.client = P2P_Client($user.name)
        $p2p.client.on('open', () => {
            $user.id = $p2p.client.id
            console.log(`Ready to receive Connection`)
        })
        
        $p2p.client.on('connection', (conn) => {
            $p2p.incoming[conn.peer] = conn
            if( ! keysIncludes( $p2p.outcoming, conn.peer ) ){
                $p2p.outcoming[conn.current] = $p2p.client.connect(conn.current, {
                    label: $user.name
                })
            }
            if( ! Object.keys($p2p.messages).includes(conn.peer) ) {
                $p2p.messages[conn.peer] = [{
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

        $p2p.client.on('call', function(call) {
            console.log('Incoming Video Call', call)
            $p2p.calls[call.peer] = call
            $p2p.currentCall = call.peer
            $p2p.current = call.peer
            $p2p.ringing = true
        });
    }

    

    const acceptCall = () => {
        if( ! $p2p.ringing ) return
        $p2p.ringing = false
        getUserMedia({video: true, audio: true}, function(stream) {
            $p2p.outcomingStream = stream
            $p2p.calls[$p2p.ringing].answer(stream)
            $p2p.calls[$p2p.ringing].on('stream', function(remoteStream) {
                $p2p.incomingStream = remoteStream
            })
            call.on('close', function(remoteStream) {
                stream.getTracks().forEach( (track) => track.stop() )
                $p2p.outcomingStream = false
                $p2p.incomingStream = false
                delete $p2p.calls[$p2p.ringing]
            })
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        });
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