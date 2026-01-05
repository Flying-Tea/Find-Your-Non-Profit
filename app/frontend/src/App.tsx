import { useState } from 'react';
import './App.css'
import { UserFilters } from './components/FIlters'
import { NavBar } from './components/NavBar'
import { searchVolunteers, type SearchParams, type VolunteerOpportunity } from './api/VolunteerAPI';
import { ResultsList } from './components/ResultsList';
import DetailsPanel from './components/DetailsPanel';

function App() {
  const [results, setResults] = useState<VolunteerOpportunity[]>([]);
  const [selected, setSelected] = useState<VolunteerOpportunity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function HandleSearch(params: SearchParams) {
    setLoading(true);
    setError(null);
    
    try {
      const res = await searchVolunteers(params);
      setResults(res);
      setSelected(res[0] || null);
    } catch {
      setError("Failed to fetch volunteer opportunities.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <header className='mt-20'>
        <NavBar />
        <UserFilters onSearch={HandleSearch}/>
      </header>
      <div className='grid grid-cols-3 gap-6 max-w-7xl mx-auto p-4'>
        <ResultsList results={results} onSelect={setSelected} loading={loading} />
        <DetailsPanel selected={selected} loading={loading} />
      </div>
      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow">
          {error}
        </div>
      )}
      
    </>
  )
}

export default App
