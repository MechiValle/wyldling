import { Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home';
import { Fish } from './pages/Fish';
import { Food } from './pages/Food';
import { Characters } from './pages/Characters';
import { Shops } from './pages/Shops';
import { Animals } from './pages/Animals';
import { Search } from './pages/Search';
import { Settings } from './pages/Settings';
import { Cheats } from './pages/Cheats';
import { Clothing } from './pages/Clothing';
import { Tips } from './pages/Tips';
import { Hairstyles } from './pages/Hairstyles';

function App() {
  return (
    <div className='min-h-screen'>
      <NavBar />
      <main className='p-4'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/fish' element={<Fish />} />
          <Route path='/food' element={<Food />} />
          <Route path='/characters' element={<Characters />} />
          <Route path='/shops' element={<Shops />} />
          <Route path='/animals' element={<Animals />} />
          <Route path='/search' element={<Search />} />
          <Route path='/cheats' element={<Cheats />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/clothing' element={<Clothing />} />
          <Route path='/tips' element={<Tips />} />
          <Route path='/hairstyles' element={<Hairstyles />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
