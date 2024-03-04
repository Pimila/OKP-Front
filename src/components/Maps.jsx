import React, { useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, Marker} from '@react-google-maps/api';
import '../styles/Maps.css';
import '../styles/List.css';
import houseIcon from '../assets/house.png';
import { Popup } from './CardPopUp.jsx';
import close from '../assets/close.png';
import emptyHeart from '../assets/emptyHeart.png';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 60.1699,
  lng: 24.9384,
};

const libraries = ['places'];

export const getBuildingName = (building) => {
  if (!building || !building.productInformations || !building.productImages) {
    return "Unknown Building"; // Or any default value
  }

  const name =
    building.productInformations[0]?.name ||
    (building.productImages[0]?.copyright === "Kuvio"
      ? "Oodi"
      : building.productImages[0]?.copyright === "Didrichsen archives"
      ? "Didrichsenin taidemuseo"
      : building.productImages[0]?.copyright.includes(
          "Copyright: Visit Finland"
        )
      ? building.productImages[0]?.copyright.split(":")[1]?.trim() // added null check here
      : building.productImages[0]?.copyright);

  return name || "Unknown Building"; // Or any default value
};

export const markers = hubData => {
  const extractedMarkers = hubData.data?.groupedProducts?.map((building, index) => {
    const location = building.postalAddresses[0]?.location;
    const name = getBuildingName(building);
       
    // Check if location is defined and has valid latitude and longitude
    if (location && location.includes(',')) {
      const [lat, lng] = location.substring(1, location.length - 1).split(',');
      const latitude = parseFloat(lat.trim());
      const longitude = parseFloat(lng.trim());   
      
      // Check if latitude and longitude are valid numbers
      if (!isNaN(latitude) && !isNaN(longitude)) {
        const marker = {
          position: {
            lat: latitude,
            lng: longitude
          },
          title: name
        };  
        return marker;
      }
    }
    
    console.warn(`Invalid location data for marker ${index + 1}. Skipping...`);
    return null;
  }).filter(marker => marker !== null);

  return extractedMarkers;
};

export const Maps = ({searchField, hubData, buildings = [],}) => {

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_APIKEY,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [showInfoWindow, setShowInfoWindow] = useState(false); // Define showInfoWindow state
  const [mapCenter, setMapCenter] = useState(center); 
  const markersData = markers(hubData);

  const [showPopup, setShowPopup] = useState(false); 
  const [refreshPage, setRefreshPage] = useState(false);

  const filteredMarkers = markersData.filter(marker => {
      return searchField === '' || marker.title.toLowerCase().includes(searchField.toLowerCase());
    }); 
  
  const onMapLoad = map => {
    setMap(map);
    window.google.maps.event.addListener(map, 'bounds_changed', () => {
      setMapBounds(map.getBounds());
    });   
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  const mapOptions =  {
    styles: [
      {
        featureType: "all",
        elementType: "all",
        stylers: [
          { saturation: -120 }, // Set saturation to -100 for black and white
          { lightness: 0 }, // Set lightness to 0 for black and white
        ],
      },
      {
        featureType: "administrative",
        elementType: "labels.text",
        stylers: [{ visibility: "on" }], // Show city part names
      },
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }], // Hide points of interest labels
      },
      {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "off" }], // Hide transit labels
      },
      {
        featureType: "road",
        elementType: "labels",
        stylers: [{ visibility: "off" }], // Hide road labels
      },
    ],
  };


const handleMarkerClick = (marker) => {
  console.log("Marker clicked:", marker);
  setSelectedMarker(marker);
  setShowInfoWindow(true); 
  const clickedBuilding = hubData.data.groupedProducts.find(building => getBuildingName(building) === marker.title);
  setSelectedBuilding(clickedBuilding);
};
const closeInfoWindow = () => {
  setSelectedMarker(null); 
  setSelectedBuilding(null);
};

  return (
    <div className="mapContainer">
      <div className={selectedBuilding ? "map" : "map full-width"}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={mapCenter}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {filteredMarkers.map((marker, index) => {
            if (!selectedMarker || marker.title === selectedMarker.title) {
              return (
                <Marker
                  key={index}
                  position={marker.position}
                  title={marker.title}
                  icon={{
                    url: houseIcon,
                    scaledSize: new window.google.maps.Size(20, 32),
                  }}
                  onClick={() => handleMarkerClick(marker)}
                />
              );
            }
            return null;
          })}
        </GoogleMap>
      </div>
      {showInfoWindow && selectedMarker && (
        <div className="InfoWindows">
        {selectedBuilding && (
          <li className="card" key={selectedBuilding.id}>
            <div className="headingContainer">
              <h2 className="h2">{getBuildingName(selectedBuilding)}</h2>
              <div className="iconsContainer">
                <img className="emptyHeart" src={emptyHeart} alt="empty-heart" />
                <img className="pinCard" src={close} alt="close" onClick={closeInfoWindow} />
              </div>
            </div>
            <div className="info">
              <p className="p">Osoite: {selectedBuilding.postalAddresses[0]?.streetName}</p>
              <p className="p">Kaupunki: {selectedBuilding.postalAddresses[0]?.city}</p>
              <p className="p">Postinumero: {selectedBuilding.postalAddresses[0]?.postalCode}</p>
            </div>
            <figure className="picture_url">
              <img
                src={selectedBuilding.productImages[0]?.thumbnailUrl}
                alt={selectedBuilding.productImages[0]?.altText}
              />
            </figure>
            <a className="zoom" onClick={() => setShowPopup(true)}>LUE LISÄÄ</a>
            {showPopup && <Popup building={selectedBuilding} onClose={() => setShowPopup(false)} />}
          </li>
        )}
        </div>
      )}
    </div>
  );  
};  
