import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { CalcMuiPlugin, CalcMuiPluginHolder } from './calc_mui_types';

const AlertDialog = React.forwardRef((_, ref) => {
    const [openAlert, setOpenAlert] = React.useState(false);
    const [alertTitle, setAlertTitle] = React.useState("");
    const [alertText, setAlertText] = React.useState("");

    React.useImperativeHandle(ref, () => ({
        showAlert: (title: string, text: string) => {
            setAlertTitle(title);
            setAlertText(text);
            setOpenAlert(true);
        }
    }));

    const closeAlert = () => setOpenAlert(false);

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
                <DialogContentText id="alert-dialog-description" style={{ wordBreak: "break-word" }}>
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
});

const App = () => {
    const alertRef = React.useRef<any>(null);

    React.useEffect(() => {
        const plugin: CalcMuiPlugin = {
            showAlert: (title, text) => {
                if (alertRef.current) {
                    alertRef.current.showAlert(title, text);
                } else {
                    throw new Error("React not initialized");
                }
            }
        };
        (window as any as CalcMuiPluginHolder).calcMuiPlugin = plugin;
        postMessage("calcMuiPlugin");

        return () => {
            (window as any as CalcMuiPluginHolder).calcMuiPlugin = undefined;
            postMessage("calcMuiPlugin");
        };
    }, []);

    return (
        <StyledEngineProvider injectFirst>
            <AlertDialog ref={alertRef} />
        </StyledEngineProvider>
    );
};
ReactDOM.createRoot(document.getElementById("react-root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
