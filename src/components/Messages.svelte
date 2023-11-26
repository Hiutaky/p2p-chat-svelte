<script>
    
    //@ts-nocheck
    import { p2p } from "../store/p2p";
    import { user } from "../store/user";
    import { connect } from "$lib/p2p";
    let message = ''

    const sendMessage = () => {
        if( ! Object.keys($p2p.outcoming).includes($p2p.current) )
            connect($p2p.current, $user.name)
        const receiver = $p2p.outcoming[$p2p.current]
        const messageData = {
            peer: $user.id,
            content: message,
            timestamp: new Date().getTime()
        }
        if( ! receiver.open )
            receiver.on('open', (conn) => {
                receiver.send(messageData)
            })
        else
            receiver.send(messageData)

        if( ! Object.keys($p2p.messages).includes($p2p.current) )
            $p2p.messages[$p2p.current] = []
        $p2p.messages[$p2p.current] = [
            ...$p2p.messages[$p2p.current],
            messageData
        ]
        message = ``
    }
</script>
<div class="w-100 d-flex flex-column row-gap-2 border border-dark rounded p-2">
    {#if $p2p.current }
        <div class="fw-medium">
            {$p2p.incoming[$p2p.current]?.label}
        </div>
        <div class="messages-wrapper d-flex flex-column row-gap-2 bg-dark p-2 rounded">
            {#if Object.keys($p2p.messages).includes($p2p.current)}
                {#each $p2p.messages[$p2p.current] as message, i (i) }
                <div class="d-flex flex-row { message.peer === $user.id ? `justify-content-end` : `justify-content-start`}">
                    <div  class="message-item p-2 border border-black bg-black rounded">{message.content}</div>
                </div>
                {/each}
            {/if}
        </div>
        <form class="d-flex flex-row column-gap-2">
            <input
                type="text"
                bind:value={message}
                class="w-100 border border-dark rounded bg-dark text-white px-2"
                placeholder="Enter a message"
            >
            <button on:click|preventDefault={sendMessage} class="btn btn-primary">Send</button>
        </form>
    {:else}
        <div class=" fw-medium">
            <span class="placeholder placeholder-wave rounded">User name</span>
        </div>
        <div class="messages-wrapper d-flex flex-column row-gap-2 bg-dark p-2 rounded">
            <div class="d-flex flex-row justify-content-end">
                <div class="placeholder placeholder-wave message-item p-2 py-1 border border-black  rounded">Some text here</div>
            </div>
        </div>
    {/if}
</div>