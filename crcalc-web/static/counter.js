(function () {
    if (!location.toString().startsWith("file:")) {
        window.goatcounter = { allow_frame: true };
        if ((() => {
            if ('visibilityState' in document && document.visibilityState === 'prerender')
                return 'visibilityState'
            if (!goatcounter.allow_frame && location !== parent.location)
                return 'frame'
            if (!goatcounter.allow_local && location.hostname.match(/(localhost$|^127\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^192\.168\.|^0\.0\.0\.0$)/))
                return 'localhost'
            if (!goatcounter.allow_local && location.protocol === 'file:')
                return 'localfile'
            if (localStorage && localStorage.getItem('skipgc') === 't')
                return 'disabled with #toggle-goatcounter'
            return false
        })()) return;

        s = document.createElement("script");
        s.src = "/count.js";
        s.setAttribute("data-goatcounter", "https://getmd5.goatcounter.com/count");
        s.setAttribute("defer", "");
        s.setAttribute("async", "");
        document.head.appendChild(s);
        if (localStorage.getItem("skipgc") !== "t" && !sessionStorage.getItem("doNotTrack") && !localStorage.getItem("doNotTrack")) {
            if (!sessionStorage.getItem("_swa") && document.referrer.indexOf(location.protocol + "//" + location.host) !== 0) {
                sessionStorage.setItem("_swa", "1");
                fetch("https://counter.dev/track?" + new URLSearchParams({ referrer: document.referrer, screen: screen.width + "x" + screen.height, id: "c2474bae-9e6c-48ea-9a93-39ae3f9dbdae", utcoffset: "0" }))
            };
            navigator.sendBeacon(
                "https://counter.dev/trackpage",
                new URLSearchParams({
                    id: "c2474bae-9e6c-48ea-9a93-39ae3f9dbdae",
                    page: window.location.pathname,
                }),
            );
        }
    }
})();