<script>
    //@ts-nocheck
    import { serverGlobal } from "../store/serverGlobal";
    import PhoneDown from "$lib/images/phone-down.svg"
    import PhoneUp from "$lib/images/phone-up.svg"
    import ScreenStart from "$lib/images/screen-start.svg"
    import ScreenStop from "$lib/images/screen-stop.svg"
    import AvatarBeam from "./AvatarBeam.svelte";
    import { keysIncludes } from "$lib/p2p";

    let IncomingVideo, OutcomingVideo = false
    //
    let isScreenSharing = false

    $: if( ! $serverGlobal.calls[$serverGlobal.current] ) {
        isScreenSharing = false
    }

    $: if( IncomingVideo && $serverGlobal.incomingStream)
        IncomingVideo.srcObject = $serverGlobal.incomingStream
    $: if( OutcomingVideo && $serverGlobal.outcomingStream ) 
        OutcomingVideo.srcObject =  $serverGlobal.outcomingStream

    const displayMediaOptions = {
        video: {
            displaySurface: "window",
        },
        audio: false,
    };

    const _get_user_media = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices.GetUserMedia;
    
    const _change_source = (stream) => {
        $serverGlobal.calls[$serverGlobal.current].peerConnection.getSenders().forEach((sender) => {
            sender.track.stop()
            if(sender.track.kind === "audio" && stream.getAudioTracks().length > 0){
                sender.replaceTrack(stream.getAudioTracks()[0]);
            }
            if (sender.track.kind === "video" && stream.getVideoTracks().length > 0) {
                sender.replaceTrack(stream.getVideoTracks()[0]);
            }
        })
    }

    const _stop_source = () => {
        $serverGlobal.calls[$serverGlobal.current].peerConnection.getSenders().forEach((sender) => {
            sender.track.stop()
        })
    }

    const stopScreenSharing = async () => {
        await _get_user_media({video: true, audio: true}, function(stream) {
            $serverGlobal.outcomingStream = stream
            _change_source(stream)
            isScreenSharing = false
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        });
    }

    const startScreenSharing = async () => {
        const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        _change_source(stream)
        stream.getVideoTracks()[0].addEventListener('ended', async () => {
            await stopScreenSharing()
        })
        isScreenSharing = true
        $serverGlobal.outcomingStream = stream
    }

    const closeCall = () => {
        if( keysIncludes($serverGlobal.calls, $serverGlobal.currentCall) ) {
            if( $serverGlobal.outcomingStream )
                $serverGlobal.outcomingStream.getTracks().forEach( (track) => track.stop() )
            if( $serverGlobal.incomingStream )
                $serverGlobal.incomingStream.getTracks().forEach( (track) => track.stop() )
            $serverGlobal.outcomingStream = false
            $serverGlobal.incomingStream = false
            $serverGlobal.calls[$serverGlobal.current].close()
            delete $serverGlobal.calls[$serverGlobal.current]
            isScreenSharing = false
        }
    }
    const acceptCall = async () => {
        if( ! $serverGlobal.ringing ) return
        await _get_user_media({video: true, audio: true}, function(stream) {
            $serverGlobal.outcomingStream = stream
            $serverGlobal.calls[$serverGlobal.currentCall].answer(stream)
            $serverGlobal.calls[$serverGlobal.currentCall].on('stream', function(remoteStream) {
                $serverGlobal.incomingStream = remoteStream
            })
            $serverGlobal.calls[$serverGlobal.currentCall].on('close', function(remoteStream) {
                if( $serverGlobal.outcomingStream )
                    $serverGlobal.outcomingStream.getTracks().forEach((track) => track.stop() )
                if( $serverGlobal.incomingStream )
                    $serverGlobal.incomingStream.getTracks().forEach((track) => track.stop() )
                delete $serverGlobal.calls[$serverGlobal.current]
                $serverGlobal.incomingStream = false
                $serverGlobal.outcomingStream = false
            })
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        })
        $serverGlobal.ringing = false
    }
    const rejectCall = () => {
        if( ! $serverGlobal.ringing ) return
        if( keysIncludes($serverGlobal.calls, $serverGlobal.currentCall ) ) {
            $serverGlobal.calls[$serverGlobal.currentCall].close()
            $serverGlobal.currentCall = false
            $serverGlobal.ringing = false
        }
    }
</script>

{#if $serverGlobal.incomingStream || $serverGlobal.outcomingStream }
    <div class="w-100 video-wrapper position-relative d-flex flex-column flex gap-3 align-items-start">
        <div class="w-100 d-flex position-relative">
            <div class="w-100 rounded position-relative">
                <video class="d-flex h-100 bg-dark w-100 rounded" bind:this={IncomingVideo} autoplay playsinline></video>
                <span class="m-2 px-2 py-0 fs-14 bg-dark rounded position-absolute start-0 bottom-0">
                    { $serverGlobal.current ? $serverGlobal.current : `Loading` }
                </span>
            </div>
            <div class="position-absolute w-25 bottom-0 end-0 m-2 d-flex position-relative">
                <video class="w-100 bg-black bg-opacity-50 rounded" bind:this={OutcomingVideo} autoplay muted playsinline></video>
                <span class="m-2 px-2 py-0 fs-14 bg-dark rounded position-absolute start-0 bottom-0">You</span>
            </div>
            <div class="position-absolute left-0 bottom-0 w-100 d-flex flex-row justify-content-center">
                <div class="d-flex flex-row column-gap-2 p-2">
                    <button 
                        class="phone-down-btn p-2 rounded d-flex bg-danger border-0"
                        on:click={closeCall}
                    >
                        <img src={PhoneDown} class="icon" />
                    </button>
                    {#if ! isScreenSharing }
                    <button 
                        class="phone-down-btn p-2 rounded d-flex bg-success border-0"
                        on:click={startScreenSharing}
                    >
                        <img src={ScreenStart} class="icon" />
                    </button>
                    {:else}
                    <button 
                        class="phone-down-btn p-2 rounded d-flex bg-success border-0"
                        on:click={stopScreenSharing}
                    >
                        <img src={ScreenStop} class="icon" />
                    </button>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}
{#if $serverGlobal.ringing }
<div class="ringing d-flex flex-column align-items-center justify-content-center position-absolute start-0 top-0 w-100 h-100 bg-dark">
    <div class="d-flex flex-column row-gap-3 align-items-center p-3 bg-black bg-opacity-50 shadow rounded">
        <AvatarBeam name={$serverGlobal.ringing} size={64}/>
        <span class="fw-medium fs-6">{$serverGlobal.ringing} is calling you</span>
        <div class="d-flex flex-row column-gap-3  justify-content-center">
            <button 
                on:click={acceptCall}
                class="border-0 bg-success p-3 d-flex phone-down-btn"
            >
                <img src={PhoneUp} class="icon" />
            </button>
            <button 
                on:click={rejectCall}
                class="border-0 bg-danger p-3 d-flex phone-down-btn"
            >
                <img src={PhoneDown} class="icon" />
            </button>
        </div>
    </div>
</div>
{/if}

<style>
    .ringing {
        z-index: 999;
    }
</style>