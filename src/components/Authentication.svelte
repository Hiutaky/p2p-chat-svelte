<script>
    //@ts-nocheck
    import { onDestroy, onMount } from "svelte";
    import {user} from "../store/user"
    import {main} from "../store/main"
    import { connect, keysIncludes } from "$lib/p2p";
    import { instance } from "../store/instance";
    import axios from "axios";
    import { getPeers, getPublicURI } from "$lib/utilities";
    import { page } from "$app/stores";
    import { composeNotification, notifier } from "../store/notifier";
    import { goto } from "$app/navigation";

    $: CreateClient = false
    $: init = false
    onMount(async () => {
        const StartClient = await import("$lib");
        console.log()
        CreateClient = StartClient.default
        init = true
        startConnection()
    })
    $: if( !$main.client && $user.name ) 
        startConnection()

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
            $main.client = CreateClient($user.name, 'main', 9000)
        } catch (e) {
            $main.connected = false
            console.error(e)
        }
        $main.client.on('open', async () => {
            console.log('Client ready')
            $main.connected = true
            $user.id = $main.client.id
            $main.peers = (await getPeers()).filter( peer => peer !== $user.id )
            $main.client.socket.on('message', (message) => {
            })
        })
        
        $main.client.on('connection', (conn) => {
            $main.incoming[conn.peer] = conn
            if( conn.metadata.messages ) {
                const localMessages = JSON.stringify($main.messages[conn.peer])
                if( localMessages !== conn.metadata.messages ) {
                    if( localMessages.length > conn.metadata.messages.length ) {
                        
                        //local messages newer than remote
                    } else if( localMessages.length < conn.metadata.messages.length ) {
                        $main.messages[conn.peer] = JSON.parse(conn.metadata.messages)
                    } else {
                        
                    }
                }
            }
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
                if( keysIncludes(message, 'type')) {
                    switch (message.type) {
                        case 'MESSAGE':
                            addMessage(message, conn.peer, conn.label)
                            if( ! $page.route.id.replace('[slug]', conn.peer ).includes(`/chat/${conn.peer}`) ) {
                                $notifier.notifications = [
                                    ...$notifier.notifications,
                                    composeNotification({
                                        peer: conn.peer,
                                        type: 'message',
                                        content: `${conn.peer} sent you a message.`,
                                        actions: () => goto(`/chat/${conn.peer}`)
                                    })
                                ]
                            }
                            break;
                        case 'PENDING':
                            break;
                    }
                }
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