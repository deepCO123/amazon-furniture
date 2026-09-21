"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Loader2,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";
import type { Product } from "@/types";
import { categories } from "@/data/categories";
import Button from "@/components/ui/Button";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
  product?: Product | null;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  product,
}: ProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Sofas");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [material, setMaterial] = useState("خشب زان أحمر طبيعي");
  const [color, setColor] = useState("بيج");
  const [width, setWidth] = useState("180");
  const [height, setHeight] = useState("75");
  const [depth, setDepth] = useState("90");
  const [weight, setWeight] = useState("35");
  const [stockQuantity, setStockQuantity] = useState("10");
  const [curtainTypesText, setCurtainTypesText] = useState("");
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(true);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Furniture Spec Matrix state
  const [woodType, setWoodType] = useState("خشب زان أحمر روماني");
  const [fabricType, setFabricType] = useState("كتان معالج ضد البقع");
  const [waterRepellent, setWaterRepellent] = useState(true);
  const [foamDensity, setFoamDensity] = useState("كثافة 33 سوبر سوفت");
  const [chassisType, setChassisType] = useState("شاسيه حديد دهان إلكتروستاتيك");
  const [leadTimeDays, setLeadTimeDays] = useState("7");
  const [requiresAssembly, setRequiresAssembly] = useState(true);
  const [isDisassemblable, setIsDisassemblable] = useState(true);
  const [warrantyYears, setWarrantyYears] = useState("3");
  const [model3dUrl, setModel3dUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (product) {
        setName(product.name || "");
        setCategory(product.category || "كراسي مكتب");
        setPrice(product.price ? String(product.price) : "");
        setOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
        setMaterial(product.material || "خشب زان أحمر طبيعي");
        setColor(product.color || "طبيعي");
        setWidth(product.dimensions?.width ? String(product.dimensions.width) : "100");
        setHeight(product.dimensions?.height ? String(product.dimensions.height) : "75");
        setDepth(product.dimensions?.depth ? String(product.dimensions.depth) : "80");
        setWeight(product.weight ? String(product.weight) : "20");
        setStockQuantity(product.stockQuantity !== undefined ? String(product.stockQuantity) : "10");
        setCurtainTypesText(product.curtainTypes ? product.curtainTypes.join("\n") : "");
        setInStock(product.inStock !== false && (product.stockQuantity === undefined || product.stockQuantity > 0));
        setFeatured(Boolean(product.featured));
        setDescription(product.description || "");
        setImages(product.images && product.images.length > 0 ? product.images : []);

        // Spec Matrix Hydration
        setWoodType(product.specs?.woodType || "خشب زان أحمر روماني");
        setFabricType(product.specs?.fabricType || "كتان معالج ضد البقع");
        setWaterRepellent(product.specs?.waterRepellent !== false);
        setFoamDensity(product.specs?.foamDensity || "كثافة 33 سوبر سوفت");
        setChassisType(product.specs?.chassisType || "شاسيه حديد دهان إلكتروستاتيك");
        setLeadTimeDays(product.specs?.leadTimeDays ? String(product.specs.leadTimeDays) : "7");
        setRequiresAssembly(product.specs?.requiresAssembly !== false);
        setIsDisassemblable(product.specs?.isDisassemblable !== false);
        setWarrantyYears(product.specs?.warrantyYears ? String(product.specs.warrantyYears) : "3");
        setModel3dUrl(product.specs?.model3dUrl || "");
      } else {
        setName("");
        setCategory("كراسي مكتب");
        setPrice("");
        setOriginalPrice("");
        setMaterial("خشب زان أحمر طبيعي");
        setColor("طبيعي");
        setWidth("120");
        setHeight("75");
        setDepth("80");
        setWeight("20");
        setStockQuantity("10");
        setCurtainTypesText("ستائر رول بلاك أوت (Roll-up Blackout)\nستائر زيبرا ثنائية الطبقات (Zebra Blinds)\nستائر شرائح معدنية ألومنيوم (Venetian)\nستائر شرائح رأسية فورتيكال (Vertical)\nستائر مكتبية ذكية كهربائية (Smart Motorized)");
        setInStock(true);
        setFeatured(true);
        setDescription("");
        setImages([]);

        setWoodType("خشب زان أحمر روماني");
        setFabricType("كتان معالج ضد البقع");
        setWaterRepellent(true);
        setFoamDensity("كثافة 33 سوبر سوفت");
        setChassisType("شاسيه حديد دهان إلكتروستاتيك");
        setLeadTimeDays("7");
        setRequiresAssembly(true);
        setIsDisassemblable(true);
        setWarrantyYears("3");
        setModel3dUrl("");
      }
      setError(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Try server upload first, fallback to base64 Data URL
        let uploadedUrl = "";
        try {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) uploadedUrl = data.url;
          }
        } catch {
          // Fallback to local Data URL
        }

        if (!uploadedUrl) {
          uploadedUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("فشل قراءة ملف الصورة"));
            reader.readAsDataURL(file);
          });
        }

        if (uploadedUrl) {
          setImages((prev) => [...prev, uploadedUrl]);
        }
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء رفع الصورة";
      setError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add external image URL
  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("يرجى إدخال اسم المنتج");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("يرجى إدخال سعر صحيح للمنتج");
      return;
    }

    if (images.length === 0) {
      setError("يرجى رفع صورة واحدة على الأقل للمنتج");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        category,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        material: material.trim(),
        color: color.trim(),
        dimensions: {
          width: Number(width) || 100,
          height: Number(height) || 75,
          depth: Number(depth) || 80,
        },
        weight: Number(weight) || 20,
        stockQuantity: Math.max(0, Number(stockQuantity) || 0),
        inStock: inStock && (Number(stockQuantity) > 0),
        curtainTypes: category.includes("ستائر") && curtainTypesText.trim()
          ? curtainTypesText.split("\n").map((s) => s.trim()).filter(Boolean)
          : (product?.curtainTypes || undefined),
        featured,
        description: description.trim() || `قطعة أثاث فاخرة من تصميم وتنفيذ مصنع ومعرض Amazon Furniture بخامات عالية الجودة.`,
        images,
        specs: {
          woodType: woodType.trim(),
          fabricType: fabricType.trim(),
          waterRepellent,
          foamDensity: foamDensity.trim(),
          chassisType: chassisType.trim(),
          leadTimeDays: Math.max(1, Number(leadTimeDays) || 7),
          requiresAssembly,
          isDisassemblable,
          warrantyYears: Math.max(1, Number(warrantyYears) || 3),
          model3dUrl: model3dUrl.trim(),
          volumetricWeight: Math.round(((Number(width) || 100) * (Number(height) || 75) * (Number(depth) || 80)) / 5000),
        },
      };

      if (product?.id) {
        payload.id = product.id;
        payload.slug = product.slug;
      }

      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "فشل حفظ المنتج، يرجى إعادة المحاولة";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-surface-dark overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-dark bg-surface/50">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {product ? "تعديل بيانات المنتج" : "إضافة منتج جديد للمتجر"}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              ستظهر التعديلات مباشرة في المتجر لجميع العملاء فور الحفظ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-primary rounded-xl hover:bg-surface transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-danger text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Images Section */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-primary">
              صور المنتج (يرجى رفع صور واضحة للقطعة) <span className="text-danger">*</span>
            </label>

            {/* Upload Area */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                className="hidden"
                id="product-image-upload"
              />

              <label
                htmlFor="product-image-upload"
                className={`flex-1 border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  uploading
                    ? "border-accent bg-accent/5 pointer-events-none"
                    : "border-surface-dark hover:border-accent hover:bg-surface/50"
                }`}
              >
                {uploading ? (
                  <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                    <Loader2 size={20} className="animate-spin" />
                    <span>جاري رفع الصورة إلى المتجر...</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="text-accent mb-1.5" />
                    <span className="text-sm font-bold text-primary">
                      اضغط لاختيار صورة من جهازك (كمبيوتر / هاتف)
                    </span>
                    <span className="text-xs text-muted mt-1">
                      PNG, JPG, WEBP تصلح حتى 15 ميجابايت
                    </span>
                  </>
                )}
              </label>

              {/* URL fallback */}
              <div className="sm:w-64 flex flex-col justify-between border border-surface-dark rounded-xl p-3 bg-surface/30">
                <span className="text-xs font-semibold text-muted mb-1.5">
                  أو إضافة رابط صورة خارجي:
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-xs px-2.5 py-2 rounded-lg border border-surface-dark bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>

            {/* Images Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-surface-dark bg-surface shadow-xs"
                  >
                    <Image
                      src={img}
                      alt={`صورة ${idx + 1}`}
                      fill
                      unoptimized={img.startsWith("/uploads/") || img.startsWith("data:") || img.startsWith("blob:")}
                      className="object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 right-1 bg-accent text-primary-dark font-bold text-[9px] px-1.5 py-0.5 rounded shadow-xs">
                        الرئيسية
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      title="حذف الصورة"
                    >
                      <Trash2 size={18} className="text-red-400 hover:text-red-300" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">
                اسم المنتج بالكامل <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: ركنة صالون مودرن خشب زان"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">
                القسم / التصنيف <span className="text-danger">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} ({cat.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Curtain Types Configuration (if category is curtains) */}
          {category.includes("ستائر") && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <label className="block text-xs font-bold text-amber-900 mb-1.5 flex items-center justify-between">
                <span>أنواع الستارة المتوفرة لاختيار العميل (كل نوع في سطر منفصل)</span>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded">اختياري للستائر</span>
              </label>
              <textarea
                rows={4}
                value={curtainTypesText}
                onChange={(e) => setCurtainTypesText(e.target.value)}
                placeholder="ستائر رول بلاك أوت (Roll-up Blackout)&#10;ستائر زيبرا ثنائية الطبقات (Zebra Blinds)&#10;ستائر شرائح معدنية ألومنيوم (Venetian)&#10;ستائر شرائح رأسية فورتيكال (Vertical)&#10;ستائر مكتبية ذكية كهربائية (Smart Motorized)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-amber-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-amber-700 mt-1 block">
                سيظهر للعميل في صفحة المنتج زر لاختيار نوع الستارة بالتحديد قبل إضافتها للسلة وللأوردر.
              </span>
            </div>
          )}

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">
                السعر الفعلي (بالجنيه) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="مثال: 12500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="text-[11px] text-muted mt-1 block">
                يحول تلقائياً للريال والدولار حسب لغة الزائر.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">
                السعر قبل الخصم (اختياري)
              </label>
              <input
                type="number"
                min="1"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="مثال: 15000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="text-[11px] text-muted mt-1 block">
                لإظهار نسبة الخصم والتوفير.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1.5 flex items-center justify-between">
                <span>كمية المخزون (القطع المتوفرة)</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-accent/10 text-accent">خصم تلقائي</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="مثال: 10"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="text-[11px] text-muted mt-1 block">
                ينقص تلقائياً عند كل أوردر، وإذا وصل 0 يُعلم بنفاد الكمية.
              </span>
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">
                نوع الخشب / الخامة
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="مثال: خشب زان أحمر طبيعي"
                className="w-full px-3 py-2 rounded-xl border border-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">
                اللون المتوفر
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="مثال: بيج كافيه / كحلي"
                className="w-full px-3 py-2 rounded-xl border border-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">
                الوزن التقريبي (كجم)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="مثال: 45"
                className="w-full px-3 py-2 rounded-xl border border-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-xs font-bold text-primary mb-1.5">
              الأبعاد والمقاسات (سم)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-muted block mb-1">العرض (سم)</span>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-dark text-sm"
                />
              </div>
              <div>
                <span className="text-[11px] text-muted block mb-1">الارتفاع (سم)</span>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-dark text-sm"
                />
              </div>
              <div>
                <span className="text-[11px] text-muted block mb-1">العمق (سم)</span>
                <input
                  type="number"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-dark text-sm"
                />
              </div>
            </div>
            {/* Volumetric Weight Calculator Hint */}
            <div className="mt-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-center justify-between">
              <span>الوزن الحجمي التقديري لشركات الشحن (L×W×H / 5000):</span>
              <span className="font-mono font-black text-amber-800">
                {Math.round(((Number(width) || 100) * (Number(height) || 75) * (Number(depth) || 80)) / 5000)} كجم
              </span>
            </div>
          </div>

          {/* ── Furniture Spec Matrix (المواصفات الفنية المتقدمة) ── */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>🛋️ مواصفات التصنيع والخامات المتخصصة</span>
              </h3>
              <span className="text-[11px] text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full font-semibold">
                قطاع الأثاث والمفروشات
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Wood Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نوع الخشب الرئيسي
                </label>
                <input
                  type="text"
                  value={woodType}
                  onChange={(e) => setWoodType(e.target.value)}
                  placeholder="مثال: خشب زان أحمر روماني"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Fabric Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نوع القماش والتنجيد
                </label>
                <input
                  type="text"
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  placeholder="مثال: كتان تركي معالج / هامر / جلد مقلوب"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Foam Density */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كثافة ونوع الإسفنج
                </label>
                <input
                  type="text"
                  value={foamDensity}
                  onChange={(e) => setFoamDensity(e.target.value)}
                  placeholder="مثال: كثافة 33 سوبر سوفت / ريبوند طبي"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Chassis & Mechanism */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نوع الشاسيه والميكانيزم
                </label>
                <input
                  type="text"
                  value={chassisType}
                  onChange={(e) => setChassisType(e.target.value)}
                  placeholder="مثال: شاسيه حديد دهان إلكتروستاتيك / ميكانيزم تركي"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Lead Time Days */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مدة التصنيع والتجهيز (بالأيام)
                </label>
                <input
                  type="number"
                  min="1"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  placeholder="مثال: 7"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Warranty Years */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مدة الضمان المعتمد (سنوات)
                </label>
                <input
                  type="number"
                  min="1"
                  value={warrantyYears}
                  onChange={(e) => setWarrantyYears(e.target.value)}
                  placeholder="مثال: 3"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* 3D / AR Model Link */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>رابط نموذج الواقع المعزز ثلاثي الأبعاد 3D/AR (.glb / .usdz)</span>
                  <span className="text-[10px] text-slate-500 font-normal">اختياري لمعاينة المنتج بالموبايل</span>
                </label>
                <input
                  type="url"
                  value={model3dUrl}
                  onChange={(e) => setModel3dUrl(e.target.value)}
                  placeholder="https://.../model.glb"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-left font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Checkbox Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waterRepellent}
                  onChange={(e) => setWaterRepellent(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                />
                <span className="text-xs font-bold text-slate-800">قماش مقاوم للبقع والسوائل</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresAssembly}
                  onChange={(e) => setRequiresAssembly(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                />
                <span className="text-xs font-bold text-slate-800">يتطلب فني تركيب مصاحب</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDisassemblable}
                  onChange={(e) => setIsDisassemblable(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                />
                <span className="text-xs font-bold text-slate-800">قابل للفك والتركيب</span>
              </label>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-dark">
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-dark hover:bg-surface/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-5 h-5 text-accent rounded accent-[#C5A880]"
              />
              <div>
                <span className="text-sm font-bold text-primary block">
                  متوفر للتسليم والمعاينة الفورية
                </span>
                <span className="text-xs text-muted block">
                  إذا تم إلغاؤه سيظهر للعميل كـ &ldquo;غير متوفر حالياً&rdquo;
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-dark hover:bg-surface/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 text-accent rounded accent-[#C5A880]"
              />
              <div>
                <span className="text-sm font-bold text-primary block">
                  عرض في الصفحة الرئيسية (Featured)
                </span>
                <span className="text-xs text-muted block">
                  يظهر المنتج في قسم أبرز القطع والموديلات
                </span>
              </div>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-primary mb-1.5">
              الوصف والمواصفات التفصيلية للقطعة
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب هنا نبذة عن جمال التصميم، المتانة، وجودة التشطيب، وإمكانية تنفيذ أي مقاسات خاصة..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-dark">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={saving || uploading}
              className="font-bold min-w-[140px]"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check size={16} />
                  <span>{product ? "حفظ التعديلات" : "إضافة المنتج الآن"}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
