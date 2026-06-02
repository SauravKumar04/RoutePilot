import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center animate-fade-in">
      <div className="w-16 h-16 bg-gray-50 border border-border rounded-2xl flex items-center justify-center text-gray-400 mb-6 shadow-subtle">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <h1 className="text-4xl font-bold tracking-tighter text-gray-900 mb-2">
        404 — Route Lost
      </h1>
      
      <p className="text-muted text-sm max-w-sm mb-8 leading-relaxed">
        The coordinates or resource node you are trying to access does not exist or has been shifted in the optimization matrix.
      </p>

      <Link to="/dashboard">
        <Button variant="primary" className="group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;