/*
 * Copyright 2025 lll69
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, rmSync, cpSync } from "node:fs";
import { exit } from 'node:process';
import { minify_sync } from "terser";
if (existsSync("dist")) {
    rmSync("dist", { recursive: true });
}
let status = spawnSync("tsc", { stdio: "inherit", shell: true });
if (status.status || status.error) {
    console.error(status.error);
    exit(status.status || 1);
}
let minify_result = minify_sync(readFileSync("dist/cr.js", { "encoding": "utf-8" }), {
    module: true,
    mangle: true,
    compress: true,
    keep_classnames: false,
    format: {
        comments: /Copyright/g
    }
});
writeFileSync("dist/cr.min.js", minify_result.code, { "encoding": "utf-8" });
