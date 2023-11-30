<script>
    //@ts-nocheck
    import { connect, keysIncludes } from "$lib/p2p";

    import { main } from "../store/main";
    import { user } from "../store/user";

    let peerId = ``


    const connectToPeer = () => {
        if( ! $main.client || peerId === '' || peerId === $user.id ) return
        if( keysIncludes($main.messages, peerId)) {
            $main.current = peerId
            peerId = ''
            return
        }
        $main.outcoming[peerId] = $main.client.connect(peerId, { label: $user.name } )

        $main.messages[peerId] = [{
            peer: $user.id,
            timestamp: new Date().getTime(),
            content: `You started a conversation.`
        }]
        /*$main.waiting = [...$main.waiting, 
            peer
        ]*/
        console.log(`Connected as ${peerId}`)
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