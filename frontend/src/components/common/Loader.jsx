import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-muted">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="mt-2 text-sm font-medium">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        {content}
      </div>
    );
  }

  return <div className="py-12">{content}</div>;
};

export default Loader;