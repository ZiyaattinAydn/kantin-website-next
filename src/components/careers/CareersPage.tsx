"use client";

import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import {
  careerAvailabilityDays,
  careerBranches,
  careerDepartments,
  careerEmploymentTypes,
  careersContactEmail,
  type CareerDepartmentId,
} from "@/data/careers";
import styles from "./CareersPage.module.css";

const MAX_CV_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const careerFormDoodles = [
  "/assets/img/merch/doodles/table-friends.png",
  "/assets/img/merch/doodles/high-five.png",
  "/assets/img/merch/doodles/jumping.png",
  "/assets/img/merch/doodles/walking.png",
  "/assets/img/merch/doodles/hugging.png",
  "/assets/img/merch/doodles/sharing-drink.png",
  "/assets/img/merch/doodles/bar-friends.png",
  "/assets/img/merch/doodles/cats-table.png",
  "/assets/img/merch/doodles/looking-up.png",
  "/assets/img/merch/doodles/table-friends.png",
  "/assets/img/merch/doodles/high-five.png",
  "/assets/img/merch/doodles/jumping.png",
  "/assets/img/merch/doodles/walking.png",
  "/assets/img/merch/doodles/hugging.png",
  "/assets/img/merch/doodles/sharing-drink.png",
  "/assets/img/merch/doodles/bar-friends.png",
  "/assets/img/merch/doodles/cats-table.png",
  "/assets/img/merch/doodles/looking-up.png",
] as const;

function getDepartment(id: string) {
  return careerDepartments.find((department) => department.id === id);
}

export default function CareersPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [departmentId, setDepartmentId] = useState<CareerDepartmentId>("service");
  const [shiftId, setShiftId] = useState("morning");
  const [fileError, setFileError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [mailtoUrl, setMailtoUrl] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  const selectedDepartment = useMemo(
    () => getDepartment(departmentId) ?? careerDepartments[0],
    [departmentId],
  );

  const handleDepartmentChange = (nextDepartmentId: CareerDepartmentId) => {
    const nextDepartment = getDepartment(nextDepartmentId) ?? careerDepartments[0];
    setDepartmentId(nextDepartmentId);
    setShiftId(nextDepartment.shifts[0].id);
    setMailtoUrl("");
  };

  const handleFileChange = (file: File | undefined) => {
    setMailtoUrl("");

    if (!file) {
      setFileError("");
      return;
    }

    const extensionAllowed = /\.(pdf|doc|docx)$/i.test(file.name);
    const typeAllowed = !file.type || ALLOWED_CV_TYPES.includes(file.type);

    if (!extensionAllowed || !typeAllowed) {
      setFileError("CV dosyası PDF, DOC veya DOCX formatında olmalı.");
      return;
    }

    if (file.size > MAX_CV_BYTES) {
      setFileError("CV dosyası en fazla 5 MB olabilir.");
      return;
    }

    setFileError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMailtoUrl("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const availability = formData.getAll("availability").map(String);
    const cv = formData.get("cv");

    if (!availability.length) {
      setAvailabilityError("En az bir uygun gün seçmelisin.");
      form.querySelector<HTMLInputElement>('input[name="availability"]')?.focus();
      return;
    }

    setAvailabilityError("");

    if (cv instanceof File && cv.size) {
      const extensionAllowed = /\.(pdf|doc|docx)$/i.test(cv.name);
      const typeAllowed = !cv.type || ALLOWED_CV_TYPES.includes(cv.type);

      if (!extensionAllowed || !typeAllowed || cv.size > MAX_CV_BYTES) {
        handleFileChange(cv);
        form.querySelector<HTMLInputElement>('input[name="cv"]')?.focus();
        return;
      }
    }

    const department = getDepartment(String(formData.get("department")));
    const shift = department?.shifts.find(
      (item) => item.id === formData.get("shift"),
    );
    const branch = careerBranches.find((item) => item.id === formData.get("branch"));
    const employment = careerEmploymentTypes.find(
      (item) => item.id === formData.get("employmentType"),
    );
    const fullName = String(formData.get("fullName") || "").trim();

    const body = [
      "Kantin ekip başvurusu",
      "",
      `Ad soyad: ${fullName}`,
      `Telefon: ${String(formData.get("phone") || "")}`,
      `E-posta: ${String(formData.get("email") || "")}`,
      `Şube: ${branch?.label ?? "-"}`,
      `Çalışma alanı: ${department?.label ?? "-"}`,
      `Çalışma biçimi: ${employment?.label ?? "-"}`,
      `Vardiya: ${shift ? `${shift.label} (${shift.hours})` : "-"}`,
      `Uygun günler: ${availability.join(", ")}`,
      `Benzer iş deneyimi: ${String(formData.get("experience") || "-")}`,
      "",
      "Kısa tanıtım:",
      String(formData.get("about") || "-"),
      "",
      cv instanceof File && cv.size
        ? `CV dosyası: ${cv.name} — e-postaya manuel olarak eklenmeli.`
        : "CV dosyası eklenmedi.",
    ].join("\n");

    const mailto = `mailto:${careersContactEmail}?subject=${encodeURIComponent(
      `Kantin ekip başvurusu — ${fullName}`,
    )}&body=${encodeURIComponent(body)}`;

    setSubmittedName(fullName);
    setMailtoUrl(mailto);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <img
          alt=""
          aria-hidden="true"
          className={`${styles.doodle} ${styles.doodleOne}`}
          src="/assets/img/merch/doodles/table-friends.png"
        />
        <img
          alt=""
          aria-hidden="true"
          className={`${styles.doodle} ${styles.doodleTwo}`}
          src="/assets/img/merch/doodles/high-five.png"
        />

        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">Ekibe katıl</p>
            <h1>
              Ritme sen de <span>katıl.</span>
            </h1>
            <p>
              Servis, mutfak, bar ve kasa ekipleri için genel başvuru formu.
              Samimi, hızlı ve birlikte çalışan bir ekibin parçası olmak isteyenleri bekliyoruz.
            </p>
            <div className={styles.heroActions}>
              <a href="#basvuru">Başvuruya geç <span aria-hidden="true">↓</span></a>
              <Link href="/#anilarimiz">Ekibi tanı</Link>
            </div>
          </div>

          <aside className={styles.heroCard}>
            <p className={styles.cardLabel}>Şimdilik iki şubede</p>
            <strong>Alsancak + Atakent</strong>
            <p>
              Vardiya saatleri şu an iki şube için ortak kabul edildi. İşletme bilgisi değişirse
              daha sonra güncelleriz.
            </p>
            <div className={styles.heroTags}>
              <span>Part-time uygun</span>
              <span>4 çalışma alanı</span>
              <span>CV yükleme</span>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.scheduleSection} aria-labelledby="schedule-title">
        <div className="container">
          <div className={styles.sectionHeading}>
            <div>
              <p className="eyebrow">Vardiyalar net olsun</p>
              <h2 id="schedule-title">Çalışma alanları.</h2>
            </div>
            <p>
              Part-time başvuru her alanda yapılabilir. Servis ve mutfakta sabah-akşam,
              bar ve kasada akşam vardiyası bulunuyor.
            </p>
          </div>

          <div className={styles.departmentGrid}>
            {careerDepartments.map((department, index) => (
              <article className={styles.departmentCard} key={department.id}>
                <span className={styles.departmentNumber}>0{index + 1}</span>
                <h3>{department.label}</h3>
                <p>{department.description}</p>
                <div className={styles.shiftList}>
                  {department.shifts.map((shift) => (
                    <div key={shift.id}>
                      <span>{shift.label}</span>
                      <strong>{shift.hours}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.formSection} id="basvuru" aria-labelledby="application-title">
        <div className={styles.formDoodles} aria-hidden="true">
          {careerFormDoodles.map((src, index) => (
            <img
              alt=""
              className={`${styles.formDoodle} ${styles[`formDoodle${index + 1}`]}`}
              key={`${src}-${index}`}
              src={src}
            />
          ))}
        </div>

        <div className={`container ${styles.formLayout}`}>
          <aside className={styles.formIntro}>
            <p className="eyebrow">Genel başvuru</p>
            <h2 id="application-title">Kendinden biraz bahset.</h2>
            <p>
              Formun ön yüz akışı hazır. Supabase bağlantısına geçtiğimizde başvurular güvenli
              biçimde kaydedilecek ve CV dosyaları özel depolama alanına yüklenecek.
            </p>

            <div className={styles.processList}>
              <div><span>1</span><p>Alanını ve vardiyanı seç.</p></div>
              <div><span>2</span><p>Uygun günlerini ve deneyimini paylaş.</p></div>
              <div><span>3</span><p>CV’ni ekleyip başvurunu tamamla.</p></div>
            </div>

            <p className={styles.temporaryNote}>
              Geçici başvuru adresi: <a href={`mailto:${careersContactEmail}`}>{careersContactEmail}</a>
            </p>
          </aside>

          <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate={false}>
            <fieldset className={styles.fieldset}>
              <legend>İletişim bilgileri</legend>
              <div className={styles.twoColumns}>
                <label>
                  <span>Ad soyad</span>
                  <input name="fullName" autoComplete="name" required />
                </label>
                <label>
                  <span>Telefon</span>
                  <input
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="05xx xxx xx xx"
                    required
                  />
                </label>
              </div>
              <label>
                <span>E-posta</span>
                <input name="email" type="email" autoComplete="email" required />
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>Başvuru tercihi</legend>
              <div className={styles.twoColumns}>
                <label>
                  <span>Şube</span>
                  <select name="branch" defaultValue="either" required>
                    {careerBranches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Çalışma biçimi</span>
                  <select name="employmentType" defaultValue="part-time" required>
                    {careerEmploymentTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>Çalışma alanı</span>
                <select
                  name="department"
                  value={departmentId}
                  onChange={(event) => handleDepartmentChange(event.target.value as CareerDepartmentId)}
                  required
                >
                  {careerDepartments.map((department) => (
                    <option key={department.id} value={department.id}>{department.label}</option>
                  ))}
                </select>
              </label>

              <div className={styles.choiceGroup}>
                <span>Vardiya</span>
                <div className={styles.radioGrid}>
                  {selectedDepartment.shifts.map((shift) => (
                    <label className={styles.choiceCard} key={shift.id}>
                      <input
                        type="radio"
                        name="shift"
                        value={shift.id}
                        checked={shiftId === shift.id}
                        onChange={() => setShiftId(shift.id)}
                        required
                      />
                      <span>
                        <strong>{shift.label}</strong>
                        <small>{shift.hours}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>Uygunluk ve deneyim</legend>
              <div className={styles.choiceGroup}>
                <span>Hangi günler uygunsun?</span>
                <div className={styles.dayGrid}>
                  {careerAvailabilityDays.map((day) => (
                    <label key={day}>
                      <input
                        type="checkbox"
                        name="availability"
                        value={day}
                        onChange={() => {
                          setAvailabilityError("");
                          setMailtoUrl("");
                        }}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
                {availabilityError ? <p className={styles.error}>{availabilityError}</p> : null}
              </div>

              <div className={styles.choiceGroup}>
                <span>Daha önce benzer bir işte çalıştın mı?</span>
                <div className={styles.inlineChoices}>
                  <label><input type="radio" name="experience" value="Evet" required /> Evet</label>
                  <label><input type="radio" name="experience" value="Hayır" required /> Hayır</label>
                </div>
              </div>

              <label>
                <span>Kendinden kısaca bahset</span>
                <textarea
                  name="about"
                  rows={6}
                  maxLength={1200}
                  placeholder="Deneyimin, çalışma yaklaşımın ve Kantin ekibine neden katılmak istediğin..."
                  required
                />
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>CV ve onay</legend>
              <label className={styles.fileField}>
                <span>CV yükle <small>PDF, DOC veya DOCX · en fazla 5 MB</small></span>
                <input
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => handleFileChange(event.target.files?.[0])}
                />
              </label>
              {fileError ? <p className={styles.error}>{fileError}</p> : null}

              <label className={styles.consent}>
                <input name="consent" type="checkbox" required />
                <span>
                  Başvuru bilgilerimin işe alım süreci için değerlendirilmesini kabul ediyorum.
                  KVKK metni backend aşamasında nihai haliyle eklenecek.
                </span>
              </label>
            </fieldset>

            <button className={styles.submitButton} type="submit">
              Başvuruyu hazırla <span aria-hidden="true">↗</span>
            </button>

            {mailtoUrl ? (
              <div className={styles.success} role="status">
                <div>
                  <strong>{submittedName}, formun hazır.</strong>
                  <p>
                    Backend henüz bağlı olmadığı için bilgiler kaydedilmedi. Aşağıdaki bağlantı geçici
                    e-posta taslağını açar; CV dosyanı e-postaya manuel olarak eklemelisin.
                  </p>
                </div>
                <a href={mailtoUrl}>E-posta taslağını aç ↗</a>
              </div>
            ) : null}
          </form>
        </div>
      </section>
    </div>
  );
}
