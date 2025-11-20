import styles from './Banner.module.css';

export default function Banner() {
  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <h1 className={styles.typewriter}>😘 Welcome!🫰</h1>
        <p>Explore and Share Freely</p>
      </div>

      <svg
        className={styles.waves}
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        shapeRendering="auto"
      >
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
          />
        </defs>
        <g className={styles.parallax}>
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="0"
            fill="rgba(255,255,255,0.5)"
          />
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="3"
            fill="rgba(255,255,255,0.3)"
          />
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="5"
            fill="rgba(255,255,255,0.2)"
          />
          <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fbf6ee" />
        </g>
      </svg>
    </div>
  );
}
