<script>
    //@ts-nocheck
    import { onDestroy, onMount } from "svelte";
    import { page } from "$app/stores";
    import { user } from "../../../store/user";
    import AvatarBeam from "../../../components/AvatarBeam.svelte";
    import LiveMessages from "../../../components/LiveMessages.svelte";
    import RemoteVideo from "../../../components/RemoteVideo.svelte";
    import Eye from "$lib/images/eye.svg"

    let CreateClient = false
    let state = {
        liveId: false,
        connected: false,
        liveClient: false,
        client: false,
        instream: false,
        
    }
    let peers = []
    let openConnections = {}
    let viewers = 0
    let messages = []


    $: if( $user.id && state.liveId && ! state.client )
        connectLive()

    onMount(async () => {
        const StartClient = await import("$lib");
        state.liveId = $page.params.slug
        CreateClient = StartClient.default
    })

    onDestroy( () => {
        if( state.client )
        state.client.destroy()
    })

    const connectLive = async () => {
        state.client = CreateClient($user.id, 'live', 9004)
        state.client.on('open', async () => {
            console.log('Live Peer ready')
            state.liveClient = state.client.connect(state.liveId)
            state.liveClient.on('open', (conn) => {
                state.liveClient.send({
                    type: "CONNECT"
                })
            })
        })
        
        state.client.on('connection', (conn) => {
            conn.on('data', (message) => {
                //handling requests from Streamer
                if( conn.peer === state.liveId ) {
                    if( message.type === 'RELAY_ID')
                        state.safeRelayId = message.value
                    if( message.type === 'STREAM_TO' ) {
                        if( ! peers.includes(message.value) ) {
                            peers = [...peers, message.value]
                            openConnections[message.value] = state.client.connect(message.value)
                        }
                        const call = state.client.call(message.value, state.instream)
                        call.on('close', () => {
                            peers = peers.filter( peer => peer !== message.value)
                            delete openConnections[message.value]
                        })
                    }
                }
                //handling requests from Safe Relay ID or Broadcaster
                if( conn.peer === state.safeRelayId || conn.peer === state.liveId ) {
                    switch (message.type) {
                        case 'MESSAGE':
                            onMessage(message.value)
                            break;
                        case 'VIEWERS_COUNT':
                            onViewersCount(message.value)
                            break;
                    }
                    //broadcasting
                    broadcastMessage(message)
                }
            })
        })

        const broadcastMessage = (message) => {
            for( const connection in openConnections ) {
                openConnections[connection].send( message )
            }
        }
        const onViewersCount = (message) => {
            viewers = message
        }
        const onMessage = (message) => {
            messages = [...messages,  message ]
        }

        state.client.on('call', function(conn) {
            console.log(conn.peer, state.liveId, conn.peer, state.safeRelayId )
            if( conn.peer === state.liveId || conn.peer === state.safeRelayId ) {
                conn.answer(new MediaStream())
                conn.on('stream', (inStream) => {
                    if( state.connected ) return
                    state.connected = true
                    state.instream = inStream
                    state.liveClient.send({
                        type: 'CONNECTED'
                    })
                })
            }
            conn.on('close', () => {
                console.log('Stream Closed')
                state.connected = false
                state.liveClient.send({
                    type: 'CONNECT'
                })
            })
        })
    }

    const sendMessage = (message) => {
        state.liveClient.send({
            type: 'MESSAGE',
            value: {
                peer: $user.id,
                content: message,
                timestamp: new Date().getTime()
            }
        })
    }

</script>

<div class="live-wrapper h-100 w-100 overflow-auto">
    <div class="d-flex flex-column row-gap-3 bg-black bg-opacity-50 p-3">
        <h3>Viewers</h3>
        {#each peers as peer }
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
        <RemoteVideo 
            props={{
                stream: state.instream,
                peer: state.safeRelayId || state.liveId
            }}
        />
        <div class="d-flex flex-row justify-content-between">
            <span class={state.safeRelayId || state.liveId ? `` : `placeholder rounded`}>Connected to {state.safeRelayId || state.liveId}</span>
            <span class="d-flex flex-row px-2 py-1 gap-2 fw-semibold align-items-center rounded bg-black bg-opacity-50">
                <img src={Eye} class="icon" />
                <span>
                    {viewers}
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