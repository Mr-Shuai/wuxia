import { useEffect, useLayoutEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'

export type OverlayTab = 'tasks' | 'status' | 'inventory'

interface GameOverlayPanelProps {
  activeTab: OverlayTab
  onChangeTab: (tab: OverlayTab) => void
  onClose: () => void
  children: ReactNode
}

const tabs: Array<{ key: OverlayTab; label: string }> = [
  { key: 'tasks', label: '任务' },
  { key: 'status', label: '状态' },
  { key: 'inventory', label: '背包' },
]

function getTabId(tab: OverlayTab) {
  return `game-overlay-tab-${tab}`
}

function getTabPanelId(tab: OverlayTab) {
  return `game-overlay-panel-${tab}`
}

const overlayTitleId = 'game-overlay-title'

export default function GameOverlayPanel({ activeTab, onChangeTab, onClose, children }: GameOverlayPanelProps) {
  const dialogRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const tabRefs = useRef<Record<OverlayTab, HTMLButtonElement | null>>({
    tasks: null,
    status: null,
    inventory: null,
  })

  function getFocusableElements() {
    if (!dialogRef.current) {
      return []
    }

    return Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true' && element.tabIndex >= 0,
    )
  }

  useLayoutEffect(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const firstInteractiveElement = closeButtonRef.current ?? getFocusableElements()[0] ?? dialogRef.current
    firstInteractiveElement?.focus()

    return () => {
      if (returnFocusRef.current && document.contains(returnFocusRef.current)) {
        returnFocusRef.current.focus()
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== 'Tab') {
      return
    }

    const focusableElements = getFocusableElements()

    if (focusableElements.length === 0) {
      event.preventDefault()
      dialogRef.current?.focus()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const activeElementIsInsideDialog = activeElement ? dialogRef.current?.contains(activeElement) : false

    if (event.shiftKey) {
      if (!activeElementIsInsideDialog || activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }

      return
    }

    if (!activeElementIsInsideDialog || activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  function focusTab(tab: OverlayTab) {
    tabRefs.current[tab]?.focus()
  }

  function handleTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, tab: OverlayTab) {
    const currentIndex = tabs.findIndex((item) => item.key === tab)

    if (currentIndex === -1) {
      return
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const nextTab = tabs[(currentIndex + 1) % tabs.length].key
      onChangeTab(nextTab)
      window.setTimeout(() => focusTab(nextTab), 0)
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const nextTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length].key
      onChangeTab(nextTab)
      window.setTimeout(() => focusTab(nextTab), 0)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      onChangeTab(tabs[0].key)
      window.setTimeout(() => focusTab(tabs[0].key), 0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      const lastTab = tabs[tabs.length - 1].key
      onChangeTab(lastTab)
      window.setTimeout(() => focusTab(lastTab), 0)
    }
  }

  return (
    <div className="game-overlay-root">
      <button
        type="button"
        className="game-overlay-backdrop"
        data-testid="overlay-backdrop"
        aria-label="关闭江湖随览遮罩"
        tabIndex={-1}
        onClick={onClose}
      />
      <section
        ref={dialogRef}
        className="game-overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={overlayTitleId}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="game-overlay-shell">
          <header className="game-overlay-header">
            <div className="game-overlay-title-block">
              <p id={overlayTitleId} className="eyebrow">江湖随览</p>
              <h2>总览当前行程、状态与行囊</h2>
              <p className="muted">整页覆盖保留沉浸感，但正文收束到更易读的宽度。</p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="game-overlay-close"
              aria-label="关闭江湖随览"
              onClick={onClose}
            >
              关闭
            </button>
          </header>

          <div className="game-overlay-tabs" role="tablist" aria-label="江湖随览页签">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                ref={(element) => {
                  tabRefs.current[tab.key] = element
                }}
                type="button"
                id={getTabId(tab.key)}
                role="tab"
                aria-controls={getTabPanelId(tab.key)}
                aria-selected={activeTab === tab.key}
                tabIndex={activeTab === tab.key ? 0 : -1}
                className={activeTab === tab.key ? 'game-overlay-tab active' : 'game-overlay-tab'}
                onClick={() => onChangeTab(tab.key)}
                onKeyDown={(event) => handleTabKeyDown(event, tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            id={getTabPanelId(activeTab)}
            className={`game-overlay-body game-overlay-body-${activeTab}`}
            role="tabpanel"
            aria-labelledby={getTabId(activeTab)}
          >
            {children}
          </div>
        </div>
      </section>
    </div>
  )
}
