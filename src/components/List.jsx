import { useState } from 'react';
import sort from '../assets/sort.png'
import arrowDown from '../assets/arrow-down.png'
import { Popup } from './CardPopUp.jsx'
import '../styles/List.css'


export const List = ({hubData}) => {


    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [isBackwards, setIsBackwards] = useState(true)
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    

    const handleReadMore = (building) => {
        setSelectedBuilding(building);
      };
    

    const handleClosePopup = () => {
        setSelectedBuilding(null);

      };


    const handleCardCount = (count) => {
        setItemsPerPage(count)
    }

    const handleWards = () => {
        setIsBackwards(!isBackwards)
    }

    const totalPages = Math.ceil(hubData.data?.groupedProducts?.length / itemsPerPage);

    const getPageRange = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return [startIndex, endIndex];
    };

    const [startIndex, endIndex] = getPageRange();
    const sortedItems = isBackwards 
    ? hubData.data?.groupedProducts?.sort((a, b) => a.productInformations[0]?.name.localeCompare(b.productInformations[0]?.name))
    : hubData.data?.groupedProducts?.sort((a, b) => b.productInformations[0]?.name.localeCompare(a.productInformations[0]?.name))
            
    const displayedItems = sortedItems?.slice(startIndex, endIndex);
            

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
      };
      
      
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);


      
    
    return (
    <div>
        <h1>SELAA RAKENNUKSIA</h1>
        <div className='sortContainer'>
        <div className='dropdown'>
            <img src={sort} alt="sortLogo" />
            <a>NÄYTÄ {itemsPerPage}</a>
            <div class="dropdown-content">
            <button onClick={() => handleCardCount(6)}>6</button>
            <button onClick={() => handleCardCount(12)}>12</button>
            <button onClick={() => handleCardCount(24)}>24</button>
            </div>
        </div>
        <div className='wards'>
    {isBackwards ? (
        <div>
        <span>A-Ö</span>
        <img onClick={() => handleWards()} src={arrowDown} alt="arrow-down" />
        </div>
    ) : (
        <div>
        <span>Ö-A</span>
        <img onClick={() => handleWards()} src="" alt="arrow-up" />
        </div>
    )}
    </div>
        </div>
        <div className='cardContainer'>
        <ul >
        {displayedItems?.map((building) => (
        <li className="card" key={building.id}>
            <h2 className='h2'>{building.productInformations[0]?.name}</h2>
            
            <div className='info'>
            
            <p className='p'>Osoite: {building.postalAddresses[0]?.streetName}</p>
            <p className='p'>Kaupunki: {building.postalAddresses[0]?.city}</p>
            <p className='p'>Postinumero: {building.postalAddresses[0]?.postalCode}</p>
            </div>
            <figure className='picture_url'>
                <img src={building.productImages[0]?.thumbnailUrl} alt={building.productImages[0]?.altText} />
            </figure>
            

            <a className='zoom' onClick={() => handleReadMore(building)}>
              LUE LISÄÄ
            </a>
            
        </li>
        
        ))}
        </ul>
        {selectedBuilding && <Popup building={selectedBuilding} onClose={() => handleClosePopup()} />}
        </div>
        <div className="pagination">
            {pageNumbers.map((pageNumber) => (
                <span
                key={pageNumber}
                className={pageNumber === currentPage ? 'active' : ''}
                onClick={() => handlePageChange(pageNumber)}
                >
                {pageNumber}
                </span>
            ))}
        </div>


        <div className="navigation-arrows">
            <a onClick={() => handlePageChange(currentPage - 1)}>&lt; Prev</a>
            <a onClick={() => handlePageChange(currentPage + 1)}>Next &gt;</a>
        </div>

    </div>
      
            

    );
}