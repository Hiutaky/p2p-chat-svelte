<script>
    //@ts-nocheck
    import uuid4 from "uuid4";
    import PartyImage from "$lib/images/party-bg.jpg"
    import { fade, fly } from "svelte/transition";

    let randomId = uuid4()
    let joinId = ''
</script>


<div class=" bg-dark bg-opacity-25 w-100 d-flex gap-3 flex-row align-items-center h-100 justify-content-center" in:fly>
    <div class="d-flex flex-md-row flex-column column-gap-3 w-100 h-100">
        <div class="p-3 w-100 d-flex flex-column align-items-start justify-content-center h-100">
            <div class="d-flex flex-column row-gap-1 pe-md-5">
                <h2>Create or Join a Party Now!</h2>
                <p>Party is a 100% Free, P2P-Encrypted, Privacy-Oriented, Limitless feature that can handle up to 50 members without sacrficing quality.</p>
                <div class="d-flex flex-row column-gap-2">
                    <a href="/party/{randomId}">
                        <button class="btn btn-primary fw-medium">
                            Create
                        </button>
                    </a>
                    <button class="btn btn-primary px-4 fw-medium">
                        Join
                    </button>
                </div>
            </div>
        </div>
        <div 
            class="w-100 d-flex flex-column align-items-center h-100 banner-bg"
        >
        </div>
    </div>  
    
</div>

<style>
    .banner-bg {
        background:
            conic-gradient(from -45deg at calc(100%/3) calc(100%/3), #26baf4 90deg, #0000 0),
            conic-gradient(from -135deg at calc(100%/3) calc(2*100%/3), #26baf4 90deg, #37225d 0 135deg, #0000 0),
            conic-gradient(from 135deg at calc(2*100%/3) calc(2*100%/3), #26baf4 90deg, #37225d 0 135deg, #0000 0),
            conic-gradient(from 45deg at calc(2*100%/3) calc(100%/3), #26baf4 90deg, #37225d 0 135deg, #0000 0,#26baf4 0 225deg,#37225d 0);
        background-size: 76px 76px;

    }
</style>