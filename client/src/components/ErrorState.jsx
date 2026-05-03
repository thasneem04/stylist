import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-4">
    <div className="bg-red-50 p-6 rounded-full mb-6">
      <AlertTriangle className="text-red-500" size={40} />
    </div>
    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-2">Failed to Load</h2>
    <p className="text-sm text-gray-500 mb-8 max-w-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
      >
        <RefreshCw size={16} /> Try Again
      </button>
    )}
  </div>
);

export default ErrorState;
