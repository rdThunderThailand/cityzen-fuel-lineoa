import HelpFormContent from "@/components/request-help/HelpFormContent";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function HelpFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      }
    >
      <HelpFormContent />
    </Suspense>
  );
}
