import { useMediaQuery } from '../../hooks/useMediaQuery'
import { boxSrcSet, imgDims, imgRatio } from '../../lib/dims'
import { rendition } from '../../lib/media'
import { packColumns } from '../../lib/pack'
import styles from './CaseGallery.module.css'

/**
 * Prototype case gallery: up to three masonry columns packed from the manifest ratios
 * (SPEC V30: width/height attributes, lazy, no runtime probe). Phones get one column in
 * source order instead of the stacked desktop columns.
 */
export function CaseGallery({ srcs }: { srcs: string[] }) {
  const single = useMediaQuery('(max-width: 820px)')
  const cols = packColumns(srcs, imgRatio, single ? 1 : 3)
  return (
    <section className={styles.gallery}>
      <div className={styles.cols} style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
        {cols.map((col, i) => (
          <div key={i} className={styles.col}>
            {col.map((src) => (
              <img
                key={src}
                className={styles.g}
                src={rendition(src, 800)}
                srcSet={boxSrcSet(src)}
                sizes={single ? '100vw' : `${Math.round(100 / cols.length)}vw`}
                {...imgDims(src)}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
