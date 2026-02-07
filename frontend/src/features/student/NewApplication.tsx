import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { Check, ChevronRight, FileText, ArrowLeft, AlertCircle, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { University, Program, User } from '../../types';
import { applicationService } from '../../services/applicationService';
import { universityService } from '../../services/universityService';
import { academicRecordService } from '../../services/academicRecordService';

const steps = ['University', 'Program', 'Details', 'Documents', 'Review'];

export const NewApplication = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext<{ user: User }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUni, setSelectedUni] = useState<any | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    firstName: user.name.split(' ')[0] || '',
    lastName: user.name.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    sop: ''
  });

  // Track status of required records
  const [recordStatus, setRecordStatus] = useState<Record<string, boolean>>({
    'MARKSHEET_10': false,
    'MARKSHEET_12': false
  });
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);

  // Fetch universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const unis = await universityService.getAllUniversities();
        setUniversities(unis);
      } catch (error) {
        console.error('Failed to fetch universities:', error);
      }
    };
    fetchUniversities();
  }, []);

  // Fetch academic records when reaching step 3 (Documents)
  useEffect(() => {
    if (currentStep === 3) {
      const fetchRecords = async () => {
        setLoadingRecords(true);
        try {
          const records = await academicRecordService.getMyRecords();
          const status = {
            'MARKSHEET_10': records.some((r: any) => r.type === '10TH_MARKSHEET'),
            'MARKSHEET_12': records.some((r: any) => r.type === '12TH_MARKSHEET')
          };
          setRecordStatus(status);
        } catch (error) {
          console.error('Failed to fetch records:', error);
        } finally {
          setLoadingRecords(false);
        }
      };
      fetchRecords();
    }
  }, [currentStep]);

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Submit
      await handleSubmit();
    } else {
      setCurrentStep(curr => curr + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Create application
      const applicationData = {
        universityName: selectedUni!.name,
        programName: selectedProgram!.name,
        personalDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          statementOfPurpose: formData.sop
        }
      };

      const application = await applicationService.createApplication(applicationData);
      setCreatedAppId(application.id);

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      alert('Failed to submit application: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const allDocumentsAvailable = Object.values(recordStatus).every(status => status);



  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search universities by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUniversities.map(uni => (
                <div
                  key={uni.id}
                  onClick={() => setSelectedUni(uni)}
                  className={`p-6 border rounded-xl cursor-pointer transition-all hover:shadow-md ${selectedUni?.id === uni.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-200 dark:hover:border-brand-800'}`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${uni.logoColor} dark:bg-opacity-20`}>
                    <span className="font-bold text-xl">{uni.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{uni.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{uni.location}</p>
                  <div className="mt-4 text-xs font-medium bg-slate-100 dark:bg-slate-800 inline-block px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                    Rank #{uni.ranking}
                  </div>
                </div>
              ))}

              {filteredUniversities.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                  <p>No universities found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Programs at {selectedUni?.name}</h3>
            {selectedUni?.programs?.map((prog: any) => (
              <div
                key={prog.id}
                onClick={() => setSelectedProgram(prog)}
                className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedProgram?.id === prog.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-800'}`}
              >
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">{prog.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{prog.degree} • {prog.duration}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">₹{prog.fee.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">per year</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 2:
        return (
          <form className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statement of Purpose</label>
              <textarea rows={4} value={formData.sop} onChange={(e) => setFormData({ ...formData, sop: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="Why do you want to join this program?"></textarea>
            </div>
          </form>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full h-fit">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">Checking Your Documents</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">We are verifying if you have uploaded the required documents in your profile.</p>
              </div>
            </div>

            {!allDocumentsAvailable && !loadingRecords && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full h-fit">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Missing Documents</h4>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    You have missing documents. Please upload them in 'My Documents' to proceed.
                  </p>
                  <Link to="/student/documents" className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 mt-2 inline-block">
                    Go to My Documents &rarr;
                  </Link>
                </div>
              </div>
            )}

            {[
              { type: 'MARKSHEET_10', label: '10th Marksheet' },
              { type: 'MARKSHEET_12', label: '12th Marksheet' }
            ].map(({ type, label }) => (
              <div key={type} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${recordStatus[type] ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                    {recordStatus[type] ? <Check className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{label}</p>
                    <p className={`text-xs ${recordStatus[type] ? 'text-green-600' : 'text-slate-500'}`}>
                      {recordStatus[type] ? 'Available' : 'Missing - Upload in Profile'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Application Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">University</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{selectedUni?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Program</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{selectedProgram?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Applicant</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Application Fee</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">₹{selectedProgram?.fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Documents</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {Object.values(recordStatus).filter(Boolean).length} / 2
                </span>
              </div>
            </div>
            <div className="mt-6 flex items-start gap-3">
              <input type="checkbox" className="mt-1 accent-brand-600" defaultChecked />
              <p className="text-xs text-slate-600 dark:text-slate-400">I declare that all information provided is true and I accept the terms and conditions of UniApply.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <Link to="/student/dashboard" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">New Application</h1>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10"></div>
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-950 px-2 transition-colors duration-300">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${idx <= currentStep ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-xs font-medium ${idx <= currentStep ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 min-h-[400px] transition-colors">
        <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-slate-100">{steps[currentStep]}</h2>
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(c => c - 1)}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            (currentStep === 0 && !selectedUni) ||
            (currentStep === 1 && !selectedProgram) ||
            (currentStep === 3 && !allDocumentsAvailable) ||
            isSubmitting
          }
        >
          {isSubmitting ? 'Submitting...' : (currentStep === steps.length - 1 ? 'Submit Application' : 'Continue')}
          {!isSubmitting && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
};