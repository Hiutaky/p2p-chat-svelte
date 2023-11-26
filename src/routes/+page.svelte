<script>
    import { onMount } from "svelte";
    let myId = ''
    let peerId = ''
    let client = {}
    let peerConnection = false
    
    
    let message = ''
    let messages = []
    /**
     * {
     *  peer: peerId,
     *  content: message
     * }
     * 
    */

    onMount( async () => {
        const { P2PClient } = await import("$lib");
        const _client = P2PClient()
        _client.on('open', () => {
            myId = _client.id
            console.log(`Connection started: ${_client.id} `)
            client = _client
            // @ts-ignore
            _client.on("data", (data) => {
                console.log(data)
            })
        })
        _client.on('connection', (conn) => {
            console.log(`New Connection`, conn.peer)
            if( ! peerId ) {
                peerId = conn.peer
                conn.on('open', () => {
                    peerConnection = client.connect(conn.peer)
                })
            }
            //receiving messages
            conn.on('data', (message) => {
                messages = [...messages, {
                    peer: peerId,
                    content: message
                }]
                console.log(`1`, message)
            })
        })
    })

    const sendMessage = () => {
        if( !peerConnection || ! message || message === '' ) return
        messages = [...messages, {
            peer: myId,
            content: message
        }]
        peerConnection.send(
            message
        )
        message = ''
    }

    const connectToPeer = () => {
        if( ! client || peerId === '' || peerId === myId ) return
        peerConnection = client.connect(
            peerId
        )
        console.log(`Connected to ${peerId}`)
    }

</script>

<div class="container d-flex flex-column row-gap-2">
    <h2>P2P Chat Svelte</h2>
    <div class="d-flex flex-column row-gap-2 border border-black p-3 bg-black bg-opacity-50 ">
        <span>Your Id is: {myId}</span>
        {#if ! peerConnection }
        <form class="d-flex flex-row column-gap-2">
            <input 
                bind:value={peerId} 
                class="border bg-dark rounded w-100 text-white px-2"
                type="text" 
                placeholder="Enter a peer id"
            />
            <button type="button" on:click={connectToPeer} class="btn btn-primary">Connect</button>
        </form>
        {:else}
            <div class="">
                You're connected with: {peerId}
            </div>
            <div class="messages-wrapper d-flex flex-column row-gap-2 bg-dark p-2 rounded">
                {#each messages as message, i (i) }
                <div class="d-flex flex-row { message.peer === myId ? `justify-content-end` : `justify-content-start`}">
                    <div  class="message-item p-2 border border-black bg-black rounded">{message.content}</div>
                </div>
                {/each}
            </div>
            <form class="d-flex flex-row column-gap-2 w-100">
                <input bind:value={message} type="text" class="w-100 bg-dark border rounded text-white px-2" />
                <button 
                    on:click={sendMessage}
                    class="btn btn-primary"
                >Send</button>
            </form>
        {/if}
    </div>
</div>