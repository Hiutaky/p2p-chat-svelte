<script>
    //@ts-nocheck
    import uuid4 from "uuid4";

    let randomId = uuid4()
    let joinId = ''
</script>


<div class="p-3 dbg-black bg-opacity-25 w-100 d-flex gap-3 flex-row align-items-center justify-content-center">
    <div class="d-flex flex-column row-gap-2 bg-black bg-opacity-50 p-3 rounded">
        <h3>Create a Party</h3>
        <input type="text" class="border border-dark bg-dark rounded text-white" bind:value={randomId} />
        <a href="/party/{randomId}">
            <button 
                class="btn w-100 btn-primary"    
            >
                Start
            </button>
        </a>
    </div>
    <div class="d-flex flex-column row-gap-2 bg-black bg-opacity-50 p-3 rounded">
        <h3>Join a Party</h3>
        <input type="text" bind:value={joinId} class="border border-dark bg-dark rounded text-white" placeholder="Enter party code" />
        <a href="/party/{joinId}?join=true">
            <button 
                class="btn w-100 btn-primary"    
            >
                Join
            </button>
        </a>
    </div>
</div>