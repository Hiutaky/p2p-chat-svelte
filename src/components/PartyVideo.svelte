<script>
    //@ts-nocheck
    import PhoneDown from "$lib/images/phone-down.svg"
    import PhoneUp from "$lib/images/phone-up.svg"
    import ScreenStart from "$lib/images/screen-start.svg"
    import ScreenStop from "$lib/images/screen-stop.svg"
    import vMute from "$lib/images/volume-mute.svg"
    import vUnmute from "$lib/images/volume-loud.svg"
    import mMute from "$lib/images/microphone-muted.svg"
    import mUnmute from "$lib/images/microphone.svg"
    import CameraUp from "$lib/images/camera-up.svg"
    import CameraDown from "$lib/images/camera-down.svg"
    import { goto } from "$app/navigation";
    import { party } from "../store/party";
    import { stopTracks } from "$lib/utilities";

    export let peer = false

    let OutcomingVideo = false

    //
    let isScreenSharing = false
    let disabledVideoStream = false
    let volume = 1
    let micVolume = 1

    $: if( OutcomingVideo && $party.outStream ) {
        if( ! OutcomingVideo.srcObject)
            OutcomingVideo.srcObject =  $party.outStream
        else 
            OutcomingVideo.srcObject =  $party.outStream
    }
    
    $: $party.outStream.getAudioTracks().forEach( (track) => track.enabled = micVolume )
    const displayMediaOptions = {
        video: {
            displaySurface: "window",
        },
        audio: false,
    }

    const _change_source = (_stream, replaceAudio = true) => {
        $party.outStream = _stream
        Object.keys($party.calls).map( (key) => {
            const { peerConnection } = $party.calls[key]
            peerConnection.getSenders().forEach((sender) => {
                sender.track.stop()
                if(replaceAudio && sender.track.kind === "audio" && _stream.getAudioTracks().length > 0){
                    sender.replaceTrack(_stream.getAudioTracks()[0]);
                }
                if( (isScreenSharing || !disabledVideoStream) && sender.track.kind === "video" && _stream.getVideoTracks().length > 0) {
                    sender.replaceTrack(_stream.getVideoTracks()[0]);
                }
            })
        })
    }

    const _maybe_start_video_tracks = () => {
        $party.outStream.getVideoTracks().forEach( (track) => track.enabled = true )
    }


    const stopScreenSharing = async () => {
        isScreenSharing = false
        const stream = await $party.getUserMedia({video: ! disabledVideoStream, audio: true})
        stopTracks($party.outStream)
        _change_source(stream, true)
        _maybe_start_video_tracks()
    }
    const startScreenSharing = async () => {
        isScreenSharing = true
        const _stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        _change_source(_stream, false)
        _stream.getVideoTracks()[0].addEventListener('ended', async () => {
            await stopScreenSharing()
        })
        _maybe_start_video_tracks()
    }

    const closeCall = () => {
        if( $party.outStream )
            stopTracks($party.outStream)

        Object.keys($party.inStreams).map( (key) => {
            stopTracks($party.inStreams[key])
            $party.calls[key].close()
        })
        $party.outStream = false
        $party.inStreams = []
        isScreenSharing = false
        goto(`/party`)

    }
    const toggleVideoStream = () => {
        if( isScreenSharing ) return
        $party.outStream.getVideoTracks().forEach( (track) => track.enabled = disabledVideoStream )
        disabledVideoStream = ! disabledVideoStream
    }
</script>


<div class="w-100 video-wrapper position-relative d-flex flex-column flex gap-3 align-items-start">
    <div class="w-100 d-flex position-relative">
        <div class="w-100 rounded position-relative">
            <video class="d-flex h-100 bg-dark w-100 rounded" bind:this={OutcomingVideo} autoplay muted playsinline></video>
            <span class="m-2 px-2 py-0 fs-14 bg-dark rounded position-absolute start-0 bottom-0">
                { 'You' }
            </span>
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
                    on:click={ toggleVideoStream }
                >
                    <img src={ disabledVideoStream ? CameraDown : CameraUp } alt={!isScreenSharing ? `Share Screen` : `Stop Share`} class="icon" />
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