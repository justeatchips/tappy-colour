export function showConfirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
      box-sizing: border-box;
    `

    const dialog = document.createElement('div')
    dialog.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 24px;
      max-width: 320px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    `

    const msg = document.createElement('p')
    msg.textContent = message
    msg.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      text-align: center;
    `
    dialog.appendChild(msg)

    const buttons = document.createElement('div')
    buttons.style.cssText = `display: flex; gap: 12px;`

    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = 'Keep it'
    cancelBtn.style.cssText = `
      flex: 1;
      padding: 14px;
      min-height: 52px;
      font-size: 16px;
      font-weight: 600;
      background: #f3f4f6;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      color: #374151;
    `

    const confirmBtn = document.createElement('button')
    confirmBtn.textContent = 'Delete'
    confirmBtn.style.cssText = `
      flex: 1;
      padding: 14px;
      min-height: 52px;
      font-size: 16px;
      font-weight: 600;
      background: #dc2626;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      color: white;
    `

    const close = (result: boolean) => {
      overlay.remove()
      resolve(result)
    }

    cancelBtn.addEventListener('click', () => close(false))
    cancelBtn.addEventListener('touchend', (e) => { e.preventDefault(); close(false) })
    confirmBtn.addEventListener('click', () => close(true))
    confirmBtn.addEventListener('touchend', (e) => { e.preventDefault(); close(true) })
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false) })

    buttons.appendChild(cancelBtn)
    buttons.appendChild(confirmBtn)
    dialog.appendChild(buttons)
    overlay.appendChild(dialog)
    document.body.appendChild(overlay)
  })
}
