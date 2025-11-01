# Showroom (Web • Discord • Other)

Tailwind CSS ve vanilla JavaScript ile yapılmış, satılık web site şablonları, Discord botları ve diğer ürünlerinizi sergileyebileceğiniz modern bir showroom.

## Özellikler
- Sekmeli kategori filtreleri: Web, Discord, Other
- Arama, sıralama (fiyat, ad, öne çıkan)
- Etiket bazlı filtreleme (kart üzerindeki #tag tıklanabilir)
- Ürün detay modalı (demo, repo, satın al linkleri)
- Koyu/açık tema (kalıcı)
- JSON veri kaynağı (yerel fallback ile)

## Başlangıç
1. Bu klasörü açın: `showroom/`
2. Dosyayı tarayıcıda açın: `index.html`

> Not: `assets/data/items.json` dosyasını `fetch` ile okuyoruz. Tarayıcılar `file://` üzerinden `fetch`'e CORS engeli koyabilir. Bu durumda uygulama otomatik olarak gömülü yedek veriyi kullanır. JSON'u aktif kullanmak için küçük bir yerel sunucu açabilirsiniz.

### Yerel sunucu önerileri (Windows PowerShell)
- Python ile:
  ```powershell
  python -m http.server 5173
  ```
  Sonra tarayıcıda: http://localhost:5173/showroom/

- Node `http-server` ile:
  ```powershell
  npx http-server -p 5173
  ```
  Sonra tarayıcıda: http://localhost:5173/showroom/

- VS Code Live Server eklentisi ile klasörü sağ tıklayıp "Open with Live Server".

## Veriyi düzenleme
- Ürünleri `assets/data/items.json` içinde düzenleyin.
- Alanlar:
  - `id`: benzersiz kimlik
  - `category`: `web` | `discord` | `other`
  - `title`, `description`, `price`, `featured`
  - `tags`: ["string"]
  - `image`: resim URL'si
  - `links`: `{ demoUrl, repoUrl, buyUrl }`

## Özelleştirme ipuçları
- Renkler ve gölgeler `index.html` içindeki `tailwind.config` bölümünde genişletildi.
- Ek küçük stiller `assets/css/styles.css` içerisinde.
- Bileşen yapısı ve veri akışı `assets/js/app.js` içerisinde.
- 
<img src="https://raw.githubusercontent.com/Leansxd/leans-showroom/refs/heads/main/assets/img1.png?token=GHSAT0AAAAAADNADW6IOQUK6QVBNFDOYLUU2HMEP5A" alt="Site Önizleme">
<img src="https://raw.githubusercontent.com/Leansxd/leans-showroom/refs/heads/main/assets/img2.png?token=GHSAT0AAAAAADNADW6ISIZQCKJ5OGYJPJS62HMEP4A" alt="Site Önizleme">

