<script>
    //@ts-nocheck
    import Messages from "./Messages.svelte";
    import ChatVideo from "./ChatVideo.svelte";
    import { serverGlobal } from "../store/serverGlobal";
    import AvatarBeam from "./AvatarBeam.svelte";
    import Camera from "$lib/images/camera.svg"
    
    export let className = 'd-grid overflow-auto'
    const initVideoCall = async () => {
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices.GetUserMedia;
        await getUserMedia({video: true, audio: true}, function(stream) {
            $serverGlobal.currentCall = $serverGlobal.current
            const call = $serverGlobal.client.call($serverGlobal.current, stream);
            $serverGlobal.outcomingStream = stream
            $serverGlobal.calls[$serverGlobal.current] = call
            call.on('stream', function(remoteStream) {
                console.log('Stream:', remoteStream)
                $serverGlobal.incomingStream = remoteStream
            })
            call.on('close', function() {
                console.log('Peer Closed Connection')
                if( $serverGlobal.outcomingStream )
                    $serverGlobal.outcomingStream.getTracks().forEach((track) => track.stop() )
                if( $serverGlobal.incomingStream )
                    $serverGlobal.incomingStream.getTracks().forEach((track) => track.stop() )
                delete $serverGlobal.calls[$serverGlobal.current]
                $serverGlobal.incomingStream = false
                $serverGlobal.outcomingStream = false
            })
            call.on('error', (err) => {
                console.log('error', err)
            })
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        })
    }
</script>

<div class="position-relative {className} w-100 flex-column p-3 bg-black bg-opacity-25">
    <div class="d-flex flex-row align-items-center justify-content-between mb-3">
        <div class="d-flex flex-row column-gap-2 align-items-center fw-medium">
            <AvatarBeam  name={$serverGlobal.current} />
            <span class="{$serverGlobal.current ? `` : `placeholder placeholder-wave rounded`}">
                {$serverGlobal.current ? $serverGlobal.current : 'Username here'}
            </span>
        </div>
        <button class="p-2 d-flex bg-dark border border-opacity-50 rounded-3">
            <img src={Camera} class='icon' on:click={initVideoCall} />
        </button>
    </div>
    <div class=" position-relative d-flex flex-column flex-lg-row gap-3 overflow-auto align-items-start">
        <ChatVideo />
        <Messages />
    </div>
</div>

