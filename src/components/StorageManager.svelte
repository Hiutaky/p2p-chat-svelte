<script>
    import { Storage } from "$lib/storage";
    import { onMount } from "svelte";
    import { serverGlobal } from "../store/serverGlobal";
    import { user } from "../store/user";

    let subscribe = (_serverGlobal, _user) => {
        const storage = Storage.get()
        if( $user.name ) {
            let payload = {
                ...storage,
                serverGlobal: {
                    messages: $serverGlobal.messages
                }
            }
            if( ! storage || ! storage.user || $user.name !== storage.user.name )
                payload.user = $user
            Storage.set(payload)
        }
    }
    
    $: subscribe($serverGlobal.messages, $user)

    onMount(() => {
        const storage = Storage.get()
        if( storage && Object.keys(storage).includes('user') && Object.keys( storage.user).includes('name' ) ){
            if( storage.serverGlobal && storage.serverGlobal.messages )
                $serverGlobal.messages = storage.serverGlobal.messages
            $user.name = storage.user.name
        }
    })
</script>