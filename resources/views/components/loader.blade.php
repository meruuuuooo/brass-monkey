<div id="global-loader"
    class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#120E0A] transition-opacity duration-500 ease-in-out">
    <div class="relative flex flex-col items-center">
        {{-- Logos --}}
        <div class="flex items-center justify-center gap-8 mb-12 animate-pulse">
            <img src="/hillbcs-logo.png" alt="Hill BCS"
                class="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(242,202,80,0.2)]" />
            <div class="h-12 w-px bg-[#F2CA50]/20"></div>
            <img src="/brass-monkey-logo-removebg-preview.png" alt="Brass Monkey"
                class="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(242,202,80,0.2)]" />
        </div>

        {{-- Custom Brass Monkey Spinner --}}
        <div class="h-12 w-12 relative">
            <div
                class="absolute inset-0 rounded-full border-t-2 border-r-2 border-transparent border-t-[#F2CA50] animate-spin">
            </div>
            <div class="absolute inset-2 rounded-full border-r-2 border-b-2 border-transparent border-b-[#F2CA50] animate-spin"
                style="animation-direction: reverse;"></div>

            {{-- Inner Static dot --}}
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="h-1.5 w-1.5 rounded-full bg-[#F2CA50] animate-pulse"></div>
            </div>
        </div>

        <p class="text-white/40 text-[10px] tracking-[0.3em] mt-8 uppercase font-bold">
            Initializing System...
        </p>
    </div>
</div>

<script>
    // Remove the loader once the document and React app have loaded
    window.addEventListener('load', function () {
        const loader = document.getElementById('global-loader');
        if (loader) {
            // Short delay to ensure React has painted
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500); // Matches the duration-500 class
            }, 150);
        }
    });
</script>