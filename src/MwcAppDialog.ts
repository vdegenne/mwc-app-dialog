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

  @property({ attribute: false })
  onClose?: Function

  @query('#dialog')
  dialog!: Dialog

  @query('#content')
  content!: HTMLDivElement

  _acceptButton = true
  _cancelButton = true

  render() {
    return html`
    <mwc-dialog id="dialog" title="${this.title}" @closing  ="${this.onClose}">
      <div id="content">${this.template}</div>
      ${this._cancelButton ? html`
      <mwc-button slot="secondaryAction" dialogAction="cancel">${this.cancelText}</mwc-button>
      ` : null}
      ${this._acceptButton ? html`
      <mwc-button unelevated slot="primaryAction" dialogAction="accept">${this.acceptText}</mwc-button>` : null}
    </mwc-dialog>
    `
  }

  async _open(title: string, template: TemplateResult|string, onAccept: Function, onCancel: Function, cancelButton: boolean = true, acceptButton: boolean = true) {
    
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

    this.onClose = (e:CustomEvent) => {
      if ((e.detail.action === 'cancel' || e.detail.action === 'close') && onCancel) {
        onCancel()
      } else if (e.detail.action === 'accept' && onAccept) {
        onAccept(this.content)
      } else if (onAccept) {
        onAccept(this.content, e.detail.action)
      }

      /* reinit the buttons */
      this._acceptButton = true
      this._cancelButton = true
    }
    return this.content
  }

  open(title: string, template: TemplateResult|string, onAccept: Function, onCancel: Function|boolean = true) {
    if (typeof template === 'string') {
      template = html`${template}`
    }

    return new Promise((resolve, reject) => {
      this._open(
        title,
        <TemplateResult>template,
        async (dom:HTMLElement, value:any) => {
          if (onAccept) {
            const result = await onAccept(dom, value)
            if (result === -1) {
              this.dialog.open=true
              // return
            }
          }
          resolve({ dom, value })
        },
        () => {
          if (typeof onCancel === 'function') {
            onCancel()
          }
          reject()
        },
        typeof onCancel === 'boolean' ? onCancel : onCancel !== undefined,
        onAccept !== undefined
      )
    })
  }

  notice(title: string, template: TemplateResult | string) {
    return new Promise((resolve, reject) => {
      this._open(title, template, (dom: HTMLElement) => resolve(dom), reject, false, true)
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
      this._open(title, template, (_:HTMLElement, value:any) => resolve(value), reject, true, false)
    })
  }
}
