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
                <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="#2C8463"/>
                  <path d="M16.4 10.3c.2-1.3-.8-2-2.2-2.5l.5-1.9-1.1-.3-.5 1.8c-.3-.1-.6-.1-.9-.2l.5-1.8-1.1-.3L11 7l-.7-.2v.1c-1-.2-1.9-.1-2.3.8-.3.7 0 1.1.6 1.7-.4.1-.7.3-.9.7-.3.7 0 1.4.9 1.7 1.2.5 2.2.1 2.5-.9.3-1.1-.7-1.6-1.5-1.9.1 0 .2-.1.2-.1.2.1.3.1.5.2.2.1.3.1.5.2l-.5 1.9 1.1.3.5-1.9c.3.1.6.2.9.3l-.5 1.9 1.1.3.5-1.9c1.4.5 2.4.3 2.6-1.1zm-6.5.8c-.5-1.5 1.9-1.5 2.1-.3.1.5-.3 1.2-2.1.3zm1.7-2.7c-.4-1.4 1.6-1.4 1.8-.2 0 .4-.2 1-1.8.2z" fill="white"/>
                </svg>
                <span className="font-bold text-xl text-primary">Swapido</span>
                <span className="ml-2 font-medium text-gray-600">Wallet Compare</span>
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
              className="swapido-button px-3 py-2 text-sm font-medium inline-flex items-center"
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
