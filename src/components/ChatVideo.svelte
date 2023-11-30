<script>
    //@ts-nocheck
    import { main } from "../store/main";
    import PhoneDown from "$lib/images/phone-down.svg"
    import PhoneUp from "$lib/images/phone-up.svg"
    import ScreenStart from "$lib/images/screen-start.svg"
    import ScreenStop from "$lib/images/screen-stop.svg"
    import vMute from "$lib/images/volume-mute.svg"
    import vUnmute from "$lib/images/volume-loud.svg"
    import mMute from "$lib/images/microphone-muted.svg"
    import mUnmute from "$lib/images/microphone.svg"
    import AvatarBeam from "./AvatarBeam.svelte";
    import { keysIncludes } from "$lib/p2p";

    let IncomingVideo, OutcomingVideo = false
    //
    let isScreenSharing = false
    let volume = 1
    let micVolume = 1

    $: if( ! $main.calls[$main.current] ) {
        isScreenSharing = false
    }

    $:if( IncomingVideo && $main.incomingStream) {
        if( ! IncomingVideo.srcObject)
            IncomingVideo.srcObject = $main.incomingStream
        IncomingVideo.volume = volume
    }
    $: if( OutcomingVideo && $main.outcomingStream ) {
        if( ! OutcomingVideo.srcObject)
            OutcomingVideo.srcObject =  $main.outcomingStream
        $main.outcomingStream.getAudioTracks()[0].enabled = micVolume
    }

    const displayMediaOptions = {
        video: {
            displaySurface: "window",
        },
        audio: false,
    };

    const _get_user_media = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices.GetUserMedia;
    

    const _change_source = (stream, replaceAudio = true) => {
        $main.calls[$main.current].peerConnection.getSenders().forEach((sender) => {
            sender.track.stop()
            if(replaceAudio && sender.track.kind === "audio" && stream.getAudioTracks().length > 0){
                sender.replaceTrack(stream.getAudioTracks()[0]);
            }
            if ( sender.track.kind === "video" && stream.getVideoTracks().length > 0) {
                sender.replaceTrack(stream.getVideoTracks()[0]);
            }
        })
    }


    const stopScreenSharing = async () => {
        await _get_user_media({video: true, audio: true}, function(stream) {
            $main.outcomingStream = stream
            _change_source(stream)
            isScreenSharing = false
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        });
    }

    const startScreenSharing = async () => {
        const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        _change_source(stream, false)
        stream.getVideoTracks()[0].addEventListener('ended', async () => {
            await stopScreenSharing()
        })
        isScreenSharing = true
        $main.outcomingStream = stream
    }

    const closeCall = () => {
        if( keysIncludes($main.calls, $main.currentCall) ) {
            if( $main.outcomingStream )
                $main.outcomingStream.getTracks().forEach( (track) => track.stop() )
            if( $main.incomingStream )
                $main.incomingStream.getTracks().forEach( (track) => track.stop() )
            $main.outcomingStream = false
            $main.incomingStream = false
            $main.calls[$main.current].close()
            delete $main.calls[$main.current]
            isScreenSharing = false
        }
    }
    const acceptCall = async () => {
        if( ! $main.ringing ) return
        await _get_user_media({video: true, audio: true}, function(stream) {
            $main.outcomingStream = stream
            $main.calls[$main.currentCall].answer(stream)
            $main.calls[$main.currentCall].on('stream', function(remoteStream) {
                $main.incomingStream = remoteStream
            })
            $main.calls[$main.currentCall].on('close', function(remoteStream) {
                if( $main.outcomingStream )
                    $main.outcomingStream.getTracks().forEach((track) => track.stop() )
                if( $main.incomingStream )
                    $main.incomingStream.getTracks().forEach((track) => track.stop() )
                delete $main.calls[$main.current]
                $main.incomingStream = false
                $main.outcomingStream = false
            })
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        })
        $main.ringing = false
    }
    const rejectCall = () => {
        if( ! $main.ringing ) return
        if( keysIncludes($main.calls, $main.currentCall ) ) {
            $main.calls[$main.currentCall].close()
            $main.currentCall = false
            $main.ringing = false
        }
    }
</script>

{#if $main.calls[$main.current]  }
    <div class="w-100 video-wrapper position-relative d-flex flex-column flex gap-3 align-items-start">
        <div class="w-100 d-flex position-relative">
            <div class="w-100 rounded position-relative">
                <video class="d-flex h-100 bg-dark w-100 rounded" bind:this={IncomingVideo} autoplay playsinline></video>
                <span class="m-2 px-2 py-0 fs-14 bg-dark rounded position-absolute start-0 bottom-0">
                    { $main.current ? $main.current : `Loading` }
                </span>
            </div>
            <div class="position-absolute w-25 bottom-0 end-0 m-2 d-flex position-relative">
                <video class="w-100 bg-black bg-opacity-50 rounded" bind:this={OutcomingVideo} autoplay muted playsinline></video>
                <span class="m-2 px-2 py-0 fs-14 bg-dark rounded position-absolute start-0 bottom-0">You</span>
            </div>
            <div class="position-absolute left-0 bottom-0 w-100 d-flex flex-row justify-content-center">
                <div class="d-flex flex-row column-gap-2 p-2">
                    <button 
                        class="phone-down-btn p-2 rounded-5 d-flex bg-danger border-0"
                        on:click={closeCall}
                    >
                        <img src={PhoneUp} class="icon" alt="Close Call" />
                    </button>
                    <button 
                        class="phone-down-btn p-2 rounded-5 d-flex bg-black bg-opacity-50 border-0"
                        on:click={ !isScreenSharing ? startScreenSharing : stopScreenSharing}
                    >
                        <img src={ !isScreenSharing ? ScreenStart : ScreenStop} alt={!isScreenSharing ? `Share Screen` : `Stop Share`} class="icon" />
                    </button>
                    <button 
                        class="phone-down-btn p-2 rounded-5 d-flex bg-black bg-opacity-50 border-0"
                        on:click={ () => volume = ! volume }
                    >
                        <img src={ !volume ? vMute : vUnmute} alt={!volume ? `Unmute` : `Mute`} class="icon" />
                    </button>
                    <button 
                        class="phone-down-btn p-2 rounded-5 d-flex bg-black bg-opacity-50 border-0"
                        on:click={ () => micVolume = !micVolume }
                    >
                        <img src={!micVolume ? mMute : mUnmute} alt={!isScreenSharing ? `Share Screen` : `Stop Share`} class="icon" />
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}
{#if $main.ringing }
<div class="ringing d-flex flex-column align-items-center justify-content-center position-absolute start-0 top-0 w-100 h-100 bg-dark">
    <div class="d-flex flex-column row-gap-3 align-items-center p-3 bg-black bg-opacity-50 shadow rounded">
        <AvatarBeam name={$main.ringing} size={64}/>
        <span class="fw-medium fs-6">{$main.ringing} is calling you</span>
        <div class="d-flex flex-row column-gap-3  justify-content-center">
            <button 
                on:click={acceptCall}
                class="border-0 bg-success p-3 d-flex phone-down-btn"
            >
                <img src={PhoneUp} class="icon" alt="Accept"/>
            </button>
            <button 
                on:click={rejectCall}
                class="border-0 bg-danger p-3 d-flex phone-down-btn"
            >
                <img src={PhoneDown} class="icon" alt="Reject"/>
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