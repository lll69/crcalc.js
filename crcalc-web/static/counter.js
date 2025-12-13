(function () {
    if (!location.toString().startsWith("file:")) {
        window.goatcounter = { allow_frame: true };
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

        var md5Link = document.querySelector('a[href="https://github.com/satazor/js-spark-md5"]');
        var sha1Link = document.querySelector('a[href="https://github.com/emn178/js-sha1"]');
        var sha256Link = document.querySelector('a[href="https://github.com/emn178/js-sha256"]');
        var hasMd5 = false;
        var hasSha1 = false;
        var hasSha256 = false;
        if (md5Link != null && document.querySelector('a[href="/text.html"]') != null && window.SparkMD5) {
            hasMd5 = true;
        } else if (sha1Link != null && window.sha1) {
            hasSha1 = false;
        } else if (sha256Link != null && window.sha256) {
            hasSha256 = false;
        }
        function patchLink(link) {
            link.innerText = "RustWasm";
            link.href = "https://github.com/rustwasm";
            link.setAttribute("data-goatcounter-click", "https://github.com/rustwasm");
        }
        if (hasMd5 || hasSha1 || hasSha256) {
            fetch("/wasm/md5_wasm.js").then(function (response) {
                function onWasmInit(wasm) {
                    if (hasMd5) {
                        class WasmMD5 {
                            constructor() {
                                this.hasher = new wasm.WasmMD5();
                            }
                            append(buf) {
                                this.hasher.update(new Uint8Array(buf));
                            }
                            end() {
                                return this.hasher.finish();
                            }
                        }
                        function testMD5() {
                            var testArray = new Uint8Array([0x31, 0x32, 0x33, 0x34, 0x35, 0x36]);
                            var testArray1 = new Uint8Array([0x31, 0x32, 0x33]);
                            var testArray2 = new Uint8Array([0x34, 0x35, 0x36]);
                            var hasher = new WasmMD5();
                            hasher.append(testArray);
                            var result1 = hasher.end();
                            hasher.append(testArray1);
                            hasher.append(testArray2);
                            var result2 = hasher.end();
                            return ("e10adc3949ba59abbe56e057f20f883e" == result1 && result1 == result2)
                        }
                        if (testMD5()) {
                            window.SparkMD5.ArrayBuffer = WasmMD5;
                            patchLink(md5Link);
                        }
                    }
                    if (hasSha1) {
                        function createSha1Hasher() {
                            var hasher = new wasm.WasmSha1();
                            function update(buf) {
                                hasher.update(new Uint8Array(buf));
                            }
                            function hex() {
                                return hasher.finish();
                            }
                            return {
                                update: update,
                                hex: hex
                            }
                        }
                        function testSHA1() {
                            var testArray = new Uint8Array([0x31, 0x32, 0x33, 0x34, 0x35, 0x36]);
                            var testArray1 = new Uint8Array([0x31, 0x32, 0x33]);
                            var testArray2 = new Uint8Array([0x34, 0x35, 0x36]);
                            var hasher = createSha1Hasher();
                            hasher.update(testArray);
                            var result1 = hasher.hex();
                            hasher.update(testArray1);
                            hasher.update(testArray2);
                            var result2 = hasher.hex();
                            return ("7c4a8d09ca3762af61e59520943dc26494f8941b" == result1 && result1 == result2)
                        }
                        if (testSHA1()) {
                            window.sha1.create = createSha1Hasher;
                            patchLink(sha1Link);
                        }
                    }
                    if (hasSha256) {
                        function createSha256Hasher() {
                            var hasher = new wasm.WasmSha256();
                            function update(buf) {
                                hasher.update(new Uint8Array(buf));
                            }
                            function hex() {
                                return hasher.finish();
                            }
                            return {
                                update: update,
                                hex: hex
                            }
                        }
                        function testSHA256() {
                            var testArray = new Uint8Array([0x31, 0x32, 0x33, 0x34, 0x35, 0x36]);
                            var testArray1 = new Uint8Array([0x31, 0x32, 0x33]);
                            var testArray2 = new Uint8Array([0x34, 0x35, 0x36]);
                            var hasher = createSha256Hasher();
                            hasher.update(testArray);
                            var result1 = hasher.hex();
                            hasher.update(testArray1);
                            hasher.update(testArray2);
                            var result2 = hasher.hex();
                            return ("8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" == result1 && result1 == result2)
                        }
                        if (testSHA256()) {
                            window.sha256.create = createSha256Hasher;
                            patchLink(sha256Link);
                        }
                    }
                };
                window.onWasmInit = onWasmInit;
                response.text().then(function (text) {
                    Function(text)();
                })
            });
        }
    }
})();