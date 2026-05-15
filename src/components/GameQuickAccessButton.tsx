interface GameQuickAccessButtonProps {
  onOpen: () => void
}

export default function GameQuickAccessButton({ onOpen }: GameQuickAccessButtonProps) {
  return (
    <button
      type="button"
      className="game-quick-access-button"
      aria-label="江湖随览"
      onClick={onOpen}
    >
      江湖随览
    </button>
  )
}
