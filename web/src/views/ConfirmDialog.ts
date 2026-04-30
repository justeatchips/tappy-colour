import { createPanel, createPxButton } from '../ui/pixel'

export function showConfirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'tc-modal-scrim'

    const dialog = createPanel('tc-modal-card')

    const msg = document.createElement('p')
    msg.className = 'tc-dialog-message'
    msg.textContent = message
    dialog.appendChild(msg)

    const buttons = document.createElement('div')
    buttons.className = 'tc-dialog-actions'

    const close = (result: boolean) => {
      overlay.remove()
      resolve(result)
    }

    const cancelBtn = createPxButton({
      label: 'Keep it',
      variant: 'ghost',
      onClick: () => close(false),
    })
    cancelBtn.addEventListener('touchend', (e) => { e.preventDefault(); close(false) })

    const confirmBtn = createPxButton({
      label: 'Delete',
      variant: 'danger',
      onClick: () => close(true),
    })
    confirmBtn.addEventListener('touchend', (e) => { e.preventDefault(); close(true) })

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false) })

    buttons.appendChild(cancelBtn)
    buttons.appendChild(confirmBtn)
    dialog.appendChild(buttons)
    overlay.appendChild(dialog)
    document.body.appendChild(overlay)
  })
}
