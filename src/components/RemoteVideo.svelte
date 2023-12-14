<script>
    import { onDestroy } from "svelte";

    export let props = {
        stream: false,
        peer: '',
        label: 'Connected to '
    }
    export let setScreenshot = () => {}

    let VideoElement = false
    let ImageElement = false
    let interval = false

    onDestroy( () => {
        clearInterval(interval)
    })

    $: if( props.stream && VideoElement ) {
        VideoElement.srcObject = props.stream
        VideoElement.play()
        if( ! interval ) {
            setScreenshot(takeScreenshot())
            interval = setInterval( () => {
                setScreenshot(takeScreenshot())
            }, 30000)
        }
    }

    const takeScreenshot = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = VideoElement.videoWidth
        canvas.height = VideoElement.videoHeight
        try {
            context.drawImage(VideoElement, 0, 0)
            const frame = canvas.toDataURL("image/png")
            return frame
        } catch(e) {
            console.log(e)
        }
    }

</script>

<div class="d-flex flex-column row-gap-2 align-items-start">
    <video 
        class={`rounded ${props.peer ? `` : `placeholder placeholder-wave`}`}
        bind:this={VideoElement} 
        autoplay
    ></video>
</div>
<div class="d-flex flex-column">
    <img  bind:this={ImageElement} />
    <button 
        on:click={takeScreenshot}
        class="btn btn-primary"
    >
        Take Screenshot
    </button>
</div>

<style>
    video {
        width: 100%;
        background: #000;
    }
</style>