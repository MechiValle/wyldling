type Props = {
  number: number
  title: string
  description: string
}

export function InstructionStep({ number, title, description }: Props) {
  return (
    <div className="flex gap-4 border-2 border-sage-meadow rounded-xl p-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sage-meadow text-white font-display font-bold flex items-center justify-center">
        {number}
      </div>
      <div>
        <h3 className="font-display font-semibold mb-1">{title}</h3>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  )
}