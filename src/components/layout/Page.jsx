import { cn } from '../../lib/cn';

export default function Page({ children, className, ...props }) {
  return (
    <div
      className={cn('max-w-7xl mx-auto px-6 lg:px-8 py-8', className)}
      {...props}
    >
      {children}
    </div>
  );
}
