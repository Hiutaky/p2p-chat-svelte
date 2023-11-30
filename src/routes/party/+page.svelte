<script>
    //@ts-nocheck
    import uuid4 from "uuid4";
    import { party } from "../../store/party";
    import { onMount } from "svelte";
    import RemoteVideo from "../../components/RemoteVideo.svelte";
    import { keysIncludes } from "$lib/p2p";
    import { user } from "../../store/user";

    let randomId = uuid4()
    let joinId = ''
    let CreateClient = false
    let OutVideo = false
    let incomingVideos = {}

    onMount(async () => {
        const StartClient = await import("$lib");
        CreateClient = StartClient.default
        $party.getUserMedia = async () => await navigator.mediaDevices.getUserMedia({video: true, audio: true})
    })

    $: if( OutVideo && $party.outStream )
        OutVideo.srcObject = $party.outStream

    const _maybe_start_client = (join = false) => {
        if( ! $party.client || ! $party.client.open)
        try {
            $party.client = CreateClient(randomId, 'party', 9002)
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
                    $party.id, 
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

    const createParty = async (id) => {
        _maybe_start_client()
        $party.id = randomId
    }

    const joinParty = async () => {
        if( ! joinId ) return
        $party.id = joinId
        _maybe_start_client(true)
    }


</script>

{#if !$party.id }
<div class="p-3 dbg-black bg-opacity-25 w-100 d-flex gap-3 flex-row align-items-center justify-content-center">
    <div class="d-flex flex-column row-gap-2 bg-black bg-opacity-50 p-3 rounded">
        <h3>Create a Party</h3>
        <input type="text" class="border border-dark bg-dark rounded text-white" bind:value={randomId} />
        <button 
            class="btn w-100 btn-primary"    
            on:click={createParty}
        >
            Start
        </button>
    </div>
    <div class="d-flex flex-column row-gap-2 bg-black bg-opacity-50 p-3 rounded">
        <h3>Join a Party</h3>
        <input type="text" bind:value={joinId} class="border border-dark bg-dark rounded text-white" placeholder="Enter party code" />
        <button 
            class="btn w-100 btn-primary"    
            on:click={joinParty}
        >
            Join
        </button>
    </div>
</div>
{:else}
<div>
    <div>
        you
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
{/if}