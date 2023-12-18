<script>
    //@ts-nocheck
    import Messages from "./Messages.svelte";
    import ChatVideo from "./ChatVideo.svelte";
    import { main } from "../store/main";
    import AvatarBeam from "./AvatarBeam.svelte";
    import Camera from "$lib/images/camera.svg"
    import { keysIncludes } from "$lib/p2p";
    import { fly } from "svelte/transition";
    import { stopTracks } from "$lib/utilities";
    
    export let className = 'd-grid '
    const initVideoCall = async () => {
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices.GetUserMedia;
        await getUserMedia({video: true, audio: true}, function(stream) {
            $main.currentCall = $main.current
            const call = $main.client.call($main.current, stream);
            $main.outcomingStream = stream
            $main.calls[$main.current] = call
            call.on('stream', function(remoteStream) {
                $main.incomingStream = remoteStream
            })
            call.on('close', function() {
                if( $main.outcomingStream )
                    stopTracks($main.outcomingStream)
                if( $main.incomingStream )
                    stopTracks($main.incoming)
                delete $main.calls[$main.current]
                $main.incomingStream = false
                $main.outcomingStream = false
            })
            call.on('error', (err) => {
                console.log('error', err)
            })
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        })
    }
</script>

<div class="position-relative {className} chat-container h-100 w-100 flex-column p-3 bg-black bg-opacity-25 overflow-auto" in:fly>
    <div class="d-flex flex-row align-items-center justify-content-between mb-3 ">
        <div class="d-flex flex-row column-gap-2 align-items-center fw-medium">
            <AvatarBeam  name={$main.current} />
            <span class="{$main.current ? `` : `placeholder placeholder-wave rounded`}">
                {$main.current ? $main.current : 'Username here'}
            </span>
        </div>
        <button 
            class="p-2 d-flex bg-dark border border-dark rounded-3"
            on:click={() => ! keysIncludes($main.calls, $main.current) ? initVideoCall() : null}
        >
            {#if $main.incomingStream }
                <div class="circle bg-success pulse rounded-5 m-1"></div>

            {:else if $main.calls[$main.current] }
                <div class="spinner-border ico text-white"></div>
            {:else}
                <img src={Camera} class='icon' />
            {/if}
        </button>
    </div>
    <div class=" position-relative d-flex flex-column flex-lg-row gap-3 overflow-auto align-items-start">
        <ChatVideo />
        <Messages />
    </div>
</div>

<style>
    .chat-container {
        grid-template-rows: auto 1fr;
    }
    .spinner-border {
        height: 24px;
        width: 24px;
    }
    .circle {
        height: 16px;
        width: 16px;
    }
</style>