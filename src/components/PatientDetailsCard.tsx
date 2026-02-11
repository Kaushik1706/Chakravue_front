import { useRef, useState, useEffect } from 'react';
import { EditableText, EditableTextHandle } from './EditableText';
import { ExpandableCard } from './ExpandableCard';
import { User, IdCard, Calendar, Users, Phone, MapPin, Mail, AlertCircle, Camera, Image as ImageIcon, Shield, Building2, FileCheck } from 'lucide-react';
import { CardHeader } from './CardHeader';
import { PatientDetail, InsuranceType, PatientInsurance } from './patient';

// Insurance plans data - same structure as IndividualBillingView
interface InsurancePlan {
  company: string;
  tpas: string[];
  coveragePercent: number;
}

const INSURANCE_PLANS: Record<Exclude<InsuranceType, null>, InsurancePlan[]> = {
  CGHS: [
    { company: 'CGHS Central', tpas: ['Gov TPA 1', 'Gov TPA 2'], coveragePercent: 90 },
    { company: 'CGHS Delhi', tpas: ['CGHS TPA Delhi', 'Gov TPA 2'], coveragePercent: 90 },
    { company: 'CGHS Mumbai', tpas: ['CGHS TPA Mumbai', 'Gov TPA 1'], coveragePercent: 85 }
  ],
  SGHS: [
    { company: 'State Health Scheme', tpas: ['State TPA A', 'State TPA B'], coveragePercent: 85 },
    { company: 'Arogyasri', tpas: ['Arogyasri TPA', 'State TPA A'], coveragePercent: 80 },
    { company: 'Chief Minister Insurance', tpas: ['CM TPA', 'State TPA B'], coveragePercent: 75 }
  ],
  PRIVATE: [
    { company: 'Star Health', tpas: ['MediAssist', 'FHPL', 'Paramount'], coveragePercent: 80 },
    { company: 'ICICI Lombard', tpas: ['Vidal', 'HealthIndia', 'MediAssist'], coveragePercent: 75 },
    { company: 'HDFC Ergo', tpas: ['FHPL', 'MediAssist', 'Raksha'], coveragePercent: 80 },
    { company: 'New India Assurance', tpas: ['Park Mediclaim', 'MDIndia', 'FHPL'], coveragePercent: 70 },
    { company: 'Max Bupa', tpas: ['MediAssist', 'FHPL'], coveragePercent: 85 }
  ]
};

interface PatientDetailsCardProps {
  data: PatientDetail;
  updateData: (path: (string | number)[], value: any) => void;
  isEditable: boolean;
  displaySource?: 'recent' | string;
  onBillingClick?: () => void;
}

export function PatientDetailsCard({ data: patientData, updateData, isEditable, displaySource, onBillingClick }: PatientDetailsCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Refs for editable fields
  const fieldRefs = useRef<{[key: string]: EditableTextHandle | null}>({});

  // Insurance state - initialize from patientData if available
  const [hasInsurance, setHasInsurance] = useState<boolean>(patientData.insurance?.hasInsurance || false);
  const [insuranceType, setInsuranceType] = useState<InsuranceType>(patientData.insurance?.insuranceType || null);
  const [companyName, setCompanyName] = useState<string>(patientData.insurance?.companyName || '');
  const [tpaName, setTpaName] = useState<string>(patientData.insurance?.tpaName || '');

  // Update local state when patientData changes
  useEffect(() => {
    if (patientData.insurance) {
      setHasInsurance(patientData.insurance.hasInsurance);
      setInsuranceType(patientData.insurance.insuranceType);
      setCompanyName(patientData.insurance.companyName);
      setTpaName(patientData.insurance.tpaName);
    }
  }, [patientData.insurance]);

  // Update parent data when insurance details change
  const updateInsurance = (updates: Partial<PatientInsurance>) => {
    const currentInsurance: PatientInsurance = patientData.insurance || {
      hasInsurance: false,
      insuranceType: null,
      companyName: '',
      tpaName: ''
    };
    
    const newInsurance = { ...currentInsurance, ...updates };
    updateData(['patientDetails', 'insurance'], newInsurance);
  };

  const handleInsuranceToggle = (enabled: boolean) => {
    setHasInsurance(enabled);
    if (!enabled) {
      setInsuranceType(null);
      setCompanyName('');
      setTpaName('');
      updateInsurance({
        hasInsurance: false,
        insuranceType: null,
        companyName: '',
        tpaName: ''
      });
    } else {
      updateInsurance({ hasInsurance: true });
    }
  };

  const handleInsuranceTypeChange = (type: InsuranceType) => {
    setInsuranceType(type);
    setCompanyName('');
    setTpaName('');
    updateInsurance({
      insuranceType: type,
      companyName: '',
      tpaName: ''
    });
  };

  const handleCompanyChange = (company: string) => {
    setCompanyName(company);
    setTpaName('');
    updateInsurance({
      companyName: company,
      tpaName: ''
    });
  };

  const handleTpaChange = (tpa: string) => {
    setTpaName(tpa);
    updateInsurance({ tpaName: tpa });
  };

  const updatePatientField = (field: keyof PatientDetail, value: string) => {
    updateData(['patientDetails', field], value);
  };

  const basicDetails = [
    { icon: User, label: 'Patient Name', value: patientData.name, key: 'name' as keyof PatientDetail },
    { icon: IdCard, label: 'Registration ID', value: patientData.registrationId, key: 'registrationId' as keyof PatientDetail },
    { icon: Calendar, label: 'Age', value: patientData.age, key: 'age' as keyof PatientDetail },
    { icon: Users, label: 'Sex', value: patientData.sex, key: 'sex' as keyof PatientDetail }
  ];

  // Get available TPAs based on selected company
  const getAvailableTPAs = (): string[] => {
    if (!insuranceType || !companyName) return [];
    const plan = INSURANCE_PLANS[insuranceType]?.find(p => p.company === companyName);
    return plan?.tpas || [];
  };

  const cardContent = (
    <>
      <CardHeader icon={User} title="Patient Details" subtitle="EMR System Integration" />

      <div className="space-y-2 flex-1">
        {basicDetails.slice(0, 2).map((detail) => (
          <div 
            key={detail.key as string} 
            className="bg-[#1a1a1a] rounded-lg p-2 border border-[#2a2a2a] cursor-pointer hover:border-[#D4A574] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              fieldRefs.current[`card-${detail.key}`]?.startEditing();
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[#8B8B8B] text-xl">{detail.label}</span>
              <div className="ml-4 flex-shrink-0 w-44">
                <EditableText
                  ref={(el) => fieldRefs.current[`card-${detail.key}`] = el}
                  value={detail.value}
                  onSave={(value) => updatePatientField(detail.key, value)}
                  className="text-white text-xl text-right"
                  isEditable={isEditable}
                  placeholder={`Enter ${detail.label.toLowerCase()}`}
                  disableEval={true}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const expandedContent = (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h4 className="text-[#D4A574] mb-4 text-xl">Basic Information</h4>
        <div className="space-y-3">
          {basicDetails.map((detail) => (
            <div 
              key={detail.key as string} 
              className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] cursor-pointer hover:border-[#D4A574] transition-colors"
              onClick={() => fieldRefs.current[`expanded-${detail.key}`]?.startEditing()}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center">
                  <detail.icon className="w-4 h-4 text-[#D4A574]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#8B8B8B] text-xl mb-1">{detail.label}</p>
                  <EditableText
                    ref={(el) => fieldRefs.current[`expanded-${detail.key}`] = el}
                    value={detail.value}
                    onSave={(value) => updatePatientField(detail.key, value)}
                    className="text-white text-xl"
                    isEditable={isEditable}
                    disableEval={true}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Picture Buttons (kept minimal) */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] mt-4">
          <p className="text-[#8B8B8B] text-xl mb-2">Profile Picture</p>
          <div className="flex gap-2">
            <button
              disabled={!isEditable}
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#D4A574] text-[#0a0a0a] rounded-lg hover:bg-[#C9955E] transition-colors text-xl font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5" /> Take Pic
            </button>
            <button
              disabled={!isEditable}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors text-xl font-semibold"
            >
              <ImageIcon className="w-5 h-5" /> Select Files
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            capture="user"
            ref={cameraInputRef}
            style={{ display: 'none' }}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          {patientData.profilePic && (
            <div className="mt-4 flex justify-center">
              <img src={patientData.profilePic} alt="Profile Preview" className="w-24 h-24 object-cover rounded-full border border-[#2a2a2a]" />
            </div>
          )}
        </div>

        {/* Set Password Field - important for receptionist to create patient credentials */}
        <div 
          className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] mt-4 cursor-pointer hover:border-[#D4A574] transition-colors"
          onClick={() => fieldRefs.current['password']?.startEditing()}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center">
              <User className="w-4 h-4 text-[#D4A574]" />
            </div>
            <div className="flex-1">
              <p className="text-[#8B8B8B] text-xl mb-1">Set Password</p>
              <EditableText
                ref={(el) => fieldRefs.current['password'] = el}
                value={patientData.password}
                onSave={(value) => updatePatientField('password', value)}
                className="text-white text-xl"
                isEditable={isEditable}
                type="password"
                placeholder="Enter a password for patient login"
                disableEval={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-[#D4A574] mb-4 text-xl">Contact Information</h4>
        <div className="space-y-3">
          <div 
            className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] cursor-pointer hover:border-[#D4A574] transition-colors"
            onClick={() => fieldRefs.current['phone']?.startEditing()}
          >
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#D4A574] mt-1" />
              <div className="flex-1">
                <p className="text-[#8B8B8B] text-xl mb-1">Phone</p>
                <EditableText
                  ref={(el) => fieldRefs.current['phone'] = el}
                  value={patientData.phone} 
                  onSave={(v) => updatePatientField('phone', v)} 
                  className="text-white text-xl"
                  isEditable={isEditable}
                  disableEval={true}
                />
              </div>
            </div>
          </div>
          <div 
            className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] cursor-pointer hover:border-[#D4A574] transition-colors"
            onClick={() => fieldRefs.current['email']?.startEditing()}
          >
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#D4A574] mt-1" />
              <div className="flex-1">
                <p className="text-[#8B8B8B] text-xl mb-1">Email</p>
                <EditableText 
                  ref={(el) => fieldRefs.current['email'] = el}
                  value={patientData.email} 
                  onSave={(v) => updatePatientField('email', v)} 
                  className="text-white text-xl"
                  isEditable={isEditable}
                  disableEval={true}
                />
              </div>
            </div>
          </div>
          <div 
            className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] cursor-pointer hover:border-[#D4A574] transition-colors"
            onClick={() => fieldRefs.current['address']?.startEditing()}
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#D4A574] mt-1" />
              <div className="flex-1">
                <p className="text-[#8B8B8B] text-xl mb-1">Address</p>
                <EditableText 
                  ref={(el) => fieldRefs.current['address'] = el}
                  value={patientData.address} 
                  onSave={(v) => updatePatientField('address', v)} 
                  className="text-white text-xl"
                  isEditable={isEditable}
                  disableEval={true}
                />
              </div>
            </div>
          </div>
        </div>

        <h4 className="text-[#D4A574] mb-4 mt-6 text-xl">Medical Information</h4>
        <div className="space-y-3">
          <div 
            className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] cursor-pointer hover:border-[#D4A574] transition-colors"
            onClick={() => fieldRefs.current['bloodType']?.startEditing()}
          >
            <p className="text-[#8B8B8B] text-xl mb-1">Blood Type</p>
            <EditableText 
              ref={(el) => fieldRefs.current['bloodType'] = el}
              value={patientData.bloodType} 
              onSave={(v) => updatePatientField('bloodType', v)} 
              className="text-white text-xl"
              isEditable={isEditable}
              disableEval={true}
            />
          </div>
          <div 
            className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] cursor-pointer hover:border-[#D4A574] transition-colors"
            onClick={() => fieldRefs.current['allergies']?.startEditing()}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#FFA726] mt-0.5" />
              <div className="flex-1">
                <p className="text-[#8B8B8B] text-xl mb-1">Allergies</p>
                <EditableText 
                  ref={(el) => fieldRefs.current['allergies'] = el}
                  value={patientData.allergies} 
                  onSave={(v) => updatePatientField('allergies', v)} 
                  className="text-white text-xl"
                  isEditable={isEditable}
                  disableEval={true}
                />
              </div>
            </div>
          </div>
          <div 
            className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] cursor-pointer hover:border-[#D4A574] transition-colors"
            onClick={() => fieldRefs.current['emergencyContact']?.startEditing()}
          >
            <p className="text-[#8B8B8B] text-xl mb-1">Emergency Contact</p>
            <EditableText 
              ref={(el) => fieldRefs.current['emergencyContact'] = el}
              value={patientData.emergencyContact} 
              onSave={(v) => updatePatientField('emergencyContact', v)} 
              className="text-white text-xl"
              isEditable={isEditable}
              disableEval={true}
            />
          </div>
        </div>

        {/* Insurance Details Section */}
        <h4 className="text-[#D4A574] mb-4 mt-6 flex items-center gap-2 text-xl">
          <Shield className="w-4 h-4" />
          Insurance Details
        </h4>
        <div className="space-y-3">
          {/* Has Insurance Toggle */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasInsurance ? 'bg-green-500/20 text-green-500' : 'bg-[#0a0a0a] text-[#5a5a5a]'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-medium text-white">Has Insurance?</p>
                  <p className="text-sm text-[#5a5a5a]">Does patient have health insurance coverage?</p>
                </div>
              </div>
              <button 
                onClick={() => isEditable && handleInsuranceToggle(!hasInsurance)}
                disabled={!isEditable}
                className={`w-12 h-6 rounded-full transition-colors relative ${hasInsurance ? 'bg-green-600' : 'bg-[#2a2a2a]'} ${!isEditable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hasInsurance ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Insurance Details - Only show if hasInsurance is true */}
          {hasInsurance && (
            <>
              {/* Insurance Type Dropdown */}
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#D4A574]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#8B8B8B] text-xl mb-2">Insurance Type</p>
                    <select
                      value={insuranceType || ''}
                      onChange={(e) => handleInsuranceTypeChange(e.target.value as InsuranceType || null)}
                      disabled={!isEditable}
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-2 text-xl text-white focus:outline-none focus:border-[#D4A574] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Insurance Type</option>
                      <option value="CGHS">CGHS (Central Govt Health Scheme)</option>
                      <option value="SGHS">SGHS (State Govt Health Scheme)</option>
                      <option value="PRIVATE">Private Insurance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Company Name Dropdown - Only show if insurance type selected */}
              {insuranceType && (
                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-[#D4A574]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#8B8B8B] text-xl mb-2">Insurance Company</p>
                      <select
                        value={companyName}
                        onChange={(e) => handleCompanyChange(e.target.value)}
                        disabled={!isEditable}
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-2 text-xl text-white focus:outline-none focus:border-[#D4A574] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Company</option>
                        {INSURANCE_PLANS[insuranceType]?.map(plan => (
                          <option key={plan.company} value={plan.company}>
                            {plan.company} ({plan.coveragePercent}% coverage)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TPA Dropdown - Only show if company selected */}
              {companyName && (
                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center">
                      <FileCheck className="w-4 h-4 text-[#D4A574]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#8B8B8B] text-xs mb-2">TPA (Third Party Administrator)</p>
                      <select
                        value={tpaName}
                        onChange={(e) => handleTpaChange(e.target.value)}
                        disabled={!isEditable}
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#D4A574] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select TPA</option>
                        {getAvailableTPAs().map(tpa => (
                          <option key={tpa} value={tpa}>{tpa}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Insurance Summary Badge */}
              {insuranceType && companyName && tpaName && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 text-sm font-semibold">Insurance Verified</span>
                  </div>
                  <div className="text-xs text-[#8B8B8B] space-y-1">
                    <p><span className="text-white">Type:</span> {insuranceType}</p>
                    <p><span className="text-white">Company:</span> {companyName}</p>
                    <p><span className="text-white">TPA:</span> {tpaName}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ExpandableCard title="Patient Details" expandedContent={expandedContent}>
      {cardContent}
    </ExpandableCard>
  );
}
