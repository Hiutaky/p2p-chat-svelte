<script>
    
    //@ts-nocheck
    import { p2p } from "../store/p2p";
    import { user } from "../store/user";
    import { connect } from "$lib/p2p";
    import AvatarBeam from "./AvatarBeam.svelte";
    let message = ''

    const getHours = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

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
<div class="grid w-100 flex-column row-gap-3 p-3 bg-black bg-opacity-25">
    <div class="d-flex flex-row column-gap-2 align-items-center fw-medium">
        <AvatarBeam  name={$p2p.current} />
        <span class="{$p2p.current ? `` : `placeholder placeholder-wave`}">
            {$p2p.incoming[$p2p.current]?.label}
        </span>
    </div>
    <div class="messages-wrapper d-flex flex-column row-gap-1 bg-dark p-2 rounded">
        {#if Object.keys($p2p.messages).includes($p2p.current)}
            {#each $p2p.messages[$p2p.current] as message, i (i) }
            <div class="{ i > 0 && $p2p.messages[$p2p.current][i-1].peer !== message.peer ? 'mt-2' : ''} d-flex flex-row { message.peer === $user.id ? `justify-content-end` : `justify-content-start`}">
                <div  class="d-flex gap-3 justify-content-between message-item py-1 px-3 {  message.peer === $user.id ? 'bg-user' : ' bg-black bg-opacity-50'} rounded-1">
                    {message.content}
                    <div class="fs-13 text-opacity-50 text-white align-self-end">{ getHours(message.timestamp) }</div>
                </div>
            </div>
            {/each}
        {:else}
            <div class="d-flex flex-row justify-content-end ">
                <div  class="placeholder placeholder-wave d-flex gap-3 justify-content-between message-item py-1 px-3 bg-light rounded-1">
                    Some text here
                    <div class="fs-13 text-opacity-50 text-white align-self-end">00:00</div>
                </div>
            </div>
            <div class="d-flex flex-row justify-content-start mt-3 ">
                <div  class="placeholder placeholder-wave d-flex gap-3 justify-content-between message-item py-1 px-3 bg-light rounded-1">
                    Some other text here text here
                    <div class="fs-13 text-opacity-50 text-white align-self-end">00:00</div>
                </div>
            </div>
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
</div>

<style>
    .message-item {
        max-width: 85%;
    }
    .bg-user {
        background: #35a9bc;
    }
    .grid {
        display: grid;
        grid-template-rows: max-content 1fr max-content;
        height: inherit;
    }
</style>