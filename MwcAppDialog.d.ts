import { LitElement, TemplateResult } from 'lit-element';
import '@material/mwc-dialog';
import '@material/mwc-button';
import { Dialog } from '@material/mwc-dialog';
export declare class MwcAppDialog extends LitElement {
    title: string;
    template: TemplateResult | string;
    noPrimaryAction: boolean;
    onClose?: Function;
    dialog: Dialog;
    content: HTMLDivElement;
    render(): TemplateResult;
    _open(title: string, template: TemplateResult | string, onAccept: Function, onCancel: Function, primaryAction?: Boolean): Promise<HTMLDivElement>;
    open(title: string, template: TemplateResult | string, onAccept?: Function, onCancel?: Function, primaryAction?: Boolean): Promise<unknown>;
    confirm(title: string, template?: TemplateResult | string): Promise<unknown>;
    choices(choices: Array<any>): Promise<any>;
}
