export type CalcMuiPlugin = {
    showAlert?: (title: string, text: string) => void;
    onHypButtonClick?: (show: boolean) => void;
    onSinhButtonClick?: () => void;
    onCoshButtonClick?: () => void;
    onTanhButtonClick?: () => void;
    onASinhButtonClick?: () => void;
    onACoshButtonClick?: () => void;
    onATanhButtonClick?: () => void;
    onInvButtonClick?: () => void;
}

export type CalcMuiPluginHolder = {
    calcMuiPlugin: CalcMuiPlugin;
}
