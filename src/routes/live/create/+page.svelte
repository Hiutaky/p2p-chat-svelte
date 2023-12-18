<script>
    //@ts-nocheck
    import { onDestroy, onMount } from "svelte";
    import { user } from "../../../store/user";
    import { keysIncludes } from "$lib/p2p";
    import LiveMessages from "../../../components/LiveMessages.svelte";
    import RemoteVideo from "../../../components/RemoteVideo.svelte";
    import AvatarBeam from "../../../components/AvatarBeam.svelte";
    import Eye from "$lib/images/eye.svg"
    import { stopTracks } from "$lib/utilities";

    let CreateClient = false
    let VideoElement = false
    let explore = {
        client: false,
    }

    let state = {
        connected: false,
        client: false,
        openConnections: {},//array containing open data connections
        relays: [], //array containing relays IDs
        peers: [] // array containing all the peers
    }
    let outstream = false
    let messages = []
    let viewersInterval = false
    let liveData = {
        title: `My sexy live`,
        image: false,
        viewers: 0
    }

    $: if( outstream && VideoElement )
        VideoElement.srcObject = outstream

    onMount(async () => {
        const StartClient = await import("$lib");
        CreateClient = StartClient.default
    })
    onDestroy( () => {
        clearInterval(viewersInterval)
        if( state.client )
            state.client.destroy()
        if( outstream )
            stopTracks(outstream)
    })

    const onConnected = (peer) => {
        if( ! state.peers.includes(peer) ) {
            state.peers.push(peer)
        }
    }
    const onConnect = (peer) => {
        if( state.relays.filter( _peer => _peer !== peer ).length < 1 ) {
            console.log('Request to Connect via Streamer')
            state.openConnections[peer] = state.client.connect(peer)
            const call = state.client.call(peer, outstream)
            if( ! state.relays.includes(peer ) )
                state.relays.push(peer)
        }else {
            console.log('Request to Connect via Relay')
            const waitingReceiver = state.client.connect(peer)
            waitingReceiver.on('open', () => {
                const relayID = state.relays[state.relays.length-1]
                waitingReceiver.send({
                    type: "RELAY_ID",
                    value: relayID
                })
                state.openConnections[relayID].send({
                    type: "STREAM_TO",
                    value: peer
                })
                waitingReceiver.close()
            })
        }
    }
    const onMessage = (peer, message) => {
        if( ! peer in state.peers ) return
        const msg = message.value
        messages = [...messages, msg]
        broadcastMessage(message)
    }

    const broadcastMessage = (message) => {
        for( const connection in state.openConnections ) {
            state.openConnections[connection].send(message)
        }
    }

    const startRecording = async () => {
        const getUserMedia = async () => await navigator.mediaDevices.getUserMedia({video: true, audio: true})
        outstream = await getUserMedia()
    }

    const startExploreClient = () => {
        explore.client = CreateClient($user.id, 'live-explore', 9005)
        explore.client.on('open', () => {
            console.log('Live Explore ready')
        })
        explore.client.on('connection', (conn) => {
            conn.on('data', (message) => {
                console.log(message)
            })
        })
    }

    const onLiveInfo = (peer) => {
        const conn = state.client.connect(peer)
        conn.on('open', () => {
            const payload = {
                type: 'LIVE_INFO',
                value: {
                    ...liveData,
                    viewers: state.peers.length,
                }
            }
            console.log(payload)
            conn.send(payload)
        })
    }

    const createLive = async () => {
        state.client = CreateClient($user.id, 'live', 9004)
        startExploreClient()
        state.client.on('open', async () => {
            console.log('Live ready')
            state.connected = true
            viewersInterval = setInterval( () => {
                broadcastMessage({
                    type: 'VIEWERS_COUNT',
                    value: state.peers.length
                })
            }, 6000 )
        })
        state.client.on('connection', async (conn) => {
            conn.on('close', () => {
                if( state.relays.includes(conn.peer) )
                    state.relays = state.relays.filter( peer => peer !== conn.peer )
                state.peers = state.peers.filter(peer => peer !== conn.peer )
            })
            conn.on('data', (message) => {
                console.log( `New Message from ${conn.peer}`, message)
                if( keysIncludes(message, 'type') ) {
                    switch (message.type) {
                        case 'CONNECT':
                            onConnect(conn.peer)
                            break;
                        case 'CONNECTED':
                            onConnected(conn.peer)
                            break;
                        case 'MESSAGE':
                            onMessage(conn.peer, message)
                            break;
                        case 'LIVE_INFO':
                            onLiveInfo(conn.peer)
                            break;
                        default:
                            return
                    }
                }
            })
        })

        state.client.on('call', function() {
            return
        })
    }

    const sendMessage = ( message ) => {
        const messageData = {
            peer: $user.id,
            timestamp: new Date().getTime(),
            content: message
        }
        messages = [...messages, messageData]
        broadcastMessage({
            type: 'MESSAGE',
            value: messageData
        })
    }


    const getScreenshot = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = VideoElement.videoWidth
        canvas.height = VideoElement.videoHeight
        try {
            context.drawImage(VideoElement, 0, 0)
            const frame = canvas.toDataURL("image/png")
            return frame
        } catch(e) {
            console.log(e)
        }
    }
</script>


<div class="live-wrapper h-100 w-100 overflow-auto">
    <div class="d-flex flex-column row-gap-3 bg-black bg-opacity-50 p-3">
        <h3>Viewers</h3>
        {#each state.peers as peer, i (i) }
            <a href="/chat/{peer}" class="d-flex border border-dark flex-row align-items-center  justify-content-between gap-3 text-white p-3 py-2 bg-dark rounded">
                <span class="d-flex flex-row align-items-center gap-3">
                    <AvatarBeam name={peer} />
                    <span>
                        {peer}
                    </span>
                </span>
                <div class="bg-success pulse justify-self-end online-pointer"></div>
            </a>
        {/each}
    </div>
    <div class="d-flex flex-column row-gap-3 p-3">
        <div class="position-relative">
            <RemoteVideo 
                stream={outstream}
                setScreenshot={ state.client.connected ? (value) => liveData.image = value : false }
            />
            {#if ! outstream}
            <div class="position-absolute w-100 h-100 start-0 top-0 d-flex flex-column align-items-center justify-content-center">
                <button 
                    on:click={startRecording}
                    class="btn btn-primary"
                >
                    Start Recording
                </button>
            </div>
            {:else if ! state.client}
            <div class="position-absolute w-100 h-100 start-0 top-0 d-flex flex-column align-items-center justify-content-center">
                <button 
                    on:click={createLive}
                    class="btn btn-primary"
                >
                    Start Live
                </button>
            </div>
            {/if}
        </div>
        <div class="d-flex flex-row justify-content-between">
            <span class="">{ ! outstream ? `Waiting for video` : !state.client ? `Waiting for live` : `Connected`}</span>
            <span class="d-flex flex-row px-2 py-1 gap-2 fw-semibold align-items-center rounded bg-black bg-opacity-50">
                <img src={Eye} class="icon" />
                <span>
                    {state.peers.length}
                </span>
            </span>
        </div>
    </div>
    <div class="d-flex flex-column row-gap-3 bg-black bg-opacity-50 p-3 overflow-auto">
        <h3>Chat</h3>
        <LiveMessages 
            messages={messages}
            sendMessage={sendMessage}
        />
    </div>
</div>
<style>
    .live-wrapper {
        display: grid;
        grid-template-columns: 25% 1fr 25%;
        grid-template-rows: 1;
    }
</style>