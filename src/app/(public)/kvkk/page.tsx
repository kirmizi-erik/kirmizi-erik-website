import Link from "next/link";

export const metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "Kırmızı Erik Reklam Ajansı KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
      <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
        <span className="bg-brand size-1.5 rounded-full" />
        Yasal
      </div>
      <h1 className="font-heading mt-5 text-4xl leading-tight font-black tracking-tight sm:text-5xl">
        KVKK Aydınlatma Metni
      </h1>
      <p className="text-muted-foreground mt-4 text-sm">
        Yürürlük: 9 Mayıs 2026
      </p>

      <div className="prose prose-invert mt-12 max-w-none space-y-6 text-foreground/90 text-base leading-relaxed">
        <section>
          <h2 className="text-foreground text-2xl font-bold">1. Veri Sorumlusu</h2>
          <p className="mt-3">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel
            verileriniz; veri sorumlusu sıfatıyla <strong>Kırmızı Erik Reklam Ajansı</strong>{" "}
            (Begonya Sk. Nida Kule, Ataşehir / İstanbul) tarafından aşağıda açıklanan kapsamda
            işlenebilecektir.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-2xl font-bold">2. İşlenen Kişisel Veriler</h2>
          <p className="mt-3">Tarafımıza ilettiğiniz bilgiler şunları içerebilir:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>Kimlik bilgileri (ad-soyad)</li>
            <li>İletişim bilgileri (e-posta, telefon, şirket bilgisi)</li>
            <li>Brief / proje talep içeriği (mesaj metniniz)</li>
            <li>Teknik veriler (IP adresi, tarayıcı bilgisi — yalnızca güvenlik amaçlı)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground text-2xl font-bold">3. İşleme Amaçları</h2>
          <p className="mt-3">Kişisel verileriniz aşağıdaki amaçlarla işlenir:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>Brief ve proje taleplerine cevap vermek</li>
            <li>Hizmet sunumu kapsamında iletişim kurmak</li>
            <li>Teklif hazırlamak ve sözleşme süreçlerini yürütmek</li>
            <li>Yasal yükümlülükleri yerine getirmek</li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground text-2xl font-bold">4. Hukuki Sebep</h2>
          <p className="mt-3">
            Kişisel verileriniz; KVKK m.5/2 (c) sözleşmenin kurulması ve ifası, m.5/2 (f) meşru
            menfaat ve açık rızanız çerçevesinde işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-2xl font-bold">5. Aktarım</h2>
          <p className="mt-3">
            Kişisel verileriniz; iş ortaklarımıza, hizmet aldığımız altyapı sağlayıcılarına
            (Supabase, Vercel, Resend gibi yurt içi/dışı servis sağlayıcıları) yalnızca işbu
            metinde belirtilen amaçlarla ve KVKK m.8 ve m.9 düzenlemelerine uygun olarak
            aktarılabilir.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-2xl font-bold">6. Haklarınız</h2>
          <p className="mt-3">KVKK m.11 kapsamında her zaman:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenen verilerinizin silinmesini veya yok edilmesini isteme</li>
            <li>Verilerin aktarıldığı üçüncü kişileri öğrenme</li>
            <li>Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme</li>
          </ul>
          <p className="mt-3">
            haklarına sahipsiniz. Taleplerinizi{" "}
            <a
              href="mailto:info@kirmizierik.com.tr"
              className="text-brand hover:underline"
            >
              info@kirmizierik.com.tr
            </a>{" "}
            adresine iletebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-2xl font-bold">7. İletişim</h2>
          <p className="mt-3">
            <strong>Kırmızı Erik Reklam Ajansı</strong>
            <br />
            Begonya Sk. Nida Kule, Ataşehir / İstanbul
            <br />
            E-posta:{" "}
            <a
              href="mailto:info@kirmizierik.com.tr"
              className="text-brand hover:underline"
            >
              info@kirmizierik.com.tr
            </a>
            <br />
            Telefon: +90 532 261 82 22
          </p>
        </section>
      </div>

      <div className="border-border/40 mt-16 border-t pt-8">
        <Link
          href="/iletisim"
          className="text-brand hover:underline text-sm"
        >
          ← İletişim formuna geri dön
        </Link>
      </div>
    </article>
  );
}
