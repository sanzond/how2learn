import React, { useState } from 'react';
import MenuScreen from './components/MenuScreen';
import RangeTest from './components/RangeTest';
import SpeedTest from './components/SpeedTest';
import ResponsivenessTest from './components/ResponsivenessTest';

const VocabularyTestApp = () => {
  const [currentTest, setCurrentTest] = useState('menu');
  const [scores, setScores] = useState({
    range: null,
    speed: { part1: null, part2: null },
    responsiveness: null
  });

  const renderCurrentScreen = () => {
    switch (currentTest) {
      case 'menu':
        return <MenuScreen setCurrentTest={setCurrentTest} scores={scores} />;
      case 'range':
        return <RangeTest setCurrentTest={setCurrentTest} setScores={setScores} />;
      case 'speed':
        return <SpeedTest setCurrentTest={setCurrentTest} setScores={setScores} />;
      case 'responsiveness':
        return <ResponsivenessTest setCurrentTest={setCurrentTest} setScores={setScores} />;
      default:
        return <MenuScreen setCurrentTest={setCurrentTest} scores={scores} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentScreen()}
    </div>
  );
};

export default VocabularyTestApp;