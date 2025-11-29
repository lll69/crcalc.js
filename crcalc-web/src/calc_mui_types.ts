export type CalcMuiPlugin = {
    showAlert: (title: string, text: string) => void;
}
export type CalcMuiPluginHolder = {
    calcMuiPlugin: CalcMuiPlugin | undefined;
}
