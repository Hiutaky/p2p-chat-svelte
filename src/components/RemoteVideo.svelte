<script>
    export let props = {
        stream: false,
        peer: ''
    }
    let VideoElement = false

    $: if( props.stream && VideoElement )
        VideoElement.srcObject = props.stream

</script>

<div class="">
    <span>{props.peer}</span>
    <video bind:this={VideoElement} autoplay></video>
</div>