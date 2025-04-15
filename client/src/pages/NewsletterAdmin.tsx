import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface NewsletterSubscriber {
  id: number;
  email: string;
  subscribedAt: string;
}

const NewsletterAdmin = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  
  const { data, isLoading, error } = useQuery<NewsletterSubscriber[]>({
    queryKey: ['/api/newsletter'],
    retry: 1
  });
  
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setSubscribers(data);
    }
  }, [data]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Newsletter Subscribers</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-destructive/20 text-destructive p-4 rounded-md">
          Error loading subscribers. Please try again later.
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-8 bg-card rounded-lg border">
          <p className="text-muted-foreground">No subscribers yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 border-b">ID</th>
                <th className="text-left p-4 border-b">Email</th>
                <th className="text-left p-4 border-b">Subscribed At</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-muted/50">
                  <td className="p-4 border-b">{subscriber.id}</td>
                  <td className="p-4 border-b">{subscriber.email}</td>
                  <td className="p-4 border-b">
                    {new Date(subscriber.subscribedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-8 bg-muted p-4 rounded-md">
        <h2 className="font-semibold mb-2">About This Page</h2>
        <p className="text-sm text-muted-foreground">
          This admin page shows all email subscriptions stored in the SQLite database.
          The database is located at <code className="bg-card px-1 py-0.5 rounded">data/newsletter.sqlite</code> in your project directory.
        </p>
      </div>
    </div>
  );
};

export default NewsletterAdmin;