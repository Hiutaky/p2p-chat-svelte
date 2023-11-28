<script>
    
    //@ts-nocheck
    import { p2p } from "../store/p2p";
    import { user } from "../store/user";
    import { connect, keysIncludes } from "$lib/p2p";
    import AvatarBeam from "./AvatarBeam.svelte";
    import Camera from "$lib/images/camera.svg"
    import PhoneDown from "$lib/images/phone-down.svg"
    import PhoneUp from "$lib/images/phone-up.svg"
    import { afterUpdate, beforeUpdate } from "svelte";
    let message = ''
    let autoscroll = false;


    let IncomingVideo, OutcomingVideo = false
    let MessageWrapper = false

    beforeUpdate(() => {
        if (MessageWrapper) {
            const scrollableDistance = MessageWrapper.scrollHeight - MessageWrapper.offsetHeight;
            autoscroll = MessageWrapper.scrollTop > scrollableDistance - 20;
        }
    });

    afterUpdate(() => {
        if (autoscroll) {
            MessageWrapper.scrollTo(0, MessageWrapper.scrollHeight);
        }
    });
    $: if( IncomingVideo && $p2p.incomingStream)
        IncomingVideo.srcObject = $p2p.incomingStream
    $: if( OutcomingVideo && $p2p.outcomingStream ) 
        OutcomingVideo.srcObject =  $p2p.outcomingStream


    const getHours = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    const sendMessage = () => {
        if( ! Object.keys($p2p.outcoming).includes($p2p.current) )
            $p2p.outcoming[$p2p.current] = $p2p.client.connect($p2p.current, {
                label: $user.name
            })

        const receiver = $p2p.outcoming[$p2p.current]
        const messageData = {
            peer: $user.id,
            content: message,
            timestamp: new Date().getTime()
        }
        if( ! receiver.open )
            receiver.on('open', (conn) => {
                receiver.send(messageData)
            })
        else
            receiver.send(messageData)

        if( ! Object.keys($p2p.messages).includes($p2p.current) )
            $p2p.messages[$p2p.current] = []
        $p2p.messages[$p2p.current] = [
            ...$p2p.messages[$p2p.current],
            messageData
        ]
        message = ``
    }
    const initVideoCall = async () => {
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices.GetUserMedia;
        await getUserMedia({video: true, audio: true}, function(stream) {
            console.log('Outcoming Video Steam')
            $p2p.currentCall = $p2p.current
            const call = $p2p.client.call($p2p.current, stream);
            $p2p.outcomingStream = stream
            $p2p.calls[$p2p.current] = call
            call.on('stream', function(remoteStream) {
                console.log('Stream:', remoteStream)
                $p2p.incomingStream = remoteStream
            })
            call.on('close', function() {
                stream.getTracks().forEach( (track) => track.stop() )
                delete $p2p.calls[$p2p.current]
                $p2p.incomingStream = false
                $p2p.outcomingStream = false
            })
            call.on('error', (err) => {
                console.log('error', err)
            })
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        })
    }
    const closeCall = () => {
        if( keysIncludes($p2p.calls, $p2p.currentCall) ) {
            if( $p2p.outcomingStream )
                $p2p.outcomingStream.getTracks().forEach( (track) => track.stop() )
            if( $p2p.incomingStream )
                $p2p.incomingStream.getTracks().forEach( (track) => track.stop() )
            $p2p.outcomingStream = false
            $p2p.incomingStream = false
            $p2p.calls[$p2p.current].close()
            delete $p2p.calls[$p2p.current]
        }
    }
    const acceptCall = async () => {
        if( ! $p2p.ringing ) return
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices.GetUserMedia;
        await getUserMedia({video: true, audio: true}, function(stream) {
            $p2p.outcomingStream = stream
            $p2p.calls[$p2p.currentCall].answer(stream)
            $p2p.calls[$p2p.currentCall].on('stream', function(remoteStream) {
                $p2p.incomingStream = remoteStream
            })
            $p2p.calls[$p2p.currentCall].on('close', function(remoteStream) {
                stream.getTracks().forEach( (track) => track.stop() )
                $p2p.outcomingStream = false
                $p2p.incomingStream = false
                delete $p2p.calls[$p2p.currentCall]
            })
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        });
        $p2p.ringing = false
    }
    const rejectCall = () => {
        if( ! $p2p.ringing ) return
        if( keysIncludes($p2p.calls, $p2p.currentCall ) ) {
            $p2p.calls[$p2p.currentCall].close()
            $p2p.currentCall = false
            $p2p.ringing = false
        }
    }

</script>

<div class="position-relative grid w-100 flex-column row-gap-3 p-3 bg-black bg-opacity-25">
    <div class="d-flex flex-row align-items-center justify-content-between">
        <div class="d-flex flex-row column-gap-2 align-items-center fw-medium">
            <AvatarBeam  name={$p2p.current} />
            <span class="{$p2p.current ? `` : `placeholder placeholder-wave`}">
                {$p2p.current}
            </span>
        </div>
        <div >
            <img src={Camera} class='icon' on:click={initVideoCall} />
        </div>
    </div>
    {#if $p2p.ringing }
    <div class="d-flex flex-column align-items-center justify-content-center position-absolute start-0 top-0 w-100 h-100 bg-dark">
        <div class="d-flex flex-column row-gap-3 align-items-center p-3 bg-black bg-opacity-50 shadow rounded">
            <AvatarBeam name={$p2p.ringing} size={64}/>
            <span class="fw-medium fs-6">{$p2p.ringing} is calling you</span>
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
    <div class="d-flex flex-column flex-md-row gap-3 align-items-start">
        {#if $p2p.incomingStream || $p2p.outcomingStream }
            <div class="video-wrapper position-relative d-flex flex-column flex-md-row gap-3 align-items-start">
                <div class="w-100 rounded position-relative">
                    <video class="d-flex h-100 bg-dark w-100 rounded" bind:this={IncomingVideo} autoplay playsinline></video>
                    <span class="m-2 px-2 py-0 fs-14 bg-dark rounded position-absolute start-0 bottom-0">{ $p2p.current }</span>
                </div>
                <div class="position-absolute w-25 bottom-0 end-0 m-2 d-flex position-relative">
                    <video class="w-100 rounded" bind:this={OutcomingVideo} autoplay muted playsinline></video>
                    <span class="m-2 px-2 py-0 fs-14 bg-dark rounded position-absolute start-0 bottom-0">You</span>
                </div>
                <div class="position-absolute left-0 bottom-0 w-100 d-flex flex-row justify-content-center">
                    <div class="d-flex flex-row column-gap-2 p-2">
                        <button 
                            class="phone-down-btn p-3 bg-danger border-0"
                            on:click={closeCall}
                        >
                            <img src={PhoneDown} class="icon" />
                        </button>
                    </div>
                </div>
            </div>
        {/if}
        <div class="w-100 d-flex flex-column gap-2 chat-wrapper">
            <div class="messages-wrapper d-flex flex-column row-gap-1 bg-dark p-2 rounded" bind:this={MessageWrapper}>
                {#if Object.keys($p2p.messages).includes($p2p.current)}
                    {#each $p2p.messages[$p2p.current] as message, i (i) }
                    <div 
                        key={i}
                        class="{ i > 0 && $p2p.messages[$p2p.current][i-1].peer !== message.peer ? 'mt-2' : ''} d-flex flex-row { message.peer === $user.id ? `justify-content-end` : `justify-content-start`}"
                    >
                        <div  class="d-flex gap-3 justify-content-between message-item py-1 px-3 {  message.peer === $user.id ? 'bg-user' : ' bg-black bg-opacity-50'} rounded-1">
                            {message.content}
                            <div class="fs-13 text-opacity-50 text-white align-self-end">{ getHours(message.timestamp) }</div>
                        </div>
                    </div>
                    {/each}
                {:else}
                    <div class="d-flex flex-row justify-content-end ">
                        <div  class="placeholder placeholder-wave d-flex gap-3 justify-content-between message-item py-1 px-3 bg-light rounded-1">
                            Some text here
                            <div class="fs-13 text-opacity-50 text-white align-self-end">00:00</div>
                        </div>
                    </div>
                    <div class="d-flex flex-row justify-content-start mt-3 ">
                        <div  class="placeholder placeholder-wave d-flex gap-3 justify-content-between message-item py-1 px-3 bg-light rounded-1">
                            Some other text here text here
                            <div class="fs-13 text-opacity-50 text-white align-self-end">00:00</div>
                        </div>
                    </div>
                {/if}
            </div>
            <form class="d-flex flex-row column-gap-2">
                <input
                    type="text"
                    bind:value={message}
                    class="w-100 border border-dark rounded bg-dark text-white px-2"
                    placeholder="Enter a message"
                >
                <button on:click|preventDefault={sendMessage} class="btn btn-primary">Send</button>
            </form>
        </div>
    </div>
</div>

<style>
    .messages-wrapper {
        overflow: overlay;
        width: 100%;
        max-height: 100%;
        max-height: 70vh;
        min-height: 70vh;
    }
    @media (min-width: 768px) {
        .video-wrapper {
            width: 100%;
        }
        .chat-wrapper {
            min-width: 33%;
        }
    }
    .phone-down-btn {
        border-radius: 100%;
    }
    .message-item {
        max-width: 85%;
    }
    .bg-user {
        background: #35a9bc;
    }
    .grid {
        display: grid;
        grid-template-rows: max-content 1fr max-content;
        height: inherit;
    }
</style>