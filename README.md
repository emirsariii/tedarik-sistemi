Restoran Tedarik ve Stok Yönetimi Sistemi
Proje Açıklaması
Bu proje, restoran işletmelerinde tedarik ve stok süreçlerini dijital ortamda yönetilebilir hale getiren, veriye dayalı karar destek mekanizmaları ile güçlendirilmiş web tabanlı bir sistemdir. Sistem sadece bir veri kayıt aracı değil; stok yaşam döngüsünü, gıda güvenliğini (SKT) denetleyen ve tedarikçi verimliliğini ölçen kapsamlı bir çözümdür.
Projenin Amacı
Restoran işletmelerindeki stok takibi, satın alma talepleri ve tedarikçi yönetimini hatasız gerçekleştirmek; ürün son kullanma tarihi (SKT) takibi, tedarikçi performans analizi ve geçmiş tüketim hızına dayalı akıllı sipariş önerileri ile işletme verimliliğini maksimize etmektir.
Kullanılan Teknolojiler
Frontend (Arayüz): HTML (%21.1), CSS (%7.2), JavaScript (%71.7) (Gerekirse kullandığınız diğer kütüphaneleri buraya ekleyebilirsiniz)
Backend (Sunucu): Node.js / Express.js
Veritabanı: MySQL (İlişkisel ve ACID prensiplerine uygun)
Kurulum Adımları
Projeyi bilgisayarınıza klonlayın:
Veritabanı kurulumu: database klasöründeki SQL dosyasını MySQL sunucunuza aktarın ve bağlantı ayarlarını yapılandırın.
Backend bağımlılıklarını yükleyin:
Frontend bağımlılıklarını yükleyin (varsa):
Çalıştırma Adımları
MySQL veritabanı sunucusunun çalıştığından emin olun.
Backend sunucusunu başlatın:
Frontend uygulamasını başlatın:
Tarayıcınızda http://localhost:3000 (veya ilgili port) adresine giderek uygulamayı görüntüleyin.
Ekran Görüntüleri
(Projenizin çalışan arayüzünden aldığınız ekran görüntülerini Görseller veya screenshots isimli bir klasör oluşturarak repo içine yüklemeyi unutmayın
. Ardından görsel isimlerini aşağıdaki gibi güncelleyebilirsiniz.)
Özellikler
Rol Bazlı Yetkilendirme (RBAC): Admin, Yönetici, Depo Sorumlusu ve Satın Alma Sorumlusu olmak üzere 4 farklı yetki seviyesi.
Akıllı Stok ve SKT Yönetimi: Kritik stok eşik uyarıları ve yaklaşan son kullanma tarihleri için otomatik bildirimler.
Satın Alma Talep ve Onay Sistemi: Tüketim hızına dayalı talep oluşturma ve hiyerarşik yönetici onay mekanizması.
Tedarikçi Performans Değerlendirmesi: Zamanında teslimat, fiyat uygunluğu ve kaliteye dayalı otomatik tedarikçi puanlama sistemi (0-100 arası).
Parçalı Teslimat ve Fire Takibi: Eksik gelen ürünlerin takibi ve tüketim, bozulma, iade nedenli fire/israf sınıflandırması.
Güvenlik (Audit Logs): Tüm sistemsel ve veri tabanı değişikliklerinin kayıt altına alınarak izlenebilmesi.
Klasör Yapısı
backend/ - Sunucu tarafı kodları, API yönlendirmeleri ve iş mantığı.
frontend/ - Kullanıcı arayüzü (UI) bileşenleri ve sayfalar.
database/ - Veritabanı şemaları (ER ve Tablolar) ve SQL dosyaları.
Dokümantasyon/ - Proje raporu ve genel bilgilendirme belgeleri.
Görseller/ - Uygulamaya ait ekran görüntüleri (Screenshots).
Geliştirme Önerileri
Mobil Uygulama Entegrasyonu: Depo sorumlularının stok sayımlarını ve barkod okutma işlemlerini mobil cihazlar üzerinden yapabilmesi.
Yapay Zeka Destekli Tahmin: Geçmiş yılların tüketim verilerine dayalı olarak makine öğrenmesi modelleri ile gelecekteki stok ihtiyaçlarının otomatik tahmin edilmesi.
Finansal Yazılım Entegrasyonu: Gerçekleşen ödemelerin işletmenin mevcut muhasebe yazılımlarına otomatik aktarılması.
Katkıda Bulunan Kişiler
Muhammed Emir Sarı - emirsariii
Sıla Serdar - SilaSerdar
Hasan Çavdar - hasan-cavdar
Abdülrahim Usta - abdulUsta1
Recep Akşar - aksar43
