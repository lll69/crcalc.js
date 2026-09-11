/*
 * Copyright 2025-2026 lll69
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

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { CalcMuiPlugin, CalcMuiPluginHolder } from './calc_mui_types';
import { RadioGroup } from '@mui/material';
import * as ClipboardJS from 'clipboard';

/*pUrVkSlX CONFIGURATION START FOR DOWNLOAD HxDlWyZk**/
const CONFIG_IS_ONLINE = true;
// Operators
const CONFIG_POWER = true;
const CONFIG_SQRT = true;
const CONFIG_CBRT = true;
const CONFIG_FACT = true;
// Function Panel
const CONFIG_FUNCTION_PANEL = true;
// Constants
const CONFIG_PI = true;
const CONFIG_E = true;
// Functions
const CONFIG_LN = true;
const CONFIG_LOG = true;
const CONFIG_EXP = true;
const CONFIG_POW10 = true;
const CONFIG_TRIG = true;
const CONFIG_TRIG_INV = true;
const CONFIG_HYP = true;
const CONFIG_HYP_INV = true;
const CONFIG_VARIABLES = true;
const CONFIG_CUSTOM_FUNCTIONS = true;
// Switches
const CONFIG_SW_INV = true;
const CONFIG_SW_HYP = true;
const CONFIG_SW_BRACKETS = true;
// Input/Output
const CONFIG_UI_NO_KEYBOARD = true;
const CONFIG_SCROLLING = true;
// Control Buttons
const CONFIG_UI_COPY_RESULT = true;
const CONFIG_UI_COPY_TRUNC = true;
const CONFIG_UI_COPY_INTEGER = true;
const CONFIG_UI_SAVE_RESULT = true;
const CONFIG_UI_SIMPLIFY = true;
const CONFIG_UI_SPEED_SCROLL = true;
const CONFIG_UI_BUNDLE_FONTS = false;
/*HxDlWyZk CONFIGURATION END FOR DOWNLOAD pUrVkSlX**/

const crL10N = window["crL10N"] || {};

const themeProps = {
    palette: {
        primary: {
            main: "#00BCD4"
        }
    }
};

const buttonHiddenStyle = {
    display: "none !important",
    textTransform: "none",
};

const buttonStyle = {
    textTransform: "none",
};

const AlertDialog = () => {
    const [openAlert, setOpenAlert] = React.useState(false);
    const [alertTitle, setAlertTitle] = React.useState("");
    const [alertText, setAlertText] = React.useState("");
    const [showCopy, setShowCopy] = React.useState(false);
    const contentRef = React.useRef<HTMLElement | null>(null);

    const closeAlert = React.useCallback(() => {
        if (location.hash === "##mui-dialog") {
            history.back();
        }
        setOpenAlert(false);
    }, []);

    const showAlert = React.useCallback((title: string, text: string, showCopy?: boolean) => {
        history.pushState({}, "", "##mui-dialog");
        setAlertTitle(title);
        setAlertText(text);
        setShowCopy(CONFIG_UI_SIMPLIFY && !!showCopy);
        setOpenAlert(true);
    }, []);

    const copyText = React.useCallback(() => {
        if (CONFIG_UI_SIMPLIFY && contentRef.current) {
            ClipboardJS.copy(contentRef.current);
        }
    }, []);

    React.useEffect(() => {
        (window as any as CalcMuiPluginHolder).calcMuiPlugin.showAlert = showAlert;
        const hashChange = () => {
            if (location.hash !== "##mui-dialog" && openAlert) {
                closeAlert();
            }
        }
        addEventListener("hashchange", hashChange);

        return () => {
            (window as any as CalcMuiPluginHolder).calcMuiPlugin.showAlert = undefined;
            removeEventListener("hashchange", hashChange);
        };
    }, [openAlert]);

    return (
        <Dialog
            open={openAlert}
            onClose={closeAlert}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">
                {alertTitle}
            </DialogTitle>
            <DialogContent>
                <DialogContentText ref={contentRef} id="alert-dialog-description" style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}>
                    {alertText}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {CONFIG_UI_SIMPLIFY && showCopy && <Button onClick={copyText}>
                    {crL10N["copy"] || "Copy"}
                </Button>}
                <Button onClick={closeAlert} autoFocus>
                    {crL10N["ok"] || "OK"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const OptionDialog = () => {
    const [openAlert, setOpenAlert] = React.useState(false);
    const [showExact, setShowExact] = React.useState(false);

    const closeAlert = React.useCallback(() => {
        if (location.hash === "##mui-dialog-save") {
            history.back();
        }
        setOpenAlert(false);
    }, []);

    const showAlert = React.useCallback((showExact: boolean) => {
        history.pushState({}, "", "##mui-dialog-save");
        setShowExact(showExact);
        setOpenAlert(true);
    }, []);

    if (CONFIG_UI_SAVE_RESULT) {
        React.useEffect(() => {
            (window as any as CalcMuiPluginHolder).calcMuiPlugin.showSaveOption = showAlert;
            const hashChange = () => {
                if (location.hash !== "##mui-dialog-save" && openAlert) {
                    closeAlert();
                }
            }
            addEventListener("hashchange", hashChange);

            return () => {
                (window as any as CalcMuiPluginHolder).calcMuiPlugin.showSaveOption = undefined;
                removeEventListener("hashchange", hashChange);
            };
        }, [openAlert]);
    }

    const handleClick = React.useCallback((event: React.MouseEvent) => {
        if (plugin.onSaveClick) plugin.onSaveClick((event.target as HTMLButtonElement).value);
        closeAlert();
    }, []);

    return (
        <Dialog
            open={openAlert}
            onClose={closeAlert}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">
                {crL10N["saveResult"] || "Save Result"}
            </DialogTitle>
            <DialogContent>
                <RadioGroup id="alert-dialog-description">
                    <Button color="secondary" value="choose" sx={buttonHiddenStyle} onClick={handleClick}>{crL10N["chooseOption"] || "Choose Option"}</Button>
                    <Button color="secondary" value="exact" sx={showExact ? buttonStyle : buttonHiddenStyle} onClick={handleClick}>{crL10N["exactSave"] || "Save Exact Result"}</Button>
                    <Button color="secondary" value="truncated" sx={buttonStyle} onClick={handleClick}>{crL10N["truncatedSave"] || "Save Truncated Result"}</Button>
                    <Button color="secondary" value="integer" sx={buttonStyle} onClick={handleClick}>{crL10N["integerSave"] || "Save Integer Part"}</Button>
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeAlert}>
                    {crL10N["cancel"] || "Cancel"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const DialogApp = () => {
    const theme = React.useMemo(() => createTheme(themeProps), []);
    return (
        <React.StrictMode>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <AlertDialog />
                    {CONFIG_UI_SAVE_RESULT && <OptionDialog />}
                </ThemeProvider>
            </StyledEngineProvider>
        </React.StrictMode>
    );
};

const ButtonApp = ({ text, click, disabled }: { text: string, click: () => void, disabled?: boolean }) => {
    const theme = React.useMemo(() => createTheme(themeProps), []);
    return (
        <React.StrictMode>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <Button variant="outlined" disabled={disabled} disableElevation onClick={click} style={{ borderRadius: "0", padding: "0", width: "100%", height: "1.5em", fontSize: "1em", textTransform: "none" }}>{text}</Button>
                </ThemeProvider>
            </StyledEngineProvider>
        </React.StrictMode>
    )
};

const SimplifyButtonApp = ({ click }: { click: () => void }) => {
    const theme = React.useMemo(() => createTheme(themeProps), []);
    return (
        <React.StrictMode>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <Button onClick={click} style={{ width: "100%", height: "100%", fontSize: "1em", minWidth: "0", padding: "0" }}><img alt="Show simplified result" src="simplify.svg" /></Button>
                </ThemeProvider>
            </StyledEngineProvider>
        </React.StrictMode>
    )
};

const HypButtonApp = ({ plugin }: { plugin: CalcMuiPlugin }) => {
    const [show, setShow] = React.useState(false);
    const click = () => {
        const newShow = !show;
        plugin.onHypButtonClick && plugin.onHypButtonClick(newShow);
        setShow(newShow);
    }
    return show ? (
        <ButtonApp text="HYP" click={click} />
    ) : (
        <button style={{ width: "100%", height: "100%", fontSize: "1em", minWidth: "0" }} onClick={click}>HYP</button>
    )
};

if (!(window as any as CalcMuiPluginHolder).calcMuiPlugin) {
    (window as any as CalcMuiPluginHolder).calcMuiPlugin = {};
}

const plugin = (window as any as CalcMuiPluginHolder).calcMuiPlugin;
const getElementById: typeof document.getElementById = document.getElementById.bind(document);
const reactRoot = getElementById("react-root")!;
ReactDOM.createRoot(reactRoot).render(
    <DialogApp />
);

if (CONFIG_FUNCTION_PANEL && CONFIG_SW_HYP && reactRoot.dataset.hyp === "true") {
    ReactDOM.createRoot(getElementById("react_hyp_root")!).render(
        <HypButtonApp plugin={plugin} />
    );
    ReactDOM.createRoot(getElementById("react_sinh_root")!).render(
        <ButtonApp disabled={!CONFIG_HYP} text={CONFIG_HYP ? "sinh" : ""} click={() => { plugin.onSinhButtonClick && plugin.onSinhButtonClick() }} />
    );
    ReactDOM.createRoot(getElementById("react_cosh_root")!).render(
        <ButtonApp disabled={!CONFIG_HYP} text={CONFIG_HYP ? "cosh" : ""} click={() => { plugin.onCoshButtonClick && plugin.onCoshButtonClick() }} />
    );
    ReactDOM.createRoot(getElementById("react_tanh_root")!).render(
        <ButtonApp disabled={!CONFIG_HYP} text={CONFIG_HYP ? "tanh" : ""} click={() => { plugin.onTanhButtonClick && plugin.onTanhButtonClick() }} />
    );
    ReactDOM.createRoot(getElementById("react_asinh_root")!).render(
        <ButtonApp disabled={!CONFIG_HYP_INV} text={CONFIG_HYP_INV ? "asinh" : ""} click={() => { plugin.onASinhButtonClick && plugin.onASinhButtonClick() }} />
    );
    ReactDOM.createRoot(getElementById("react_acosh_root")!).render(
        <ButtonApp disabled={!CONFIG_HYP_INV} text={CONFIG_HYP_INV ? "acosh" : ""} click={() => { plugin.onACoshButtonClick && plugin.onACoshButtonClick() }} />
    );
    ReactDOM.createRoot(getElementById("react_atanh_root")!).render(
        <ButtonApp disabled={!CONFIG_HYP_INV} text={CONFIG_HYP_INV ? "atanh" : ""} click={() => { plugin.onATanhButtonClick && plugin.onATanhButtonClick() }} />
    );
    postMessage("hypRendered");
}
if (CONFIG_UI_SIMPLIFY && reactRoot.dataset.simp === "true") {
    const link = getElementById("show_simplify")!;
    ReactDOM.createRoot(getElementById("react_simplify_root")!).render(
        <SimplifyButtonApp click={() => link.click()} />
    );
    postMessage("simplifyRendered");
}
if (CONFIG_FUNCTION_PANEL && CONFIG_SW_INV && reactRoot.dataset.inv === "true") {
    ReactDOM.createRoot(getElementById("react_inv_root")!).render(
        <ButtonApp text="2ndF" click={() => { plugin.onInvButtonClick && plugin.onInvButtonClick() }} />
    );
    postMessage("invRendered");
}
