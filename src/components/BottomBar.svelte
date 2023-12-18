<script>
    import ChatIcon from "$lib/images/chats.svg"
    import GroupIcon from "$lib/images/group.svg"
    import ExploreIcon from "$lib/images/explore.svg"
    import RandomIcon from "$lib/images/random.svg"
    import LiveIcon from "$lib/images/live.svg"
    import { instance } from "../store/instance";
    import { main } from "../store/main";

    const createRoulette = () => {
        $instance.view = 'roulette'
    }
    const viewChats = () => {
        $instance.view = 'chats'
        $main.current = false
    }

</script>

<div class="position bottom-0 start-0 w-100 p-2 bg-black bg-opacity-50 d-flex flex-row justify-content-evenly">
    <a href="/chats">
        <button 
            class="border-0 bg-transparent text-white d-flex flex-column align-items-center row-gap-1  justify-content-center p-1"
            on:click={ () => viewChats() }
        >
            <img src={ChatIcon} class="icon">
            <span class="fs-13">Chats</span>
        </button>
    </a>
    <a href="/explore">
        <button
            class="border-0 bg-transparent text-white d-flex  flex-column row-gap-1 align-items-center justify-content-center"
            on:click={() => $instance.view = 'explore' }
        >
            <img src={ExploreIcon} class="icon">
            <span class="fs-13">Explore</span>
        </button>
    </a>
    <a href="/roulette">
        <button
            class="border-0 bg-transparent text-white d-flex  flex-column row-gap-1 align-items-center justify-content-center"
            on:click={() => createRoulette() }
        >
            <img src={RandomIcon} class="icon">
            <span class="fs-13">Roulette</span>
        </button>
    </a>
    <a href="/party">
        <button
            class="border-0 bg-transparent text-white d-flex  flex-column row-gap-1 align-items-center justify-content-center"
        >
            <img src={GroupIcon} class="icon">
            <span class="fs-13">Party</span>
        </button>
    </a>
    <a href="/live">
    <button 
        class="border-0 bg-transparent text-white d-flex  flex-column row-gap-1 align-items-center justify-content-center"
        on:click={() => $instance.view = 'chats' }
    >
        <img src={LiveIcon} class="icon">
        <span class="fs-13">Live</span>
    </button>
    </a>
</div>