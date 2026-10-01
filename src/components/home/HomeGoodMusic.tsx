import styles from "./HomeGoodMusic.module.css";

const moods = [
  {
    index: "01",
    title: "Güne giriş",
    subtitle: "İlk kahve, ilk masa.",
    description:
      "Günün başında fonda duran, konuşmayı bölmeyen bir seçki için ayrılan yer.",
  },
  {
    index: "02",
    title: "Masa uzadı",
    subtitle: "Bir tur daha.",
    description:
      "Akşam hızlanırken ritmi yükselten ama masanın önüne geçmeyen seçki.",
  },
  {
    index: "03",
    title: "Geceye doğru",
    subtitle: "Kapanışa daha var.",
    description:
      "Gece uzadığında devralacak daha karanlık ve daha hareketli taraf.",
  },
] as const;

export default function HomeGoodMusic() {
  return (
    <section className={styles.section} id="iyi-muzik">
      <div className={`container ${styles.container}`}>
        <header className={`${styles.header} reveal`}>
          <div>
            <p className={styles.eyebrow}>Kantin Radio</p>
            <h2>
              İyi müzik<span>.</span>
            </h2>
          </div>
          <p className={styles.lead}>
            Masada ne varsa müzik de onun kadar önemli. Kantin seçkileri
            hazırlanıyor; hazır olduğunda günün farklı saatleri için ayrı
            listeler burada olacak.
          </p>
        </header>

        <div className={`${styles.stage} reveal reveal-delay-1`}>
          <div className={styles.stageGrid}>
            <div className={styles.recordScene} aria-hidden="true">
              <span className={styles.orbit} />
              <div className={styles.record}>
                <span className={styles.recordGrooveOne} />
                <span className={styles.recordGrooveTwo} />
                <span className={styles.recordLabel}>
                  <b>kantin.</b>
                  <small>radio</small>
                </span>
              </div>
              <span className={styles.toneArm}>
                <i />
              </span>
            </div>

            <div className={styles.stageCopy}>
              <div className={styles.statusRow}>
                <span className={styles.liveDot} aria-hidden="true" />
                <span>Seçkiler hazırlanıyor</span>
              </div>

              <p className={styles.stageKicker}>Yakında burada</p>
              <h3>Masaya göre bir soundtrack.</h3>
              <p>
                Tek bir “Kantin playlisti” yerine günün ritmine göre ayrılan
                küçük seçkiler tasarlıyoruz. Spotify listeleri hazır olduğunda
                bu alan doğrudan dinlemeye açılacak.
              </p>

              <div className={styles.wave} aria-hidden="true">
                {Array.from({ length: 28 }, (_, index) => (
                  <span
                    key={index}
                    style={{ "--bar": index } as React.CSSProperties}
                  />
                ))}
              </div>

              <div className={styles.meta}>
                <span>Alsancak + Atakent</span>
                <span>3 ayrı mood</span>
                <span>Spotify yakında</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.moods} aria-label="Hazırlanan müzik seçkileri">
          {moods.map((mood, index) => (
            <article
              className={`${styles.moodCard} reveal${
                index === 1
                  ? " reveal-delay-1"
                  : index === 2
                    ? " reveal-delay-2"
                    : ""
              }`}
              key={mood.index}
            >
              <div className={styles.moodTop}>
                <span>{mood.index}</span>
                <span className={styles.pending}>yakında</span>
              </div>
              <div>
                <p>{mood.subtitle}</p>
                <h3>{mood.title}</h3>
              </div>
              <p className={styles.moodDescription}>{mood.description}</p>
              <div className={styles.miniWave} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
