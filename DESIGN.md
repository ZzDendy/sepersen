# DESIGN.md Sepersen

Keputusan visual yang mengikat. Skill tidak boleh mengubah ini.

Reading this as: aplikasi pendamping harian pribadi, untuk pemakaian malam dan pagi, gaya warm-premium tenang, dial ENERGY 2 / RHYTHM 1 / MOTION 2.

## Identitas
Sepersen, teman harian 1% lebih baik. Nada: lembut, memaafkan, tanpa streak yang menakuti. Bahasa Indonesia, tanpa em dash, tanpa buzzword AI. Motif identitas: monogram "1%" di kotak membulat, dipakai di kepala layar dan ikon aplikasi.

## Palet (2 inti + 1 aksen)
- Krem `--bg #FFF6E8`: latar, alasan: hangat dan rendah stimulasi untuk malam hari, kontras 16.32:1 dengan tinta.
- Tinta `--ink #1C1917`: teks utama, alasan: kontras 16.32:1 di atas krem, lebih hangat dari hitam murni.
- Karamel `--copper #92400E`: aksi utama dan judul kecil, alasan: kontras 7.09:1 sebagai teks putih di atasnya dan 6.38:1 di atas tint, rasa hangat pagi.
- Hijau dalam `--pine #065F46`: aksen momen selesai, alasan: dipakai hanya di status selesai dan pilihan aktif.
- Kartu putih `#FFFFFF` dengan garis `#F0DFC2`: alasan: satu tingkat garis rambut, pemisah dibantu bayangan lembut.
- Garis kolom isian `#A98A5F`: alasan: batas kontrol interaktif butuh 3:1, terukur 3.24:1 di atas putih.

## Tipografi
- Judul dan angka timer: Fraunces 600 (serif hangat premium, lembut tapi dewasa, bukan bulat anak-anak). Alasan: kontras bentuk dengan isi sans bikin hierarki jelas, terbaca sebagai judul tanpa perlu ukuran besar.
- Isi: Plus Jakarta Sans 400/500/600/700 (sans Indonesia, sangat terbaca di HP kecil malam hari). Alasan: digambar untuk bahasa Indonesia, bukaan huruf lebar, bobot medium tidak tipis di layar kecil.
- Ukuran dasar 16px, leting 1.6, judul H1 clamp 28-32px spasi -0.01em. Angka timer dan air pakai tabular-nums agar tidak goyang.

## Bentuk dan elevasi
- Radius bertingkat: kartu 20-26, tombol dan kolom isian 16, chip dan nav 999. Alasan: radius menandai jenis benda, bukan dekorasi.
- Bayangan hanya di dua tempat: kartu aksi utama dan nav mengambang. Alasan: elevasi menandai yang terpenting.
- Nav solid tanpa kaca. Alasan: backdrop-blur memaksa repaint tiap frame saat scroll di HP.
- Latar dibekukan: dekorasi radial menempel di viewport dan tidak ikut scroll. Alasan: repaint latar hilang saat scroll.
- Cahaya hanya di lingkaran halo timer Bengong. Alasan: satu titik fokus di layar gelap.
- Tanpa gradien warna mencolok, tanpa grid, tanpa stripe kiri, tanpa badge di atas judul, tanpa ilustrasi generik.

## Layout
Mobile only, satu kolom, lebar maks 480px, padding sisi 16px. Bottom nav 5 tujuan: Hari Ini, Jurnal, Bengong, Ingat, Ringkas, bentuk pil solid mengambang dengan ikon SVG 22px konsisten (gores 1.8, ujung bulat). Target sentuh min 48px Android. Layar Bengong: tinta pekat dengan teks krem, tanpa yang bisa diklik selain jeda dan selesai. Header semua layar: judul saja, tanpa kicker dan sub penjelas. Pengecualian: kalimat ringkasan dinamis, status izin, status tersimpan, dan label angka tetap ada karena itu isi, bukan hiasan.

## Motion (MOTION 2, semua pakai transform dan opacity)
- Buka layar: kartu muncul bertahap 60ms per kartu, naik 10px + fade 280ms ease-out. Alasan: menuntun mata dari atas ke bawah tanpa kejutan.
- Ganti tab: status langsung benar, konten baru naik 8px + fade 220ms bertahap 60ms per kartu. Alasan: perpindahan terasa sambung tanpa menunda status.
- Bilah air tipis + getar 10ms hanya di momen penting (target air tercapai, jurnal tersimpan, bengong selesai). Alasan: momen penting terasa dirayakan tanpa berisik.
- Halo Bengong: bernapas 4 detik (scale 1 ke 1.04, bayangan ikut mengembang), berhenti saat dijeda dan selesai. Alasan: irama napas, bukan hiasan; berhenti saat tidak dipakai agar hemat baterai.
- Toast: geser naik 12px + fade 200ms, keluar 160ms. Alasan: kabar datang dari bawah seperti diangkat.
- Tekan tombol: mengecil ke 0.96 dalam 120ms lalu kembali. Alasan: umpan balik sentuh yang terasa di jempol.
- Angka air: memantul lembut (scale 1.25 ke 1 dalam 220ms) tiap tambah. Alasan: momen minum terasa dirayakan.
- Semua mati total saat prefers-reduced-motion. Timer tetap ganti teks tanpa gerak.

## Fokus hangat tanpa kotak biru
- Tap highlight transparan di semua benda. Alasan: kilau abu biru bawaan Chrome hilang total.
- Outline hanya muncul saat keyboard (focus-visible), 3px copper. Alasan: klik mouse dan sentuh bersih, keyboard tetap tahu posisi, kontras 7.09:1 lolos.
- Layar gelap pakai outline krem 16.86:1. Judul programmatic tanpa outline. Tidak ada outline none tanpa ganti.

## Layar sambutan izin awal
- Satu layar scroll saat buka pertama: 2 kartu izin opsional, boleh lewati semua. Alasan: izin diminta sekali di depan dengan bahasa lembut, bukan muncul tiba tiba.
- Izin 1 notifikasi pengingat makan. Alasan: di APK bunyi walau aplikasi ditutup lewat alarm OS; di browser bunyi saat Sepersen terbuka. Tanpa lokasi dan tanpa data keluar HP.
- Izin 2 getar momen penting. Alasan: target air, jurnal, dan timer selesai terasa dirayakan. Tanpa getar pun aplikasi jalan penuh; status jujur bila HP tidak bergetar.
- Tiap kartu ada status teks (Mati, Nyala), bukan warna saja. Tidak ada izin lokasi, kamera, kontak, atau file. Kartu pasang ke layar utama dibuang karena distribusi sekarang APK.

## Pengingat asli (khusus APK)
- WebView tidak punya Web Notification API, jadi pengingat lewat jembatan asli `NotifikasiAndroid`: tampilkan kabar, minta izin, getar, dan jadwal harian. Alasan: pengingat bunyi walau aplikasi ditutup, tanpa Firebase dan tanpa server.
- Jadwal makan (pagi, siang, malam) didaftarkan ulang tiap simpan pengaturan dan tiap buka aplikasi. Alarm inexact harian dijadwal ulang tiap berbunyi dan tiap HP dinyalakan. Alasan: cukup tepat tanpa izin exact alarm, tetap jalan setelah reboot.
- Di browser biasa jembatan tidak ada dan alur web standar dipakai (toast + Web Notification). Pesan "tidak didukung" diganti "kabar di aplikasi" agar tidak menakuti.

## Premium 2 (tanpa tambah fitur)
- Monogram berbingkai emas tipis + kilau atas. Alasan: satu tanda pemilik yang terasa mahal tanpa gambar baru.
- Kartu hero berlapis (highlight atas + bayangan dua tingkat). Kartu flat di atas #FFFEFB. Alasan: hierarki terbaca sekali lihat.
- Tombol utama berkilau tekan + bayangan menekan. Alasan: umpan balik jempol yang terasa mahal.
- Timer Bengong memakai cincin progres krem mengelilingi halo. Alasan: sisa waktu terbaca tanpa angka saja.
- Nav aktif memakai titik kecil di bawah label. Alasan: status terbaca tanpa warna saja.
- Toast berkabar pine di kiri. Alasan: kabar sukses punya tanda selain warna.

## Layar MVP
1. Hari Ini: sapa, win 1% cepat, mood 10 detik, checklist makan dan air, ritual pagi dan malam, jalan pintas.
2. Jurnal: 3 prompt kecil, riwayat, status kosong jujur.
3. Bengong: timer 10 menit, timer fokus 15 menit, timer rem scroll 10 menit, masing masing mulai, jeda, selesai.
4. Ingat: jam makan, target air, tombol izin notifikasi.
5. Ringkasan: rekap 7 hari terakhir dari data lokal. Isi: satu kalimat lembut, hitung jurnal, win, bengong, rata air, mood tersering, grafik air 7 hari SVG dengan label angka tiap bar, daftar 7 hari teks (bukan warna saja). Tanpa streak, tanpa cloud, tanpa angka palsu.
