<script>
    //@ts-nocheck
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import RemoteVideo from "../../../components/RemoteVideo.svelte";
    import { party } from "../../../store/party";
    import { user } from "../../../store/user";
    import uuid4 from "uuid4";

    let OutVideo, CreateClient

    onMount(async () => {
        const StartClient = await import("$lib");
        CreateClient = StartClient.default
        $party.getUserMedia = async () => await navigator.mediaDevices.getUserMedia({video: true, audio: true})
        $party.partyId = $page.params.slug
        if( ! $page.url.searchParams.get('join') ) {
            $party.id = $party.partyId
            createParty()
        }else {
            $party.id = uuid4()
            joinParty()
        }
    })
    

    $: if( OutVideo && $party.outStream )
        OutVideo.srcObject = $party.outStream

    const _maybe_start_client = (join = false) => {
        if( ! $party.client || ! $party.client.open)
        try {
            $party.client = CreateClient($party.id, 'party', 9002)
        } catch (e) {
            $party.connected = false
            console.error(e)
        }
        $party.client.on('open', async () => {
            $party.connected = true
            $party.outStream = await $party.getUserMedia()
            if( join ) {
                //creating call
                const call = $party.client.call(
                    $party.partyId, 
                    $party.outStream
                )
                call.on('stream', (remoteStream) => {
                    $party.inStreams[call.peer] = remoteStream
                    $party.peers.push(call.peer)
                })
            }
        })
        $party.client.on('connection', (conn) => {
            conn.on('data', (message) => {
                if( keysIncludes(message, 'peers') ) {
                    _fetch_peers(message.peers)
                }
            })
        })
        $party.client.on('close', () => {
            console.log('close')
        })

        //on receiving call
        $party.client.on('call', async (call) => {
            if( $party.peers.includes(call.peer) ) return
            console.log('Incoming Call from: ', call.peer)
            if( ! join ) {
                //if party creator send peers
                console.log(`Sending Peers`, call.peer)
                const receiver = $party.client.connect(call.peer)
                const messageData = {
                    peers: $party.peers
                }
                if( ! receiver.open )
                    receiver.on('open', (conn) => {
                        receiver.send(messageData)
                    })
                else
                    receiver.send(messageData)
            }
            call.answer($party.outStream)
            call.on('stream', (remoteStream) => {
                $party.inStreams[call.peer] = remoteStream
                if(! $party.peers.includes(call.peer) )
                    $party.peers.push(call.peer)
            })
        })
    }

    const _fetch_peers = (peers) => {
        peers = peers.filter( peer => peer !== randomId )
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

    const createParty = async () => {
        _maybe_start_client()
    }

    const joinParty = async () => {
        _maybe_start_client(true)
    }
</script>
<div class="d-flex flex-column row-gap-2 p-3">
    <div class="bg-danger px-2 py-1 text-white rounded fw-bold">
        ! Party feature is still in beta !
    </div>
    <div>Party Id {$party.partyId}</div>
    <div class="">Sharable party 
        <span class="bg-black bg-opacity-50 px-2 py-1 rounded">
            {window.location.origin}/party/{$party.partyId}?join=true
        </span>
    </div>
    <div>Your Id {$party.id}</div>
    <div>
        You
        {#if $party.outStream}
        <video bind:this={OutVideo} autoplay />
        {/if}
    </div>
    <div>
        {#each Object.entries($party.inStreams) as [peer,stream] (peer)}
        <RemoteVideo props={{
            stream: stream,
            peer: peer
        }} />
        {/each}
    </div>
</div>