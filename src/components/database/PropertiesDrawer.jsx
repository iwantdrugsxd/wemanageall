import { useEffect } from 'react';
import { cn } from '../../lib/cn';
import IconButton from '../ui/IconButton';
import Input from '../ui/Input';
import Select from '../ui/Select';
// Icons are inline SVG paths

/**
 * Properties Drawer - Right-side drawer for viewing/editing item properties
 */
export default function PropertiesDrawer({
  isOpen,
  onClose,
  title = 'Properties',
  sections = [],
  className
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 w-96 z-50 shadow-xl',
          'flex flex-col',
          'transition-transform duration-300 ease-out'
        )}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-subtle)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <IconButton
            variant="ghost"
            size="md"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sections.map((section, sectionIdx) => (
            <div key={section.title || sectionIdx}>
              {section.title && (
                <h3
                  className="text-xs font-semibold uppercase mb-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {section.title}
                </h3>
              )}
              <div className="space-y-3">
                {section.fields.map((field, fieldIdx) => (
                  <div key={field.key || fieldIdx}>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {field.label}
                    </label>
                    {field.readOnly ? (
                      <div
                        className="text-sm py-2 px-3 rounded"
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {field.value || 'Not available'}
                      </div>
                    ) : field.type === 'select' ? (
                      <Select
                        value={field.value || ''}
                        onChange={(e) => field.onChange && field.onChange(e.target.value)}
                        className="w-full"
                      >
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        type={field.type || 'text'}
                        value={field.value || ''}
                        onChange={(e) => field.onChange && field.onChange(e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
