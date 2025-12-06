export type CalcMuiPlugin = {
    showAlert?: (title: string, text: string) => void;
    onHypButtonClick?: () => void;
    onSinhButtonClick?: () => void;
    onCoshButtonClick?: () => void;
    onTanhButtonClick?: () => void;
    onASinhButtonClick?: () => void;
    onACoshButtonClick?: () => void;
    onATanhButtonClick?: () => void;
}

export type CalcMuiPluginHolder = {
    calcMuiPlugin: CalcMuiPlugin;
}
