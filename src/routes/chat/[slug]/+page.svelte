<script>
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import Chat from "../../../components/Chat.svelte";
    import { main } from "../../../store/main";
    let init = false
    onMount(() => {
        init = true
        if( $page.params.slug )
            $main.current = $page.params.slug
    })

    $: console.log($main.current)

</script>
{#if init}
<Chat />
{/if}