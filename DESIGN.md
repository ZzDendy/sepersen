# DESIGN.md Sepersen

Keputusan visual yang mengikat. Skill tidak boleh mengubah ini.

Reading this as: aplikasi pendamping harian pribadi, untuk pemakaian malam dan pagi, gaya dark-premium tenang, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

Sumber arah: file unduhan pengguna `/home/dendy/Downloads/sepersen.html` + `/home/dendy/Downloads/icon.svg` (ditimpa penuh ke `index.html` + `icon.svg` pada 2026-11-10). Ini arah pemilik, bukan selera agen.

## Identitas
Sepersen, teman harian 1% lebih baik. Nada: lembut, memaafkan, tanpa streak yang menakuti. Bahasa Indonesia, tanpa em dash, tanpa buzzword AI. Motif identitas: orb cincin 6 segmen (satu segmen per hal kecil yang beres) + logo lingkaran progres ungu-peach.

## Palet (gelap, inti ungu + aksen peach + mint)
- Latar `--#15122A` ke `#241B40`: alasan: gelap hangat, cocok malam hari, log dan teks terbaca tanpa silau.
- Teks `--ink #F2EEFB`: alasan: kontras tinggi di atas gelap.
- Teks redup `--mut #B8B1D3`: alasan: teks sekunder tetap lolos baca.
- Peach `--peach #FFB48F`: alasan: satu-satunya aksen hangat untuk tombol utama, segmen orb aktif, dan progres timer.
- Mint `--mint #8FE0C0`: alasan: status selesai dan centang makan.
- Garis `--line rgba(255,255,255,.13)`, kaca `--glass rgba(255,255,255,.06)`: alasan: pemisah panel tanpa bayangan berat.

## Tipografi
- Judul dan angka: Bricolage Grotesque 600/700 (display berkarakter, dewasa). Alasan: hierarki jelas tanpa ukuran raksasa.
- Isi: Figtree 400/500/600 (sans bersih, terbaca di HP kecil malam hari). Alasan: bukaan huruf lega, bobot medium tidak tipis.
- Judul H1 clamp 34-42px spasi -0.025em, H2 21px. Angka orb 68px, timer 60px tabular-nums.

## Bentuk dan elevasi
- Panel kaca radius 28px dengan tepi bergradasi + bayangan dalam. Alasan: kedalaman tanpa gambar.
- Tombol pil penuh. Alasan: target jempol 48px ke atas, konsisten di semua layar.
- Nav kaca blur pil 5 tombol + indikator meluncur. Alasan: tetap terbaca saat scroll, posisi aktif jelas bergerak.
- Cahaya: orb bernapas + cincin putar + timer bercahaya. Alasan: satu titik fokus per layar, bukan hiasan di mana-mana.
- Tanpa badge di atas judul, tanpa ilustrasi generik, tanpa angka palsu.

## Layout
Mobile only, satu kolom, lebar maks 480px, padding sisi 20px. Bottom nav 5 tujuan: Hari Ini, Jurnal, Bengong, Ingat, Ringkas. Target sentuh min 48px. Header semua layar: judul saja + tanggal kecil. Pengecualian: kalimat ringkasan dinamis, status izin, status tersimpan, dan label angka tetap ada karena itu isi.

## Motion (MOTION 2, transform dan opacity)
- Masuk layar: tiap anak naik + fade bertahap 75ms. Alasan: menuntun mata dari atas ke bawah.
- Orb: segmen menyala bertahap + napas 6 detik + cincin putar 9 detik. Alasan: kemajuan terasa hidup, bukan statis.
- Tombol: kilau geser 6 detik + riak sentuh + pegas tekan. Alasan: umpan balik jempol yang terasa mahal.
- Gelas air: terisi berurutan + tetes pegas. Alasan: momen minum dirayakan.
- Grafik: batang tumbuh 900ms bertahap. Alasan: rekap terbaca tanpa kaget.
- Semua mati total saat prefers-reduced-motion.

## Fokus hangat tanpa kotak biru
- Tap highlight transparan di semua benda. Alasan: kilau abu biru bawaan Chrome hilang total.
- Outline hanya muncul saat keyboard (focus-visible), 3px peach. Alasan: klik bersih, keyboard tetap tahu posisi.

## Layar sambutan izin awal
- Satu sheet bawah saat buka pertama: 2 kartu izin opsional (notifikasi + getar), boleh lewati semua. Alasan: izin diminta sekali di depan dengan bahasa lembut.
- Tidak ada izin lokasi, kamera, kontak, atau file. Kartu pasang ke layar utama dibuang karena distribusi sekarang APK.

## Pengingat asli (khusus APK)
- WebView tidak punya Web Notification API, jadi pengingat lewat jembatan asli `NotifikasiAndroid`: tampilkan kabar, minta izin, getar, dan jadwal harian. Alasan: pengingat bunyi walau aplikasi ditutup, tanpa Firebase dan tanpa server.
- Jadwal makan (pagi, siang, malam) didaftarkan ulang tiap simpan pengaturan dan tiap buka aplikasi. Alarm inexact harian dijadwal ulang tiap berbunyi dan tiap HP dinyalakan.

## Layar
1. Hari Ini: tanggal, orb 11 hal kecil, win 1%, mood, makan, air gelas, ritual pagi dan malam, jalan pintas.
2. Jurnal: 3 prompt, riwayat 10 terakhir, status kosong jujur.
3. Bengong: 3 mode timer (Bengong 10, Fokus 15, Rem 10) + cincin progres.
4. Ingat: jam makan, target air, tombol izin notifikasi.
5. Ringkasan: rekap 7 hari dari data lokal. Hitung win, jurnal, gelas air, ritual, menit bengong dan fokus. Grafik air + daftar win + pips 11 per hari. Tanpa streak, tanpa cloud, tanpa angka palsu.
- Penyimpanan lokal kunci `sepersen:v2` (skema baru, tidak migrasi otomatis dari skema lama `sepersen-day-*`; data lama tidak terbawa).

## Optimasi HP kentang (tanpa ubah tampilan)
- Latar tidak lagi bergerak (drift 30 detik dimatikan). Alasan: transform viewport tiap frame bikin scroll patah.
- Noise tanpa blend overlay + opacity diturunkan. Alasan: mix-blend memaksa repaint tiap frame.
- Cincin putar orb dimatikan total, napas orb sekali saat muncul. Alasan: 2 loop infinite nonstop paling berat di layar utama.
- Kilau tombol dimatikan, riak sentuh dimatikan. Alasan: animasi tiap ketuk menumpuk saat scroll cepat.
- Nav tanpa backdrop-blur (solid 0.94). Alasan: blur tiap frame saat scroll paling mahal di HP.
- Halo timer statis saat jalan (tanpa loop). Cincin progres tetap jalan karena itu isi. Alasan: loop 4 detik + drop-shadow bikin timer patah.
- Cincin timer tanpa drop-shadow, orb tanpa glow, angka tanpa text-shadow. Alasan: filter bayangan tiap frame mahal di GPU HP.
- Grafik 600ms + jeda 50ms, breakpoint 380px. Alasan: tetap hidup tapi selesai cepat.

## Ide Kilat + Niat pengingat
- Ide Kilat di Beranda: kolom 1 baris + Catat, daftar terbaru di atas, Beres pindah jadi win hari ini (lalu ide dihapus), Hapus buang ide. Maks 50 ide. Alasan: ide lewat tidak hilang, satu ketuk jadi win tanpa ketik ulang.
- Niat: mau apa + jam + Sekali saja/Tiap hari + Pasang pengingat. Daftar tampil jam + ulang + status bunyi + Hapus. Alasan: niat seperti masak nasi habis solat jadi alarm beneran.
- Sekali saja pakai exact sekali jalan; tiap hari pakai inexact harian + dijadwal ulang tiap berbunyi dan reboot. Alasan: tepat untuk sekali, hemat baterai untuk harian.
- Fix pindah win: sempat tidak tampil karena home() tidak dipanggil; sekarang panggil home() + ide ikut terhapus agar tidak dobel.