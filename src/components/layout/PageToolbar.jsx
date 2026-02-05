import { cn } from '../../lib/cn';

export default function PageToolbar({ children, className, ...props }) {
  return (
    <div
      className={cn('mb-6 flex items-center justify-between gap-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
