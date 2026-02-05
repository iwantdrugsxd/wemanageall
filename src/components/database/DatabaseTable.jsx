import { cn } from '../../lib/cn';

/**
 * Database Table - Reusable table component for database views
 */
export default function DatabaseTable({
  columns = [],
  rows = [],
  onRowClick,
  className
}) {
  if (rows.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr 
            className="border-b sticky top-0 z-10"
            style={{ 
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-base)'
            }}
          >
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={cn(
                  'text-left py-3 px-4 text-sm font-medium',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center'
                )}
                style={{ color: 'var(--text-muted)' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={cn(
                'border-b transition-colors',
                onRowClick && 'cursor-pointer hover:bg-opacity-50'
              )}
              style={{ 
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (onRowClick) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {columns.map((col, colIdx) => {
                const cellValue = col.accessor ? col.accessor(row) : row[col.key];
                const cellContent = col.render ? col.render(cellValue, row) : cellValue;

                return (
                  <td
                    key={col.key || colIdx}
                    className={cn(
                      'py-3 px-4 text-sm',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center'
                    )}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
