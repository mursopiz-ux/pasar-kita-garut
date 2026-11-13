import { CheckCircle2, FileText, ImagePlus, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApprovalStatusLabel } from '../components/ApprovalStatusLabel';
import { DemoNotice } from '../components/DemoNotice';
import { OptimizedImage } from '../components/OptimizedImage';
import { APP_CONFIG } from '../config/appConfig';
import { useDemoApp } from '../context/DemoAppContext';
import { CULINARY_CRAFT_IMAGE, PROFESSIONAL_PORTRAIT_IMAGE, SERVICE_STUDIO_IMAGE } from '../data/demoData';
import { ListingType, type CompressedImageResult } from '../types';
import { validateImageFile, validatePdfFile } from '../utils/fileValidation';
import { formatBytes, formatRupiah } from '../utils/formatters';
import { compressImageWithThumbnail } from '../utils/imageCompression';

type DashboardTab = 'register-business' | 'catalog-media' | 'professional-cv';

export function UserDashboardPage() {
  const {
    businesses,
    products,
    professionals,
    categories,
    kecamatanList,
    session,
    dataSource,
    addBusinessDemo,
    updateBusinessMediaDemo,
    addProductDemo,
    upsertMyProfessionalDemo,
    updateProfessionalCvDemo,
  } = useDemoApp();

  const [activeTab, setActiveTab] = useState<DashboardTab>('register-business');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State pendaftaran usaha baru
  const [bizName, setBizName] = useState('');
  const [bizTagline, setBizTagline] = useState('');
  const [bizCategory, setBizCategory] = useState(categories[0]?.slug ?? 'kuliner-oleh-oleh');
  const [bizKecamatan, setBizKecamatan] = useState(kecamatanList[0]?.slug ?? 'garut-kota');
  const [bizAddress, setBizAddress] = useState('');
  const [bizWhatsapp, setBizWhatsapp] = useState('');
  const [bizEmail, setBizEmail] = useState(session?.email ?? '');
  const [bizDesc, setBizDesc] = useState('');
  const [bizVision, setBizVision] = useState('');
  const [bizMission, setBizMission] = useState('');
  const [bizYear, setBizYear] = useState(2024);
  const [bizTeamSize, setBizTeamSize] = useState('3 - 5 Orang');
  const [bizLegal, setBizLegal] = useState('NIB Perorangan');
  const [logoUpload, setLogoUpload] = useState<CompressedImageResult | null>(null);
  const [coverUpload, setCoverUpload] = useState<CompressedImageResult | null>(null);
  const [compressing, setCompressing] = useState(false);

  // State katalog & media usaha
  const [selectedBizId, setSelectedBizId] = useState(businesses[0]?.id ?? '');
  const [prodType, setProdType] = useState<ListingType>(ListingType.PRODUCT);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('45000');
  const [prodUnit, setProdUnit] = useState('pcs');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState<CompressedImageResult | null>(null);

  // State profil profesional & CV PDF
  const [proName, setProName] = useState(session?.name ?? '');
  const [proHeadline, setProHeadline] = useState('');
  const [proKecamatan, setProKecamatan] = useState('garut-kota');
  const [proSkills, setProSkills] = useState('Desain Grafis, Administrasi, Microsoft Excel');
  const [proExpYears, setProExpYears] = useState(2);
  const [proEdu, setProEdu] = useState('');
  const [proSummary, setProSummary] = useState('');
  const [proWhatsapp, setProWhatsapp] = useState('');
  const [proEmail, setProEmail] = useState(session?.email ?? '');
  const [proAvatar, setProAvatar] = useState<CompressedImageResult | null>(null);
  const [pdfMeta, setPdfMeta] = useState<{
    name: string;
    size: number;
    objectUrl: string;
  } | null>(null);
  const [targetProIdForPdf, setTargetProIdForPdf] = useState(professionals[0]?.id ?? '');

  const handleImageSelect = async (
    file: File | undefined,
    onSuccess: (res: CompressedImageResult) => void
  ) => {
    setUploadError(null);
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.valid) {
      setUploadError(check.error ?? 'Berkas gambar tidak valid.');
      return;
    }
    setCompressing(true);
    try {
      const result = await compressImageWithThumbnail(file);
      onSuccess(result);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Gagal mengompres gambar.');
    } finally {
      setCompressing(false);
    }
  };

  const handlePdfSelect = (file: File | undefined, attachToExistingId?: string) => {
    setUploadError(null);
    if (!file) return;
    const check = validatePdfFile(file);
    if (!check.valid) {
      setUploadError(check.error ?? 'Berkas PDF tidak valid.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPdfMeta({ name: file.name, size: file.size, objectUrl });
    if (attachToExistingId) {
      updateProfessionalCvDemo(attachToExistingId, file.name, file.size, objectUrl);
      setFeedback(`CV PDF "${file.name}" (${formatBytes(file.size)}) berhasil dilampirkan.`);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setFeedback(null);

    if (bizName.trim().length < 3 || bizTagline.trim().length < 5 || !bizWhatsapp.trim()) {
      setUploadError('Nama usaha, deskripsi singkat, dan nomor WhatsApp wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await addBusinessDemo({
        name: bizName.trim(),
        tagline: bizTagline.trim(),
        categorySlug: bizCategory,
        kecamatanSlug: bizKecamatan,
        address: bizAddress.trim() || `Kec. ${bizKecamatan}, Kab. Garut`,
        whatsapp: bizWhatsapp.trim(),
        email: bizEmail.trim() || 'usaha@pasarkitagarut.demo',
        description: bizDesc.trim() || bizTagline.trim(),
        operatingHours: 'Senin - Sabtu · 08.00 - 17.00 WIB',
        logoUrl: logoUpload?.thumbnailDataUrl || SERVICE_STUDIO_IMAGE,
        coverUrl: coverUpload?.dataUrl || logoUpload?.dataUrl || SERVICE_STUDIO_IMAGE,
        vision: bizVision.trim() || 'Menyediakan layanan dan produk unggulan bagi warga Garut.',
        missionText:
          bizMission.trim() || 'Menjaga kualitas produk lokal.\nMelayani pelanggan dengan ramah.',
        foundedYear: bizYear,
        teamSize: bizTeamSize,
        legalStatus: bizLegal,
      });

      setSelectedBizId(created.id);
      setBizName('');
      setBizTagline('');
      setBizAddress('');
      setBizDesc('');
      setLogoUpload(null);
      setCoverUpload(null);
      setFeedback(
        `Usaha "${created.name}" berhasil disimpan dan berstatus Menunggu Persetujuan Admin.`
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Gagal mendaftarkan usaha.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setFeedback(null);

    const targetBizId = selectedBizId || businesses[0]?.id;
    if (!targetBizId || prodName.trim().length < 3) {
      setUploadError('Pilih usaha dan isi nama produk/jasa minimal 3 karakter.');
      return;
    }

    const parsedPrice = Number(prodPrice);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setUploadError('Harga harus berupa angka lebih dari 0.');
      return;
    }

    setSubmitting(true);
    try {
      const added = await addProductDemo({
        businessId: targetBizId,
        type: prodType,
        name: prodName.trim(),
        price: parsedPrice,
        unit: prodUnit.trim() || 'pcs',
        description: prodDesc.trim() || 'Item katalog usaha.',
        imageUrl: prodImage?.dataUrl || CULINARY_CRAFT_IMAGE,
        thumbnailUrl: prodImage?.thumbnailDataUrl || CULINARY_CRAFT_IMAGE,
      });

      setProdName('');
      setProdDesc('');
      setProdImage(null);
      setFeedback(`"${added.name}" (${formatRupiah(added.price)}) berhasil disimpan ke katalog.`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Gagal menambahkan katalog.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setFeedback(null);

    if (proName.trim().length < 3 || proHeadline.trim().length < 3 || !proWhatsapp.trim()) {
      setUploadError('Nama lengkap, bidang keahlian, dan nomor WhatsApp wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await upsertMyProfessionalDemo({
        fullName: proName.trim(),
        headline: proHeadline.trim(),
        kecamatanSlug: proKecamatan,
        skillsText: proSkills,
        experienceYears: Number(proExpYears) || 1,
        education: proEdu.trim() || 'Pendidikan Terakhir',
        summary:
          proSummary.trim() || `Profesional di bidang ${proHeadline.trim()} wilayah Garut.`,
        whatsapp: proWhatsapp.trim(),
        email: proEmail.trim() || 'profesional@pasarkitagarut.demo',
        avatarUrl: proAvatar?.thumbnailDataUrl || PROFESSIONAL_PORTRAIT_IMAGE,
        cvPdfName: pdfMeta?.name ?? null,
        cvPdfSizeBytes: pdfMeta?.size ?? null,
        cvPdfObjectUrl: pdfMeta?.objectUrl ?? null,
      });

      setFeedback(
        `Profil profesional "${created.fullName}" berhasil disimpan dan siap ditinjau di Dashboard Admin.`
      );
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Gagal menyimpan profil profesional.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBiz = businesses.find((b) => b.id === selectedBizId) ?? businesses[0];
  const selectedBizProducts = products.filter((p) => p.businessId === selectedBiz?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-emerald-800">
            {session ? `Masuk sebagai ${session.name}` : 'Mode Uji Coba Pengguna (DEMO)'}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Dashboard Pengguna
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Daftar usaha gratis, kompres foto logo &amp; produk otomatis, serta unggah CV dalam format PDF.
          </p>
        </div>

        <Link
          to="/admin"
          className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg min-h-[44px] whitespace-nowrap shrink-0"
        >
          Buka Panel Admin Persetujuan
        </Link>
      </div>

      <DemoNotice />

      {/* Tab navigasi dashboard */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-200/70 rounded-xl w-fit max-w-full">
        <button
          type="button"
          onClick={() => {
            setActiveTab('register-business');
            setUploadError(null);
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg min-h-[44px] transition-colors whitespace-nowrap ${
            activeTab === 'register-business'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Daftar Usaha &amp; Company Profile
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('catalog-media');
            setUploadError(null);
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg min-h-[44px] transition-colors whitespace-nowrap ${
            activeTab === 'catalog-media'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Katalog Produk &amp; Foto
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('professional-cv');
            setUploadError(null);
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg min-h-[44px] transition-colors whitespace-nowrap ${
            activeTab === 'professional-cv'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Profil Profesional &amp; CV PDF
        </button>
      </div>

      {feedback && (
        <div
          role="status"
          className="flex items-start gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}

      {uploadError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
        >
          {uploadError}
        </div>
      )}

      {/* TAB 1: PENDAFTARAN USAHA & COMPANY PROFILE */}
      {activeTab === 'register-business' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={(e) => void handleCreateBusiness(e)}
            className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-5"
          >
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Pendaftaran Usaha Gratis {dataSource === 'demo' ? '(DEMO)' : ''}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Setelah dikirim, usaha berstatus Menunggu Persetujuan dan dapat disetujui di Dashboard Admin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="biz-name" className="block text-sm font-medium text-slate-800 mb-1">
                  Nama Usaha *
                </label>
                <input
                  id="biz-name"
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="Contoh: Kopi Sari Papandayan"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="biz-wa" className="block text-sm font-medium text-slate-800 mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  id="biz-wa"
                  type="tel"
                  value={bizWhatsapp}
                  onChange={(e) => setBizWhatsapp(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="biz-tagline" className="block text-sm font-medium text-slate-800 mb-1">
                Ringkasan / Tagline Usaha *
              </label>
              <input
                id="biz-tagline"
                type="text"
                value={bizTagline}
                onChange={(e) => setBizTagline(e.target.value)}
                placeholder="Contoh: Penyedia kopi Arabika sangrai segar dan paket oleh-oleh."
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="biz-cat" className="block text-sm font-medium text-slate-800 mb-1">
                  Kategori Usaha
                </label>
                <select
                  id="biz-cat"
                  value={bizCategory}
                  onChange={(e) => setBizCategory(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="biz-kec" className="block text-sm font-medium text-slate-800 mb-1">
                  Kecamatan
                </label>
                <select
                  id="biz-kec"
                  value={bizKecamatan}
                  onChange={(e) => setBizKecamatan(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                >
                  {kecamatanList.map((k) => (
                    <option key={k.slug} value={k.slug}>
                      Kec. {k.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="biz-address" className="block text-sm font-medium text-slate-800 mb-1">
                  Alamat Lengkap
                </label>
                <input
                  id="biz-address"
                  type="text"
                  value={bizAddress}
                  onChange={(e) => setBizAddress(e.target.value)}
                  placeholder="Jl. Raya / Kampung / Desa"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="biz-email" className="block text-sm font-medium text-slate-800 mb-1">
                  Email Usaha
                </label>
                <input
                  id="biz-email"
                  type="email"
                  value={bizEmail}
                  onChange={(e) => setBizEmail(e.target.value)}
                  placeholder="kontak@usaha.com"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="biz-desc" className="block text-sm font-medium text-slate-800 mb-1">
                Deskripsi Usaha
              </label>
              <textarea
                id="biz-desc"
                rows={3}
                value={bizDesc}
                onChange={(e) => setBizDesc(e.target.value)}
                placeholder="Ceritakan produk, layanan, atau keunggulan usaha Anda..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {/* Upload Logo & Foto Sampul dengan kompresi */}
            <div className="pt-3 border-t border-slate-100 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Upload Logo &amp; Foto Usaha (Kompresi Otomatis)
                </h3>
                <p className="text-xs text-slate-500">
                  Maksimal {formatBytes(APP_CONFIG.maxImageUploadBytes)} per foto (JPG/PNG/WebP). Gambar dikompres otomatis agar ringan dibuka dari Android.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <label htmlFor="upload-logo" className="block text-xs font-semibold text-slate-800">
                    Logo Usaha
                  </label>
                  <input
                    id="upload-logo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => void handleImageSelect(e.target.files?.[0], setLogoUpload)}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800"
                  />
                  {logoUpload && (
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={logoUpload.thumbnailDataUrl}
                        alt="Pratinjau logo terkompresi"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                      <p className="text-xs text-emerald-800 font-mono tabular-nums">
                        {formatBytes(logoUpload.originalBytes)} → {formatBytes(logoUpload.compressedBytes)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <label htmlFor="upload-cover" className="block text-xs font-semibold text-slate-800">
                    Foto Tempat / Produk Utama
                  </label>
                  <input
                    id="upload-cover"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => void handleImageSelect(e.target.files?.[0], setCoverUpload)}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800"
                  />
                  {coverUpload && (
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={coverUpload.thumbnailDataUrl}
                        alt="Pratinjau foto terkompresi"
                        className="w-16 h-12 rounded-lg object-cover border border-slate-200"
                      />
                      <p className="text-xs text-emerald-800 font-mono tabular-nums">
                        {formatBytes(coverUpload.originalBytes)} → {formatBytes(coverUpload.compressedBytes)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {compressing && (
                <p className="text-xs text-emerald-700 font-medium">
                  Sedang mengompres gambar dan membuat thumbnail...
                </p>
              )}
            </div>

            {/* Company Profile Section */}
            <div className="pt-3 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Informasi Company Profile
              </h3>
              <div>
                <label htmlFor="biz-vision" className="block text-sm font-medium text-slate-800 mb-1">
                  Visi Usaha
                </label>
                <input
                  id="biz-vision"
                  type="text"
                  value={bizVision}
                  onChange={(e) => setBizVision(e.target.value)}
                  placeholder="Contoh: Menjadi mitra pilihan untuk kebutuhan kulit asli Garut."
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="biz-mission" className="block text-sm font-medium text-slate-800 mb-1">
                  Misi Usaha (satu poin per baris)
                </label>
                <textarea
                  id="biz-mission"
                  rows={2}
                  value={bizMission}
                  onChange={(e) => setBizMission(e.target.value)}
                  placeholder="Menjaga kualitas bahan baku lokal.&#10;Melayani pengiriman tepat waktu."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="biz-year" className="block text-xs font-medium text-slate-700 mb-1">
                    Tahun Berdiri
                  </label>
                  <input
                    id="biz-year"
                    type="number"
                    value={bizYear}
                    onChange={(e) => setBizYear(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="biz-team" className="block text-xs font-medium text-slate-700 mb-1">
                    Jumlah Tim
                  </label>
                  <input
                    id="biz-team"
                    type="text"
                    value={bizTeamSize}
                    onChange={(e) => setBizTeamSize(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="biz-legal" className="block text-xs font-medium text-slate-700 mb-1">
                    Status Legalitas
                  </label>
                  <input
                    id="biz-legal"
                    type="text"
                    value={bizLegal}
                    onChange={(e) => setBizLegal(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg min-h-[44px]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>
                {submitting
                  ? 'Menyimpan...'
                  : dataSource === 'supabase'
                    ? 'Daftarkan Usaha Gratis'
                    : 'Daftarkan Usaha Gratis (DEMO)'}
              </span>
            </button>
          </form>

          {/* Daftar Usaha milik sesi ini */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Daftar Usaha dalam Sesi DEMO ({businesses.length})
            </h2>
            <div className="space-y-3">
              {businesses.map((biz) => (
                <div
                  key={biz.id}
                  className="p-3 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <OptimizedImage src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{biz.name}</p>
                      <ApprovalStatusLabel status={biz.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Link to={`/usaha/${biz.slug}`} className="text-emerald-800 hover:underline font-medium">
                      Lihat Profil
                    </Link>
                    <Link to={`/company-profile/${biz.slug}`} className="text-slate-600 hover:underline">
                      Company Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: KATALOG PRODUK & MEDIA */}
      {activeTab === 'catalog-media' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={(e) => void handleAddProduct(e)}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-5"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">
              Tambah Produk atau Jasa ke Katalog {dataSource === 'demo' ? '(DEMO)' : ''}
            </h2>

            <div>
              <label htmlFor="select-biz-catalog" className="block text-sm font-medium text-slate-800 mb-1">
                Pilih Usaha
              </label>
              <select
                id="select-biz-catalog"
                value={selectedBiz?.id ?? ''}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProdType(ListingType.PRODUCT)}
                className={`py-2.5 text-sm font-medium rounded-lg border min-h-[44px] ${
                  prodType === ListingType.PRODUCT
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Produk Fisik
              </button>
              <button
                type="button"
                onClick={() => setProdType(ListingType.SERVICE)}
                className={`py-2.5 text-sm font-medium rounded-lg border min-h-[44px] ${
                  prodType === ListingType.SERVICE
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Layanan Jasa
              </button>
            </div>

            <div>
              <label htmlFor="prod-name" className="block text-sm font-medium text-slate-800 mb-1">
                Nama Produk / Jasa *
              </label>
              <input
                id="prod-name"
                type="text"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="Contoh: Dodol Ketan Original 500gr"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prod-price" className="block text-sm font-medium text-slate-800 mb-1">
                  Harga (Rp) *
                </label>
                <input
                  id="prod-price"
                  type="number"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="prod-unit" className="block text-sm font-medium text-slate-800 mb-1">
                  Satuan
                </label>
                <input
                  id="prod-unit"
                  type="text"
                  value={prodUnit}
                  onChange={(e) => setProdUnit(e.target.value)}
                  placeholder="pcs / kotak / paket / m²"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="prod-desc" className="block text-sm font-medium text-slate-800 mb-1">
                Keterangan Singkat
              </label>
              <textarea
                id="prod-desc"
                rows={2}
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                placeholder="Spesifikasi, berat, atau rincian layanan..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label htmlFor="prod-photo" className="block text-xs font-semibold text-slate-800">
                Foto Produk (otomatis dibuatkan thumbnail &amp; dikompresi)
              </label>
              <input
                id="prod-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => void handleImageSelect(e.target.files?.[0], setProdImage)}
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white"
              />
              {prodImage && (
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={prodImage.thumbnailDataUrl}
                    alt="Thumbnail produk"
                    className="w-16 h-12 rounded-lg object-cover border border-slate-200"
                  />
                  <span className="text-xs text-emerald-800 font-mono tabular-nums">
                    Terkompres: {formatBytes(prodImage.originalBytes)} → {formatBytes(prodImage.compressedBytes)}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg min-h-[44px]"
            >
              <ImagePlus className="w-4 h-4" aria-hidden="true" />
              <span>
                {submitting
                  ? 'Menyimpan...'
                  : dataSource === 'supabase'
                    ? 'Simpan ke Katalog'
                    : 'Simpan ke Katalog (DEMO)'}
              </span>
            </button>
          </form>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-slate-900">
                Item Katalog {selectedBiz?.name}
              </h2>
              <span className="font-mono tabular-nums text-xs text-slate-500">
                {selectedBizProducts.length} item
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label htmlFor="quick-update-logo" className="block text-xs font-medium text-slate-700">
                Perbarui Foto Sampul Usaha Ini (Kompresi Cepat)
              </label>
              <input
                id="quick-update-logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  if (!selectedBiz) return;
                  void handleImageSelect(e.target.files?.[0], (res) => {
                    updateBusinessMediaDemo(selectedBiz.id, undefined, res.dataUrl);
                    setFeedback(`Foto sampul "${selectedBiz.name}" diperbarui (${formatBytes(res.compressedBytes)}).`);
                  });
                }}
                className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white"
              />
            </div>

            <div className="space-y-3">
              {selectedBizProducts.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200">
                  <div className="w-14 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <OptimizedImage src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs font-mono tabular-nums text-emerald-800 font-semibold">
                      {formatRupiah(item.price)} / {item.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROFIL PROFESIONAL & UPLOAD CV PDF */}
      {activeTab === 'professional-cv' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={(e) => void handleSaveProfessional(e)}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-5"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">
              Buat Profil Profesional &amp; Unggah CV PDF {dataSource === 'demo' ? '(DEMO)' : ''}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pro-name" className="block text-sm font-medium text-slate-800 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  id="pro-name"
                  type="text"
                  value={proName}
                  onChange={(e) => setProName(e.target.value)}
                  placeholder="Contoh: Siti Rahmawati, S.Ak."
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="pro-headline" className="block text-sm font-medium text-slate-800 mb-1">
                  Bidang Keahlian / Jabatan *
                </label>
                <input
                  id="pro-headline"
                  type="text"
                  value={proHeadline}
                  onChange={(e) => setProHeadline(e.target.value)}
                  placeholder="Contoh: Akuntan Pajak & Pembukuan UMKM"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pro-kec" className="block text-sm font-medium text-slate-800 mb-1">
                  Kecamatan
                </label>
                <select
                  id="pro-kec"
                  value={proKecamatan}
                  onChange={(e) => setProKecamatan(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {kecamatanList.map((k) => (
                    <option key={k.slug} value={k.slug}>
                      Kec. {k.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pro-exp" className="block text-sm font-medium text-slate-800 mb-1">
                  Pengalaman (Tahun)
                </label>
                <input
                  id="pro-exp"
                  type="number"
                  min={0}
                  value={proExpYears}
                  onChange={(e) => setProExpYears(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="pro-wa" className="block text-sm font-medium text-slate-800 mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  id="pro-wa"
                  type="tel"
                  value={proWhatsapp}
                  onChange={(e) => setProWhatsapp(e.target.value)}
                  placeholder="0813xxxxxxxx"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pro-edu" className="block text-sm font-medium text-slate-800 mb-1">
                  Pendidikan Terakhir
                </label>
                <input
                  id="pro-edu"
                  type="text"
                  value={proEdu}
                  onChange={(e) => setProEdu(e.target.value)}
                  placeholder="Contoh: S1 Akuntansi"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="pro-email" className="block text-sm font-medium text-slate-800 mb-1">
                  Email Kontak
                </label>
                <input
                  id="pro-email"
                  type="email"
                  value={proEmail}
                  onChange={(e) => setProEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pro-skills" className="block text-sm font-medium text-slate-800 mb-1">
                Keahlian (pisahkan dengan koma)
              </label>
              <input
                id="pro-skills"
                type="text"
                value={proSkills}
                onChange={(e) => setProSkills(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="pro-summary" className="block text-sm font-medium text-slate-800 mb-1">
                Ringkasan Pengalaman Kerja
              </label>
              <textarea
                id="pro-summary"
                rows={3}
                value={proSummary}
                onChange={(e) => setProSummary(e.target.value)}
                placeholder="Jelaskan latar belakang kerja dan layanan yang Anda tawarkan..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* Foto Profil & Upload CV PDF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label htmlFor="pro-avatar" className="block text-xs font-semibold text-slate-800">
                  Foto Profil (Kompresi Otomatis)
                </label>
                <input
                  id="pro-avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => void handleImageSelect(e.target.files?.[0], setProAvatar)}
                  className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white"
                />
                {proAvatar && (
                  <p className="text-xs text-emerald-800 font-mono tabular-nums">
                    Siap ({formatBytes(proAvatar.compressedBytes)})
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label htmlFor="pro-cv-pdf" className="block text-xs font-semibold text-slate-800">
                  Unggah CV Format PDF (Maks. {formatBytes(APP_CONFIG.maxPdfUploadBytes)})
                </label>
                <input
                  id="pro-cv-pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => handlePdfSelect(e.target.files?.[0])}
                  className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white"
                />
                {pdfMeta && (
                  <p className="text-xs text-emerald-800 flex items-center gap-1 truncate">
                    <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{pdfMeta.name}</span>
                    <span className="font-mono shrink-0">({formatBytes(pdfMeta.size)})</span>
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg min-h-[44px]"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>
                {submitting
                  ? 'Menyimpan...'
                  : dataSource === 'supabase'
                    ? 'Simpan Profil & CV'
                    : 'Simpan Profil & CV (DEMO)'}
              </span>
            </button>
          </form>

          {/* Lampirkan PDF cepat ke profil yang sudah ada */}
          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Uji Unggah CV PDF ke Profil Tersedia
            </h2>
            <p className="text-xs text-slate-600">
              Pilih salah satu profil contoh di bawah untuk langsung melampirkan file PDF dan menguji tombol unduhnya di halaman CV.
            </p>
            <select
              aria-label="Pilih profil profesional"
              value={targetProIdForPdf}
              onChange={(e) => setTargetProIdForPdf(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>

            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => handlePdfSelect(e.target.files?.[0], targetProIdForPdf)}
              className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white"
            />

            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              {professionals.map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.fullName}</p>
                    <ApprovalStatusLabel status={p.status} />
                  </div>
                  <p className="text-xs text-slate-600">
                    {p.cvPdfName ? `CV: ${p.cvPdfName}` : 'Belum ada file PDF'}
                  </p>
                  <Link
                    to={`/profesional/${p.slug}`}
                    className="inline-block text-xs font-medium text-emerald-800 hover:underline pt-1"
                  >
                    Buka Halaman CV →
                  </Link>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
