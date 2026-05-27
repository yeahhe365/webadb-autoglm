import { PanelLeftClose, Search, SquarePen, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AppCopy } from '../lib/appCopy'
import type { BusyTask } from '../lib/busyTask'
import type { AgentThreadSummary } from '../lib/threadStore'

type ChatHistorySidebarProps = {
  activeThreadId: string
  busyTask: BusyTask | null
  copy: AppCopy
  isOpen: boolean
  onClose: () => void
  onDeleteThread: (threadId: string) => void
  onNewChat: () => void
  onSelectThread: (threadId: string) => void
  threadSummaries: AgentThreadSummary[]
}

const MAX_RENDERED_HISTORY_ITEMS = 200

export function ChatHistorySidebar({
  activeThreadId,
  busyTask,
  copy,
  isOpen,
  onClose,
  onDeleteThread,
  onNewChat,
  onSelectThread,
  threadSummaries,
}: ChatHistorySidebarProps) {
  const [query, setQuery] = useState('')
  const isBusy = Boolean(busyTask)
  const shouldRenderHistoryContent = isOpen
  const trimmedQuery = query.trim()
  const filteredSummaries = useMemo(() => {
    if (!shouldRenderHistoryContent) {
      return []
    }
    const normalizedQuery = query.trim().toLocaleLowerCase()
    if (!normalizedQuery) {
      return threadSummaries.slice(0, MAX_RENDERED_HISTORY_ITEMS)
    }
    return threadSummaries
      .filter((summary) => {
        return [summary.title, summary.task]
          .filter(Boolean)
          .some((value) => value.toLocaleLowerCase().includes(normalizedQuery))
      })
      .slice(0, MAX_RENDERED_HISTORY_ITEMS)
  }, [query, shouldRenderHistoryContent, threadSummaries])
  const emptyLabel =
    threadSummaries.length === 0
      ? copy.historyEmpty
      : trimmedQuery
        ? copy.historyNoMatchesForQuery(trimmedQuery)
        : copy.historyNoMatches

  return (
    <aside
      className={`chat-history-sidebar ${isOpen ? 'open' : ''}`}
      aria-hidden={!isOpen}
      aria-label={copy.history}
      inert={isOpen ? undefined : true}
      role="complementary"
    >
      <div className="chat-history-header">
        <button
          type="button"
          className="icon-button chat-history-close"
          aria-label={copy.closeHistorySidebar}
          title={copy.closeHistorySidebar}
          onClick={onClose}
        >
          <PanelLeftClose size={20} strokeWidth={2} />
        </button>
        <span>{copy.history}</span>
        <small className="chat-history-count">{threadSummaries.length}</small>
      </div>

      {shouldRenderHistoryContent ? (
        <>
          <div className="chat-history-actions">
            <button
              type="button"
              className="chat-history-action"
              disabled={isBusy}
              onClick={onNewChat}
              title={isBusy ? copy.waitForCurrentRun : copy.newChat}
            >
              <SquarePen size={18} strokeWidth={2} />
              <span>{copy.newChat}</span>
            </button>

            <label className="chat-history-search">
              <Search size={17} />
              <span className="visually-hidden">{copy.historySearchAria}</span>
              <input
                aria-label={copy.historySearchAria}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.historySearchPlaceholder}
              />
              {query ? (
                <button
                  type="button"
                  aria-label={copy.historySearchClear}
                  title={copy.historySearchClear}
                  onClick={() => setQuery('')}
                >
                  <X size={14} />
                </button>
              ) : null}
            </label>
          </div>

          <div className="chat-history-list">
            {filteredSummaries.length === 0 ? (
              <div className="chat-history-empty">
                <SquarePen size={20} strokeWidth={2} aria-hidden="true" />
                <p>{emptyLabel}</p>
                {threadSummaries.length > 0 && trimmedQuery ? (
                  <button
                    type="button"
                    className="chat-history-empty-action"
                    onClick={() => setQuery('')}
                  >
                    {copy.historySearchClear}
                  </button>
                ) : null}
              </div>
            ) : (
              <section aria-label={copy.recentChats}>
                <h3>{copy.recentChats}</h3>
                <div className="chat-history-items">
                  {filteredSummaries.map((summary) => {
                    const isActive = summary.id === activeThreadId
                    return (
                      <div
                        className={`chat-history-item-row ${isActive ? 'active' : ''}`}
                        key={summary.id}
                      >
                        <button
                          type="button"
                          className="chat-history-item"
                          disabled={isBusy}
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={copy.openHistoryThread(summary.title)}
                          onClick={() => onSelectThread(summary.id)}
                          title={isBusy ? copy.waitForCurrentRun : summary.title}
                        >
                          <span
                            className={`chat-history-status-dot status-${summary.status}`}
                            aria-hidden="true"
                          />
                          <span className="chat-history-item-text">
                            <span className="chat-history-item-title">{summary.title}</span>
                            <span className="chat-history-item-meta">
                              {formatHistoryTimestamp(summary.updatedAt)}
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          className="chat-history-delete"
                          disabled={isBusy}
                          aria-label={copy.deleteHistoryThread(summary.title)}
                          title={
                            isBusy
                              ? copy.waitForCurrentRun
                              : copy.deleteHistoryThread(summary.title)
                          }
                          onClick={() => onDeleteThread(summary.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        </>
      ) : null}
    </aside>
  )
}

function formatHistoryTimestamp(timestamp: number) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
