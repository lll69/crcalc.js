import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { CalcMuiPluginHolder } from './calc_mui_types';

const themeProps = {
    palette: {
        primary: {
            main: "#00BCD4"
        }
    }
}

const AlertDialog = () => {
    const [openAlert, setOpenAlert] = React.useState(false);
    const [alertTitle, setAlertTitle] = React.useState("");
    const [alertText, setAlertText] = React.useState("");

    const closeAlert = () => {
        setOpenAlert(false);
        if (location.hash === "##mui-dialog") {
            history.back();
        }
    };

    const showAlert = (title: string, text: string) => {
        setAlertTitle(title);
        setAlertText(text);
        setOpenAlert(true);
        history.pushState({}, "", "##mui-dialog");
    }

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
    });

    return (
        <Dialog
            open={openAlert}
            onClose={closeAlert}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
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

const DialogApp = () => {
    const theme = createTheme(themeProps);
    return (
        <React.StrictMode>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <AlertDialog />
                </ThemeProvider>
            </StyledEngineProvider>
        </React.StrictMode>
    );
};

const ButtonApp = ({ text, click }: { text: string, click: () => void }) => {
    const theme = createTheme(themeProps);
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
    const theme = createTheme(themeProps);
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
        <ButtonApp text="HYP" click={() => { plugin.onHypButtonClick && plugin.onHypButtonClick() }} />
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
