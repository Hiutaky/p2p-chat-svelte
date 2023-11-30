<script>
    import { Storage } from "$lib/storage";
    import { onMount } from "svelte";
    import { main } from "../store/main";
    import { user } from "../store/user";

    let subscribe = (_serverGlobal, _user) => {
        const storage = Storage.get()
        if( $user.name ) {
            let payload = {
                ...storage,
                main: {
                    messages: $main.messages
                }
            }
            if( ! storage || ! storage.user || $user.name !== storage.user.name )
                payload.user = $user
            Storage.set(payload)
        }
    }
    
    $: subscribe($main.messages, $user)

    onMount(() => {
        const storage = Storage.get()
        if( storage && Object.keys(storage).includes('user') && Object.keys( storage.user).includes('name' ) ){
            if( storage.main && storage.main.messages )
                $main.messages = storage.main.messages
            $user.name = storage.user.name
        }
    })
</script>