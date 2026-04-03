import Image from "next/image";

interface PrintLabelProps {
  stationCode: string; // The ID or code of the station
  stationName?: string;
}

export function PrintLabel({ stationCode, stationName }: PrintLabelProps) {
  // Construct dynamic URL based on the concept
  const baseUrl = "https://cityzen-core.com/r/";
  const qrTextLink = baseUrl + stationCode;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 rounded-3xl shadow-md max-w-[300px] mx-auto text-center font-sans">
      <h3 className="font-extrabold text-blue-900 text-xl mb-4 line-clamp-2 leading-tight">
        {stationName || "แสกนเพื่อรายงานสถานะ"}
      </h3>

      {/* Container for QR Code with some decorative background */}
      <div className="p-4 bg-gray-50 rounded-2xl mb-5 shadow-inner border border-gray-100">
        <Image
          src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrTextLink)}`}
          alt={`QR Code for ${stationCode}`}
          width={300}
          height={300}
          className="w-48 h-48 rounded-xl object-contain mix-blend-multiply"
          loading="lazy"
        />
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-600 font-bold tracking-tight">
          สแกนเพื่ออัปเดตสถานการณ์น้ำมัน
        </p>
        <p className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded inline-block mt-2">
          REF: {stationCode}
        </p>
      </div>
    </div>
  );
}
