import { useRef } from 'react';
import { EditableText, EditableTextHandle } from './EditableText';
import { ExpandableCard } from './ExpandableCard';
import { FileText, Clock, AlertCircle, Plus, X, Eye, ChevronDown } from 'lucide-react';
import { CardHeader } from './CardHeader';
import { PresentingComplaints, Complaint } from './patient';

interface VitalSignsCardProps {
  data: PresentingComplaints;
  updateData: (path: (string | number)[], value: any) => void;
  isEditable: boolean;
  // Navigation props (Deprecated)
  showVisitNav?: boolean;
  visitIndex?: number;
  totalVisits?: number;
  onPrevVisit?: () => void;
  onNextVisit?: () => void;
  isViewingPastVisit?: boolean;
}

const EYE_COMPLAINTS = [
  'Blurred vision',
  'Eye pain',
  'Foreign body sensation',
  'Redness',
  'Itching',
  'Tearing',
  'Dryness',
  'Discharge',
  'Floaters',
  'Flashes of light',
  'Double vision',
  'Photophobia',
  'Decreased vision',
  'Eyelid swelling',
];

const AGGRAVATING_FACTORS = [
  'Bright light',
  'Near work',
  'Computer use',
  'Reading',
  'Evening time',
  'Cold weather',
  'Dust exposure',
  'Allergy',
  'Stress',
  'Fatigue',
  'Hot weather',
  'Air conditioning',
];

const RELIEVING_FACTORS = [
  'Rest',
  'Cool compress',
  'Lubricating drops',
  'Avoiding triggers',
  'Medication',
  'Sleep',
  'Outdoor activity',
  'Reduced screen time',
  'Warm compress',
  'Eye covering',
  'Blinking',
  'Massage',
];

const DURATION_UNITS = ['days', 'hrs', 'weeks'] as const;

export function VitalSignsCard({ 
  data, 
  updateData, 
  isEditable
}: VitalSignsCardProps) {
  const complaints = data?.complaints ?? [];
  const history = data?.history ?? { severity: '', onset: '', aggravating: '', relieving: '', associated: '' };
  
  const historyRef = useRef<EditableTextHandle>(null);

  // Removed global selectedAggravating/selectedRelieving - now stored per complaint

  const updateComplaint = (id: string, field: keyof Complaint, value: any) => {
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      updateData(['presentingComplaints', 'complaints', index, field], value);
    }
  };

  // Toggle a factor for a specific complaint (per-complaint, not global)
  const toggleComplaintFactor = (complaintId: string, factor: string, factorType: 'aggravatingFactors' | 'relievingFactors') => {
    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;
    
    const currentFactors = complaint[factorType] || [];
    const newFactors = currentFactors.includes(factor)
      ? currentFactors.filter(f => f !== factor)
      : [...currentFactors, factor];
    
    updateComplaint(complaintId, factorType, newFactors);
  };

  const addComplaintFromButton = (complaintName: string) => {
    const newComplaint: Complaint = {
      id: Date.now().toString(), 
      complaint: complaintName, 
      duration: '',
      durationUnit: 'days',
      eye: 'both'
    };
    updateData(['presentingComplaints', 'complaints'], [...complaints, newComplaint]);
  };

  const removeComplaint = (id: string) => {
    if (complaints.length > 1) {
      const updatedComplaints = complaints.filter(c => c.id !== id);
      updateData(['presentingComplaints', 'complaints'], updatedComplaints);
    }
  };

  const updateHistory = (field: keyof typeof history, value: string) => {
    updateData(['presentingComplaints', 'history', field], value);
  };

  // Legacy global factor functions removed - factors are now per-complaint
  // Old data in history.aggravating/history.relieving is preserved but new data goes per-complaint

  const cardContent = (
    <>
      <CardHeader icon={FileText} title="Presenting Complaints" />
      <div className="space-y-2 flex-1">
        {complaints.slice(0, 2).map((item) => (
          <div key={item.id} className="bg-[#1a1a1a] rounded-lg p-2 border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <EditableText
                  value={item.complaint}
                  onSave={(value) => updateComplaint(item.id, 'complaint', value)}
                  isEditable={isEditable}
                  className="text-white text-sm text-left justify-start"
                  placeholder="Enter complaint"
                  disableEval={true}
                />
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3 text-[#D4A574]" />
                <span className="text-[#8B8B8B] text-sm whitespace-nowrap">
                  {item.duration}{item.durationUnit ? ` ${item.durationUnit}` : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const expandedContent = (
    <div className="space-y-6">
      {/* Complaints Selection Card */}
      <div>
        <h4 className="text-[#D4A574] font-medium mb-3 text-xl">Select Complaints</h4>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 max-h-56 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {EYE_COMPLAINTS.map((complaint) => (
              <button
                key={complaint}
                onClick={() => addComplaintFromButton(complaint)}
                className="bg-[#0a0a0a] border border-[#D4A574] hover:bg-[#D4A574] hover:text-[#0a0a0a] text-[#D4A574] text-xl p-3 rounded transition-all duration-200 font-medium"
              >
                {complaint}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Complaints with Eye and Duration */}
      {complaints.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[#D4A574] font-medium text-xl">Selected Complaints</h4>
          {complaints.map((item) => (
            <div key={item.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium text-xl">{item.complaint}</p>
                {complaints.length > 1 && (
                  <button
                    onClick={() => removeComplaint(item.id)}
                    className="text-[#8B8B8B] hover:text-[#F44336] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Eye Selection + Duration in one row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Eye Selection */}
                <div>
                  <p className="text-[#8B8B8B] text-xl mb-2 flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Affected Eye
                  </p>
                  {isEditable ? (
                    <div className="flex gap-2">
                      {['LE', 'RE', 'BOTH'].map((eye) => (
                        <button
                          key={eye}
                          onClick={() => updateComplaint(item.id, 'eye', eye.toLowerCase())}
                          className={`flex-1 px-3 py-2 rounded text-xl font-medium transition-all ${
                            (item.eye || 'both') === eye.toLowerCase()
                              ? 'bg-[#D4A574] text-[#0a0a0a]'
                              : 'bg-[#0a0a0a] border border-[#2a2a2a] text-[#D4A574] hover:border-[#D4A574]'
                          }`}
                        >
                          {eye}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white text-xl capitalize">{item.eye ? `${item.eye} Eye` : 'Both'}</p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <p className="text-[#8B8B8B] text-xl mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duration
                  </p>
                  {isEditable ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={item.duration}
                        onChange={(e) => updateComplaint(item.id, 'duration', e.target.value)}
                        placeholder="Value"
                        className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] text-white text-xl p-2 rounded focus:outline-none focus:border-[#D4A574]"
                      />
                      <select
                        value={item.durationUnit || 'days'}
                        onChange={(e) => updateComplaint(item.id, 'durationUnit', e.target.value)}
                        className="bg-[#0a0a0a] border border-[#2a2a2a] text-white text-xl p-2 rounded cursor-pointer appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23D4A574' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 8px center',
                          paddingRight: '28px'
                        }}
                      >
                        {DURATION_UNITS.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-white text-xl">
                      {item.duration ? `${item.duration} ${item.durationUnit || 'days'}` : '-'}
                    </p>
                  )}
                </div>
              </div>

              {/* Per-Complaint Aggravating & Relieving Factors (Task 1) */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#2a2a2a]">
                {/* Aggravating Factors for this complaint */}
                <div>
                  <p className="text-[#8B8B8B] text-xl mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Aggravating
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {AGGRAVATING_FACTORS.map((factor) => {
                      const isSelected = (item.aggravatingFactors || []).includes(factor);
                      return (
                        <button
                          key={factor}
                          onClick={() => isEditable && toggleComplaintFactor(item.id, factor, 'aggravatingFactors')}
                          disabled={!isEditable}
                          className={`px-2 py-1 rounded text-xl font-medium transition-all ${
                            isSelected
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-[#0a0a0a] border border-[#2a2a2a] text-[#666] hover:border-red-500/30 hover:text-red-400'
                          } ${!isEditable ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                        >
                          {factor}
                        </button>
                      );
                    })}
                  </div>
                  {/* Show selected factors summary */}
                  {(item.aggravatingFactors || []).length > 0 && (
                    <p className="text-red-400/70 text-xl mt-2 italic">
                      Selected: {(item.aggravatingFactors || []).join(', ')}
                    </p>
                  )}
                </div>

                {/* Relieving Factors for this complaint */}
                <div>
                  <p className="text-[#8B8B8B] text-xl mb-2 flex items-center gap-1">
                    <ChevronDown className="w-4 h-4 text-green-400" />
                    Relieving
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {RELIEVING_FACTORS.map((factor) => {
                      const isSelected = (item.relievingFactors || []).includes(factor);
                      return (
                        <button
                          key={factor}
                          onClick={() => isEditable && toggleComplaintFactor(item.id, factor, 'relievingFactors')}
                          disabled={!isEditable}
                          className={`px-2 py-1 rounded text-xl font-medium transition-all ${
                            isSelected
                              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                              : 'bg-[#0a0a0a] border border-[#2a2a2a] text-[#666] hover:border-green-500/30 hover:text-green-400'
                          } ${!isEditable ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                        >
                          {factor}
                        </button>
                      );
                    })}
                  </div>
                  {/* Show selected factors summary */}
                  {(item.relievingFactors || []).length > 0 && (
                    <p className="text-green-400/70 text-xl mt-2 italic">
                      Selected: {(item.relievingFactors || []).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History of Complaint */}
      <div>
        <h4 className="text-[#D4A574] font-medium mb-3 text-xl">History of Presenting Complaint</h4>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
          <p 
            className="text-[#8B8B8B] text-xl mb-2 cursor-pointer hover:text-[#D4A574] transition-colors"
            onClick={() => historyRef.current?.startEditing()}
          >
            Additional Notes
          </p>
          <EditableText
            ref={historyRef}
            value={history.severity}
            onSave={(value) => updateHistory('severity', value)}
            isEditable={isEditable}
            className="text-white text-left text-xl"
            disableEval={true}
          />
        </div>
      </div>
    </div>
  );

  return (
    <ExpandableCard 
      title="Presenting Complaints & History" 
      expandedContent={expandedContent}
      fullScreen={true}
    >
      {cardContent}
    </ExpandableCard>
  );
}