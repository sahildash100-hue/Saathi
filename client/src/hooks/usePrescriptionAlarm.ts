import { useEffect, useRef } from 'react';

interface Prescription {
  _id: string;
  medicationName: string;
  dosage: string;
  time: string; // Format: "HH:MM"
  completed: boolean;
}

export function usePrescriptionAlarm(prescriptions: Prescription[]) {
  const alertedPrescriptionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const speakPrescription = (prescription: Prescription) => {
      const message = `You have a prescription. Take ${prescription.medicationName}. Dosage: ${prescription.dosage}`;
      const utterance = new SpeechSynthesisUtterance(message);
      
      // Speech settings optimized for clarity
      utterance.rate = 0.85; // Slightly slower for senior users
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume
      
      // Use a more natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Samantha')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Cancel any ongoing speech to avoid overlapping
      window.speechSynthesis.cancel();
      
      // Speak the prescription
      window.speechSynthesis.speak(utterance);
    };

    const checkPrescriptionTimes = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      prescriptions.forEach(prescription => {
        // Skip if already completed or already alerted
        if (
          !prescription.time ||
          prescription.completed ||
          alertedPrescriptionsRef.current.has(prescription._id)
        ) {
          return;
        }

        // Check if it's time for the prescription (within 5 minute window)
        const [prescriptionHour, prescriptionMinute] = prescription.time.split(':').map(Number);
        const prescriptionTimeMinutes = prescriptionHour * 60 + prescriptionMinute;
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
        
        const timeDifference = Math.abs(currentTimeMinutes - prescriptionTimeMinutes);
        
        // Trigger if within 2 minutes of scheduled time
        if (timeDifference <= 2) {
          if (!alertedPrescriptionsRef.current.has(prescription._id)) {
            alertedPrescriptionsRef.current.add(prescription._id);
            speakPrescription(prescription);
            
            console.log('💊 Prescription spoken:', prescription.medicationName, 'at', currentTime);
          }
        }
      });
    };

    // Check every minute for prescriptions
    const interval = setInterval(checkPrescriptionTimes, 60000);

    return () => {
      clearInterval(interval);
      // Cancel any ongoing speech when component unmounts
      window.speechSynthesis.cancel();
    };
  }, [prescriptions]);
}
