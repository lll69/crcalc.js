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
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';

const themeProps = {
    palette: {
        primary: {
            main: "#00BCD4"
        }
    }
};

const hiddenStyle = {
    display: "none !important"
};

const AlertDialog = () => {
    const [openAlert, setOpenAlert] = React.useState(false);
    const [alertTitle, setAlertTitle] = React.useState("");
    const [alertText, setAlertText] = React.useState("");

    const closeAlert = React.useCallback(() => {
        if (location.hash === "##mui-dialog") {
            history.back();
        }
        setOpenAlert(false);
    }, []);

    const showAlert = React.useCallback((title: string, text: string) => {
        history.pushState({}, "", "##mui-dialog");
        setAlertTitle(title);
        setAlertText(text);
        setOpenAlert(true);
    }, []);

    React.useEffect(() => {
        (window as any as CalcMuiPluginHolder).calcMuiPlugin.showAlert = showAlert;
        const hashChange = () => {
            if (location.hash !== "##mui-dialog" && openAlert) {
                closeAlert();
            }
        }
        if (location.hash === "##mui-dialog" && !openAlert) {
            location.hash = "##";
        }
        addEventListener("hashchange", hashChange);

        return () => {
            (window as any as CalcMuiPluginHolder).calcMuiPlugin.showAlert = undefined;
            removeEventListener("hashchange", hashChange);
        };
    });

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
                <DialogContentText id="alert-dialog-description" style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}>
                    {alertText}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeAlert} autoFocus>
                    OK
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

    React.useEffect(() => {
        (window as any as CalcMuiPluginHolder).calcMuiPlugin.showSaveOption = showAlert;
        const hashChange = () => {
            if (location.hash !== "##mui-dialog-save" && openAlert) {
                closeAlert();
            }
        }
        if (location.hash === "##mui-dialog-save" && !openAlert) {
            location.hash = "##";
        }
        addEventListener("hashchange", hashChange);

        return () => {
            (window as any as CalcMuiPluginHolder).calcMuiPlugin.showSaveOption = undefined;
            removeEventListener("hashchange", hashChange);
        };
    });

    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (plugin.onSaveClick) plugin.onSaveClick(event.target.value);
        closeAlert();
    }, []);

    return (
        <Dialog
            open={openAlert}
            onClose={closeAlert}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">
                Save Result
            </DialogTitle>
            <DialogContent>
                <RadioGroup
                    id="alert-dialog-description"
                    value="choose"
                    onChange={handleChange}>
                    <FormControlLabel value="choose" control={<Radio />} label="Choose Option" sx={hiddenStyle} />
                    <FormControlLabel value="exact" control={<Radio />} label="Save Exact Result" sx={showExact ? undefined : hiddenStyle} />
                    <FormControlLabel value="truncated" control={<Radio />} label="Save Truncated Result" />
                    <FormControlLabel value="integer" control={<Radio />} label="Save Integer Part" />
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeAlert}>
                    Cancel
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
                    <OptionDialog />
                </ThemeProvider>
            </StyledEngineProvider>
        </React.StrictMode>
    );
};

const ButtonApp = ({ text, click }: { text: string, click: () => void }) => {
    const theme = React.useMemo(() => createTheme(themeProps), []);
    return (
        <React.StrictMode>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <Button variant="outlined" disableElevation onClick={click} style={{ borderRadius: "0", padding: "0", width: "100%", height: "1.5em", fontSize: "1em", textTransform: "none" }}>{text}</Button>
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

if (reactRoot.dataset.hyp === "true") {
    ReactDOM.createRoot(getElementById("react_hyp_root")!).render(
        <HypButtonApp plugin={plugin} />
    );
    ReactDOM.createRoot(getElementById("react_sinh_root")!).render(
        <ButtonApp text="sinh" click={() => { plugin.onSinhButtonClick && plugin.onSinhButtonClick() }} />
    );
    ReactDOM.createRoot(getElementById("react_cosh_root")!).render(
        <ButtonApp text="cosh" click={() => { plugin.onCoshButtonClick && plugin.onCoshButtonClick() }} />
    );
    ReactDOM.createRoot(getElementById("react_tanh_root")!).render(
        <ButtonApp text="tanh" click={() => { plugin.onTanhButtonClick && plugin.onTanhButtonClick() }} />
    );
    ReactDOM.createRoot(getElementById("react_asinh_root")!).render(
        <ButtonApp text="asinh" click={() => { plugin.onASinhButtonClick && plugin.onASinhButtonClick() }} />
    );
    ReactDOM.createRoot(getElementById("react_acosh_root")!).render(
        <ButtonApp text="acosh" click={() => { plugin.onACoshButtonClick && plugin.onACoshButtonClick() }} />
    );
    ReactDOM.createRoot(getElementById("react_atanh_root")!).render(
        <ButtonApp text="atanh" click={() => { plugin.onATanhButtonClick && plugin.onATanhButtonClick() }} />
    );
    postMessage("hypRendered");
}
if (reactRoot.dataset.simp === "true") {
    const link = getElementById("show_simplify")!;
    ReactDOM.createRoot(getElementById("react_simplify_root")!).render(
        <SimplifyButtonApp click={() => link.click()} />
    );
    postMessage("simplifyRendered");
}
if (reactRoot.dataset.inv === "true") {
    ReactDOM.createRoot(getElementById("react_inv_root")!).render(
        <ButtonApp text="INV" click={() => { plugin.onInvButtonClick && plugin.onInvButtonClick() }} />
    );
    postMessage("invRendered");
}
