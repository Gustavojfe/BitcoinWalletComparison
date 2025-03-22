import { Link, useLocation } from 'wouter';

const Header = () => {
  const [location] = useLocation();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="font-bold text-xl text-primary">Wallet Compare</span>
              </Link>
            </div>
            <nav className="ml-6 flex space-x-8" aria-label="Main Navigation">
              <Link href="/" className={`${location === '/' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} border-b-2 inline-flex items-center px-1 pt-1 font-medium`}>
                Compare
              </Link>
              <Link href="/about" className={`${location === '/about' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} border-b-2 inline-flex items-center px-1 pt-1 font-medium`}>
                About
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <button 
              type="button" 
              className="app-button px-3 py-2 text-sm font-medium inline-flex items-center"
              onClick={() => {
                document.getElementById('help-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Help
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
