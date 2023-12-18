<script>
    //@ts-nocheck
    import { onDestroy, onMount } from "svelte";
    import AvatarBeam from "./AvatarBeam.svelte";
    import { user } from "../store/user";
    import Exit from "$lib/images/exit.svg"
    import Reload from "$lib/images/reload.svg"
    import uuid4 from "uuid4"
    import axios from "axios"
    import { getPublicURI, stopTracks } from "$lib/utilities";
    import { fly } from "svelte/transition";

    const initState = {
        client: false,
        inCall: false,
        outCall: false,
        queue: false,
        
        peer: false,
    }
    let IncomingVideo = false,
        OutcomingVideo = false,
        incomingStream = false, 
        outcomingStream = false

    let randomHash = uuid4()
    let starter 
    let queueInterval = false
    let state = initState
    let queueClient = false
    let isQueue = true

    $: if( IncomingVideo && incomingStream)
        IncomingVideo.srcObject = incomingStream
    $: if( OutcomingVideo && outcomingStream ) 
        OutcomingVideo.srcObject =  outcomingStream

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
        if( outcomingStream ) {
            stopTracks(outcomingStream)
        }
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

    const startMediaStream = async () => {
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices.GetUserMedia;
        await getUserMedia({video: true, audio: true}, (stream) => {
            outcomingStream = stream
        })
    }

    const startOutgoingCall = async (peer) => {
        console.log('Connecting to', peer)
        state.peer = peer
        _maybe_init_roulette()
        clearInterval(queueInterval)
        queueClient.disconnect()
        const call = state.client.call(peer, outcomingStream);
        state.outCall = call
        call.on('stream', function(remoteStream) {
            incomingStream = remoteStream
        })
        call.on('close', function() {
            console.log(`On Outgoing Close`)
            next()
        })
        call.on('error', (err) => {
            console.log('error', err)
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
        incomingStream = false
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
            if( outcomingStream ) {
                state.inCall.answer(outcomingStream)
                state.inCall.on('stream', function(remoteStream) {
                    incomingStream = remoteStream
                })
                state.inCall.on('close', function(remoteStream) {
                    console.log(`On Incoming Close`)
                    next()
                    //outcomingStream.getTracks().forEach( (track) => track.stop() )
                })
            }else {
                state.inCall = false
                state.queue = false
                console.log('Failed to get local stream' ,err);
            }
        })
    }

</script>
{#if outcomingStream }
    <div transition:fly class="video-wrapper w-100 d-flex flex-column flex-md-row gap-3 align-items-center justify-content-center p-3">
        {#if incomingStream }
        <div class="w-100 rounded position-relative" transition:fly>
            <video class="d-flex h-100 w-100 rounded" bind:this={IncomingVideo} autoplay playsinline></video>
            <span class="m-2 px-2 py-0 fs-14 bg-dark rounded position-absolute start-0 bottom-0">{ state.peer }</span>
        </div>
        {/if}
        <div class="w-100 rounded d-flex position-relative">
            <video class="w-100 rounded" bind:this={OutcomingVideo} autoplay muted playsinline></video>
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
{/if}
{#if ! state.peer }
<div class="d-flex flex-column align-items-center justify-content-center position-absolute start-0 top-0 w-100 h-100">
    <div transition:fly class="d-flex flex-column row-gap-3 align-items-center p-3 bg-dark border-dark border shadow rounded">
        <AvatarBeam name={randomHash} size={64} />
        {#if ! outcomingStream }
            <button
                on:click={ startMediaStream }
            >
                Enable Webcam
            </button>
        {:else if state.peer }
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