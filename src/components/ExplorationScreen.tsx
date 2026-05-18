import { useEffect, useState } from 'react'
import ResultScreen from './ResultScreen'
import StatusPanel from './StatusPanel'
import type { ExplorationMapDefinition, ExplorationMapNode, ExplorationReward, GameState } from '../game/types'

interface InlineResultState {
  text: string
  recentLogs: string[]
  streaming: boolean
}

interface ExplorationScreenProps {
  state: GameState
  map: ExplorationMapDefinition
  onNodeAction: (nodeId: string, shopItemId?: string) => void
  inlineResult?: InlineResultState | null
  disableChoices?: boolean
}

function getNodeTypeLabel(node: ExplorationMapNode) {
  switch (node.type) {
    case 'shop':
      return '商铺'
    case 'training':
      return '试步'
    case 'sidequest':
      return '支线'
    case 'intel':
      return '情报'
    case 'exit':
      return '返程'
  }
}

function getNodeActionLabel(node: ExplorationMapNode) {
  switch (node.type) {
    case 'training':
      return '试步习得'
    case 'sidequest':
      return '了结此事'
    case 'intel':
      return '搜查此处'
    case 'exit':
      return '结束探索并返回主线'
    default:
      return null
  }
}

function getNodeRoutePosition(index: number, totalCount: number) {
  const xTrack = [24, 64, 36, 76, 50, 28]
  const x = xTrack[index % xTrack.length]
  const y = totalCount <= 1 ? 50 : 14 + (index * 72) / (totalCount - 1)

  return { x, y }
}

function getNodeVisualTone(node: ExplorationMapNode) {
  switch (node.type) {
    case 'intel':
      return { className: 'exploration-node-tone-intel', emblem: '闻' }
    case 'training':
      return { className: 'exploration-node-tone-training', emblem: '武' }
    case 'shop':
      return { className: 'exploration-node-tone-shop', emblem: '市' }
    case 'sidequest':
      return { className: 'exploration-node-tone-sidequest', emblem: '义' }
    case 'exit':
      return { className: 'exploration-node-tone-exit', emblem: '归' }
  }
}

function getRewardPreviewText(reward?: ExplorationReward) {
  if (!reward) {
    return null
  }

  const rewardKinds: string[] = []

  if (reward.martialSkillId) {
    rewardKinds.push('武学')
  }

  if (reward.weaponId) {
    rewardKinds.push('兵刃')
  }

  if (reward.itemId) {
    rewardKinds.push('物件')
  }

  if (rewardKinds.length === 0) {
    return null
  }

  return `可能所得：${rewardKinds.join('、')}`
}

function formatPriceRange(prices: number[]) {
  if (prices.length === 0) {
    return null
  }

  const lowestPrice = Math.min(...prices)
  const highestPrice = Math.max(...prices)

  if (lowestPrice === highestPrice) {
    return `${lowestPrice} 两`
  }

  return `${lowestPrice}-${highestPrice} 两`
}

function getNodePreviewSummary(state: GameState, mapId: string, node: ExplorationMapNode) {
  if (node.type === 'shop') {
    const shopItems = node.shopItems ?? []
    const availableItems = shopItems.filter((item) => !state.purchasedShopItems.includes(item.id))
    const prices = formatPriceRange((availableItems.length > 0 ? availableItems : shopItems).map((item) => item.price))

    if (!prices) {
      return '可查看货架。'
    }

    const itemCount = availableItems.length > 0 ? availableItems.length : shopItems.length

    return `可采购 ${itemCount} 项 · ${prices}`
  }

  if (node.type === 'exit') {
    return '返回主线，收束本次自由探索。'
  }

  if (isMapNodeCompleted(state, mapId, node) && node.once) {
    return '此处已办妥，可转看别处。'
  }

  return getRewardPreviewText(node.type === 'sidequest' ? node.quest?.reward ?? node.reward : node.reward)
}

function getNodePreviewAction(node: ExplorationMapNode) {
  if (node.type === 'shop') {
    return '查看可买物件'
  }

  return getNodeActionLabel(node) ?? '查看详情'
}

function getNodePreviewPosition(x: number, y: number) {
  const alignEnd = x >= 56
  const left = Math.min(78, Math.max(22, x + (alignEnd ? -22 : 22)))
  const top = Math.min(84, Math.max(18, y))

  return {
    left,
    top,
    alignEnd,
  }
}

function isShopNodeCompleted(state: GameState, node: ExplorationMapNode) {
  if (node.type !== 'shop') {
    return false
  }

  const requiredPurchases = node.shopItems?.filter((item) => item.once !== false).map((item) => item.id) ?? []

  if (requiredPurchases.length === 0) {
    return false
  }

  return requiredPurchases.every((itemId) => state.purchasedShopItems.includes(itemId))
}

function isMapNodeCompleted(state: GameState, mapId: string, node: ExplorationMapNode) {
  if (node.type === 'shop') {
    return isShopNodeCompleted(state, node)
  }

  return state.completedMapNodes.includes(`${mapId}:${node.id}`)
}

function getMapProgress(state: GameState, map: ExplorationMapDefinition) {
  const progressNodes = map.nodes.filter((node) => node.type !== 'exit')
  const completedCount = progressNodes.filter((node) => isMapNodeCompleted(state, map.id, node)).length

  return {
    completedCount,
    totalCount: progressNodes.length,
  }
}

function getExplorationMood(disableChoices: boolean, inlineResult: InlineResultState | null) {
  if (inlineResult?.streaming) {
    return {
      badge: '线索回响中',
      summary: '先看清刚得到的回声，新的落子还要稍等片刻。',
    }
  }

  if (disableChoices) {
    return {
      badge: '暂缓出手',
      summary: '局面已经有变化，先稳住心神，再决定摸哪一条暗线。',
    }
  }

  return {
    badge: '可继续探查',
    summary: '这里还留着可摸的痕迹，先看收益，再决定从哪一处下手。',
  }
}

export default function ExplorationScreen({
  state,
  map,
  onNodeAction,
  inlineResult = null,
  disableChoices = false,
}: ExplorationScreenProps) {
  const [selectedNodeId, setSelectedNodeId] = useState(map.nodes[0]?.id ?? '')
  const [previewNodeId, setPreviewNodeId] = useState('')

  useEffect(() => {
    setSelectedNodeId((current) => {
      if (current && map.nodes.some((node) => node.id === current)) {
        return current
      }

      return map.nodes[0]?.id ?? ''
    })
    setPreviewNodeId('')
  }, [map])

  const explorationMood = getExplorationMood(disableChoices, inlineResult)
  const selectedNode = map.nodes.find((node) => node.id === selectedNodeId) ?? map.nodes[0]
  const mapProgress = getMapProgress(state, map)
  const routeNodes = map.nodes.map((node, index) => ({
    node,
    index,
    ...getNodeRoutePosition(index, map.nodes.length),
  }))

  if (!selectedNode) {
    return null
  }

  const selectedNodeCompleted = isMapNodeCompleted(state, map.id, selectedNode)
  const nodeActionLabel = getNodeActionLabel(selectedNode)
  const selectedRouteNode = routeNodes.find((item) => item.node.id === selectedNode.id) ?? routeNodes[0]
  const previewNode = map.nodes.find((node) => node.id === previewNodeId)
  const previewRouteNode = routeNodes.find((item) => item.node.id === previewNodeId)
  const previewNodeCompleted = previewNode ? isMapNodeCompleted(state, map.id, previewNode) : false
  const previewNodeSummary = previewNode ? getNodePreviewSummary(state, map.id, previewNode) : null
  const previewNodePosition = previewRouteNode ? getNodePreviewPosition(previewRouteNode.x, previewRouteNode.y) : null
  const previewNodeAction = previewNode ? getNodePreviewAction(previewNode) : null

  return (
    <main className="screen shell two-column exploration-layout">
      <section className="panel story-panel">
        <header className="story-header exploration-hero">
          <div className="exploration-hero-copy">
            <p className="eyebrow">探索 · {map.id}</p>
            <h1>{map.title}</h1>
            <p className="location">{map.location}</p>
            <p className="muted exploration-hero-lead">{map.summary}</p>
          </div>
          <div className="exploration-hero-status">
            <span className={`exploration-phase-badge ${disableChoices ? 'exploration-phase-hold' : 'exploration-phase-open'}`}>
              自由探索
            </span>
            <div className="exploration-status-strip" aria-label="探索状态">
              <span className="exploration-meta-pill">{explorationMood.badge}</span>
              <span className="exploration-meta-pill">银两 {state.silver}</span>
              <span className="exploration-meta-pill">已完成 {mapProgress.completedCount}/{mapProgress.totalCount}</span>
            </div>
            <p>{explorationMood.summary}</p>
          </div>
        </header>

        {inlineResult ? (
          <ResultScreen
            eyebrow="探索所得"
            title=""
            text={inlineResult.text}
            streaming={inlineResult.streaming}
            className="story-echo-panel"
          />
        ) : null}

        <section className="exploration-content-grid">
          <section className="choice-section exploration-overview-card">
            <div className="choice-section-header exploration-overview-header">
              <div>
                <p className="eyebrow">地图总览</p>
                <h2>把路径、落点与收束一眼看清</h2>
              </div>
              <span className="muted">{disableChoices ? '先看清刚发生的变化，再决定下一步。' : '点选节点查看细节，再决定是否出手。'}</span>
            </div>

            <div className="exploration-route-summary" aria-label="当前路径摘要">
              <span className="exploration-route-pill">当前节点：{selectedNode.title}</span>
              <span className="exploration-route-pill">类型：{getNodeTypeLabel(selectedNode)}</span>
              <span className="exploration-route-pill">序位：{String(selectedRouteNode.index + 1).padStart(2, '0')}</span>
            </div>

            <section className="exploration-route-board" aria-label="探索路径图">
              <div className="exploration-route-board-glow" aria-hidden="true" />
              <div className="exploration-route-board-grid" aria-hidden="true" />
              <svg className="exploration-route-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {routeNodes.slice(0, -1).map((item, index) => {
                  const nextItem = routeNodes[index + 1]
                  const currentCompleted = isMapNodeCompleted(state, map.id, item.node)
                  const isSelectedPath = selectedRouteNode.index > index

                  return (
                    <line
                      key={`${item.node.id}-${nextItem.node.id}`}
                      x1={item.x}
                      y1={item.y}
                      x2={nextItem.x}
                      y2={nextItem.y}
                      className={`exploration-route-line${currentCompleted ? ' exploration-route-line-complete' : ''}${isSelectedPath ? ' exploration-route-line-active' : ''}`}
                    />
                  )
                })}
              </svg>

              {routeNodes.map(({ node, index, x, y }) => {
                const isSelected = node.id === selectedNode.id
                const isCompleted = isMapNodeCompleted(state, map.id, node)
                const detailId = `${map.id}-${node.id}-detail`
                const metaId = `${map.id}-${node.id}-meta`
                const tone = getNodeVisualTone(node)

                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`choice-button exploration-node-button exploration-node-anchor ${tone.className}${isSelected ? ' exploration-node-button-selected' : ''}${isCompleted ? ' exploration-node-button-completed' : ''}`}
                    onClick={() => setSelectedNodeId(node.id)}
                    onMouseEnter={() => setPreviewNodeId(node.id)}
                    onMouseLeave={() => setPreviewNodeId((current) => (current === node.id ? '' : current))}
                    onFocus={() => setPreviewNodeId(node.id)}
                    onBlur={() => setPreviewNodeId((current) => (current === node.id ? '' : current))}
                    aria-current={isSelected ? 'step' : undefined}
                    aria-label={node.title}
                    aria-describedby={`${detailId} ${metaId}`}
                    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <span className="exploration-node-emblem" aria-hidden="true">{tone.emblem}</span>
                    <span className="exploration-action-kicker">节点 {String(index + 1).padStart(2, '0')}</span>
                    <strong>{node.title}</strong>
                    <span id={detailId} className="exploration-action-hint">{node.description}</span>
                    <span id={metaId} className="exploration-action-meta">
                      {getNodeTypeLabel(node)}
                      {isCompleted ? ' · 已完成' : node.once ? ' · 仅首次有效' : ' · 可重复查看'}
                    </span>
                  </button>
                )
              })}

              {previewNode && previewNodePosition && previewNodeAction ? (
                <article
                  className={`exploration-node-preview${previewNodePosition.alignEnd ? ' exploration-node-preview-align-end' : ''}`}
                  style={{ left: `${previewNodePosition.left}%`, top: `${previewNodePosition.top}%`, pointerEvents: 'none' }}
                  aria-live="polite"
                >
                  <p className="eyebrow">落点预览</p>
                  <h3>{previewNode.title}</h3>
                  <p className="exploration-node-preview-copy">{previewNode.description}</p>
                  <div className="exploration-node-preview-pills">
                    <span className="exploration-route-pill">下一手：{previewNodeAction}</span>
                    <span className="exploration-route-pill">状态：{previewNodeCompleted ? '已办妥' : '待出手'}</span>
                  </div>
                  {previewNodeSummary ? <p className="exploration-node-preview-meta">{previewNodeSummary}</p> : null}
                </article>
              ) : null}
            </section>
          </section>

          <section className="choice-section exploration-detail-panel">
            <div className="choice-section-header">
              <div>
                <p className="eyebrow">节点详情</p>
                <h2>{selectedNode.title}</h2>
              </div>
              <span className="choice-count">{getNodeTypeLabel(selectedNode)}</span>
            </div>

            <div className="exploration-copy-card">
              <p>{selectedNode.description}</p>
              {selectedNode.once && selectedNodeCompleted ? <p className="muted">此处已经处理完毕。</p> : null}
            </div>

            {selectedNode.type === 'shop' ? (
              <div className="exploration-shop-list">
                {selectedNode.shopItems?.map((item) => {
                  const isPurchased = state.purchasedShopItems.includes(item.id)
                  const cannotAfford = state.silver < item.price
                  const metaId = `${map.id}-${selectedNode.id}-${item.id}-meta`

                  return (
                    <article key={item.id} className="exploration-shop-card">
                      <div className="exploration-shop-card-header">
                        <div>
                          <h3>{item.name}</h3>
                          <p className="muted">{item.description}</p>
                        </div>
                        <strong>{item.price} 两</strong>
                      </div>
                      <button
                        type="button"
                        className="choice-button exploration-shop-action"
                        onClick={() => onNodeAction(selectedNode.id, item.id)}
                        disabled={disableChoices || isPurchased || cannotAfford}
                        aria-label={`购买 ${item.name}`}
                        aria-describedby={metaId}
                      >
                        <strong>{`购买 ${item.name}`}</strong>
                        <span id={metaId} className="exploration-action-meta">
                          {isPurchased ? '已购入' : cannotAfford ? '银两不足' : item.once ? '仅可购买一次' : '可再次购买'}
                        </span>
                      </button>
                    </article>
                  )
                })}
              </div>
            ) : nodeActionLabel ? (
              <button
                type="button"
                className="choice-button exploration-detail-action"
                onClick={() => onNodeAction(selectedNode.id)}
                disabled={disableChoices || (selectedNode.type !== 'exit' && selectedNode.once && selectedNodeCompleted)}
                aria-label={nodeActionLabel}
                aria-describedby={`${map.id}-${selectedNode.id}-action-meta`}
              >
                <strong>{nodeActionLabel}</strong>
                <span id={`${map.id}-${selectedNode.id}-action-meta`} className="exploration-action-meta">
                  {selectedNode.type === 'exit' ? '离开自由探索并回到主线推进。' : selectedNodeCompleted ? '此处已经办妥。' : '执行后仍会留在当前地图中。'}
                </span>
              </button>
            ) : null}
          </section>
        </section>
      </section>
      <StatusPanel state={state} compact />
    </main>
  )
}
