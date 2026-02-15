import React, { useState } from 'react';
import { Phone, MessageSquare, X } from 'lucide-react';
import { customerApi } from '../../api/axios';

// 1. Define the Payload interface to fix the .booking_id errors
interface CallPayload {
  call_type: string;
  booking_id?: string;
  enquiry_id?: string;
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  enquiryId?: string;
  tokens?: { access: string };
}

export const CommunicationDrawer: React.FC<DrawerProps>= ({ 
  isOpen, 
  onClose, 
  bookingId, 
  enquiryId, 
  tokens 
}) => {
  // Use string or null, but we'll convert to boolean for the 'disabled' prop
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const makeCall = async (type: string) => {
    setLoadingType(type);
    
    // 2. Initialize with the correct type to allow adding properties
    const payload: CallPayload = { 
      call_type: type === 'whatsapp' ? 'whatsapp' : type 
    };

    if (bookingId) payload.booking_id = bookingId;
    if (enquiryId) payload.enquiry_id = enquiryId;

    try {
      const res = await customerApi.post("/calls/connect/",payload);

      alert(type === 'whatsapp' ? "WhatsApp Sent!" : "Call initiated");
      //onClose();
    } catch (err) {
      alert("Action failed. Please try again.");
      console.error(err);
    } finally {
      setLoadingType(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-80 bg-white z-50 shadow-2xl p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Contact Customer</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <button
            // 3. Convert null/string to a boolean using !! 
            // This fixes: Type 'null' is not assignable to type 'boolean'
            disabled={!!loadingType} 
            onClick={() => makeCall('booking')}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 rounded-xl disabled:opacity-50"
          >
            {loadingType === 'booking' ? "Connecting..." : <><Phone size={18} /> Call Customer</>}
          </button>

          {bookingId && (
            <button
              disabled={!!loadingType}
              onClick={() => makeCall('whatsapp')}
              className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-3 rounded-xl disabled:opacity-50"
            >
              {loadingType === 'whatsapp' ? "Sending..." : <><MessageSquare size={18} /> WhatsApp</>}
            </button>
          )}
        </div>
      </div>
    </>
  );
};