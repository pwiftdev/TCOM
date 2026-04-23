import * as D from '@radix-ui/react-dialog';

export function Dialog({ open, onOpenChange, title, description, children }) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="dialog-overlay" />
        <D.Content className="dialog-content" onOpenAutoFocus={(e) => e.preventDefault()}>
          <D.Close className="dialog-close" aria-label="Close">×</D.Close>
          {title && (
            <D.Title asChild>
              <h3>{title}</h3>
            </D.Title>
          )}
          {description && (
            <D.Description asChild>
              <p className="muted" style={{ marginTop: 0 }}>{description}</p>
            </D.Description>
          )}
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
