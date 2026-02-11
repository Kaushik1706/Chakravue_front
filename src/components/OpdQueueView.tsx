import { useState, useEffect } from 'react';
import { CheckCircle2, Eye, AlertCircle, Save, RotateCcw } from 'lucide-react';
import API_ENDPOINTS from '../config/api';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { QueuedPatient } from './queueTypes';
import { PatientData } from './patient';

interface OpdQueueViewProps {
  userRole?: string;
  onPatientSelected?: (patient: QueuedPatient, patientData: PatientData) => void;
  hideDetailView?: boolean;
}

export function OpdQueueView({ userRole, onPatientSelected, hideDetailView }: OpdQueueViewProps) {
  const [queue, setQueue] = useState<QueuedPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<QueuedPatient | null>(null);
  const [findings, setFindings] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpdQueue();
    // Listen for custom events indicating backend state changed
    const handleOpdQueueUpdated = () => fetchOpdQueue();
    window.addEventListener('opdQueueUpdated', handleOpdQueueUpdated);
    return () => window.removeEventListener('opdQueueUpdated', handleOpdQueueUpdated);
  }, []);

  const fetchOpdQueue = () => {
    (async () => {
      try {
        // Fetch from dedicated OPD queue collection - only show waiting patients
        const resp = await fetch(`${API_ENDPOINTS.QUEUE_OPD}?status=waiting`);
        if (!resp.ok) throw new Error('Failed to load OPD queue');
        const json = await resp.json();
        const today = new Date().toISOString().split('T')[0];
        
        // Filter to only show waiting patients (not done) and today's patients
        const waitingItems = (json.items || []).filter((item: any) => {
          const isWaiting = item.status === 'waiting' || !item.status;
          const rawDate = item.appointmentDate || (item.receptionData && item.receptionData.appointmentDate);
          const itemDate = rawDate ? rawDate.split('T')[0] : '';
          return isWaiting && itemDate === today;
        });
        setQueue(waitingItems);
        setLoading(false);
      } catch (e) {
        console.error('Error loading OPD queue:', e);
        setQueue([]);
        setLoading(false);
      }
    })();
  };

  const handleSelectPatient = (patient: QueuedPatient) => {
    setSelectedPatient(patient);
    setFindings(patient.opdFindings ? JSON.stringify(patient.opdFindings, null, 2) : '');
    
    // Extract data from OPD queue item - receptionData has nested structure
    const rd = (patient as any).receptionData || {};
    
    // receptionData has nested structure: receptionData.patientDetails, receptionData.presentingComplaints, etc.
    const rdPatientDetails = rd.patientDetails || {};
    const rdPresentingComplaints = rd.presentingComplaints || {};
    const rdMedicalHistory = rd.medicalHistory || {};
    const rdDrugHistory = rd.drugHistory || {};
    
    const regId = (patient as any).registrationId || patient.patientRegistrationId || rdPatientDetails.registrationId || '';
    const name = patient.patientName || rdPatientDetails.name || '';
    const phone = rdPatientDetails.phone || (patient as any).phone || '';
    const email = rdPatientDetails.email || (patient as any).email || '';
    
    // Convert QueuedPatient to PatientData format for dashboard
    // Use THIS VISIT's data from receptionData, NOT from patient document
    const patientData: PatientData = {
      patientDetails: {
        name: name,
        registrationId: regId,
        age: rdPatientDetails.age || '',
        sex: rdPatientDetails.sex || '',
        profilePic: null,
        password: '',
        phone: phone,
        email: email,
        address: rdPatientDetails.address || '',
        bloodType: rdPatientDetails.bloodType || '',
        allergies: rdPatientDetails.allergies || '',
        emergencyContact: rdPatientDetails.emergencyContact || ''
      },
      // Use THIS VISIT's clinical data from receptionData
      presentingComplaints: rdPresentingComplaints.complaints ? rdPresentingComplaints : {
        complaints: [],
        history: { severity: '', onset: '', aggravating: '', relieving: '', associated: '' },
        timeline: []
      },
      medicalHistory: rdMedicalHistory.medical ? rdMedicalHistory : {
        medical: [],
        surgical: [],
        familyHistory: '',
        socialHistory: { smoking: '', alcohol: '', exercise: '' }
      },
      drugHistory: rdDrugHistory.allergies ? rdDrugHistory : {
        allergies: [],
        currentMeds: [],
        compliance: { adherenceRate: '', missedDoses: '', lastRefill: '' },
        previousMeds: ''
      },
      // OPD data starts fresh (OPD will fill these)
      optometry: {
        vision: undefined,
        autoRefraction: {
          ur: undefined,
          dr: undefined
        },
        finalGlasses: {
          rightEye: undefined,
          leftEye: undefined,
          add: '',
          mDist: ''
        },
        currentGlasses: {
          rightEye: {
            sph: '',
            cyl: '',
            axis: '',
            va: '',
            add: ''
          },
          leftEye: {
            sph: '',
            cyl: '',
            axis: '',
            va: '',
            add: ''
          }
        },
        oldGlass: {
          rightEye: {
            sph: '',
            cyl: '',
            axis: '',
            va: '',
            add: ''
          },
          leftEye: {
            sph: '',
            cyl: '',
            axis: '',
            va: '',
            add: ''
          }
        },
        additional: {
          gpAdvisedFor: '',
          gpAdvisedBy: '',
          useOfGlass: '',
          product: ''
        }
      },
      iop: {},
      ophthalmicInvestigations: {},
      systemicInvestigations: {
        bloodTests: [],
        lipidProfile: [],
        renalFunction: [],
        liverFunction: []
      }
    };
    
    // Call parent callback to update dashboard
    if (onPatientSelected) {
      onPatientSelected(patient, patientData);
    }
  };

  const sendToDashboard = () => {
    if (!selectedPatient) return;
    handleSelectPatient(selectedPatient);
  };

  const completeOpdExamination = async () => {
    if (!selectedPatient) return;

    try {
      // Get correct registration ID from queue item
      const rd = (selectedPatient as any).receptionData || {};
      const registrationId = (selectedPatient as any).registrationId || selectedPatient.patientRegistrationId || rd.patientRegistrationId;
      const queueId = (selectedPatient as any).id || selectedPatient._id;
      
      if (!registrationId) {
        alert('Cannot complete: Patient has no registration ID');
        return;
      }

      const updated: QueuedPatient = {
        ...selectedPatient,
        status: 'opd_completed',
        completedByOpdAt: new Date().toISOString(),
        opdFindings: findings ? { notes: findings } : {},
      };

      // Update OPD queue item on backend (this will update appointment and patient)
      try {
        console.log('Updating OPD queue item:', queueId);
        const resp = await fetch(API_ENDPOINTS.QUEUE_OPD_ITEM(queueId), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'done',
            action: 'opd_done',
            opdData: {
              findings: findings,
              completedAt: updated.completedByOpdAt
            }
          })
        });
        if (!resp.ok) {
          const errorText = await resp.text();
          throw new Error(`Failed to update OPD queue: ${resp.status} - ${errorText}`);
        }
        console.log('OPD queue updated');
      } catch (e) {
        console.error('Failed to update OPD queue:', e);
        alert('Failed to persist OPD data to server. Please retry.');
        return;
      }

      // Notify other components
      window.dispatchEvent(new CustomEvent('opdQueueUpdated', { detail: { registrationId } }));

      setSelectedPatient(null);
      setFindings('');
      alert('Patient moved to Doctor queue');
    } catch (err) {
      console.error('Error completing OPD:', err);
    }
  };

  // Recall patient back to reception
  const recallToReception = async () => {
    if (!selectedPatient) return;
    
    const reason = prompt('Enter reason for recalling patient to reception:');
    if (!reason) return;

    try {
      const queueId = (selectedPatient as any).id || selectedPatient._id;
      
      const resp = await fetch(API_ENDPOINTS.QUEUE_RECALL_TO_RECEPTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueId: queueId,
          reason: reason
        })
      });

      if (!resp.ok) {
        throw new Error('Failed to recall patient');
      }

      alert('Patient recalled to reception for corrections');
      setSelectedPatient(null);
      fetchOpdQueue();
      
      // Notify reception queue to refresh
      window.dispatchEvent(new CustomEvent('receptionQueueUpdated'));
    } catch (err) {
      console.error('Error recalling patient:', err);
      alert('Failed to recall patient. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${hideDetailView ? 'h-full' : 'h-screen'} bg-[#0a0a0a]`}>
        <div className="text-center">
          <Eye className="w-10 h-10 text-[#D4A574] animate-spin mx-auto mb-4 opacity-20" />
        </div>
      </div>
    );
  }

  if (hideDetailView) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
        <div className="p-6 border-b border-[#1a1a1a]">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#8B8B8B] uppercase tracking-widest">OPD Queue</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1a1a1a] rounded-full border border-[#222]">
                 <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                 <span className="text-[8px] font-bold text-[#444] uppercase tracking-widest">Live</span>
              </div>
           </div>
           
           <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-[#444] uppercase font-bold tracking-widest">Active Queue</span>
           </div>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto scrollbar-hide flex-1 pt-4">
          {queue.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center opacity-20">
               <p className="text-[10px] font-bold uppercase tracking-widest text-[#444]">No Patients Pending</p>
            </div>
          ) : (
            queue.map((patient, idx) => {
              const isSelected = selectedPatient?._id === patient._id || (selectedPatient as any).id === (patient as any).id;
              
              return (
                <button
                  key={patient._id || (patient as any).id || idx}
                  onClick={() => handleSelectPatient(patient)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                    isSelected 
                      ? 'bg-[#121212] border-[#D4A574]/40 shadow-lg shadow-[#D4A574]/5' 
                      : 'bg-[#0f0f0f] border-[#1a1a1a] hover:border-[#222]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-[#D4A574]' : 'text-[#444]'}`}>
                      Patient
                    </span>
                    <span className="text-[9px] font-mono text-[#333]">
                      {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <h4 className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-white' : 'text-[#8B8B8B] group-hover:text-white'}`}>
                    {patient.patientName}
                  </h4>
                  <p className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-[#D4A574]/50' : 'text-[#444]'}`}>
                    {patient.patientRegistrationId || 'OPD-PENDING'}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 ml-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-light tracking-tight mb-2">OPD Queue</h1>
        <p className="text-[#8B8B8B]">Examine patients and send to doctor</p>
        <div className="w-16 h-1 bg-gradient-to-r from-[#D4A574] to-transparent rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Queue List */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-6 mb-6">
            <div className="text-sm text-[#8B8B8B]">
              OPD Queue: <span className="text-[#D4A574] font-semibold">{queue.length} patients</span>
            </div>
          </div>

          {queue.length === 0 ? (
            <Card className="bg-[#0f0f0f] border border-[#1a1a1a] p-12 text-center">
              <Eye className="w-12 h-12 text-[#5a5a5a] mx-auto mb-4" />
              <p className="text-[#8B8B8B]">No patients in OPD queue</p>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-4">
              {queue.map((patient, idx) => {
                // Extract fields from queue item structure
                const rd = (patient as any).receptionData || {};
                const rdPatientDetails = rd.patientDetails || {};
                const regId = (patient as any).registrationId || patient.patientRegistrationId || rd.patientRegistrationId || rdPatientDetails.registrationId || '';
                const displayName = patient.patientName || rdPatientDetails.name || (patient as any).patientName || 'Unknown Patient';
                const doctorName = rd.doctorName || (patient as any).doctorName || '';
                const notes = rd.notes || (patient as any).receptionNotes || '';

                return (
                <button
                  key={(patient as any).id || patient._id || idx}
                  onClick={() => handleSelectPatient(patient)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    (selectedPatient && ((selectedPatient as any).id === (patient as any).id || selectedPatient._id === patient._id))
                      ? 'bg-[#D4A574]/10 border-[#D4A574]'
                      : 'bg-[#0f0f0f] border-[#1a1a1a] hover:border-[#D4A574]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{displayName}</span>
                    <span className="text-xs bg-[#D4A574] text-[#0a0a0a] px-2 py-1 rounded font-semibold">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="text-xs text-[#8B8B8B] space-y-1">
                    <p>ID: <span className="text-[#D4A574] font-mono">{regId || 'ID PENDING'}</span></p>
                    {doctorName && <p>Doctor: {doctorName}</p>}
                    {notes && (
                      <p className="text-[#D4A574] italic">Reception: {notes}</p>
                    )}
                  </div>
                </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Examination Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-8 h-fit max-h-[90vh] overflow-y-auto">
            {selectedPatient ? (
              <>
                <h2 className="text-lg font-medium text-white mb-6">OPD Examination</h2>

                <div className="space-y-6">
                  {(() => {
                    const sp = selectedPatient as any;
                    const rd = sp.receptionData || {};
                    const rdPatientDetails = rd.patientDetails || {};
                    const displayName = sp.patientName || rdPatientDetails.name || 'Unknown Patient';
                    const displayReg = sp.patientRegistrationId || sp.registrationId || rd.patientRegistrationId || rdPatientDetails.registrationId || 'OPD-PENDING';
                    const assignedDoctor = sp.doctorName || rd.doctorName || '';
                    return (
                      <>
                        <div>
                          <p className="text-xs text-[#8B8B8B] uppercase mb-2">Patient</p>
                          <p className="text-white font-semibold">{displayName}</p>
                          <p className="text-xs text-[#D4A574] font-mono mt-1">{displayReg}</p>
                        </div>

                        <div>
                          <p className="text-xs text-[#8B8B8B] uppercase mb-2">Doctor Assigned</p>
                          <p className="text-white text-sm">{assignedDoctor}</p>
                        </div>
                      </>
                    );
                  })()}

                  {selectedPatient.receptionNotes && (
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                      <p className="text-xs text-[#8B8B8B] uppercase mb-2">Reception Notes</p>
                      <p className="text-white text-sm">{selectedPatient.receptionNotes}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-[#8B8B8B] uppercase mb-2">OPD Findings</label>
                    <textarea
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                      placeholder="Enter examination findings, tests, prescriptions, etc..."
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 text-white text-sm placeholder-[#5a5a5a] focus:border-[#D4A574] outline-none transition-colors"
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={sendToDashboard}
                    className="w-full bg-[#D4A574] hover:bg-[#E8B88B] text-[#0a0a0a] font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Open in Dashboard
                  </Button>

                  {/* Recall Button */}
                  <Button
                    onClick={recallToReception}
                    variant="outline"
                    className="w-full mt-3 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Recall to Reception
                  </Button>
                  <p className="text-xs text-[#8B8B8B] text-center mt-2">
                    Use if reception data needs correction
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-[#5a5a5a] mx-auto mb-4" />
                <p className="text-[#8B8B8B] text-sm">Select a patient to begin examination</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
