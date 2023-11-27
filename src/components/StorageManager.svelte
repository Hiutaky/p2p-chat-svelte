<script>
    import { Storage } from "$lib/storage";
    import { onMount } from "svelte";
    import { p2p } from "../store/p2p";
    import { user } from "../store/user";


    let subscribe = (_p2p, _user) => {
        const storage = Storage.get()
        if( $user.name ) {
            console.log('updating')
            let payload = {
                ...storage,
                p2p: {
                    messages: $p2p.messages
                }
            }
            if( ! storage.user || $user.name !== storage.user.name )
                payload.user = $user
            Storage.set(payload)
        }
    }
    
    $: subscribe($p2p.messages, $user)

    onMount(() => {
        const storage = Storage.get()
        if( storage.user && Object.keys( storage.user).includes('name' ) ){
            if( storage.p2p && storage.p2p.messages )
                $p2p.messages = storage.p2p.messages
            $user.name = storage.user.name
        }
    })
</script>