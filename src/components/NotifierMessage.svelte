<script>
    import { main } from "../store/main";
    import { notifier } from "../store/notifier";
    import AvatarBeam from "./AvatarBeam.svelte";
    export let notification = {}
    export let index = 0
</script>

<button 
    class="d-flex flex-row column-gap-2 p-0 bg-transparent border-0 text-white"
    on:click={ () => {
        notification.actions()
        $notifier.notifications = $notifier.notifications.filter( (_, i) => i !== index)
    }}
>
    <AvatarBeam 
        name={notification.peer}
        size={22}
    />
    <div class="d-flex flex-column row-gap-1 align-items-end">
        <div class="w-100">
            {notification.content}
        </div>
        <span class="fs-12">{notification.timestamp ? new Date(notification.timestamp).toLocaleString() : '' }</span>
    </div>
</button>