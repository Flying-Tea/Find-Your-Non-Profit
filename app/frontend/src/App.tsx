import { useState } from 'react';
import './App.css'
import { UserFilters } from './components/FIlters'
import { NavBar } from './components/NavBar'
import { searchVolunteers, type SearchParams, type VolunteerOpportunity } from './api/VolunteerAPI';
import { ResultsList } from './components/ResultsList';
import DetailsPanel from './components/DetailsPanel';
import { useSearchParams } from 'react-router-dom';

function App() {
  const [results, setResults] = useState<VolunteerOpportunity[]>([]);
  const [selected, setSelected] = useState<VolunteerOpportunity | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<SearchParams | null>(null);

  const [, setSearchParams] = useSearchParams();

  function updateUrl(params: SearchParams) {
    const url = new URLSearchParams();

    if (params.interests.length)
      url.set("interests", params.interests.join(","));

    if (params.region) url.set("region", params.region);
    if (params.age) url.set("age", params.age);
    if (params.isRemote) url.set("isRemote", "true");
    if (params.q) url.set("q", params.q);

    setSearchParams(url);
  }

  async function HandleSearch(params: SearchParams) {
    setIsFetching(true);
    setLastParams(params);
    updateUrl(params);

    try {
      const res = await searchVolunteers(params);
      setResults(res);
      setSelected(prevSelected => prevSelected ?? (res[0] || null))
      setError(null);
    } catch {
      setError("Failed to fetch volunteer opportunities. ");
    } finally {
      setIsFetching(false);
    }
  }
  return (
    <>
      <header className='mt-20'>
        <NavBar />
        <UserFilters onSearch={HandleSearch}/>
      </header>
      <div className='flex gap-6 max-w-7xl mx-auto p-4'>
        <div className='w-1/3'>
          <ResultsList results={results} onSelect={setSelected} loading={isFetching && results.length === 0} />
        </div>
        <div className='flex gap-4 w-2/3'>
          <DetailsPanel selected={selected} loading={isFetching && !selected} />
        </div>
      </div>
      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow">
          {error}
          <button onClick={() => {
            if (!lastParams) return; 
            HandleSearch(lastParams);
            window.location.reload();
          }} 
            className="bg-white text-red-600 px-2 ml-2 py-1 rounded text-sm hover:bg-red-100"> Retry
          </button>
        </div>
        
      )}
      
    </>
  )
}

export default App
