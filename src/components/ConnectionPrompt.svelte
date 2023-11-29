<script>
    //@ts-nocheck
    import { connect, keysIncludes } from "$lib/p2p";

    import { serverGlobal } from "../store/serverGlobal";
    import { user } from "../store/user";

    let peerId = ``


    const connectToPeer = () => {
        if( ! $serverGlobal.client || peerId === '' || peerId === $user.id ) return
        if( keysIncludes($serverGlobal.messages, peerId)) {
            $serverGlobal.current = peerId
            peerId = ''
            return
        }
        $serverGlobal.outcoming[peerId] = $serverGlobal.client.connect(peerId, { label: $user.name } )

        $serverGlobal.messages[peerId] = [{
            peer: $user.id,
            timestamp: new Date().getTime(),
            content: `You started a conversation.`
        }]
        /*$serverGlobal.waiting = [...$serverGlobal.waiting, 
            peer
        ]*/
        console.log(`Connected to ${peerId}`)
        peerId = ''
    }
</script>

<form class="d-flex flex-row column-gap-2 p-3">
    <input 
        bind:value={peerId} 
        class="border bg-dark rounded w-100 text-white px-2"
        type="text" 
        placeholder="Enter a peer id"
    />
    <button type="button" on:click={connectToPeer} class="btn btn-primary">Connect</button>
</form>