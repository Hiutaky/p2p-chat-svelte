<script>
    //@ts-nocheck
    import { onDestroy, onMount } from "svelte";
    import AvatarBeam from "./AvatarBeam.svelte";
    import { user } from "../store/user";
    import Exit from "$lib/images/exit.svg"
    import Reload from "$lib/images/reload.svg"
    import uuid4 from "uuid4"
    import axios from "axios"
    import { getPublicURI } from "$lib/utilities";

    const initState = {
        client: false,
        inCall: false,
        outCall: false,
        queue: false,
        IncomingVideo: false,
        OutcomingVideo: false,
        incomingStream: false, 
        outcomingStream: false,
        peer: false,
    }
    let randomHash = uuid4()
    let starter 
    let queueInterval = false
    let state = initState
    let queueClient = false
    let isQueue = true

    $: if( state.IncomingVideo && state.incomingStream)
        state.IncomingVideo.srcObject = state.incomingStream
    $: if( state.OutcomingVideo && state.outcomingStream ) 
        state.OutcomingVideo.srcObject =  state.outcomingStream

    onMount( async () => {
        const StartClient = await import("$lib");
        starter = StartClient.default
    })

    onDestroy( () => {
        console.log(`Destroy`)
        if( state.client )
            state.client.destroy()
        if( queueInterval )
            clearInterval(queueInterval)
        if( queueClient )
            queueClient.destroy()
        state = initState
    })

    const onClose = () => {
        console.log('on close')
        isQueue = false
        if( queueInterval )
            clearInterval(queueInterval)
        state.queue = false
        _close_connections()
        //state.client = false
    }
    const next = () => {
        _close_connections()
        if( queueInterval )
            clearInterval(queueInterval)
        if( ! isQueue || state.queue ) return
        startQueue()
    }

    const startOutgoingCall = async (peer) => {
        console.log('Connecting to', peer)
        state.peer = peer
        _maybe_init_roulette()
        clearInterval(queueInterval)
        queueClient.disconnect()
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices.GetUserMedia;
        await getUserMedia({video: true, audio: true}, function(stream) {
            let call = state.client.call(peer, stream);
            state.outcomingStream = stream
            state.outCall = call
            call.on('stream', function(remoteStream) {
                state.incomingStream = remoteStream
            })
            call.on('close', function() {
                console.log(`On Outgoing Close`)
                next()
                stream.getTracks().forEach( (track) => track.stop() )
            })
            call.on('error', (err) => {
                console.log('error', err)
            })
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        })
        state.queue = false
    }

    const _close_connections = () => {
        if( queueClient && queueClient.open )
            queueClient.disconnect()
        if( state.inCall )
            state.inCall.close()
        if( state.outCall )
            state.outCall.close()
        state.incomingStream = false
        state.outcomingStream = false
        state.inCall = false
        state.outCall = false
        state.peer = false
    }
    const _maybe_init_roulette = () => {
        if( ! state.client || ! state.client.open )
            state.client = starter($user.name, `roulette`, 9001)
    }

    const startQueue = () => {
        console.log(starter)
        if( ! queueClient || queueClient.disconnected )
            queueClient = starter($user.name, `queue`, 9003)
        isQueue = true
        state.queue = true
        queueClient.on('open', () => {
            console.log(`- Queue Client Ready`)
            _maybe_init_roulette()
            state.client.on('open', () => {
                console.log(`- Roulette Client Ready`)
            })
            queueInterval = setInterval(async () => {
                console.log('Searching for Peers')
                if( state.peer || state.inCall) clearInterval(queueInterval)
                randomHash = uuid4()
                let peers = (await axios.get(`${getPublicURI('queue')}/peerjs/peers`)).data
                peers = peers.filter( (peer) => peer !== $user.name) 
                const ran = Math.floor( Math.random() * peers.length)
                if( peers.length ) {
                    startOutgoingCall(peers[ran])
                } else {
                    randomHash = uuid4()
                }
            }, 3000)
            onCallHandler()
        })
    }

    const onCallHandler = () => {
        state.client.on('call', async function(incCall) {
            console.log('Incoming Video Call', incCall)
            state.peer = incCall.peer
            queueClient.disconnect()
            if( queueInterval )
                clearInterval(queueInterval)
            state.queue = false
            state.inCall = incCall
            const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices.GetUserMedia;
            await getUserMedia({video: true, audio: true}, function(stream) {
                state.outcomingStream = stream
                state.inCall.answer(stream)
                state.inCall.on('stream', function(remoteStream) {
                    state.incomingStream = remoteStream
                })
                state.inCall.on('close', function(remoteStream) {
                    console.log(`On Incoming Close`)
                    next()
                    stream.getTracks().forEach( (track) => track.stop() )
                })
            }, function(err) {
                state.inCall = false
                state.queue = false
                console.log('Failed to get local stream' ,err);
            });
        })
    }

</script>
{#if  state.inCall || state.outCall}
    <div class="video-wrapper w-100 d-flex flex-column flex-md-row gap-3 align-items-start p-3">
        <div class="w-100 rounded position-relative">
            <video class="d-flex h-100 w-100 rounded" bind:this={state.IncomingVideo} autoplay playsinline></video>
            <span class="m-2 px-2 py-0 fs-14 bg-dark rounded position-absolute start-0 bottom-0">{ state.peer }</span>
        </div>
        <div class="w-100 rounded d-flex position-relative">
            <video class="w-100 rounded" bind:this={state.OutcomingVideo} autoplay muted playsinline></video>
            <span class="m-2 px-2 py-0 fs-14 bg-dark rounded position-absolute start-0 bottom-0">You</span>
        </div>
    </div>
    <div class="w-100 d-flex flex-row justify-content-center">
        <div class="d-flex flex-row column-gap-2 p-2">
            <button 
                class="phone-down-btn p-3 bg-danger border-0"
                on:click={(onClose)}
            >
                <img src={Exit} class="icon" />
            </button>
            <button 
                class="phone-down-btn p-3 bg-primary border-0"
                on:click={(next)}
            >
                <img src={Reload} class="icon" />
            </button>
        </div>
    </div>
{:else}
<div class="d-flex flex-column align-items-center justify-content-center position-absolute start-0 top-0 w-100 h-100 bg-dark">
    <div class="d-flex flex-column row-gap-3 align-items-center p-3 bg-black bg-opacity-50 shadow rounded">
        <AvatarBeam name={randomHash} size={64}/>
        {#if state.peer }
        <span class="fw-medium fs-6">Connecting with {state.peer}...</span>
        {:else if ! state.inCall && ! state.outCall && ! state.queue }
        <span class="fw-medium fs-6">Ready for a match?</span>
        <div class="d-flex flex-row column-gap-3  justify-content-center">
            <button 
                class=" btn btn-success d-flex"
                on:click={startQueue}
            >
                Start
            </button>
        </div>
        {:else if state.queue}
        <span class="fw-medium fs-6">Searching for a match...</span>
        <button 
            class=" btn btn-danger d-flex"
            on:click={onClose}
        >
            Close
        </button>
        {/if}
    </div>
</div>
{/if}

<style>
    video {
        background-color: #333333;
    }
</style>