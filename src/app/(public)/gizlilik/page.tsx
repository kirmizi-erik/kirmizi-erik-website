import Link from "next/link";

export const metadata = {
  title: "Gizlilik Politikası",
  description: "Kırmızı Erik Reklam Ajansı gizlilik politikası ve çerez kullanımı.",
};

export default function GizlilikPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
      <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
        <span className="bg-brand size-1.5 rounded-full" />
        Yasal
      </div>
      <h1 className="font-heading mt-5 text-4xl leading-tight font-black tracking-tight sm:text-5xl">
        Gizlilik Politikası
      </h1>
      <p className="text-muted-foreground mt-4 text-sm">
        Yürürlük: 9 Mayıs 2026
      </p>

      <div className="prose prose-invert mt-12 max-w-none space-y-6 text-foreground/90 text-base leading-relaxed">
        <section>
          <h2 className="text-foreground text-2xl font-bold">Genel</h2>
          <p className="mt-3">
            Bu sayfa, <strong>kirmizierik.com.tr</strong> sitesini ziyaret eden kullanıcıların
            kişisel verilerine ve gizliliğine ilişkin genel ilkeleri açıklar. Detaylı yasal
            metin için{" "}
            <Link href="/kvkk" className="text-brand hover:underline">
              KVKK Aydınlatma Metni
            </Link>{" "}
            sayfamıza bakabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-2xl font-bold">Topladığımız Bilgiler</h2>
          <p className="mt-3">
            Site üzerinden yalnızca kullanıcının kendisinin paylaştığı bilgileri toplarız:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>İletişim formu üzerinden gönderilen ad, e-posta, telefon, şirket bilgisi</li>
            <li>Brief / proje açıklaması</li>
            <li>Sohbet asistanı (chatbot) ile gönüllü olarak paylaşılan bilgi</li>
          </ul>
          <p className="mt-3">
            Ayrıca site performansı ve güvenliği için teknik bilgiler (IP, tarayıcı, ziyaret
            zamanı) anonim olarak loglanabilir.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-2xl font-bold">Çerezler (Cookies)</h2>
          <p className="mt-3">
            Site; oturum yönetimi (admin paneli) ve site tercihleri için temel çerezler
            kullanır. Üçüncü taraf reklam çerezi kullanılmaz. Tarayıcınızdan çerezleri her
            zaman silebilir veya engelleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-2xl font-bold">Verilerin Saklanması</h2>
          <p className="mt-3">
            Kişisel veriler güvenli altyapı üzerinde (Supabase) şifrelenmiş olarak saklanır.
            Veri yalnızca brief'inize yanıt vermek ve sözleşme süreçlerini yürütmek amacıyla
            kullanılır. İhtiyaç ortadan kalktığında veriler silinir.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-2xl font-bold">Üçüncü Taraf Servisler</h2>
          <p className="mt-3">
            Kullandığımız altyapı servisleri:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>
              <strong>Vercel</strong> — site hosting (ABD/AB)
            </li>
            <li>
              <strong>Supabase</strong> — veritabanı ve depolama (AB)
            </li>
            <li>
              <strong>Resend</strong> — e-posta bildirimleri (ABD/AB)
            </li>
            <li>
              <strong>Anthropic</strong> — sohbet asistanı (Claude API, ABD)
            </li>
          </ul>
          <p className="mt-3">
            Bu servisler kendi gizlilik politikalarına tabidir; aktarılan veri yalnızca hizmet
            sunumu için gerekli minimum düzeydedir.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-2xl font-bold">İletişim</h2>
          <p className="mt-3">
            Gizliliğe ilişkin sorularınız için:{" "}
            <a
              href="mailto:info@kirmizierik.com.tr"
              className="text-brand hover:underline"
            >
              info@kirmizierik.com.tr
            </a>
          </p>
        </section>
      </div>

      <div className="border-border/40 mt-16 border-t pt-8">
        <Link href="/" className="text-brand hover:underline text-sm">
          ← Anasayfaya dön
        </Link>
      </div>
    </article>
  );
}
