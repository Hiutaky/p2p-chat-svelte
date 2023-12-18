<script>
    //@ts-nocheck
    import { onDestroy, onMount } from "svelte";
    import { page } from "$app/stores";
    import PhoneUp from "$lib/images/phone-up.svg"
    import PhoneDown from "$lib/images/phone-down.svg"
    import { keysIncludes } from "$lib/p2p";
    import { user } from "../../../store/user";
    import RemoteVideo from "../../../components/RemoteVideo.svelte";
    import { defaultParty, party } from "../../../store/party";
    import PartyVideo from "../../../components/PartyVideo.svelte";
    import { main } from "../../../store/main";
    import { composeNotification, notifier } from "../../../store/notifier";
    import uuid4 from "uuid4";

    let OutVideo, CreateClient = false

    //if joiner, wait for $user.id to be valid
    $: if( CreateClient && $user.id && $party.id !== $party.partyId && ! $party.client )
        _maybe_start_client(true)

    //wait for proper video stream
    $: if( OutVideo && $party.outStream )
        OutVideo.srcObject = $party.outStream

    onMount(async () => {
        const StartClient = await import("$lib");
        CreateClient = StartClient.default
        $party.getUserMedia = async (video = true, audio = true) => await navigator.mediaDevices.getUserMedia({
            video: video, audio: audio
        })
        $party.partyId = $page.params.slug
        if( $page.url.searchParams.get('join') ) {
            $party.id = uuid4()
            if( $user.id ) {
                _maybe_start_client(true)
            }
        }else{
            $party.id = $party.partyId
            _maybe_start_client()
        }
    })
    
    onDestroy( () => {
        if( $party.client ) {
            $party.client.destroy()
            if( $party.outStream )
                $party.outStream.getTracks()?.forEach( track => track.stop() )
            if( $party.inStreams )
                Object.keys($party.inStreams).map( (key) => {
                    $party.inStreams[key].getTracks()?.forEach( track => track.stop() )
                })
            $party = defaultParty
            OutVideo = false
        }
    })

    const _maybe_start_client = (join = false) => {
        if( ! $party.client || ! $party.client.open)
            try {
                $party.client = CreateClient($party.id, 'party', 9002)
            } catch (e) {
                $notifier.notifications = [...$notifier.notifications, composeNotification({
                    peer: 'System',
                    type: 'message',
                    content: 'There was a problem connecting to the exchange server.'
                }) ]
            }
        $party.client.on('open', async () => {
            $party.outStream = await $party.getUserMedia()
            if( join ) {
                const call = $party.client.call(
                    $party.partyId, 
                    $party.outStream, 
                    {
                        metadata: {
                            name: $user.id
                        } 
                    }
                )
                call.on('stream', (remoteStream) => {
                    $party.inStreams[call.peer] = remoteStream
                    $party.peers.push(call.peer)
                })
                call.on('close', () => {
                    onStreamClose(call)
                })
                call.on('error', () => {
                    console.log('Stream error')
                })
                $party.calls[$party.partyId] = call
            }
        })
        
        $party.client.on('connection', (conn) => {
            conn.on('data', (message) => {
                if( conn.peer === $party.partyId )
                    _handle_owner_messages( message )
            })
        })
        $party.client.on('close', () => {
            console.log('close')
        })

        //on receiving call
        $party.client.on('call', async (call) => {
            if( $party.peers.includes(call.peer) ) return
            console.log('Incoming Call from: ', call.peer)
            if( ! join ) { //is creating the party
                //if party creator send peers
                $party.waiting = [...$party.waiting.filter( (_call) => _call.metadata.name !== call.metadata.name), call ]
            } else {
                call.answer($party.outStream)
                $party.calls[call.peer] = call
                call.on('stream', (remoteStream) => {
                    $party.inStreams[call.peer] = remoteStream
                    if(! $party.peers.includes(call.peer) )
                        $party.peers.push(call.peer)
                })
                call.on('close', () => {
                    onStreamClose(call)
                })
                call.on('error', () => {
                    console.log('Stream error')
                })
            }
        })
    }
    const rejectJoiner = (callIndex) => {
        const call = $party.waiting[callIndex]
        call.close()
        $party.waiting = $party.waiting.filter( (w, i) => i !== callIndex )
    }
    const acceptJoiner = (callIndex) => {
        const call = $party.waiting[callIndex]
        const receiver = $party.client.connect(call.peer)

        const messages = [{
            type: 'peers',
            value: $party.peers
        },{
            type: 'metadata',
            value: {
                name: $user.id
            }
        }]
        if( ! receiver.open )
            receiver.on('open', (conn) => {
                receiver.send(messages)
            })
        else
            receiver.send(messages)

        call.answer($party.outStream)
        call.on('stream', (remoteStream) => {
            $party.inStreams[call.peer] = remoteStream
            if( !$party.peers.includes(call.peer) )
                $party.peers.push(call.peer)
        })
        call.on('close', () => {
            onStreamClose(call)
        })
        $party.waiting = $party.waiting.filter( (w, i) => i !== callIndex )
        $party.calls[call.peer] = call
    }

    const onStreamClose = (call) => {
        let calls = {}
        let inStreams = {}
        console.log('Closing', call)
        Object.keys($party.calls).map( (key) => {
            if( key !== call.peer ) {
                calls[key] = $party.calls[key]
                inStreams[key] = $party.inStreams[key]
            }
        })
        $party.calls = calls
        $party.inStreams = inStreams
    }

    const _handle_owner_messages = (messages) => {
        console.log('Messages', messages)
        if( messages instanceof Array ) {
            for( let i = 0; i < messages.length; i++ ) {
                const message = messages[i]
                if( keysIncludes( message, 'type' ) ) {
                    switch (message.type) {
                        case 'peers':
                            _fetch_peers(message.value)
                            break;
                        case 'metadata':
                            $party.calls[$party.partyId].metadata = message.value
                            break;
                    }
                }
            }
        }
    }

    const _fetch_peers = (peers) => {
        peers = peers.filter( peer => peer !== $party.id )
        for(let i = 0; i < peers.length; i++ ) {
            const call = $party.client
                .call(
                    peers[i], 
                    $party.outStream,
                    {
                        metadata: {
                            label: $user.id
                        }
                    }
                )
            call.on('stream', (remoteStream) => {
                $party.inStreams[call.peer] = remoteStream
                $party.peers.push(call.peer)
            })
        }
    }
</script>
<div class="d-flex flex-column w-100 row-gap-2 p-3">
    <div class="party-grid w-100 gap-2">
        {#if $party.outStream}
            <PartyVideo 
                stream={$party.outStream}
                peer={$main.id}
            />
        {/if}
        {#if Object.keys($party.inStreams).length }
            {#each Object.keys($party.inStreams) as peer, i (i)}
                <RemoteVideo 
                    stream={$party.inStreams[peer]}
                    peer={$party.calls[peer]?.metadata?.name}
                />
            {/each}
        {/if}
    </div>
    <div class="position-absolute m-2 rounded bg-black bg-opacity-50 p-2 end-0 bottom-0 d-flex flex-column row-gap-2">
        <span class="fw-bold fs-13">
            Waiting Joiners
        </span>
        {#each $party.waiting as call, i (i) }
        <span 
            class="px-2 bg-dark rounded py-1 d-flex flex-row column-gap-2" 
        >
            <span>
                {call.metadata?.name}
            </span>
            <div class="d-flex flex-row gap-2 align-items-center">
                <button class="rounded-5 border-0 p-1 bg-success d-flex" on:click={ () => acceptJoiner(i)} >
                    <img alt="Accept" src={PhoneUp} class="icon" />
                </button>
                <button class="rounded-5 border-0 p-1 bg-danger d-flex" on:click={ () => rejectJoiner(i)}>
                    <img alt="Reject" src={PhoneDown} class="icon" />
                </button>
            </div>
        </span>
        {/each}
    </div>
</div>

<style>
    .icon {
        width: 12px !important;
        height: 12px !important;
    }
    .party-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
    }
    @media (min-width: 786px) {
        .party-grid {
            grid-template-columns: repeat(2, 50%);
        }
    }
    @media (min-width: 920px) {
        .party-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }
</style>