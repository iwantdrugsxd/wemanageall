import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const firstName = user?.name?.split(' ')[0] || 'there';

  const actions = [
    {
      icon: '✍️',
      label: 'Dump thoughts',
      path: '/dashboard',
      color: 'bg-black/10 hover:bg-black/20',
    },
    {
      icon: '📋',
      label: 'Work on projects',
      path: '/projects',
      color: 'bg-black/10 hover:bg-black/20',
    },
    {
      icon: '🗓',
      label: 'Plan my day',
      path: '/dashboard',
      color: 'text-black hover:text-black',
    },
    {
      icon: '💬',
      label: 'Unload',
      path: '/emotions',
      color: 'bg-pink-100 hover:bg-pink-200',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-black mb-4">
            Welcome back, {firstName}.
          </h1>
          <p className="text-xl text-gray-600">
            What do you want to do right now?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`${action.color} p-8 rounded-3xl transition-all transform hover:scale-105 border border-gray-300/50`}
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <div className="font-medium text-black text-lg">{action.label}</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-8 text-gray-600 hover:text-black transition-colors"
        >
          Go to dashboard →
        </button>
      </div>
    </div>
  );
}
