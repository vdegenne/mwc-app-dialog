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

  @property({ type: Boolean })
  noPrimaryAction = false

  @property()
  onClose = (e:CustomEvent) => {}

  @query('#dialog')
  dialog!: Dialog

  @query('#content')
  content!: HTMLDivElement

  render() {
    return html`
    <mwc-dialog id="dialog" title="${this.title}" @closed="${this.onClose}">
      <div id="content">${this.template}</div>
      <mwc-button slot="secondaryAction" dialogAction="cancel">cancel</mwc-button>
      ${!this.noPrimaryAction
        ? html`
        <mwc-button unelevated slot="primaryAction" dialogAction="accept">ok</mwc-button>`
        : null}
    </mwc-dialog>
    `
  }

  async _open(title: string, template: TemplateResult|string, onAccept: Function, onCancel: Function, primaryAction: Boolean = true) {
    this.title = title && title[0].toUpperCase() + title.slice(1, title.length)
    this.template = template
    this.noPrimaryAction = !primaryAction
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
    }
    return this.content
  }

  open(title: string, template: TemplateResult | string, onAccept?: Function, onCancel?: Function, primaryAction: Boolean = true) {
    if (typeof template === 'string') {
      template = html`${template}`
    }
    if (typeof onAccept === 'boolean') {
      primaryAction = onAccept
      onAccept = undefined
    }
    if (typeof onCancel === 'boolean') {
      primaryAction = onCancel
      onCancel = undefined
    }

    return new Promise((resolve, reject) => {
      this._open(
        title,
        <TemplateResult>template,
        (dom:HTMLElement, value:any) => {
          if (onAccept) {
            onAccept(dom, value)
          }
          resolve({ dom, value })
        },
        () => {
          if (onCancel) {
            onCancel()
          }
          reject()
        },
        primaryAction
      )
    })
  }

  confirm(title: string, template: TemplateResult | string = '') {
    return new Promise((resolve, reject) => {
      this._open(title, template, resolve, reject)
    })
  }

  choices(choices:Array<any>) {
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
      this._open('select one', template, (_:HTMLElement, value:any) => resolve(value), reject, false)
    })
  }
}
