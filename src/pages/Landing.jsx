import { useState } from 'react';
import { Link } from 'react-router-dom';

// Navbar Component
function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 lg:px-12 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">O</span>
            </div>
        <span className="text-sm font-bold tracking-wide">OFA</span>
          </Link>
          
      <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-wide">
        <a href="#philosophy" className="hover:text-orange-500 transition-colors">Philosophy</a>
        <a href="#pillars" className="hover:text-orange-500 transition-colors">Pillars</a>
        <a href="#features" className="hover:text-orange-500 transition-colors">Features</a>
        <a href="#faq" className="hover:text-orange-500 transition-colors">Support</a>
      </nav>
      
      <Link 
        to="/signup" 
        className="bg-orange-500 text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wide rounded-md hover:bg-orange-600 transition-colors shadow-sm"
      >
        Get Access
            </Link>
    </header>
  );
}

// Features UI Mockup Component
function FeaturesUIMockup() {
  const features = [
    { icon: 'dashboard', label: 'Dashboard', value: 'Unified Control', status: 'Active', color: 'bg-blue-500' },
    { icon: 'folder', label: 'Projects', value: '12 Active', status: 'In Progress', color: 'bg-purple-500' },
    { icon: 'check_circle', label: 'Tasks', value: '47 Total', status: '8 Today', color: 'bg-green-500' },
    { icon: 'calendar_today', label: 'Calendar', value: '5 Events', status: 'This Week', color: 'bg-red-500' },
    { icon: 'mic', label: 'Unload', value: '23 Entries', status: 'Voice Enabled', color: 'bg-orange-500' },
    { icon: 'account_balance', label: 'Money', value: '$12,450', status: 'This Month', color: 'bg-emerald-500' },
    { icon: 'library_books', label: 'Library', value: '156 Items', status: 'Organized', color: 'bg-indigo-500' },
    { icon: 'settings', label: 'Settings', value: 'Configured', status: 'Synced', color: 'bg-gray-500' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-5xl mx-auto">
      {/* Browser Chrome */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1.5 text-xs text-gray-500 ml-4 border border-gray-200">
          ofa.app/dashboard
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xl font-serif text-gray-900 mb-1">OFA Dashboard</h3>
              <p className="text-sm text-gray-500">Complete system overview</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-500 transition-all shadow-sm hover:shadow-md group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center shadow-sm`}>
                  <span className="material-symbols-outlined text-white text-lg">{feature.icon}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors font-medium">
                  {feature.status}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{feature.label}</h4>
                <p className="text-xs text-gray-500">{feature.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-medium">Today's Focus</p>
            <p className="text-xl font-bold text-gray-900">8 Tasks</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-medium">This Week</p>
            <p className="text-xl font-bold text-gray-900">24 Completed</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-medium">Progress</p>
            <p className="text-xl font-bold text-orange-500">68%</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h4>
          <div className="space-y-2.5">
            {[
              { action: 'Completed task', item: 'Design Review', time: '2h ago' },
              { action: 'Added project', item: 'Q4 Planning', time: '5h ago' },
              { action: 'Voice entry', item: 'Unload session', time: '1d ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">{activity.action}</span>
                  <span className="text-gray-900 font-semibold">{activity.item}</span>
                </div>
                <span className="text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hero Section
function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 pt-24 pb-20 overflow-hidden bg-white">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <span className="text-xs font-semibold uppercase tracking-wider text-orange-500 block mb-6">System Release V4.0</span>
        <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight font-serif text-gray-900">
          Your life deserves an operating system.
          </h1>
        <p className="text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-4 text-gray-600">
          You already optimize your work. Why is your life still running on random habits?
        </p>
        <p className="text-base md:text-lg font-serif italic text-gray-500 mb-12">
          Built for people who are tired of productivity apps and want clarity instead.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/signup" 
            className="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 text-sm font-semibold uppercase tracking-wide rounded-md hover:bg-orange-600 transition-colors shadow-md"
          >
            Get Started Free
            </Link>
          <a 
            href="#pillars" 
            className="w-full sm:w-auto border-2 border-gray-300 px-8 py-4 text-sm font-semibold uppercase tracking-wide rounded-md hover:border-orange-500 hover:text-orange-500 transition-all"
          >
            See How It Works
            </a>
          </div>
        </div>
      <div className="w-full max-w-6xl mx-auto">
        <FeaturesUIMockup />
      </div>
    </section>
  );
}

// Philosophy Section
function Philosophy() {
  const problems = [
    {
      title: 'Scattered Tools',
      desc: 'Your data exists in silos. Notes in one app, tasks in another, finances in a third. Context is lost in the gaps.'
    },
    {
      title: 'No Connection',
      desc: 'Your daily actions aren\'t tied to your long-term identity. You\'re busy, but you aren\'t moving.'
    },
    {
      title: 'Reactive Living',
      desc: 'Spending the day answering notifications instead of building the life you envisioned.'
    },
    {
      title: 'Lost Context',
      desc: 'Forgetting the "why" behind the "what." A system that loses the human element.'
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-900 text-white px-6 lg:px-12" id="philosophy">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-4 block">The Protocol</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-10 font-serif">The Problem We're Solving</h2>
          <div className="space-y-8">
            {problems.map((problem, index) => (
              <div key={index} className="flex gap-6 border-l-2 border-orange-500 pl-6 py-2">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wide mb-2 text-orange-400">{problem.title}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{problem.desc}</p>
        </div>
            </div>
          ))}
        </div>
          </div>
        <div className="relative aspect-square border-2 border-gray-700 rounded-lg p-8 flex flex-col justify-center items-center text-center bg-gray-800/50 backdrop-blur-sm">
          <span className="material-symbols-outlined text-7xl font-thin mb-6 opacity-30 text-orange-400">all_inclusive</span>
          <p className="text-xl font-serif italic max-w-sm text-gray-200">"The quality of your life is determined by the quality of the systems you inhabit."</p>
          <span className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-500">Architectural Truth</span>
        </div>
      </div>
    </section>
  );
}

// Three Pillars Section
function Pillars() {
  const pillars = [
    {
      num: '01',
      title: 'Identity',
      desc: 'Define the architect. Codify your values, long-term visions, and the person you are becoming. This is the source code of your system.'
    },
    {
      num: '02',
      title: 'Actions',
      desc: 'The daily execution. Projects, tasks, and habits that translate abstract goals into concrete physical progress through systematic focus.'
    },
    {
      num: '03',
      title: 'Outcomes',
      desc: 'The feedback loop. Tracking finances, health data, and weekly reflections to ensure the system is optimized for peak performance.'
    }
  ];

  return (
    <section className="py-20 md:py-32 px-6 lg:px-12" id="pillars">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif">The Three Pillars</h2>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 hidden md:block">Structural Core</span>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar, index) => (
            <div key={index} className="bg-white p-8 lg:p-10 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center font-serif text-xl font-bold">
                  {pillar.num}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pillar {pillar.num}</span>
              </div>
              <h3 className="text-2xl mb-4 font-serif">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section
function Features() {
  const features = [
    {
      title: 'Dashboard',
      desc: 'Unified mission control for your day.',
      why: 'Zero-friction navigation.'
    },
    {
      title: 'Projects',
      desc: 'Structured roadmap for complex goals.',
      why: 'Clear next-step visibility.'
    },
    {
      title: 'Lists',
      desc: 'The database of every moving part.',
      why: 'Absolute mental clarity.'
    },
    {
      title: 'Calendar',
      desc: 'Temporal visualization of your life.',
      why: 'Intentional time ownership.'
    },
    {
      title: 'Unload',
      desc: 'Rapid entry for thoughts and tasks. Voice-to-text with free transcription.',
      why: 'Never lose an idea again.'
    },
    {
      title: 'Money',
      desc: 'Clinical oversight of your capital.',
      why: 'Financial peace of mind.'
    },
    {
      title: 'Library',
      desc: 'Permanent archive of your learning.',
      why: 'Build a second brain.'
    },
    {
      title: 'Settings',
      desc: 'Global configuration for your OS.',
      why: 'Tailored for your style.'
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-50 px-6 lg:px-12" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-500 block mb-4">The Complete Suite</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4 font-serif">Everything You Need.<br/>Nothing You Don't.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 group hover:border-orange-500 transition-all shadow-sm hover:shadow-md">
              <h4 className="font-bold text-sm uppercase tracking-wide mb-3 text-gray-900">{feature.title}</h4>
              <p className="text-sm leading-relaxed text-gray-600 mb-4">{feature.desc}</p>
              <p className="text-xs font-semibold text-orange-500 italic">{feature.why}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Quote Section
function Quote() {
  return (
    <section className="py-20 md:py-32 bg-white px-6 lg:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif italic leading-tight text-gray-900">
          "You don't need to become more disciplined. You need a system that respects how human you are."
          </h2>
        </div>
    </section>
  );
}

// Implementation Section
function Implementation() {
  const steps = [
    {
      num: '01',
      title: 'Define',
      desc: 'Map out your current reality and desired future. We start by cleaning the slate and identifying the core metrics that actually move the needle.',
      icon: '📋'
    },
    {
      num: '02',
      title: 'Connect',
      desc: 'Integrate your disparate tools into a single, cohesive source of truth. Bridge the gap between who you are and what you do every day.',
      icon: '🔗',
      highlight: true
    },
    {
      num: '03',
      title: 'Learn',
      desc: 'Operate within the system and refine it weekly. The OS evolves with you, becoming more precise and automated over time.',
      icon: '📈'
    }
  ];

  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-500 block mb-4">Process</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4 font-serif text-black">Implementation</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">A systematic approach to building your personal operating system</p>
        </div>

        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-200 via-orange-400 to-orange-200" style={{ height: 'calc(100% - 6rem)' }}></div>

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                  {/* Number Badge */}
                  <div className="relative flex-shrink-0">
                    <div className={`relative w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      step.highlight 
                        ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/30 scale-105' 
                        : 'bg-white border-2 border-gray-200 text-black hover:border-orange-500 hover:shadow-lg'
                    }`}>
                      <span className="text-3xl font-serif font-bold">{step.num}</span>
                      {step.highlight && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    {/* Icon */}
                    <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      step.highlight ? 'bg-white text-orange-500 shadow-md' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                        Step {step.num}
                      </span>
                      <h3 className="text-3xl md:text-4xl mb-4 font-serif text-black">{step.title}</h3>
                    </div>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl">
                      {step.desc}
                    </p>
                    
                    {/* Progress indicator */}
                    {index < steps.length - 1 && (
                      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span>Next step</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-full border border-gray-200">
            <span className="text-sm text-gray-600">Ready to start?</span>
            <Link 
              to="/signup" 
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Begin Implementation →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function Testimonials() {
  const testimonials = [
    {
      quote: '"The OFA system changed how I view my time. It\'s not just about productivity; it\'s about clarity of purpose."',
      name: 'Sarah Chen',
      role: 'Creative Director',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj4xKsctwS_lpvCWM_J1j8ltwkvQV342arqDaguBhojx6_1wUGbnaImawey89ohGPCpJ9w8Bdw8Q__3eIaVX3hDSOEo2BwNFVrVA4JkbUz_E_Mcm1mcFcc8BVj11DXpuEpSeYRSTL8KC0pqrn84e7HcfDMCkXT-DAJjfJ3mCAGCrD_K9twbWVwXwWCn2weCMLlOzW1YSVT4gXGxzMmXq0NaPNM-JrqZqr1I8EM2ReJ1yLZ67ZILPyIzc9cFXkRL3XIOHWjkNGohyA'
    },
    {
      quote: '"I\'ve tried every app and template out there. This is the first one that feels like a professional-grade tool."',
      name: 'Marcus Johnson',
      role: 'Software Engineer',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOYkYCfdkRIxe-024MgyLILvGSudXduqzUnwr9hbj_HZVdQ_ql7WYGt-DwtE4dVGsAW10x3XznwJfiiqOQ4cSmcY2wxiEXY_8mjFXfz926fwf1LpVgTfQB1uNNQ6oMmP8bqTi_q8WttF5Fg-V9ULJqbOUrmsmQVPMU49houfWiJvM6C7oxKNX3tHKT5ThOJJkWeexkwA1Dt0lteEgH4mlx4NSTjvcLaTH5blOzaOV0K_SD4DGU0su4CGruqorS3g_JbfawDe4pQ2E'
    },
    {
      quote: '"It\'s like an architecture for the mind. My stress levels have halved because I trust the system."',
      name: 'Emily Rodriguez',
      role: 'Product Founder',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0qyE0xAJQHjoij1EIsJAguhhlLl7WQ5jL94fLlUvA8mJModdH17tJJ0eo5OYimnZK41ZQKMpYFBrxoQ1p62GVPqPzgMZ-AFo80zMHToNqElLRK3z4wjfAWgwZcClKmL7vIuoP6HeQcajOD1ty7lHbQ7E1-m65Unq3cz3P3F7CQmCAp0CMWd9sUCkFSBfdTiPPkIVRqXJsXaJV5ag4R7j3lsWRdCrX0xJMKF6AhSOIfHnP4k-nmYmN0BoFbTHsZ2VY244SizKOMXA'
    }
  ];

  return (
    <section className="py-20 md:py-32 border-y border-gray-200 px-6 lg:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex flex-col gap-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <p className="text-lg font-serif italic text-gray-700 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  <img alt={testimonial.name} className="w-full h-full object-cover" src={testimonial.image} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQ() {
  const faqs = [
    {
      question: 'Is OFA free?',
      answer: 'OFA offers a lifetime license for a one-time fee. We don\'t believe in rent-seeking subscriptions for your personal operating system.'
    },
    {
      question: 'Is my data private?',
      answer: 'Yes. The OS is local-first. We do not store your personal data on our servers. You own your system and your data.'
    },
    {
      question: 'Does it work on mobile?',
      answer: 'The system is fully responsive and features a dedicated \'Rapid Entry\' interface optimized for iOS and Android workflows.'
    },
    {
      question: 'Is it hard to set up?',
      answer: 'The initialization process takes about 2-3 hours. We provide a step-by-step \'Blueprint\' guide to help you migrate your life.'
    }
  ];

  return (
    <section className="py-20 md:py-32 px-6 lg:px-12" id="faq">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-orange-500 block text-center mb-4">Help & Data</span>
        <h2 className="text-4xl md:text-5xl mb-12 text-center font-serif">Frequently Asked</h2>
        <div className="divide-y divide-gray-200">
          {faqs.map((faq, index) => (
            <details key={index} className="group py-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <span className="font-semibold text-sm text-gray-900">{faq.question}</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-45 text-orange-500">add</span>
              </summary>
              <div className="mt-4 text-sm text-gray-600 leading-relaxed">
                {faq.answer}
          </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTA() {
  return (
    <section className="py-20 md:py-32 px-6 lg:px-12 bg-gray-900 text-white text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl mb-12 font-serif italic">Start Building the System You'll Thank Yourself For in 5 Years.</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link 
            to="/signup" 
            className="bg-orange-500 text-white px-10 py-4 text-sm font-semibold uppercase tracking-wide rounded-md hover:bg-orange-600 transition-colors shadow-lg"
          >
            Get Started Free — $0
            </Link>
          <a 
            href="#pillars" 
            className="border-2 border-gray-600 px-10 py-4 text-sm font-semibold uppercase tracking-wide rounded-md hover:border-orange-500 hover:text-orange-500 transition-all"
          >
            See How It Works
          </a>
        </div>
        <p className="mt-10 text-xs font-semibold uppercase tracking-wider text-gray-400">Join 12,000+ Verified Architects</p>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-white py-16 px-6 lg:px-12 border-t border-gray-200">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-base font-bold">OFA</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            The clinical operating system for high-output individuals. Built on the principles of essentialism and architectural precision.
          </p>
        </div>
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wide mb-6 text-gray-900">System</h5>
          <ul className="space-y-3 text-xs text-gray-600">
            <li><a href="#features" className="hover:text-orange-500 transition-colors">Components</a></li>
            <li><a href="#pillars" className="hover:text-orange-500 transition-colors">Integration</a></li>
            <li><a href="#philosophy" className="hover:text-orange-500 transition-colors">Manifesto</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wide mb-6 text-gray-900">Resources</h5>
          <ul className="space-y-3 text-xs text-gray-600">
            <li><a href="#" className="hover:text-orange-500 transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-orange-500 transition-colors">Video Tutorials</a></li>
            <li><a href="#" className="hover:text-orange-500 transition-colors">Community</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wide mb-6 text-gray-900">Protocol</h5>
          <ul className="space-y-3 text-xs text-gray-600">
            <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-orange-500 transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-gray-500">© 2024 OFA. All rights reserved.</p>
        <div className="flex gap-6 text-gray-400">
          <span className="material-symbols-outlined text-lg hover:text-orange-500 transition-colors cursor-pointer">terminal</span>
          <span className="material-symbols-outlined text-lg hover:text-orange-500 transition-colors cursor-pointer">architecture</span>
          <span className="material-symbols-outlined text-lg hover:text-orange-500 transition-colors cursor-pointer">grid_view</span>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function Landing() {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <Philosophy />
      <Pillars />
      <Features />
      <Quote />
      <Implementation />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
