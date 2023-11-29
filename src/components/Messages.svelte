<script>
    
    //@ts-nocheck
    import { serverGlobal } from "../store/serverGlobal";
    import { user } from "../store/user";
    import { afterUpdate, beforeUpdate } from "svelte";
    let message = ''
    let autoscroll = false;

    let MessageWrapper = false

    beforeUpdate(() => {
        if (MessageWrapper) {
            const scrollableDistance = MessageWrapper.scrollHeight - MessageWrapper.offsetHeight;
            autoscroll = MessageWrapper.scrollTop > scrollableDistance - 20;
        }
    });

    afterUpdate(() => {
        if (autoscroll) {
            MessageWrapper.scrollTo(0, MessageWrapper.scrollHeight);
        }
    });

    const getHours = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    const sendMessage = () => {
        console.log(Object.keys($serverGlobal.outcoming).includes($serverGlobal.current))
        if( ! Object.keys($serverGlobal.outcoming).includes($serverGlobal.current) )
            $serverGlobal.outcoming[$serverGlobal.current] = $serverGlobal.client.connect($serverGlobal.current, {
                label: $user.name
            })
        const receiver = $serverGlobal.outcoming[$serverGlobal.current]
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

        if( ! Object.keys($serverGlobal.messages).includes($serverGlobal.current) )
            $serverGlobal.messages[$serverGlobal.current] = []
        $serverGlobal.messages[$serverGlobal.current] = [
            ...$serverGlobal.messages[$serverGlobal.current],
            messageData
        ]
        message = ``
    }

</script>

    <div class="w-100 d-flex flex-column gap-2 chat-wrapper  overflow-auto h-100">
        <div class="messages-wrapper  overflow-scroll d-flex flex-column row-gap-1 bg-dark p-2 rounded" bind:this={MessageWrapper}>
            {#if Object.keys($serverGlobal.messages).includes($serverGlobal.current)}
                {#each $serverGlobal.messages[$serverGlobal.current] as message, i (i) }
                <div
                    key={i}
                    class="{ i > 0 && $serverGlobal.messages[$serverGlobal.current][i-1].peer !== message.peer ? 'mt-2' : ''} d-flex flex-row { message.peer === $user.id ? `justify-content-end` : `justify-content-start`}"
                >
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
</style>