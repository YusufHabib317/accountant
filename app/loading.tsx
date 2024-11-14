import { Loader2 } from 'lucide-react';

export default function loading() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      <Loader2 className="animate-spin" />
    </div>
  );
}
