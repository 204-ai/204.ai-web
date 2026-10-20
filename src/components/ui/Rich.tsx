import { Fragment } from 'react'

/** Paragraph copy from content JSON: `**…**` renders bold, "\n" a line break (SPEC I.content). */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/\*\*(.+?)\*\*/g).map((part, j) => (j % 2 ? <b key={j}>{part}</b> : part))}
        </Fragment>
      ))}
    </>
  )
}
