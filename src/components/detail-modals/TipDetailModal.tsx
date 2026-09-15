import { Modal } from '../Modal'
import { splitParagraphs } from '../../lib/formatContent'

type Tip = {
  id: number
  title: string
  content: string
  source: string | null
}

type Props = {
  tip: Tip
  tags: string[]
  onClose: () => void
}

export function TipDetailModal({ tip, tags, onClose }: Props) {
  const paragraphs = splitParagraphs(tip.content)

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-2xl font-bold mb-2">{tip.title}</h2>

      <div className="flex flex-wrap gap-1 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`text-xs px-2 py-0.5 rounded-full border ${
              tag === 'Spoilers'
                ? 'border-marigold-harvest text-marigold-harvest font-semibold'
                : 'border-sage-meadow text-sage-meadow'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 text-sm">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {tip.source && (
        <p className="text-xs opacity-50 text-center mt-6">Source: {tip.source}</p>
      )}
    </Modal>
  )
}