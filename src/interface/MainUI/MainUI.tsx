import './MainUIStyles.css';
import Map from '../Map/Map';
import BottomPanel from './Bottom';
import MainGame from './NewMainGame';
import { useRef, useEffect } from 'react';
import React from 'react';

const MainUI = () => {

    return ( 
        <div className='main-container'>
            <div className="left-panel">
                <Map />
            </div>
            <div className='main-game-container'>
                <div className='main-game'>
                    <MainGame />
                </div>
                <div className='bottom-panel'>
                    <BottomPanel />
                </div>
            </div>
        </div>
    )
}

export default MainUI;