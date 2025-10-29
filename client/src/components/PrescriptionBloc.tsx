import { useState } from 'react';
import { Trash2, Pill } from 'lucide-react';
import { Button } from './ui/button';

interface Prescription {
  _id: string;
  medicationName: string;
  dosage: string;
  time: string;
  completed: boolean;
}

interface PrescriptionBlocProps {
  prescriptions: Prescription[];
  onRemove: (id: string) => void;
}

export default function PrescriptionBloc({ prescriptions, onRemove }: PrescriptionBlocProps) {
  return (
    <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 text-white flex flex-col shadow-xl border border-blue-400/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          <h3 className="text-lg font-bold">Prescriptions</h3>
        </div>
        <span className="bg-white/20 backdrop-blur-sm text-sm px-2.5 py-1 rounded-full font-semibold">
          {prescriptions.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {prescriptions.length === 0 ? (
          <div className="text-center mt-6">
            <Pill className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs opacity-80">No prescriptions yet.</p>
          </div>
        ) : (
          prescriptions.slice(0, 3).map((prescription) => (
            <div
              key={prescription._id}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-xs hover:bg-white/15 transition-all border border-white/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mb-0.5 truncate">{prescription.medicationName}</p>
                  <p className="text-blue-100 text-[10px]">{prescription.dosage}</p>
                  <p className="text-blue-200 text-[10px] mt-1">⏰ {prescription.time}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-white hover:bg-white/20 shrink-0"
                  onClick={() => onRemove(prescription._id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
