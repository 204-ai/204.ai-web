import styles from './TitleCard.module.css'

/** Prototype chapter break: mono chapter, display name, mono tail. */
export function TitleCard({ chapter, name, tail }: { chapter: string; name: string; tail: string }) {
  return (
    <div className={styles.card}>
      <div className={`${styles.chap} r-up`}>{chapter}</div>
      <div className={`${styles.name} r-up d-1`}>{name}</div>
      <div className={`${styles.tail} r-up d-2`}>{tail}</div>
    </div>
  )
}
