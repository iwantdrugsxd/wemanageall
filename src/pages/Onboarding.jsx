import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Q2 - Values options
const VALUES = [
  { id: 'growth', name: 'Growth' },
  { id: 'freedom', name: 'Freedom' },
  { id: 'stability', name: 'Stability' },
  { id: 'impact', name: 'Impact' },
  { id: 'mastery', name: 'Mastery' },
  { id: 'relationships', name: 'Relationships' },
  { id: 'peace', name: 'Peace' },
  { id: 'wealth', name: 'Wealth' },
];

// Q3 - Roles options
const ROLES = [
  { id: 'student', name: 'Student' },
  { id: 'founder', name: 'Founder / Builder' },
  { id: 'employee', name: 'Employee' },
  { id: 'athlete', name: 'Athlete' },
  { id: 'creator', name: 'Creator' },
  { id: 'caregiver', name: 'Caregiver' },
  { id: 'explorer', name: 'Explorer' },
  { id: 'other', name: 'Other' },
];

// Q4 - Life Phase options
const LIFE_PHASES = [
  { id: 'building', name: 'Building something' },
  { id: 'figuring', name: 'Figuring things out' },
  { id: 'stuck', name: 'Feeling stuck' },
  { id: 'leveling', name: 'Leveling up' },
  { id: 'recovering', name: 'Recovering from burnout' },
  { id: 'fresh', name: 'Starting fresh' },
];

// Q5 - Challenges options
const CHALLENGES = [
  { id: 'consistency', name: 'Consistency' },
  { id: 'time', name: 'Time management' },
  { id: 'overthinking', name: 'Overthinking' },
  { id: 'stress', name: 'Stress / anxiety' },
  { id: 'money', name: 'Money management' },
  { id: 'direction', name: 'Direction / clarity' },
  { id: 'relationships', name: 'Relationships' },
  { id: 'energy', name: 'Energy / health' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateOnboarding, checkAuth } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState({
    vision: '',
    values: [],
    roles: [],
    lifePhase: '',
    challenges: [],
  });

  // Track if we've initialized the step to prevent resetting during progression
  const [stepInitialized, setStepInitialized] = useState(false);

  // Load existing onboarding data when component mounts or user changes
  useEffect(() => {
    if (user) {
      // Restore saved data from user profile
      setData({
        vision: user.identity?.vision || '',
        values: user.identity?.values || [],
        roles: user.identity?.roles || [],
        lifePhase: user.lifePhase || '',
        challenges: user.focusAreas || [],
      });
      
      // Only restore current step on initial load, not on every user update
      // This prevents resetting the step when we're progressing through onboarding
      // Also, don't go backwards if we're already ahead
      if (!stepInitialized && user.onboardingStep && user.onboardingStep > 0 && user.onboardingStep <= 5) {
        // Only restore if we're not already ahead of the saved step
        if (currentStep <= user.onboardingStep) {
          console.log(`📍 Restoring onboarding step from database: ${user.onboardingStep}`);
          setCurrentStep(user.onboardingStep);
        } else {
          console.log(`📍 Local step (${currentStep}) is ahead of database step (${user.onboardingStep}), keeping local step`);
        }
        setStepInitialized(true);
      }
      
      // If onboarding is already completed, redirect to dashboard
      // This handles the case where user state updates after step 5 completion
      if (user.onboardingCompleted) {
        console.log('✅ User onboarding completed detected, redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate, stepInitialized]);

  const handleNext = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    try {
      // Always save ALL collected data at each step to ensure nothing is lost
      // This ensures all answers are stored in the database
      const onboardingData = {
        identity: {
          // Always include vision if it exists (step 1)
          vision: data.vision || undefined,
          // Always include values if they exist (step 2)
          values: data.values.length > 0 ? data.values : undefined,
          // Always include roles if they exist (step 3)
          roles: data.roles.length > 0 ? data.roles : undefined,
        },
        // Always include lifePhase if it exists (step 4)
        lifePhase: data.lifePhase || undefined,
        // Always include challenges if they exist (step 5)
        challenges: data.challenges.length > 0 ? data.challenges : undefined,
      };

      // Save all data at current step
      const result = await updateOnboarding(currentStep, onboardingData);
      
      // Check if session expired
      if (result?.unauthorized) {
        alert('Your session has expired. Please log in again.');
        navigate('/login', { replace: true });
        return;
      }
      
      // Check for errors
      if (result?.error) {
        throw new Error(result.error);
      }
      
      console.log(`✅ Saved onboarding step ${currentStep}:`, {
        step: currentStep,
        vision: data.vision,
        values: data.values,
        roles: data.roles,
        lifePhase: data.lifePhase,
        challenges: data.challenges,
        completed: result.profile?.onboardingCompleted
      });
      
      if (currentStep < 5) {
        // Move to next step - ensure smooth progression
        console.log(`✅ Step ${currentStep} saved. Moving to step ${currentStep + 1}...`);
        setCurrentStep(currentStep + 1);
        // Loading will be set to false in the finally block
      } else {
        // Complete onboarding - step 5 is the final step
        // Verify onboarding is actually completed
        if (result.profile?.onboardingCompleted) {
          console.log('✅ Onboarding completed! Navigating to dashboard...', {
            onboardingCompleted: result.profile.onboardingCompleted,
            step: currentStep,
            profileId: result.profile.id
          });
          
          // The user state is already updated by updateOnboarding() which calls setUser(result.profile)
          // Use requestAnimationFrame to ensure React has processed the state update before navigation
          // This prevents the ProtectedRoute from seeing stale user state
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              navigate('/dashboard', { replace: true });
            });
          });
        } else {
          console.error('❌ Onboarding step 5 completed but onboardingCompleted is false!', result.profile);
          // Still navigate - let ProtectedRoute handle verification
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      alert(`Failed to save your answers: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1: return data.vision.trim().length > 0;
      case 2: return data.values.length >= 3 && data.values.length <= 5;
      case 3: return data.roles.length > 0;
      case 4: return data.lifePhase.length > 0;
      case 5: return data.challenges.length >= 1 && data.challenges.length <= 3;
      default: return true;
    }
  };

  const toggleSelection = (field, id, max = Infinity) => {
    setData(prev => {
      const current = prev[field];
      if (current.includes(id)) {
        return { ...prev, [field]: current.filter(i => i !== id) };
      } else if (current.length < max) {
        return { ...prev, [field]: [...current, id] };
      }
      return prev;
    });
  };

  const firstName = user?.name?.split(' ')[0] || 'friend';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-300/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <span className="font-display text-ofa-cream text-sm font-semibold">O</span>
            </div>
            <span className="font-display text-lg font-semibold text-black">OFA</span>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(step => (
              <div 
                key={step}
                className={`h-2 rounded-full transition-all duration-500 ${
                  step === currentStep ? 'w-8 bg-black' : 
                  step < currentStep ? 'w-2 bg-black' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
          
          <div className="w-20" />
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 pt-24 pb-32 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Vision (Q1) */}
          {currentStep === 1 && (
            <div className="animate-fade-in-up">
              <div className="mb-10">
                <span className="text-sm font-mono text-black tracking-widest uppercase mb-3 block">Identity Stage</span>
                <h1 className="font-display text-3xl md:text-4xl text-black mb-4">
                  In one sentence, who do you want to become in the next 3 years?
                </h1>
                <p className="text-lg text-gray-600">
                  Not what you want to have — who you want to become.
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <textarea 
                    value={data.vision}
                    onChange={(e) => setData({ ...data, vision: e.target.value })}
                    rows={4}
                    placeholder="e.g., A disciplined builder."
                    className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl text-black placeholder:text-gray-500 resize-none focus:outline-none focus:border-ofa-ink focus:ring-4 focus:ring-ofa-ink/5"
                  />
                </div>
                
                <div className="bg-gray-100/50 rounded-2xl p-6 border border-gray-300/50">
                  <p className="text-sm font-medium text-black mb-3">Examples:</p>
                  <div className="space-y-2">
                    {['A disciplined builder.', 'A calm, confident leader.', 'Someone in control of their life.'].map((example, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => setData({ ...data, vision: example })}
                        className="text-left w-full px-4 py-3 bg-white rounded-xl text-sm text-gray-600 hover:bg-black hover:text-ofa-cream transition-all"
                      >
                        "{example}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Values (Q2) */}
          {currentStep === 2 && (
            <div className="animate-fade-in-up">
              <div className="mb-10">
                <span className="text-sm font-mono text-black tracking-widest uppercase mb-3 block">Identity Stage</span>
                <h1 className="font-display text-3xl md:text-4xl text-black mb-4">
                  Which values matter most to you right now?
                </h1>
                <p className="text-lg text-gray-600">Choose up to 3–5.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {VALUES.map(value => (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => toggleSelection('values', value.id, 5)}
                    className={`relative p-5 bg-white border rounded-2xl text-center transition-all ${
                      data.values.includes(value.id) 
                        ? 'border-ofa-ink bg-black/5' 
                        : 'border-gray-300 hover:border-ofa-cloud'
                    }`}
                  >
                    {data.values.includes(value.id) && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <h3 className="font-medium text-black">{value.name}</h3>
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-gray-500 mt-4 text-center">
                {data.values.length}/5 values selected (minimum 3)
              </p>
            </div>
          )}

          {/* Step 3: Roles (Q3) */}
          {currentStep === 3 && (
            <div className="animate-fade-in-up">
              <div className="mb-10">
                <span className="text-sm font-mono text-black tracking-widest uppercase mb-3 block">Life Context Stage</span>
                <h1 className="font-display text-3xl md:text-4xl text-black mb-4">
                  Which roles best describe your life right now?
                </h1>
                <p className="text-lg text-gray-600">Multi-select.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ROLES.map(role => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleSelection('roles', role.id)}
                    className={`relative p-5 bg-white border rounded-2xl text-center transition-all ${
                      data.roles.includes(role.id) 
                        ? 'border-ofa-ink bg-black/5' 
                        : 'border-gray-300 hover:border-ofa-cloud'
                    }`}
                  >
                    {data.roles.includes(role.id) && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <h3 className="font-medium text-black">{role.name}</h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Life Phase (Q4) */}
          {currentStep === 4 && (
            <div className="animate-fade-in-up">
              <div className="mb-10">
                <span className="text-sm font-mono text-black tracking-widest uppercase mb-3 block">Life Context Stage</span>
                <h1 className="font-display text-3xl md:text-4xl text-black mb-4">
                  How would you describe your life phase right now?
                </h1>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LIFE_PHASES.map(phase => (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => setData({ ...data, lifePhase: phase.id })}
                    className={`relative p-5 bg-white border rounded-2xl text-left transition-all ${
                      data.lifePhase === phase.id 
                        ? 'border-ofa-ink bg-black/5' 
                        : 'border-gray-300 hover:border-ofa-cloud'
                    }`}
                  >
                    {data.lifePhase === phase.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <h3 className="font-medium text-black">{phase.name}</h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Challenges (Q5) */}
          {currentStep === 5 && (
            <div className="animate-fade-in-up">
              <div className="mb-10">
                <span className="text-sm font-mono text-black tracking-widest uppercase mb-3 block">Focus & Struggles Stage</span>
                <h1 className="font-display text-3xl md:text-4xl text-black mb-4">
                  What do you struggle with most?
                </h1>
                <p className="text-lg text-gray-600">Choose up to 3.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHALLENGES.map(challenge => (
                  <button
                    key={challenge.id}
                    type="button"
                    onClick={() => toggleSelection('challenges', challenge.id, 3)}
                    className={`relative p-5 bg-white border rounded-2xl text-left transition-all ${
                      data.challenges.includes(challenge.id) 
                        ? 'border-ofa-ink bg-black/5' 
                        : 'border-gray-300 hover:border-ofa-cloud'
                    }`}
                  >
                    {data.challenges.includes(challenge.id) && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <h3 className="font-medium text-black">{challenge.name}</h3>
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-gray-500 mt-4 text-center">
                {data.challenges.length}/3 challenges selected (minimum 1)
              </p>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-300/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className={`px-6 py-3 text-gray-600 hover:text-black transition-colors flex items-center gap-2 ${currentStep === 1 ? 'invisible' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <button 
            onClick={handleNext}
            disabled={loading || !validateStep()}
            className="btn-primary px-8 py-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : currentStep === 5 ? (
              <>
                Complete
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            ) : (
              <>
                Continue
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

                    className={`relative p-5 bg-white border rounded-2xl text-left transition-all ${
                      data.challenges.includes(challenge.id) 
                        ? 'border-ofa-ink bg-black/5' 
                        : 'border-gray-300 hover:border-ofa-cloud'
                    }`}
                  >
                    {data.challenges.includes(challenge.id) && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <h3 className="font-medium text-black">{challenge.name}</h3>
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-gray-500 mt-4 text-center">
                {data.challenges.length}/3 challenges selected (minimum 1)
              </p>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-300/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className={`px-6 py-3 text-gray-600 hover:text-black transition-colors flex items-center gap-2 ${currentStep === 1 ? 'invisible' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <button 
            onClick={handleNext}
            disabled={loading || !validateStep()}
            className="btn-primary px-8 py-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : currentStep === 5 ? (
              <>
                Complete
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            ) : (
              <>
                Continue
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
