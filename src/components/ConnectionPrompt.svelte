<script>
    //@ts-nocheck
    import { connect } from "$lib/p2p";

    import { p2p } from "../store/p2p";
    import { user } from "../store/user";

    let peerId = ``


    const connectToPeer = () => {
        if( ! $p2p.client || peerId === '' || peerId === $user.id ) return
        connect(peerId, $user.name)
        $p2p.messages[peerId] = [{
            peer: $user.id,
            timestamp: new Date().getTime(),
            content: `You started a conversation.`
        }]
        /*$p2p.waiting = [...$p2p.waiting, 
            peer
        ]*/
        console.log(`Connected to ${peerId}`)
        peerId = ''
    }
</script>

<form class="d-flex flex-row column-gap-2">
    <input 
        bind:value={peerId} 
        class="border bg-dark rounded w-100 text-white px-2"
        type="text" 
        placeholder="Enter a peer id"
    />
    <button type="button" on:click={connectToPeer} class="btn btn-primary">Connect</button>
</form>