<script>
    import AvatarBeam from "./AvatarBeam.svelte";
    import PhoneUp from "$lib/images/phone-up.svg"
    import PhoneDown from "$lib/images/phone-down.svg"
    import { main } from "../store/main";
    import { notifier } from "../store/notifier";

    export let notification = {
        type: 'incoming-call',
        peer: 'Random-Guy',
        content: `Someone is calling...`,
        actions: [{
            label: 'Accept',
            onClick: () => alert('Accept'),
            class: "bg-success"
        },{
            label: 'Reject',
            onClick: () => alert('Decline'),
            class: "bg-danger"
        }]
    }
    export let index = 0
</script>

<div class="d-flex flex-row gap-3 align-items-center justify-content-center">
    <AvatarBeam 
        name={notification.peer}
        size={32}
    />
    <div class="w-100">
        {notification.content}
    </div>
</div>
<div class="d-flex flex-row gap-2 w-100">
    {#each notification.actions as action, i (i) }
        <button 
            on:click={ () => {
                action.onClick()
                $notifier.notifications = $notifier.notifications.filter( (_, i) => i !== index )

            }} 
            class="btn w-100 fs-13 fw-bold text-white py-1 px-2 d-flex flex-row gap-2 align-items-center {action.class}"
        >
            <img src={ action.class === 'bg-success' ? PhoneUp : PhoneDown } style="width: 1.2em;" alt="Answer Call" />
            {action.label}
        </button>
    {/each}
</div>
