<script>
    
    //@ts-nocheck
    import { main } from "../store/main";
    import { user } from "../store/user";
    import { afterUpdate, beforeUpdate, onMount } from "svelte";
    let message = ''

    let MessageWrapper = false
    let height = 0

    $: messages = $main.messages[$main.current]
    $: if( $main.current && MessageWrapper) {
        MessageWrapper.scrollTo(0, MessageWrapper.scrollHeight)
    }

    let peer = false
    beforeUpdate( () => {
        peer = $main.current
    })

    afterUpdate( () => {
        if( peer !== $main.current)
            MessageWrapper.scrollTo(0, MessageWrapper.scrollHeight)

        return
        if( height === 1 )
            MessageWrapper.scrollBottom()
        else if( height < MessageWrapper.scrollHeight )
            MessageWrapper.scrollTo({
                top: MessageWrapper.scrollHeight,
                left: 0,
                behavior: "smooth",
            })
    })

    const getHours = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`
    }

    const sendMessage = () => {
        if( ! Object.keys($main.outcoming).includes($main.current) )
            $main.outcoming[$main.current] = $main.client.connect($main.current, {
                label: $user.name
            })
        const receiver = $main.outcoming[$main.current]
        if( ! receiver ) return
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

        if( ! Object.keys($main.messages).includes($main.current) )
            $main.messages[$main.current] = []
        $main.messages[$main.current] = [
            ...$main.messages[$main.current],
            messageData
        ]
        message = ``
    }

</script>
<div class="w-100 d-flex flex-column gap-2 chat-wrapper  overflow-auto h-100">
    <div 
        class="messages-wrapper {$main.current} scroller bg-dark overflow-scroll d-flex flex-column row-gap-1 p-2 rounded h-100" 
        bind:this={MessageWrapper}
    >
        {#if Object.keys($main.messages).includes($main.current)}
            {#each messages.slice(messages.length-20, messages.length) as message, i (i) }
            <div
                key={i}
                class="{ i > 0 && $main.messages[$main.current][i-1].peer !== message.peer ? 'mt-2' : ''} d-flex flex-row { message.peer === $user.id ? `justify-content-end` : `justify-content-start`}"
            >
                <div class="d-flex gap-3 justify-content-between message-item py-1 px-3 {  message.peer === $user.id ? 'bg-user' : ' bg-black bg-opacity-50'} rounded-1">
                    {message.content}
                    <div class="fs-13 text-opacity-50 text-white align-self-end">{ getHours(message.timestamp) }</div>
                </div>
            </div>
            {/each}
            <div class="anchor"></div>
        {:else}
            <div class="d-flex flex-row justify-content-end">
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
    .chat-wrapper {
        display: grid;
        grid-template-rows: 1fr auto;
        max-height: 100%;
    }
    .messages-wrapper {
        width: 100%;
        height: 100%;
    }
    @media (min-width: 768px) {
        .video-wrapper {
            width: 100%;
        }
        .chat-wrapper {
            min-width: 33%;
        }
    }
    .phone-down-btn {
        border-radius: 100%;
    }
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
    .scroller * {
        overflow-anchor: none;
    }

    .anchor {
        overflow-anchor: auto;
        height: 1px;
    }
</style>