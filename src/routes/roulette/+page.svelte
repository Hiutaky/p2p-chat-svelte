<script>
    import { fly } from "svelte/transition";
    import Roulette from "../../components/Roulette.svelte";

</script>

<div class="w-100" in:fly>
    <Roulette />
</div>
