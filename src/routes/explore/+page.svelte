<script>
    import { onDestroy, onMount } from "svelte";
    import { getPeers, getPublicURI } from "$lib/utilities";
    import { main } from "../../store/main";
    import { user } from "../../store/user";
    import Explore from "../../components/Explore.svelte";
    let peersInterval = false

    onDestroy(() => {
        if( peersInterval)
            clearInterval(peersInterval)
    })

    onMount(() => {
        peersInterval = setInterval(async () => {
            $main.peers = (await getPeers()).filter( peer => peer !== $user.id )
        }, 6000)
    })
</script>

<Explore />
