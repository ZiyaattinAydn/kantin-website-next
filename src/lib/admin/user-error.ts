// A closed catalogue prevents exception messages from exposing infrastructure or user data.
const friendlyMessages = new Set<string>([
  "Admin notu en fazla 5000 karakter olabilir.",
  "Alt metin en fazla 500 karakter olabilir.",
  "Ana sayfa bölüm sırası eksik veya geçersiz.",
  "Başvuru bulunamadı.",
  "Bu kayıt pasife alınamıyor.",
  "Bu modülde yeni kayıt oluşturma kapalı.",
  "CV silinemedi ve anonimleştirme kilidi geri alınamadı; işlemi tekrar dene.",
  "Dry-run: Anonimleştirme için başvuru önce Arşiv durumuna alınmalı.",
  "Dry-run: CV medya kaydı bulunamadı.",
  "Fiyat izin verilen aralığın dışında.",
  "Fiyat sıfır veya daha büyük olmalı.",
  "Fiyat zorunlu.",
  "Fiyatı 85 veya 85,50 biçiminde gir.",
  "Geçersiz başvuru güncellemesi.",
  "Geçersiz medya yayın durumu.",
  "Kalıcı silme onayı doğrulanamadı. İşlemi ekrandaki kalıcı silme düğmesinden yeniden başlat.",
  "Kalıcı silme yalnız ziyaretçi sitesinde kullanılabilen görseller için uygulanabilir.",
  "Kalıcı silmeden önce kaydı pasife almalı veya arşivlemelisin.",
  "Kalıcı silmeden önce medya arşivlenmeli.",
  "Medya adı en fazla 180 karakter olabilir.",
  "Medya adı ve alt metin zorunlu.",
  "Medya kaydı bulunamadı.",
  "Medya sırası sıfır veya daha büyük bir tam sayı olmalı.",
  "Onay alanına ANONIMLESTIR yazılmalı.",
  "Silme işleminden etkilenecek bağlantılar doğrulanamadı.",
  "Yeni görsel dosyası seçilmedi.",
  "Yüklenecek görsel seçilmedi.",
]);
export function friendlyAdminError(
  error: unknown,
  fallback = "Bu işlem şu anda tamamlanamadı. Tekrar deneyin.",
): string {
  const message = error instanceof Error ? error.message : "";
  return friendlyMessages.has(message) ? message : fallback;
}
