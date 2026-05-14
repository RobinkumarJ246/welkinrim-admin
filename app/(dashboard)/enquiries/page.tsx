'use client';

import { useState, useMemo } from 'react';
import { useEnquiries, Enquiry } from '@/hooks/useEnquiries';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/context/ToastContext';

type StatusFilter = 'all' | 'new' | 'read' | 'responded' | 'resolved' | 'spam';

const STATUS_CONFIG = {
  new: { label: 'New', color: '#E8A800', icon: '●' },
  read: { label: 'Read', color: '#3B82F6', icon: '●' },
  responded: { label: 'Responded', color: '#10B981', icon: '✓' },
  resolved: { label: 'Resolved', color: '#6B7280', icon: '✓' },
  spam: { label: 'Spam', color: '#EF4444', icon: '✕' },
};

export default function EnquiriesPage() {
  const { enquiries, loading, stats, updateStatus, addNote, deleteEnquiry, refresh } = useEnquiries();
  const toast = useToast();

  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Enquiry | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const filteredEnquiries = useMemo(() => {
    let result = [...enquiries];

    // Status filter
    if (activeStatus !== 'all') {
      result = result.filter(e => e.status === activeStatus);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query) ||
        (e.company && e.company.toLowerCase().includes(query)) ||
        e.message.toLowerCase().includes(query)
      );
    }

    return result;
  }, [enquiries, activeStatus, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: Enquiry['status']) => {
    const success = await updateStatus(id, newStatus);
    if (success) {
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedEnquiry || !noteText.trim()) return;
    setSavingNote(true);
    const success = await addNote(selectedEnquiry.id, noteText.trim());
    setSavingNote(false);
    if (success) {
      toast.success('Note saved');
      setSelectedEnquiry(null);
      setNoteText('');
    } else {
      toast.error('Failed to save note');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const success = await deleteEnquiry(deleteConfirm.id);
    if (success) {
      toast.success('Enquiry deleted');
    } else {
      toast.error('Failed to delete enquiry');
    }
    setDeleteConfirm(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusTabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'new', label: 'New', count: stats.new, highlight: stats.new > 0 },
    { id: 'read', label: 'Read', count: stats.read },
    { id: 'responded', label: 'Responded', count: stats.responded },
    { id: 'resolved', label: 'Resolved', count: stats.resolved },
    { id: 'spam', label: 'Spam', count: stats.spam },
  ];

  return (
    <div className="enquiries-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Enquiries</h1>
          <p className="page-subtitle">Customer contact form submissions</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={refresh}>
            <RefreshIcon />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            className={`status-tab ${activeStatus === tab.id ? 'active' : ''} ${tab.highlight ? 'highlight' : ''}`}
            onClick={() => setActiveStatus(tab.id as StatusFilter)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-bar">
        <SearchIcon />
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, email, company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')}>
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Enquiries List */}
      {loading ? (
        <div className="loading-state">Loading enquiries...</div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="empty-state">
          <p>No enquiries found</p>
          {searchQuery && <button onClick={() => setSearchQuery('')}>Clear search</button>}
        </div>
      ) : (
        <div className="enquiries-list">
          {filteredEnquiries.map(enquiry => (
            <div key={enquiry.id} className="enquiry-card">
              {/* Header */}
              <div className="enquiry-header">
                <div className="enquiry-meta">
                  <span
                    className="status-badge"
                    style={{ background: STATUS_CONFIG[enquiry.status].color }}
                  >
                    {STATUS_CONFIG[enquiry.status].icon} {STATUS_CONFIG[enquiry.status].label}
                  </span>
                  <span className="enquiry-date">{formatDate(enquiry.created_at)}</span>
                </div>
                <div className="enquiry-actions">
                  <select
                    className="status-select"
                    value={enquiry.status}
                    onChange={(e) => handleStatusChange(enquiry.id, e.target.value as Enquiry['status'])}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                  <button className="action-btn" onClick={() => {
                    setSelectedEnquiry(enquiry);
                    setNoteText(enquiry.notes || '');
                  }}>
                    <NoteIcon />
                  </button>
                  <button className="action-btn delete" onClick={() => setDeleteConfirm(enquiry)}>
                    <DeleteIcon />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="enquiry-content">
                <div className="enquirer-info">
                  <h3 className="enquirer-name">{enquiry.name}</h3>
                  <a href={`mailto:${enquiry.email}`} className="enquirer-email">{enquiry.email}</a>
                  {enquiry.company && <p className="enquirer-company">{enquiry.company}</p>}
                  {enquiry.phone && <p className="enquirer-phone">{enquiry.phone}</p>}
                  {enquiry.industry && <p className="enquirer-industry">{enquiry.industry}</p>}
                </div>
                <div className="message-preview">
                  <p className="message-text">{enquiry.message.slice(0, 200)}{enquiry.message.length > 200 ? '...' : ''}</p>
                  {enquiry.message.length > 200 && (
                    <button
                      className="expand-btn"
                      onClick={() => setSelectedEnquiry(enquiry)}
                    >
                      Read full message
                    </button>
                  )}
                </div>
              </div>

              {/* Response Actions */}
              <div className="enquiry-response-actions">
                <a
                  href={`mailto:${enquiry.email}?subject=Re: Your enquiry to Welkinrim Technologies&body=Dear ${enquiry.name},%0D%0A%0D%0AThank you for your enquiry. We have received your message regarding:%0D%0A%0D%0A${encodeURIComponent(enquiry.message.slice(0, 150))}%0D%0A%0D%0AOur team will be happy to assist you.%0D%0A%0D%0ABest regards,%0D%0AWelkinrim Technologies`}
                  className="response-btn email"
                >
                  <EmailIcon />
                  Respond via Email
                </a>
                {enquiry.phone && (
                  <a href={`tel:${enquiry.phone}`} className="response-btn call">
                    <PhoneIcon />
                    Call
                  </a>
                )}
              </div>

              {/* Notes */}
              {enquiry.notes && (
                <div className="enquiry-notes">
                  <span className="notes-label">Note:</span>
                  <p className="notes-text">{enquiry.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Note/View Modal */}
      {selectedEnquiry && (
        <div className="modal-overlay" onClick={() => setSelectedEnquiry(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Enquiry Details</h2>
              <button className="modal-close" onClick={() => setSelectedEnquiry(null)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              {/* Contact Info */}
              <div className="detail-section">
                <div className="detail-row">
                  <span className="detail-label">From:</span>
                  <span className="detail-value">{selectedEnquiry.name} ({selectedEnquiry.email})</span>
                </div>
                {selectedEnquiry.company && (
                  <div className="detail-row">
                    <span className="detail-label">Company:</span>
                    <span className="detail-value">{selectedEnquiry.company}</span>
                  </div>
                )}
                {selectedEnquiry.phone && (
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedEnquiry.phone}</span>
                  </div>
                )}
                {selectedEnquiry.industry && (
                  <div className="detail-row">
                    <span className="detail-label">Industry:</span>
                    <span className="detail-value">{selectedEnquiry.industry}</span>
                  </div>
                )}
              </div>

              {/* Full Message */}
              <div className="detail-section">
                <span className="detail-label">Message:</span>
                <div className="full-message">{selectedEnquiry.message}</div>
              </div>

              {/* Internal Note */}
              <div className="detail-section">
                <span className="detail-label">Internal Note:</span>
                <textarea
                  className="note-input"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add internal notes about this enquiry..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <a
                href={`mailto:${selectedEnquiry.email}?subject=Re: Your enquiry to Welkinrim Technologies&body=Dear ${selectedEnquiry.name},%0D%0A%0D%0AThank you for contacting Welkinrim Technologies.%0D%0A%0D%0ARegarding your enquiry:%0D%0A%0D%0A${encodeURIComponent(selectedEnquiry.message)}%0D%0A%0D%0A%0D%0ABest regards,%0D%0AWelkinrim Technologies`}
                className="btn btn-primary"
              >
                <EmailIcon />
                Respond via Email
              </a>
              <button className="btn btn-secondary" onClick={handleSaveNote} disabled={savingNote}>
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
              <button className="btn btn-ghost" onClick={() => setSelectedEnquiry(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Enquiry"
        message={`Are you sure you want to delete the enquiry from "${deleteConfirm?.name}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmType="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      <style jsx>{`
        .enquiries-page {
          padding: 24px;
          max-width: 1200px;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .page-title {
          font-family: var(--font-display);
          font-size: 28px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-ink);
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-ink-mid);
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 4px;
          cursor: pointer;
          transition: all 150ms ease;
          border: 1px solid transparent;
        }

        .btn-primary {
          background: var(--color-gold);
          border-color: var(--color-gold);
          color: var(--color-ink);
        }

        .btn-primary:hover {
          filter: brightness(1.1);
        }

        .btn-secondary {
          background: var(--color-white-pure);
          border-color: var(--color-white-border);
          color: var(--color-ink);
        }

        .btn-secondary:hover {
          background: var(--color-white-grey);
        }

        .btn-ghost {
          background: transparent;
          border-color: transparent;
          color: var(--color-ink-mid);
        }

        .btn-ghost:hover {
          color: var(--color-ink);
        }

        /* Status Tabs */
        .status-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .status-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          border-radius: 4px;
          cursor: pointer;
          transition: all 200ms ease;
        }

        .status-tab:hover {
          border-color: var(--color-gold);
        }

        .status-tab.active {
          background: var(--color-gold);
          border-color: var(--color-gold);
          color: var(--color-white-pure);
        }

        .status-tab.highlight {
          border-color: var(--color-gold);
        }

        .tab-label {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .tab-count {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 0 6px;
          background: var(--color-white-grey);
          border-radius: 12px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
        }

        .status-tab.active .tab-count {
          background: rgba(255, 255, 255, 0.2);
          color: var(--color-white-pure);
        }

        .status-tab.highlight .tab-count {
          background: var(--color-gold);
          color: var(--color-ink);
        }

        /* Search */
        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 24px;
        }

        .search-bar svg:first-child {
          position: absolute;
          left: 12px;
          width: 16px;
          height: 16px;
          color: var(--color-ink-soft);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 10px 36px 10px 38px;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--color-ink);
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          border-radius: 4px;
          transition: border-color 200ms ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-gold);
          box-shadow: 0 0 0 3px var(--color-gold-ghost);
        }

        .search-clear {
          position: absolute;
          right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--color-ink-soft);
        }

        .search-clear:hover {
          color: var(--color-ink);
        }

        /* Enquiries List */
        .enquiries-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .enquiry-card {
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          border-radius: 8px;
          padding: 20px;
          transition: border-color 200ms ease;
        }

        .enquiry-card:hover {
          border-color: var(--color-gold);
        }

        .enquiry-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .enquiry-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fff;
          padding: 4px 8px;
          border-radius: 3px;
        }

        .enquiry-date {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--color-ink-soft);
        }

        .enquiry-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-select {
          padding: 6px 10px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-ink);
          background: var(--color-white-grey);
          border: 1px solid var(--color-white-border);
          border-radius: 3px;
          cursor: pointer;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--color-white-grey);
          border: 1px solid var(--color-white-border);
          border-radius: 3px;
          cursor: pointer;
          color: var(--color-ink-mid);
          transition: all 150ms ease;
        }

        .action-btn:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
        }

        .action-btn.delete:hover {
          border-color: #EF4444;
          color: #EF4444;
        }

        .enquiry-content {
          display: flex;
          gap: 24px;
        }

        .enquirer-info {
          min-width: 200px;
        }

        .enquirer-name {
          font-family: var(--font-display);
          font-size: 16px;
          color: var(--color-ink);
          margin: 0 0 4px 0;
        }

        .enquirer-email {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--color-gold);
          text-decoration: none;
        }

        .enquirer-email:hover {
          text-decoration: underline;
        }

        .enquirer-company,
        .enquirer-phone,
        .enquirer-industry {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-ink-mid);
          margin: 4px 0 0 0;
        }

        .message-preview {
          flex: 1;
        }

        .message-text {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-ink);
          line-height: 1.6;
          margin: 0;
        }

        .enquiry-response-actions {
          margin-top: 16px;
          display: flex;
          gap: 12px;
        }

        .response-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 4px;
          cursor: pointer;
          transition: all 150ms ease;
          text-decoration: none;
          border: 1px solid transparent;
        }

        .response-btn.email {
          background: var(--color-gold);
          color: var(--color-ink);
          border-color: var(--color-gold);
        }

        .response-btn.email:hover {
          filter: brightness(1.1);
        }

        .response-btn.call {
          background: var(--color-white-grey);
          color: var(--color-ink);
          border-color: var(--color-white-border);
        }

        .response-btn.call:hover {
          border-color: var(--color-gold);
        }

        .expand-btn {
          display: inline-flex;
          align-items: center;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-gold);
          background: transparent;
          border: none;
          cursor: pointer;
          margin-top: 8px;
          padding: 0;
        }

        .expand-btn:hover {
          text-decoration: underline;
        }

        .enquiry-notes {
          margin-top: 16px;
          padding: 12px;
          background: rgba(232, 168, 0, 0.08);
          border: 1px solid rgba(232, 168, 0, 0.2);
          border-radius: 4px;
        }

        .notes-label {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          color: var(--color-gold);
          text-transform: uppercase;
        }

        .notes-text {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-ink);
          margin: 4px 0 0 0;
        }

        /* Loading/Empty States */
        .loading-state,
        .empty-state {
          padding: 48px;
          text-align: center;
          background: var(--color-white-grey);
          border-radius: 8px;
        }

        .loading-state {
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--color-ink-soft);
        }

        .empty-state p {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-ink-soft);
          margin: 0 0 12px 0;
        }

        .empty-state button {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--color-gold);
          background: none;
          border: none;
          cursor: pointer;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .modal-content {
          background: var(--color-white-pure);
          border-radius: 8px;
          padding: 24px;
          max-width: 480px;
          width: 90%;
        }

        .modal-large {
          max-width: 640px;
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }

        .detail-label {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-ink-soft);
          min-width: 80px;
        }

        .detail-value {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-ink);
        }

        .full-message {
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-ink);
          padding: 12px;
          background: var(--color-white-grey);
          border: 1px solid var(--color-white-border);
          border-radius: 4px;
          white-space: pre-wrap;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .modal-header h2 {
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
          border: none;
          cursor: pointer;
          color: var(--color-ink-soft);
        }

        .modal-close:hover {
          color: var(--color-ink);
        }

        .modal-body {
          margin-bottom: 20px;
        }

        .modal-subtitle {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-ink-mid);
          margin-bottom: 12px;
        }

        .note-input {
          width: 100%;
          padding: 12px;
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-ink);
          background: var(--color-white-grey);
          border: 1px solid var(--color-white-border);
          border-radius: 4px;
          resize: vertical;
        }

        .note-input:focus {
          outline: none;
          border-color: var(--color-gold);
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 8a6 6 0 11-1.5-4" />
      <path d="M14 2v4h-4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6.5" cy="6.5" r="4" />
      <path d="M10 10l3.5 3.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2l10 10M12 2L2 12" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3h10v10H3z" />
      <path d="M5 6h6M5 9h4" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12a2 2 0 012 2v6a2 2 0 01-2 2H2a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path d="M2 6l6 4 6-4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2h8v12H4z" />
      <path d="M6 3h4M7 12h2" strokeLinecap="round" />
    </svg>
  );
}