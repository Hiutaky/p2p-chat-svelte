<script>
    import { user } from "../store/user";
    import AvatarBeam from "./AvatarBeam.svelte";
    export let messages = []
    export let sendMessage = (message) => {}
    let message = ''
    let MessageWrapper


    const getHours = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`
    }
    $: console.log(messages)


</script>
<div class="w-100 d-flex flex-column gap-2 chat-wrapper  overflow-auto h-100">
    <div 
        class="messages-wrapper scroller bg-dark overflow-scroll d-flex flex-column row-gap-1 p-2 rounded h-100" 
        bind:this={MessageWrapper}
    >
        {#each messages as message, i (i) }
        <div
            key={i}
            class="{ i > 0 && messages[i-1].peer !== message.peer ? 'mt-2' : ''} d-flex gap-2 flex-row align-items-center  { message.peer === $user.id ? ` flex-row-reverse` : ``}"
        >
        {#if ! i || messages.length-1 === i || messages[i+1].peer !== message.peer }
            <AvatarBeam name={message.peer} size={26}/>
        {/if}
            <div class="d-flex gap-3 justify-content-between message-item py-1 px-3 {  message.peer === $user.id ? 'bg-user' : ' bg-black bg-opacity-50'} rounded-1">
                {message.content}
                <div class="fs-13 text-opacity-50 text-white align-self-end">{ getHours(message.timestamp) }</div>
            </div>
        </div>
        {/each}
        <div class="anchor"></div>
    </div>
    <form class="d-flex flex-row column-gap-2">
        <input
            type="text"
            bind:value={message}
            class="w-100 border border-dark rounded bg-dark text-white px-2"
            placeholder="Enter a message"
        >
        <button 
            on:click|preventDefault={() => { 
                sendMessage(message) 
                message = ``
            }} 
            class="btn btn-primary"
        >
            Send
        </button>
    </form>
</div>
