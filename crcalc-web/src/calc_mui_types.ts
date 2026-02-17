export type CalcMuiPlugin = {
    showAlert?: (title: string, text: string) => void;
    showSaveOption?: (showExact: boolean) => void;
    onHypButtonClick?: (show: boolean) => void;
    onSinhButtonClick?: () => void;
    onCoshButtonClick?: () => void;
    onTanhButtonClick?: () => void;
    onASinhButtonClick?: () => void;
    onACoshButtonClick?: () => void;
    onATanhButtonClick?: () => void;
    onInvButtonClick?: () => void;
    onSaveClick?: (option: string) => void;
}

export type CalcMuiPluginHolder = {
    calcMuiPlugin: CalcMuiPlugin;
}
