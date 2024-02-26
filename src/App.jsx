import { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { Maps } from './components/Maps.jsx';
import { List } from './components/List.jsx';
import { Input } from './components/Input.jsx';
import { Login } from './components/Login.jsx';
import axios from 'axios';
import './styles/App.css';

function App() {
  const [data, setData] = useState([]);
  const [hubData, setHubData] = useState({ data: { groupedProducts: [] } });
  const [searchField, setSearchField] = useState('');
  const [loginForm, setLoginForm] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    getAll();
    fetchData();
  }, []);

  const handleSearch = (searchTerm) => {
    // Update the search field state
    setSearchField(searchTerm);
  };

  const handleLoginForm = () => {
    setLoginForm(!loginForm);
  };

  const getAll = async () => {
    try {
      const response = await axios.get('https://www.hel.fi/palvelukarttaws/rest/v4/unit/?ontologyword=473');
      setData(response.data);
    } catch (error) {
      console.error('Something went wrong:', error.message);
    }
  };

  const fetchData = async () => {
    try {
      const backendRes = await fetch('http://localhost:5143/api/DataHub');
      const backendData = await backendRes.json();
      setHubData(backendData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateMapMarker = selectedBuilding => {
    setSelectedMarker(selectedBuilding);
  };

  return (
    <>
      <Header handleLoginForm={handleLoginForm} />
      <Input handleSearch={handleSearch} searchField={searchField} markers={hubData.data?.groupedProducts || []} updateMapMarker={updateMapMarker} />
      <Login loginForm={loginForm} handleLoginForm={handleLoginForm} />
      <Maps searchField={searchField} buildings={hubData.data?.groupedProducts || []} hubData={hubData} selectedMarker={selectedMarker}/>
      <List hubData={hubData} searchField={searchField} />
      <Footer />
    </>
  );
}

export default App;
