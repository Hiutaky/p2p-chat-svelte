<script>
    import Logo from "$lib/images/pi.svg"
    import { main } from "../store/main";
    import { user } from "../store/user";
    import AvatarBeam from "./AvatarBeam.svelte";
    import Notifier from "./Notifier.svelte";

</script>

<header class="d-flex flex-row gap-2 justify-content-between align-items-center p-3 bg-black bg-opacity-50">
    <h2 class="d-flex flex-row column-gap-2 align-items-center m-0">
        <img class="logo" src={Logo} />
        PiChat
    </h2>
    <div class="d-flex flex-row gap-3 align-items-center">
        <AvatarBeam name={$user.name} />
        <span class="px-2 py-1 bg-dark rounded d-flex flex-row gap-2 align-items-center">
            <div class="circle rounded-5 {$main.connected ? `bg-success` : `bg-danger` }"></div>
            <span>{$user.name}</span>
        </span>
        <Notifier />
    </div>
</header>

<style>
    .logo {
        width: 2rem;
    }
    .circle {
        width: 12px;
        height: 12px;
    }
</style>