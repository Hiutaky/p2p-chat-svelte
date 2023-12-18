<script>
    import { onDestroy } from "svelte";

    export let stream = false
    export let peer = ''
    export let setScreenshot = false

    let VideoElement = false
    let ImageElement = false
    let interval = false

    onDestroy( () => {
        clearInterval(interval)
    })

    $: if( stream && VideoElement ) {
        VideoElement.srcObject = stream
        if( ! interval && setScreenshot ) {
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

<div class="w-100">
    <div class="position-relative d-flex flex-column row-gap-2 align-items-start">
        <video 
            class={`w-100 rounded ${peer ? `` : `placeholder placeholder-wave`}`}
            bind:this={VideoElement} 
            autoplay
        ></video>
        <span class="m-2 position-absolute fs-13 start-0 bottom-0 rounded bg-dark px-2">
            {peer}
        </span>
    </div>
</div>

<style>
    video {
        width: 100%;
        background: #000;
    }
</style>