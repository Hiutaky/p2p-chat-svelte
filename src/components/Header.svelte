<script>
    import Logo from "$lib/images/pi.svg"
    import { user } from "../store/user";
    import AvatarBeam from "./AvatarBeam.svelte";
</script>

<header class="d-flex flex-row gap-2 justify-content-between align-items-center p-3 bg-black bg-opacity-50">
    <h2 class="d-flex flex-row column-gap-2 align-items-center m-0">
        <img class="logo" src={Logo} />
        PiChat
    </h2>
    <AvatarBeam name={$user.name} />
    <span>
        {$user.name}
    </span>
</header>

<style>
    .logo {
        width: 2rem;
    }
</style>