'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useProductActions } from '@/hooks/useProductActions';
import { useSeries } from '@/hooks/useSeries';
import { uploadProductThumbnail, uploadProductIcon } from '@/lib/imageUpload';
import type { Product, MotorProduct, ESCProduct, FCProduct, IPSProduct } from '@/lib/products';

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
}

type ProductType = 'motor' | 'esc' | 'fc' | 'ips';

interface CustomField {
  key: string;
  value: string;
}

export function ProductFormModal({ product, onClose }: ProductFormModalProps) {
  const { create, update } = useProductActions();
  const { series: seriesList } = useSeries();

  const [productType, setProductType] = useState<ProductType>(
    (product?.category as ProductType) || 'motor'
  );
  const [series, setSeries] = useState<string>(
    product ? ((product as MotorProduct)?.series || productType) : (seriesList[0]?.id || 'haemng')
  );
  const [formData, setFormData] = useState<Partial<Product>>(
    product ?? getEmptyProduct('motor', seriesList[0]?.id || '')
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [thumbnailBgColor, setThumbnailBgColor] = useState<string>('#111111');
  const [uploadProgress, setUploadProgress] = useState<{ step: string; total: number; current: number } | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Seed form when editing an existing product
  useEffect(() => {
    if (product) {
      setFormData(product);
      setProductType(product.category as ProductType);
      if (product.category === 'motor') {
        setSeries((product as MotorProduct).series ?? '');
      }
      const productData = product as any;
      if (Array.isArray(productData.customFields)) {
        setCustomFields(productData.customFields);
      }
      if (productData.thumbnailUrl) setThumbnailPreview(productData.thumbnailUrl);
      if (productData.iconUrl) setIconPreview(productData.iconUrl);
      if (productData.thumbnailBgColor) setThumbnailBgColor(productData.thumbnailBgColor);
    } else {
      const defaultSeries = productType === 'motor' ? (seriesList[0]?.id || 'haemng') : productType;
      setSeries(defaultSeries);
      setFormData(getEmptyProduct(productType, defaultSeries));
    }
  }, [product, seriesList, productType]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isSaving, onClose]);

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev!, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, [errors]);

  const clearError = (field: string) =>
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  // Switch product type — preserve id and model so the user doesn't lose what they typed
  const handleTypeSwitch = (type: ProductType) => {
    setProductType(type);
    const newSeries = type === 'motor' ? (series || seriesList[0]?.id || 'haemng') : type;
    setSeries(newSeries);
    const preserved = { id: (formData as any).id, model: (formData as any).model };
    setFormData({ ...getEmptyProduct(type, newSeries), ...preserved });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.model?.trim()) newErrors.model = 'Model name is required';
    if (!formData.id?.trim()) newErrors.id = 'Product ID is required';
    if (productType === 'motor' && !(formData as MotorProduct).kv) newErrors.kv = 'KV rating is required';
    if (productType === 'motor' && !(formData as MotorProduct).voltage?.trim()) newErrors.voltage = 'Voltage is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    clearError('thumbnail');
  };

  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
    clearError('icon');
  };

  const addCustomField = () =>
    setCustomFields(prev => [...prev, { key: '', value: '' }]);

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) =>
    setCustomFields(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));

  const removeCustomField = (index: number) =>
    setCustomFields(prev => prev.filter((_, i) => i !== index));

const generateProductId = (): string => {
  const model = (formData as any).model || '';
  const prefix = productType === 'motor' ? series || productType : productType;

  const slug = model
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const suffix = crypto.randomUUID().slice(0, 6); // more unique

  return [prefix, slug, suffix].filter(Boolean).join('-');
};

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setUploadProgress(null);

    // Determine steps for progress tracking
    const steps = ['thumbnail', 'icon', 'save'].filter(s => {
      if (s === 'thumbnail') return !!thumbnailFile;
      if (s === 'icon') return !!iconFile;
      return true;
    });
    let stepIndex = 0;

    const advance = (step: string) => {
      stepIndex++;
      setUploadProgress({ step, total: steps.length, current: stepIndex });
    };

    try {
      const productId = (formData as any).id?.trim() || generateProductId();
      let thumbnailUrl = (formData as any).thumbnailUrl;
      let iconUrl = (formData as any).iconUrl;

      if (thumbnailFile) {
        advance('Uploading thumbnail…');
        const result = await uploadProductThumbnail(thumbnailFile, productId);
        if (!result.success) {
          setErrors({ thumbnail: result.error || 'Failed to upload thumbnail' });
          return;
        }
        thumbnailUrl = result.url;
      }

      if (iconFile) {
        advance('Uploading icon…');
        const result = await uploadProductIcon(iconFile, productId);
        if (!result.success) {
          setErrors({ icon: result.error || 'Failed to upload icon' });
          return;
        }
        iconUrl = result.url;
      }

      advance('Saving product…');

      const finalData = {
        ...formData,
        id: productId,
        category: productType,
        series: productType === 'motor' ? series : productType,
        is_published: !saveAsDraft,
        thumbnailUrl,
        iconUrl,
        thumbnailBgColor,
        customFields: customFields.filter(f => f.key.trim() && f.value.trim()),
      } as any as Product;

      const success = product
        ? await update(product.id, finalData)
        : await create(finalData);

      if (success) onClose();
      else setErrors({ general: 'Failed to save product. Please try again.' });
    } catch (err) {
      console.error('Error saving product:', err);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSaving(false);
      setUploadProgress(null);
    }
  };

  const inputClass = (field: string) => `input${errors[field] ? ' input-error' : ''}`;

  return (
    <div className="modal-overlay" onClick={!isSaving ? onClose : undefined} role="dialog" aria-modal="true" aria-label={product ? 'Edit Product' : 'Add Product'}>
      <div className="modal product-modal" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} noValidate>

          {/* ── Header ── */}
          <div className="modal-header">
            <div className="modal-header-left">
              <span className="modal-eyebrow">{product ? 'Editing' : 'New'}</span>
              <h2 className="modal-title">{product ? 'Edit Product' : 'Add Product'}</h2>
            </div>
            <button type="button" className="modal-close" onClick={onClose} disabled={isSaving} aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="modal-body">

            {/* Global error */}
            {errors.general && (
              <div className="alert alert-error" role="alert">
                <ErrorIcon />
                <span>{errors.general}</span>
              </div>
            )}

            {/* ── Section: Product Type ── */}
            <fieldset className="form-section" disabled={isSaving}>
              <legend className="section-label">Product Type</legend>
              <div className="type-selector" role="group">
                {(['motor', 'esc', 'fc', 'ips'] as ProductType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`type-btn${productType === type ? ' active' : ''}`}
                    onClick={() => handleTypeSwitch(type)}
                    aria-pressed={productType === type}
                  >
                    <span className="type-btn-label">{TYPE_LABELS[type]}</span>
                    <span className="type-btn-sub">{TYPE_SUBS[type]}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* ── Section: Identity ── */}
            <fieldset className="form-section" disabled={isSaving}>
              <legend className="section-label">Identity</legend>
              <div className="form-grid">

                <div className="form-group full-width">
                  <label htmlFor="model" className="label">Model Name <span className="required">*</span></label>
                  <input
                    id="model"
                    type="text"
                    className={inputClass('model')}
                    value={(formData as any).model || ''}
                    onChange={e => handleChange('model', e.target.value)}
                    placeholder="e.g., Haemng 2121 II"
                    autoFocus={!product}
                  />
                  {errors.model && <FieldError message={errors.model} />}
                </div>

                <div className="form-group form-group-wide">
                  <label htmlFor="id" className="label">
                    Product ID <span className="required">*</span>
                    {product && <span className="label-badge">read-only</span>}
                  </label>
                  <div className="input-row">
                    <input
                      id="id"
                      type="text"
                      className={inputClass('id')}
                      value={(formData as any).id || ''}
                      onChange={e => handleChange('id', e.target.value)}
                      placeholder="e.g., haemng-2121-ii"
                      readOnly={!!product}
                      style={product ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                    />
                    {!product && (
                      <button
                        type="button"
                        className="btn-generate"
                        onClick={() => handleChange('id', generateProductId())}
                        title="Auto-generate unique product ID"
                      >
                        ⚡ Generate
                      </button>
                    )}
                  </div>
                  {errors.id && <FieldError message={errors.id} />}
                </div>

                {productType === 'motor' && (
                  <div className="form-group form-group-fill">
                    <label htmlFor="series" className="label">Series</label>
                    <select
                      id="series"
                      className="select"
                      value={series}
                      onChange={e => {
                        setSeries(e.target.value);
                        handleChange('series', e.target.value);
                      }}
                    >
                      {seriesList.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </fieldset>

            {/* ── Section: Specs (type-specific) ── */}
            <fieldset className="form-section" disabled={isSaving}>
              <legend className="section-label">Specifications</legend>
              <div className="form-grid">

                {/* Motor */}
                {productType === 'motor' && (<>
                  <div className="form-group">
                    <label htmlFor="kv" className="label">KV Rating <span className="required">*</span></label>
                    <input id="kv" type="number" min="0" className={inputClass('kv')}
                      value={(formData as MotorProduct).kv || ''}
                      onChange={e => handleChange('kv', parseInt(e.target.value) || 0)} />
                    {errors.kv && <FieldError message={errors.kv} />}
                  </div>
                  <div className="form-group">
                    <label htmlFor="voltage" className="label">Voltage <span className="required">*</span></label>
                    <input id="voltage" type="text" className={inputClass('voltage')} placeholder="e.g., 6S, 12S"
                      value={(formData as MotorProduct).voltage || ''}
                      onChange={e => handleChange('voltage', e.target.value)} />
                    {errors.voltage && <FieldError message={errors.voltage} />}
                  </div>
                  <div className="form-group">
                    <label htmlFor="peakCurrent" className="label">Peak Current (A)</label>
                    <input id="peakCurrent" type="number" min="0" className="input"
                      value={(formData as MotorProduct).peakCurrent || ''}
                      onChange={e => handleChange('peakCurrent', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="peakThrust" className="label">Peak Thrust</label>
                    <input id="peakThrust" type="text" className="input"
                      value={(formData as MotorProduct).peakThrust || ''}
                      onChange={e => handleChange('peakThrust', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="recommendedThrust" className="label">Recommended Thrust</label>
                    <input id="recommendedThrust" type="text" className="input"
                      value={(formData as MotorProduct).recommendedThrust || ''}
                      onChange={e => handleChange('recommendedThrust', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="weight" className="label">Weight (g)</label>
                    <input id="weight" type="number" min="0" className="input"
                      value={formData.weight || ''}
                      onChange={e => handleChange('weight', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="diameter" className="label">Diameter (mm)</label>
                    <input id="diameter" type="number" min="0" className="input"
                      value={(formData as MotorProduct).diameter || ''}
                      onChange={e => handleChange('diameter', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="height" className="label">Height (mm)</label>
                    <input id="height" type="number" min="0" className="input"
                      value={(formData as MotorProduct).height || ''}
                      onChange={e => handleChange('height', parseInt(e.target.value) || 0)} />
                  </div>
                </>)}

                {/* ESC */}
                {productType === 'esc' && (<>
                  <div className="form-group">
                    <label htmlFor="continuousCurrent" className="label">Continuous Current (A)</label>
                    <input id="continuousCurrent" type="number" min="0" className="input"
                      value={(formData as ESCProduct).continuousCurrent || ''}
                      onChange={e => handleChange('continuousCurrent', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="currentLimit" className="label">Current Limit (A)</label>
                    <input id="currentLimit" type="number" min="0" className="input"
                      value={(formData as ESCProduct).currentLimit || ''}
                      onChange={e => handleChange('currentLimit', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="recommendedBattery" className="label">Recommended Battery</label>
                    <input id="recommendedBattery" type="text" className="input"
                      value={(formData as ESCProduct).recommendedBattery || ''}
                      onChange={e => handleChange('recommendedBattery', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="weight" className="label">Weight (g)</label>
                    <input id="weight" type="number" min="0" className="input"
                      value={formData.weight || ''}
                      onChange={e => handleChange('weight', parseInt(e.target.value) || 0)} />
                  </div>
                </>)}

                {/* FC */}
                {productType === 'fc' && (<>
                  <div className="form-group">
                    <label htmlFor="size" className="label">Size</label>
                    <input id="size" type="text" className="input"
                      value={(formData as FCProduct).size || ''}
                      onChange={e => handleChange('size', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="weight" className="label">Weight (g)</label>
                    <input id="weight" type="number" min="0" className="input"
                      value={formData.weight || ''}
                      onChange={e => handleChange('weight', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="uart" className="label">UART Count</label>
                    <input id="uart" type="number" min="0" className="input"
                      value={(formData as FCProduct).uart || ''}
                      onChange={e => handleChange('uart', parseInt(e.target.value) || 0)} />
                  </div>
                </>)}

                {/* IPS */}
                {productType === 'ips' && (<>
                  <div className="form-group">
                    <label htmlFor="motorModel" className="label">Motor Model</label>
                    <input id="motorModel" type="text" className="input"
                      value={(formData as IPSProduct).motorModel || ''}
                      onChange={e => handleChange('motorModel', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="escModel" className="label">ESC Model</label>
                    <input id="escModel" type="text" className="input"
                      value={(formData as IPSProduct).escModel || ''}
                      onChange={e => handleChange('escModel', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="kv" className="label">KV Rating</label>
                    <input id="kv" type="number" min="0" className="input"
                      value={(formData as IPSProduct).kv || ''}
                      onChange={e => handleChange('kv', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="weight" className="label">Weight (g)</label>
                    <input id="weight" type="number" min="0" className="input"
                      value={formData.weight || ''}
                      onChange={e => handleChange('weight', parseInt(e.target.value) || 0)} />
                  </div>
                </>)}
              </div>
            </fieldset>

            {/* ── Section: Images ── */}
            <fieldset className="form-section" disabled={isSaving}>
              <legend className="section-label">Product Images</legend>
              <div className="images-row">

                {/* Thumbnail */}
                <div className="image-upload-card">
                  <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} style={{ display: 'none' }} />
                  <div
                    className={`image-drop-zone${thumbnailPreview ? ' has-image' : ''}${errors.thumbnail ? ' has-error' : ''}`}
                    onClick={() => thumbnailInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && thumbnailInputRef.current?.click()}
                    aria-label="Upload thumbnail"
                  >
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="Thumbnail preview" className="drop-preview-img" />
                    ) : (
                      <div className="drop-placeholder">
                        <ImageIcon />
                        <span className="drop-hint">Click to upload</span>
                      </div>
                    )}
                    <div className="drop-overlay">
                      <span>{thumbnailPreview ? 'Change' : 'Upload'}</span>
                    </div>
                  </div>
                  <div className="image-card-meta">
                    <span className="image-card-title">Thumbnail</span>
                    <span className="image-card-spec">800 × 600 px · ratio 1.3–1.9</span>
                  </div>
                  {errors.thumbnail && <FieldError message={errors.thumbnail} />}
                  
                  {/* Background Color Picker */}
                  <div className="color-picker-group">
                    <label className="field-label">Background Color</label>
                    <div className="color-picker-row">
                      <input 
                        type="color" 
                        value={thumbnailBgColor} 
                        onChange={(e) => setThumbnailBgColor(e.target.value)}
                        className="color-input"
                      />
                      <input 
                        type="text" 
                        value={thumbnailBgColor} 
                        onChange={(e) => setThumbnailBgColor(e.target.value)}
                        className="input input-sm"
                        placeholder="#111111"
                        maxLength={7}
                      />
                      <div className="color-preset-buttons">
                        <button 
                          type="button" 
                          onClick={() => setThumbnailBgColor('#111111')} 
                          className="color-preset-btn"
                          style={{ background: '#111111' }}
                          title="Black"
                        />
                        <button 
                          type="button" 
                          onClick={() => setThumbnailBgColor('#FFFFFF')} 
                          className="color-preset-btn"
                          style={{ background: '#FFFFFF', border: '1px solid #ddd' }}
                          title="White"
                        />
                        <button 
                          type="button" 
                          onClick={() => setThumbnailBgColor('#1c1c1c')} 
                          className="color-preset-btn"
                          style={{ background: '#1c1c1c' }}
                          title="Dark Gray"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Icon */}
                <div className="image-upload-card image-upload-card--small">
                  <input ref={iconInputRef} type="file" accept="image/*" onChange={handleIconSelect} style={{ display: 'none' }} />
                  <div
                    className={`image-drop-zone${iconPreview ? ' has-image' : ''}${errors.icon ? ' has-error' : ''}`}
                    onClick={() => iconInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && iconInputRef.current?.click()}
                    aria-label="Upload icon"
                  >
                    {iconPreview ? (
                      <img src={iconPreview} alt="Icon preview" className="drop-preview-img" />
                    ) : (
                      <div className="drop-placeholder">
                        <ImageIcon />
                        <span className="drop-hint">Click to upload</span>
                      </div>
                    )}
                    <div className="drop-overlay">
                      <span>{iconPreview ? 'Change' : 'Upload'}</span>
                    </div>
                  </div>
                  <div className="image-card-meta">
                    <span className="image-card-title">Icon</span>
                    <span className="image-card-spec">256 × 256 px · square</span>
                  </div>
                  {errors.icon && <FieldError message={errors.icon} />}
                </div>

              </div>
            </fieldset>

            {/* ── Section: Custom Fields ── */}
            <fieldset className="form-section" disabled={isSaving}>
              <div className="section-header-row">
                <legend className="section-label" style={{ float: 'none', display: 'inline' }}>Additional Fields</legend>
                <button type="button" className="btn-add-field" onClick={addCustomField}>
                  <PlusIcon /> Add Field
                </button>
              </div>

              {customFields.length > 0 ? (
                <div className="custom-fields-list">
                  {customFields.map((field, index) => (
                    <div key={index} className="custom-field-row">
                      <input
                        type="text"
                        placeholder="Key"
                        value={field.key}
                        onChange={e => updateCustomField(index, 'key', e.target.value)}
                        className="input custom-field-key"
                        aria-label={`Custom field ${index + 1} key`}
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={field.value}
                        onChange={e => updateCustomField(index, 'value', e.target.value)}
                        className="input"
                        aria-label={`Custom field ${index + 1} value`}
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomField(index)}
                        className="btn-remove-field"
                        aria-label={`Remove field ${index + 1}`}
                        title="Remove field"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="help-text">Add custom key-value pairs for additional product specifications</p>
              )}
            </fieldset>

          </div>

          {/* ── Footer ── */}
          <div className="modal-footer">
            {/* Upload progress bar */}
            {uploadProgress && (
              <div className="progress-wrap" aria-live="polite">
                <span className="progress-label">{uploadProgress.step}</span>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            {!product && (
              <button 
                type="button" 
                className="btn btn-draft" 
                onClick={(e) => handleSubmit(e as any, true)}
                disabled={isSaving}
              >
                {isSaving ? <Spinner /> : 'Save as Draft'}
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? (
                <><Spinner /> {uploadProgress?.step ?? 'Saving…'}</>
              ) : (
                product ? 'Update Product' : 'Publish'
              )}
            </button>
          </div>
        </form>

        <style jsx>{`
          /* ── Overlay ── */
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(14, 14, 15, 0.65);
            backdrop-filter: blur(2px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .product-modal {
            max-width: 720px;
            width: 100%;
            max-height: 92vh;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
          }

          /* ── Header ── */
          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--color-white-border);
            position: sticky;
            top: 0;
            background: var(--color-white-pure, #fff);
            z-index: 10;
          }

          .modal-header-left {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .modal-eyebrow {
            font-family: var(--font-mono);
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--color-gold);
          }

          .modal-title {
            font-family: var(--font-display);
            font-size: 18px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--color-ink);
            margin: 0;
          }

          .modal-close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: transparent;
            border: 1px solid transparent;
            cursor: pointer;
            color: var(--color-ink-soft);
            border-radius: 4px;
            transition: all 150ms ease;
          }
          .modal-close:hover { background: var(--color-white-grey); color: var(--color-ink); border-color: var(--color-white-border); }
          .modal-close:disabled { opacity: 0.4; cursor: not-allowed; }

          /* ── Body ── */
          .modal-body {
            padding: 24px;
            flex: 1;
            overflow-y: auto;
          }

          /* ── Alert ── */
          .alert {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            border-radius: 6px;
            font-family: var(--font-mono);
            font-size: 12px;
            margin-bottom: 20px;
          }
          .alert-error {
            background: color-mix(in srgb, var(--color-error, #e53e3e) 8%, transparent);
            border: 1px solid color-mix(in srgb, var(--color-error, #e53e3e) 30%, transparent);
            color: var(--color-error, #e53e3e);
          }

          /* ── Sections ── */
          .form-section {
            margin-bottom: 28px;
            border: none;
            padding: 0;
          }

          .section-label {
            font-family: var(--font-mono);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--color-ink-soft);
            display: block;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--color-white-border);
          }

          .section-header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--color-white-border);
          }

          /* ── Type selector ── */
          .type-selector {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }

          .type-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: 12px 8px;
            background: var(--color-white-pure);
            border: 1px solid var(--color-white-border);
            border-radius: 6px;
            cursor: pointer;
            transition: all 150ms ease;
          }
          .type-btn:hover { border-color: var(--color-gold); background: color-mix(in srgb, var(--color-gold) 5%, transparent); }
          .type-btn.active { background: var(--color-gold); border-color: var(--color-gold); color: var(--color-white-pure); }

          .type-btn-label {
            font-family: var(--font-mono);
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.08em;
          }
          .type-btn-sub {
            font-family: var(--font-mono);
            font-size: 9px;
            letter-spacing: 0.04em;
            opacity: 0.65;
          }
          .type-btn.active .type-btn-sub { opacity: 0.85; color: inherit; }

          /* ── Form grid ── */
          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
          }
          .form-group.full-width { grid-column: 1 / -1; }
          .form-group.form-group-wide { grid-column: span 2; }
          .form-group.form-group-fill { grid-column: 3 / -1; }

          @media (max-width: 640px) {
            .form-group.form-group-wide,
            .form-group.form-group-fill { grid-column: 1 / -1; }
          }

          .label {
            font-family: var(--font-mono);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.04em;
            color: var(--color-ink-soft);
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .required { color: var(--color-gold); }

          .label-badge {
            font-size: 9px;
            padding: 1px 5px;
            background: var(--color-white-grey, #f5f5f5);
            border: 1px solid var(--color-white-border);
            border-radius: 3px;
            color: var(--color-ink-soft);
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }

          .input-row {
            display: flex;
            gap: 8px;
          }
          .input-row .input { flex: 1; }

          .btn-generate {
            padding: 0 12px;
            height: 36px;
            background: var(--color-gold);
            border: 1px solid var(--color-gold);
            border-radius: 4px;
            color: var(--color-ink);
            font-family: var(--font-mono);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.05em;
            cursor: pointer;
            white-space: nowrap;
            transition: all 150ms ease;
            flex-shrink: 0;
          }
          .btn-generate:hover { filter: brightness(1.1); transform: translateY(-1px); }
          .btn-generate:active { transform: translateY(0); }

          .field-error {
            display: flex;
            align-items: center;
            gap: 4px;
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--color-error, #e53e3e);
            margin-top: 4px;
          }

          /* ── Images ── */
          .images-row {
            display: flex;
            gap: 16px;
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .image-upload-card {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
            min-width: 160px;
          }
          .image-upload-card--small { max-width: 160px; }

          .image-drop-zone {
            position: relative;
            border: 2.5px dashed var(--color-white-border);
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            aspect-ratio: 4/3;
            background: var(--color-white-warm, #fafafa);
            transition: border-color 150ms ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .image-upload-card--small .image-drop-zone { aspect-ratio: 1; }
          .image-drop-zone:hover, .image-drop-zone:focus-visible { border-color: var(--color-gold); outline: none; }
          .image-drop-zone:focus-visible { box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-gold) 40%, transparent); }
          .image-drop-zone.has-error { border-color: var(--color-error, #e53e3e); }

          .drop-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            color: var(--color-ink-soft);
          }

          .drop-hint {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.04em;
          }

          .drop-preview-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .drop-overlay {
            position: absolute;
            inset: 0;
            background: rgba(14, 14, 15, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 150ms ease;
            font-family: var(--font-mono);
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: white;
          }
          .image-drop-zone:hover .drop-overlay,
          .image-drop-zone:focus-visible .drop-overlay { opacity: 1; }

          .image-card-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .image-card-title {
            font-family: var(--font-mono);
            font-size: 11px;
            font-weight: 600;
            color: var(--color-ink);
          }

          .image-card-spec {
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--color-ink-soft);
            letter-spacing: 0.03em;
          }

          /* ── Custom fields ── */
          .btn-add-field {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 5px 10px;
            background: transparent;
            border: 1px solid var(--color-white-border);
            border-radius: 4px;
            color: var(--color-ink-soft);
            font-family: var(--font-mono);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: all 150ms ease;
          }
          .btn-add-field:hover { border-color: var(--color-gold); color: var(--color-ink); }

          .custom-fields-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .custom-field-row {
            display: flex;
            gap: 8px;
            align-items: center;
          }

          .custom-field-key { flex: 0 0 36%; }

          .btn-remove-field {
            width: 32px;
            height: 32px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: 1px solid var(--color-white-border);
            border-radius: 4px;
            color: var(--color-ink-soft);
            cursor: pointer;
            transition: all 150ms ease;
          }
          .btn-remove-field:hover { background: var(--color-error, #e53e3e); border-color: var(--color-error, #e53e3e); color: white; }

          .help-text {
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--color-ink-soft);
            margin: 0;
            font-style: italic;
          }

          /* ── Footer ── */
          .modal-footer {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px 24px;
            border-top: 1px solid var(--color-white-border);
            background: var(--color-white-warm);
            position: sticky;
            bottom: 0;
          }

          .footer-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
          }

          /* ── Progress ── */
          .progress-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .progress-label {
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--color-ink-soft);
            white-space: nowrap;
            min-width: 140px;
          }

          .progress-bar-track {
            flex: 1;
            height: 3px;
            background: var(--color-white-border);
            border-radius: 2px;
            overflow: hidden;
          }

          .progress-bar-fill {
            height: 100%;
            background: var(--color-gold);
            border-radius: 2px;
            transition: width 300ms ease;
          }

          /* ── Spinner ── */
          @keyframes spin { to { transform: rotate(360deg); } }
          .spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: currentColor;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
            flex-shrink: 0;
          }

          /* ── Color Picker ── */
          .color-picker-group {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--color-white-border);
          }

          .color-picker-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
          }

          .color-input {
            width: 48px;
            height: 36px;
            border: 1px solid var(--color-white-border);
            border-radius: 4px;
            cursor: pointer;
            padding: 2px;
          }

          .color-input::-webkit-color-swatch-wrapper {
            padding: 0;
          }

          .color-input::-webkit-color-swatch {
            border: none;
            border-radius: 2px;
          }

          .color-preset-buttons {
            display: flex;
            gap: 6px;
            margin-left: 8px;
          }

          .color-preset-btn {
            width: 32px;
            height: 32px;
            border-radius: 4px;
            cursor: pointer;
            border: none;
            transition: transform 150ms ease, box-shadow 150ms ease;
          }

          .color-preset-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }

          .color-preset-btn:active {
            transform: scale(0.95);
          }

          /* ── Disabled fieldset ── */
          fieldset:disabled { opacity: 0.6; pointer-events: none; }
        `}</style>
      </div>
    </div>
  );
}

/* ── Helpers ── */

const TYPE_LABELS: Record<ProductType, string> = {
  motor: 'MOTOR',
  esc: 'ESC',
  fc: 'FC',
  ips: 'IPS',
};

const TYPE_SUBS: Record<ProductType, string> = {
  motor: 'Brushless',
  esc: 'Speed Ctrl',
  fc: 'Flight Ctrl',
  ips: 'Propulsion',
};

type ProductType = 'motor' | 'esc' | 'fc' | 'ips';

function getEmptyProduct(type: ProductType, series: string): Partial<Product> {
  const base = {
    id: '',
    model: '',
    category: type,
    series: type === 'motor' ? series : type,
  };

  if (type === 'motor') return {
    ...base,
    kv: 0, voltage: '', peakCurrent: 0, recommendedThrust: '',
    peakThrust: '', propeller: '', diameter: 0, height: 0,
    weight: 0, escCompat: '', powerSource: '', performance: [], thrustUnit: 'g',
  } as MotorProduct;

  if (type === 'esc') return {
    ...base,
    continuousCurrent: 0, currentLimit: 0, recommendedBattery: '',
    bec: '', ipRating: '', weight: 0, size: '', powerLine: '',
    motorLine: '', throttlePulse: '', signalFreq: '', signalVoltage: '',
    opTempRange: '', speedSignalOutput: true, errorSignalOutput: true, protections: [],
  } as ESCProduct;

  if (type === 'fc') return {
    ...base,
    opVoltage: '', opTemp: '', size: '', weight: 0, pwmOutput: '',
    rcIn: '', usb: '', powerMonitor: '', powerInput: '', sensor: '',
    compass: true, vibrationIsolation: true, uart: 0, i2c: 0,
    can: 0, adc: '', spi: 0, software: '', outputConnector: '', communication: '',
  } as FCProduct;

  return {
    ...base,
    motorModel: '', escModel: '', kv: 0, voltage: '', peakCurrent: 0,
    recommendedThrust: '', peakThrust: '', propeller: '',
    diameter: 0, height: 0, depth: 0, weight: 0,
  } as IPSProduct;
}

/* ── Helper components ── */

function FieldError({ message }: { message: string }) {
  return (
    <div className="field-error" role="alert">
      <ErrorIcon />
      <span>{message}</span>
    </div>
  );
}

/* ── Icon components ── */

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M6 1v10M1 6h10" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="6" />
      <path d="M7 4v3.5M7 10v.5" />
    </svg>
  );
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}