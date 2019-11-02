import { LitElement, html, TemplateResult, customElement, property, query } from 'lit-element'
import '@material/mwc-dialog'
import '@material/mwc-button'
import { Dialog } from '@material/mwc-dialog'

@customElement('mwc-app-dialog')
export class MwcAppDialog extends LitElement {
  @property({ type: String })
  title = ''

  @property()
  template: TemplateResult|string = ''

  @property({ type: String })
  acceptText = 'ok'

  @property({ type: String })
  cancelText = 'cancel'

  protected onClose: Function = () => {}

  @query('#dialog')
  dialog!: Dialog

  @query('#content')
  content!: HTMLDivElement

  protected _acceptButton = true
  protected _cancelButton = true
  public preventEscape = false

  constructor () {
    super()
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.dialog.open) {
        if (this.preventEscape) {
          e.stopImmediatePropagation()
        }
      }
    })
  }

  render() {
    return html`
    <mwc-dialog id="dialog" title="${this.title}" @closed="${(e:CustomEvent) => this.onClose(e)}">
      <div id="content">${this.template}</div>
      ${this._cancelButton ? html`
      <mwc-button slot="secondaryAction" dialogAction="cancel">${this.cancelText}</mwc-button>
      ` : null}
      ${this._acceptButton ? html`
      <mwc-button unelevated slot="primaryAction" @click="${() => this.onClose()}">${this.acceptText}</mwc-button>` : null}
    </mwc-dialog>
    `
  }

  onKeyDown(e: KeyboardEvent) {
    console.log('keydown')
  }

  async _open(title: string, template: TemplateResult|string, onAccept: Function, onCancel: Function, acceptButton: boolean = true, cancelButton: boolean = true) {
    
    this.title = title && title[0].toUpperCase() + title.slice(1, title.length)
    this.template = template
    this._acceptButton = acceptButton
    this._cancelButton = cancelButton
    this.dialog.open = true
    await this.updateComplete
    
    this.content.querySelectorAll('[id]').forEach(el => {
      // @ts-ignore
      this.content[el.id] = el
    })

    this.onClose = async (e:CustomEvent|undefined) => {
      if (e) {
        if ((e.detail.action === 'cancel' || e.detail.action === 'close') && onCancel) {
          onCancel()
        } else if (onAccept) {
          onAccept(this.content, e.detail.action)
        }
      }
      else {
        // the button was pressed
        if (onAccept) {
          const returnCode = await onAccept(this.content)
          if (returnCode !== -1) {
            this.onClose = () => {}
            this.dialog.open = false
          }
        }
      }

      /* reinit the buttons */
      // this._acceptButton = true
      // this._cancelButton = true
    }
    return this.content
  }

  close() {
    this.dialog.open = false
  }

  async open(title: string, template: TemplateResult|string, onAccept:Function|undefined, onCancel: Function|boolean = true) {
    if (typeof template === 'string') {
      template = html`${template}`
    }
    
    return await this._open(
        title,
        <TemplateResult>template,
        async (dom:HTMLElement, value:any) => {
          if (onAccept) {
            return await onAccept(dom, value)
          }
          // _resolve({ dom, value })
        },
        () => {
          if (typeof onCancel === 'function') {
            onCancel()
          }
          // _reject()
        },
        onAccept !== undefined,
        typeof onCancel === 'boolean' ? onCancel : onCancel !== undefined
      )

  }

  notice(title: string, template: TemplateResult | string) {
    return new Promise((resolve) => {
  this._open(title, template, resolve, resolve, true, false)
    })
  }

  confirm(title: string, template: TemplateResult | string = '') {
    return new Promise((resolve, reject) => {
      this._open(title, template, resolve, reject)
    })
  }

  choices(choices:Array<any>, title:string = 'Select one') {
    const template = html`
    <style>
      #content > mwc-button {
        display: block;
        margin: 4px 0;
      }
    </style>
    ${choices.map(c => html`<mwc-button dialogAction="${c}">${c}</mwc-button>`)}
    `

    return new Promise<any>((resolve, reject) => {
      this._open(title, template, (_:HTMLElement, value:any) => resolve(value), reject, false, true)
    })
  }
}
