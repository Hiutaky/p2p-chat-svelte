<script>
    //@ts-nocheck
    import { onMount } from "svelte";
    import {user} from "../store/user"
    import {p2p} from "../store/p2p"
    import UserDetails from "../components/UserDetails.svelte";
    import ConnectionPrompt from "../components/ConnectionPrompt.svelte";
    import Messages from "../components/Messages.svelte";
    import ChatList from "../components/ChatList.svelte";
    let client = {}
    let peerId = ''
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

    /*onMount( async () => {
        const { P2PClient } = await import("$lib");
        client = P2PClient()
        client.on('open', () => {
            $user.id = client.id
            console.log(`Ready to receive Connection`)
        })

        client.on('connection', (conn) => {
            console.log(`New Incoming Connection`, conn.peer)
            if( ! peerId ) {
                $p2p.waiting = [...$p2p.waiting, conn.peer]
                peerId = conn.peer
                //after approval
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
    })*/

    const sendMessage = () => {
        if( !peerConnection || ! message || message === '' ) return
        messages = [...messages, {
            peer: $user.id,
            content: message
        }]
        peerConnection.send(
            message
        )
        message = ''
    }
    const approveConnection = (key) => {
        $p2p.connected[key] = 
            $p2p.client.connect(
                $p2p.waiting[key].peer,
                {
                    label: $user.id
                }
            )
        delete $p2p.waiting[key]
    }


</script>

<div class="container-md d-flex flex-column row-gap-2 py-5">
    <h2>P2P Chat Svelte</h2>
    <div class="d-flex flex-column row-gap-2 border border-dark shadow rounded p-3 bg-black bg-opacity-50 ">
        <UserDetails />
        {#if ! $user.name }
        <div></div>
        {:else if ! peerConnection }
        <ConnectionPrompt />
        {/if}
        <div class="d-flex flex-md-row flex-column gap-2">
            <ChatList />
            <Messages />
        </div>
    </div>
</div>

<style>
    .fs-14 {
        font-size: 14px;
    }
    .fs-13 {
        font-size: 13px;
    }
</style>