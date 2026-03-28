'use client';

import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import type { Product, MotorProduct, ESCProduct, FCProduct, IPSProduct, PerformancePoint } from '@/lib/products';

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
}

type ProductType = 'motor' | 'esc' | 'fc' | 'ips';
type Series = 'Haemng' | 'Maelard';

export function ProductFormModal({ product, onClose }: ProductFormModalProps) {
  const { create, update } = useProducts();

  const [productType, setProductType] = useState<ProductType>(
    (product?.category as ProductType) || 'motor'
  );
  const [series, setSeries] = useState<Series>((product as MotorProduct)?.series || 'Haemng');
  const [formData, setFormData] = useState<Partial<Product>>(
    product || getEmptyProduct('motor', 'Haemng')
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setProductType(product.category as ProductType);
      if (product.category === 'motor') {
        setSeries((product as MotorProduct).series);
      }
    } else {
      setFormData(getEmptyProduct('motor', 'Haemng'));
    }
  }, [product]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev!, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedChange = (field: string, nestedField: string, value: any) => {
    setFormData(prev => ({
      ...prev!,
      [field]: { ...(prev as any)[field], [nestedField]: value },
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.model?.trim()) {
      newErrors.model = 'Model is required';
    }
    if (!formData.id?.trim()) {
      newErrors.id = 'ID is required';
    }
    if ('kv' in formData && !formData.kv) {
      newErrors.kv = 'KV is required';
    }
    if ('voltage' in formData && !formData.voltage) {
      newErrors.voltage = 'Voltage is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSaving(true);

    // Generate ID from model if empty
    const finalData = {
      ...formData,
      id: formData.id || generateId(formData.model!, series),
    } as Product;

    if (product) {
      update(product.id, finalData);
    } else {
      create(finalData);
    }

    setIsSaving(false);
    onClose();
  };

  const inputClass = (field: string) => `input ${errors[field] ? 'input-error' : ''}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal product-modal" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2 className="modal-title">{product ? 'Edit Product' : 'Add Product'}</h2>
            <button type="button" className="modal-close" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <div className="modal-body">
            {/* Product Type Selector */}
            <div className="form-section">
              <label className="label">Product Type</label>
              <div className="type-selector">
                {(['motor', 'esc', 'fc', 'ips'] as ProductType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`type-btn ${productType === type ? 'active' : ''}`}
                    onClick={() => {
                      setProductType(type);
                      setFormData(getEmptyProduct(type, series));
                    }}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="model" className="label">Model Name *</label>
                <input
                  id="model"
                  type="text"
                  className={inputClass('model')}
                  value={formData.model || ''}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="e.g., Haemng 2121 II"
                />
                {errors.model && <span className="error-text">{errors.model}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="id" className="label">Product ID *</label>
                <input
                  id="id"
                  type="text"
                  className={inputClass('id')}
                  value={formData.id || ''}
                  onChange={(e) => handleChange('id', e.target.value)}
                  placeholder="e.g., haemng-2121-ii"
                />
                {errors.id && <span className="error-text">{errors.id}</span>}
              </div>

              {productType === 'motor' && (
                <div className="form-group">
                  <label htmlFor="series" className="label">Series</label>
                  <select
                    id="series"
                    className="select"
                    value={series}
                    onChange={(e) => {
                      setSeries(e.target.value as Series);
                      handleChange('series', e.target.value);
                    }}
                  >
                    <option value="Haemng">Haemng</option>
                    <option value="Maelard">Maelard</option>
                  </select>
                </div>
              )}

              {/* Motor-specific fields */}
              {productType === 'motor' && (
                <>
                  <div className="form-group">
                    <label htmlFor="kv" className="label">KV Rating</label>
                    <input
                      id="kv"
                      type="number"
                      className={inputClass('kv')}
                      value={(formData as MotorProduct).kv || ''}
                      onChange={(e) => handleChange('kv', parseInt(e.target.value) || 0)}
                    />
                    {errors.kv && <span className="error-text">{errors.kv}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="voltage" className="label">Voltage</label>
                    <input
                      id="voltage"
                      type="text"
                      className={inputClass('voltage')}
                      value={(formData as MotorProduct).voltage || ''}
                      onChange={(e) => handleChange('voltage', e.target.value)}
                      placeholder="e.g., 6S, 12S"
                    />
                    {errors.voltage && <span className="error-text">{errors.voltage}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="peakCurrent" className="label">Peak Current (A)</label>
                    <input
                      id="peakCurrent"
                      type="number"
                      className="input"
                      value={(formData as MotorProduct).peakCurrent || ''}
                      onChange={(e) => handleChange('peakCurrent', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="peakThrust" className="label">Peak Thrust</label>
                    <input
                      id="peakThrust"
                      type="text"
                      className="input"
                      value={(formData as MotorProduct).peakThrust || ''}
                      onChange={(e) => handleChange('peakThrust', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="recommendedThrust" className="label">Recommended Thrust</label>
                    <input
                      id="recommendedThrust"
                      type="text"
                      className="input"
                      value={(formData as MotorProduct).recommendedThrust || ''}
                      onChange={(e) => handleChange('recommendedThrust', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight" className="label">Weight (g)</label>
                    <input
                      id="weight"
                      type="number"
                      className="input"
                      value={formData.weight || ''}
                      onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="diameter" className="label">Diameter (mm)</label>
                    <input
                      id="diameter"
                      type="number"
                      className="input"
                      value={(formData as MotorProduct).diameter || ''}
                      onChange={(e) => handleChange('diameter', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="height" className="label">Height (mm)</label>
                    <input
                      id="height"
                      type="number"
                      className="input"
                      value={(formData as MotorProduct).height || ''}
                      onChange={(e) => handleChange('height', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </>
              )}

              {/* ESC-specific fields */}
              {productType === 'esc' && (
                <>
                  <div className="form-group">
                    <label htmlFor="continuousCurrent" className="label">Continuous Current (A)</label>
                    <input
                      id="continuousCurrent"
                      type="number"
                      className="input"
                      value={(formData as ESCProduct).continuousCurrent || ''}
                      onChange={(e) => handleChange('continuousCurrent', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="currentLimit" className="label">Current Limit (A)</label>
                    <input
                      id="currentLimit"
                      type="number"
                      className="input"
                      value={(formData as ESCProduct).currentLimit || ''}
                      onChange={(e) => handleChange('currentLimit', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="recommendedBattery" className="label">Recommended Battery</label>
                    <input
                      id="recommendedBattery"
                      type="text"
                      className="input"
                      value={(formData as ESCProduct).recommendedBattery || ''}
                      onChange={(e) => handleChange('recommendedBattery', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight" className="label">Weight (g)</label>
                    <input
                      id="weight"
                      type="number"
                      className="input"
                      value={formData.weight || ''}
                      onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </>
              )}

              {/* Flight Controller fields */}
              {productType === 'fc' && (
                <>
                  <div className="form-group">
                    <label htmlFor="size" className="label">Size</label>
                    <input
                      id="size"
                      type="text"
                      className="input"
                      value={(formData as FCProduct).size || ''}
                      onChange={(e) => handleChange('size', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight" className="label">Weight (g)</label>
                    <input
                      id="weight"
                      type="number"
                      className="input"
                      value={formData.weight || ''}
                      onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="uart" className="label">UART Count</label>
                    <input
                      id="uart"
                      type="number"
                      className="input"
                      value={(formData as FCProduct).uart || ''}
                      onChange={(e) => handleChange('uart', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </>
              )}

              {/* IPS fields */}
              {productType === 'ips' && (
                <>
                  <div className="form-group">
                    <label htmlFor="motorModel" className="label">Motor Model</label>
                    <input
                      id="motorModel"
                      type="text"
                      className="input"
                      value={(formData as IPSProduct).motorModel || ''}
                      onChange={(e) => handleChange('motorModel', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="escModel" className="label">ESC Model</label>
                    <input
                      id="escModel"
                      type="text"
                      className="input"
                      value={(formData as IPSProduct).escModel || ''}
                      onChange={(e) => handleChange('escModel', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="kv" className="label">KV Rating</label>
                    <input
                      id="kv"
                      type="number"
                      className="input"
                      value={(formData as IPSProduct).kv || ''}
                      onChange={(e) => handleChange('kv', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight" className="label">Weight (g)</label>
                    <input
                      id="weight"
                      type="number"
                      className="input"
                      value={formData.weight || ''}
                      onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : (product ? 'Update' : 'Create')}
            </button>
          </div>
        </form>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(14, 14, 15, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .product-modal {
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--color-white-border);
          }

          .modal-title {
            font-family: var(--font-display);
            font-size: 18px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--color-ink);
          }

          .modal-close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--color-ink-soft);
            border-radius: 4px;
          }

          .modal-close:hover {
            background: var(--color-white-grey);
            color: var(--color-ink);
          }

          .modal-body {
            padding: 24px;
          }

          .modal-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 24px;
            border-top: 1px solid var(--color-white-border);
            background: var(--color-white-warm);
          }

          .form-section {
            margin-bottom: 24px;
          }

          .type-selector {
            display: flex;
            gap: 8px;
          }

          .type-btn {
            flex: 1;
            padding: 12px;
            background: var(--color-white-pure);
            border: 1px solid var(--color-white-border);
            border-radius: 4px;
            font-family: var(--font-mono);
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 200ms ease;
          }

          .type-btn:hover {
            border-color: var(--color-gold);
          }

          .type-btn.active {
            background: var(--color-gold);
            border-color: var(--color-gold);
            color: var(--color-white-pure);
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
          }

          .form-group.full-width {
            grid-column: 1 / -1;
          }

          .label {
            margin-bottom: 6px;
          }

          .error-text {
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--color-error);
            margin-top: 4px;
          }
        `}</style>
      </div>
    </div>
  );
}

function getEmptyProduct(type: ProductType, series: Series): Partial<Product> {
  const base = {
    category: type,
    series: type === 'motor' ? series : undefined,
  };

  if (type === 'motor') {
    return {
      ...base,
      kv: 0,
      voltage: '',
      peakCurrent: 0,
      recommendedThrust: '',
      peakThrust: '',
      propeller: '',
      diameter: 0,
      height: 0,
      weight: 0,
      escCompat: '',
      powerSource: '',
      performance: [],
      thrustUnit: 'g',
    } as MotorProduct;
  }

  if (type === 'esc') {
    return {
      ...base,
      continuousCurrent: 0,
      currentLimit: 0,
      recommendedBattery: '',
      bec: '',
      ipRating: '',
      weight: 0,
      size: '',
      powerLine: '',
      motorLine: '',
      throttlePulse: '',
      signalFreq: '',
      signalVoltage: '',
      opTempRange: '',
      speedSignalOutput: true,
      errorSignalOutput: true,
      protections: [],
    } as ESCProduct;
  }

  if (type === 'fc') {
    return {
      ...base,
      opVoltage: '',
      opTemp: '',
      size: '',
      weight: 0,
      pwmOutput: '',
      rcIn: '',
      usb: '',
      powerMonitor: '',
      powerInput: '',
      sensor: '',
      compass: true,
      vibrationIsolation: true,
      uart: 0,
      i2c: 0,
      can: 0,
      adc: '',
      spi: 0,
      software: '',
      outputConnector: '',
      communication: '',
    } as FCProduct;
  }

  return {
    ...base,
    motorModel: '',
    escModel: '',
    kv: 0,
    voltage: '',
    peakCurrent: 0,
    recommendedThrust: '',
    peakThrust: '',
    propeller: '',
    diameter: 0,
    height: 0,
    depth: 0,
    weight: 0,
  } as IPSProduct;
}

function generateId(model: string, series: string): string {
  return model
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2l12 12M14 2L2 14" />
    </svg>
  );
}
