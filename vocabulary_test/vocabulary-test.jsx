import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Award, BookOpen, Zap, Target } from 'lucide-react';

const VocabularyTestApp = () => {
  const [currentTest, setCurrentTest] = useState('menu');
  const [scores, setScores] = useState({
    range: null,
    speed: { part1: null, part2: null },
    responsiveness: null
  });

  const rangeQuestions = [
    { id: 1, word: "disheveled appearance", options: ["untidy", "fierce", "foolish", "peculiar", "unhappy"], answer: 0 },
    { id: 2, word: "a baffling problem", options: ["difficult", "simple", "puzzling", "long", "new"], answer: 2 },
    { id: 3, word: "lenient parent", options: ["tall", "not strict", "wise", "foolish", "severe"], answer: 1 },
    { id: 4, word: "repulsive personality", options: ["disgusting", "attractive", "normal", "confused", "conceited"], answer: 0 },
    { id: 5, word: "audacious attempt", options: ["useless", "bold", "foolish", "crazy", "necessary"], answer: 1 },
    { id: 6, word: "parry a blow", options: ["ward off", "fear", "expect", "invite", "ignore"], answer: 0 },
    { id: 7, word: "prevalent disease", options: ["dangerous", "catching", "childhood", "fatal", "widespread"], answer: 4 },
    { id: 8, word: "ominous report", options: ["loud", "threatening", "untrue", "serious", "unpleasant"], answer: 1 },
    { id: 9, word: "an incredible story", options: ["true", "interesting", "well-known", "unbelievable", "unknown"], answer: 3 },
    { id: 10, word: "an ophthalmologist", options: ["eye doctor", "skin doctor", "foot doctor", "heart doctor", "cancer specialist"], answer: 0 },
    { id: 11, word: "will supersede the old law", options: ["enforce", "specify penalties for", "take the place of", "repeal", "continue"], answer: 2 },
    { id: 12, word: "an anonymous donor", options: ["generous", "stingy", "well-known", "one whose name is not known", "reluctant"], answer: 3 },
    { id: 13, word: "performed an autopsy", options: ["examination of living tissue", "examination of a corpse to determine the cause of death", "process in the manufacture of optical lenses", "operation to cure an organic disease", "series of questions to determine the causes of delinquent behavior"], answer: 1 },
    { id: 14, word: "an indefatigable worker", options: ["well-paid", "tired", "skillful", "tireless", "pleasant"], answer: 3 },
    { id: 15, word: "a confirmed atheist", options: ["bachelor", "disbeliever in God", "believer in religion", "believer in science", "priest"], answer: 1 },
    { id: 16, word: "endless loquacity", options: ["misery", "fantasy", "repetitiousness", "ill health", "talkativeness"], answer: 4 },
    { id: 17, word: "a glib talker", options: ["smooth", "awkward", "loud", "friendly", "boring"], answer: 0 },
    { id: 18, word: "an incorrigible optimist", options: ["happy", "beyond correction or reform", "foolish", "hopeful", "unreasonable"], answer: 1 },
    { id: 19, word: "an ocular problem", options: ["unexpected", "insoluble", "visual", "continual", "imaginary"], answer: 2 },
    { id: 20, word: "a notorious demagogue", options: ["rabble-rouser", "gambler", "perpetrator of financial frauds", "liar", "spendthrift"], answer: 0 },
    { id: 21, word: "a naïve attitude", options: ["unwise", "hostile", "unsophisticated", "friendly", "contemptuous"], answer: 2 },
    { id: 22, word: "living in affluence", options: ["difficult circumstances", "countrified surroundings", "fear", "wealth", "poverty"], answer: 3 },
    { id: 23, word: "in retrospect", options: ["view of the past", "artistic balance", "anticipation", "admiration", "second thoughts"], answer: 0 },
    { id: 24, word: "a gourmet", options: ["seasoned traveler", "greedy eater", "vegetarian", "connoisseur of good food", "skillful chef"], answer: 3 },
    { id: 25, word: "to simulate interest", options: ["pretend", "feel", "lose", "stir up", "ask for"], answer: 0 },
    { id: 26, word: "a magnanimous action", options: ["puzzling", "generous", "foolish", "unnecessary", "wise"], answer: 1 },
    { id: 27, word: "a clandestine meeting", options: ["prearranged", "hurried", "important", "secret", "public"], answer: 3 },
    { id: 28, word: "the apathetic citizens", options: ["made up of separate ethnic groups", "keenly vigilant of their rights", "politically conservative", "indifferent, uninterested, uninvolved", "terrified"], answer: 3 },
    { id: 29, word: "to placate his son", options: ["please", "help", "find a job for", "make arrangements for", "change a feeling of hostility to one of friendliness"], answer: 4 },
    { id: 30, word: "to vacillate continually", options: ["avoid", "swing back and forth in indecision", "inject", "treat", "scold"], answer: 1 },
    { id: 31, word: "a nostalgic feeling", options: ["nauseated", "homesick", "sharp", "painful", "delighted"], answer: 1 },
    { id: 32, word: "feel antipathy", options: ["bashfulness", "stage fright", "friendliness", "hostility", "suspense"], answer: 3 },
    { id: 33, word: "be more circumspect", options: ["restrained", "confident", "cautious", "honest", "intelligent"], answer: 2 },
    { id: 34, word: "an intrepid fighter for human rights", options: ["fearless", "eloquent", "popular", "experienced", "famous"], answer: 0 },
    { id: 35, word: "diaphanous material", options: ["strong", "sheer and gauzy", "colorful", "expensive", "synthetic"], answer: 1 },
    { id: 36, word: "a taciturn host", options: ["stingy", "generous", "disinclined to conversation", "charming", "gloomy"], answer: 2 },
    { id: 37, word: "to malign his friend", options: ["accuse", "help", "disbelieve", "slander", "introduce"], answer: 3 },
    { id: 38, word: "a congenital deformity", options: ["hereditary", "crippling", "slight", "incurable", "occurring at or during birth"], answer: 4 },
    { id: 39, word: "a definite neurosis", options: ["plan", "emotional disturbance", "physical disease", "feeling of fear", "allergic reaction"], answer: 1 },
    { id: 40, word: "made an unequivocal statement", options: ["hard to understand", "lengthy", "politically motivated", "clear and forthright", "supporting"], answer: 3 },
    { id: 41, word: "vicarious enjoyment", options: ["complete", "unspoiled", "occurring from a feeling of identification with another", "long-continuing", "temporary"], answer: 2 },
    { id: 42, word: "psychogenic ailment", options: ["incurable", "contagious", "originating in the mind", "intestinal", "imaginary"], answer: 2 },
    { id: 43, word: "an anachronous attitude", options: ["unexplainable", "unreasonable", "belonging to a different time", "out of place", "unusual"], answer: 2 },
    { id: 44, word: "her iconoclastic phase", options: ["artistic", "sneering at tradition", "troubled", "difficult", "religious"], answer: 1 },
    { id: 45, word: "a tyro", options: ["dominating personality", "beginner", "accomplished musician", "dabbler", "serious student"], answer: 1 },
    { id: 46, word: "a laconic reply", options: ["immediate", "assured", "terse and meaningful", "unintelligible", "angry"], answer: 2 },
    { id: 47, word: "semantic confusion", options: ["relating to the meaning of words", "pertaining to money", "having to do with the emotions", "relating to mathematics", "caused by inner turmoil"], answer: 0 },
    { id: 48, word: "cavalier treatment", options: ["courteous", "haughty and highhanded", "negligent", "affectionate", "expensive"], answer: 1 },
    { id: 49, word: "an anomalous situation", options: ["dangerous", "intriguing", "unusual", "pleasant", "unhappy"], answer: 2 },
    { id: 50, word: "posthumous child", options: ["cranky", "brilliant", "physically weak", "illegitimate", "born after the death of the father"], answer: 4 },
    { id: 51, word: "feels enervated", options: ["full of ambition", "full of strength", "completely exhausted", "troubled", "full of renewed energy"], answer: 2 },
    { id: 52, word: "shows perspicacity", options: ["sincerity", "mental keenness", "love", "faithfulness", "longing"], answer: 1 },
    { id: 53, word: "an unpopular martinet", options: ["candidate", "supervisor", "strict disciplinarian", "military leader", "discourteous snob"], answer: 2 },
    { id: 54, word: "gregarious person", options: ["outwardly calm", "very sociable", "completely untrustworthy", "vicious", "self-effacing and timid"], answer: 1 },
    { id: 55, word: "generally phlegmatic", options: ["smug, self-satisfied", "easily pleased", "nervous, high strung", "emotionally unresponsive", "lacking in social graces"], answer: 3 },
    { id: 56, word: "an inveterate gambler", options: ["impoverished", "successful", "habitual", "occasional", "superstitious"], answer: 2 },
    { id: 57, word: "an egregious error", options: ["outstandingly bad", "slight", "irreparable", "unnecessary", "deliberate"], answer: 0 },
    { id: 58, word: "cacophony of a large city", options: ["political administration", "crowded living conditions", "cultural advantages", "unpleasant noises, harsh sounds", "busy traffic"], answer: 3 },
    { id: 59, word: "a prurient adolescent", options: ["tall and gangling", "sexually longing", "clumsy, awkward", "sexually attractive", "soft-spoken"], answer: 1 },
    { id: 60, word: "uxorious husband", options: ["henpecked", "suspicious", "guilty of infidelity", "fondly and foolishly doting on his wife", "tightfisted, penny-pinching"], answer: 3 }
  ];

  const speedPart1Questions = [
    { colA: "sweet", colB: "sour", answer: "O" },
    { colA: "crazy", colB: "insane", answer: "S" },
    { colA: "stout", colB: "fat", answer: "S" },
    { colA: "big", colB: "angry", answer: "D" },
    { colA: "danger", colB: "peril", answer: "S" },
    { colA: "help", colB: "hinder", answer: "O" },
    { colA: "splendid", colB: "magnificent", answer: "S" },
    { colA: "love", colB: "hate", answer: "O" },
    { colA: "stand", colB: "rise", answer: "S" },
    { colA: "furious", colB: "violent", answer: "S" },
    { colA: "tree", colB: "apple", answer: "D" },
    { colA: "doubtful", colB: "certain", answer: "O" },
    { colA: "handsome", colB: "ugly", answer: "O" },
    { colA: "begin", colB: "start", answer: "S" },
    { colA: "strange", colB: "familiar", answer: "O" },
    { colA: "male", colB: "female", answer: "O" },
    { colA: "powerful", colB: "weak", answer: "O" },
    { colA: "beyond", colB: "under", answer: "D" },
    { colA: "live", colB: "die", answer: "O" },
    { colA: "go", colB: "get", answer: "D" },
    { colA: "return", colB: "replace", answer: "S" },
    { colA: "growl", colB: "weep", answer: "D" },
    { colA: "open", colB: "close", answer: "O" },
    { colA: "nest", colB: "home", answer: "S" },
    { colA: "chair", colB: "table", answer: "D" },
    { colA: "want", colB: "desire", answer: "S" },
    { colA: "can", colB: "container", answer: "S" },
    { colA: "idle", colB: "working", answer: "O" },
    { colA: "rich", colB: "luxurious", answer: "S" },
    { colA: "building", colB: "structure", answer: "S" }
  ];

  const MenuScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <BookOpen className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">English Vocabulary Test</h1>
            <p className="text-gray-600">Test your vocabulary range, speed, and responsiveness</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div 
              onClick={() => setCurrentTest('range')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform shadow-lg"
            >
              <Target className="w-12 h-12 mb-3" />
              <h2 className="text-xl font-bold mb-2">Vocabulary Range</h2>
              <p className="text-blue-100 text-sm mb-3">60 questions testing your word knowledge</p>
              <div className="text-xs bg-white/20 rounded px-2 py-1 inline-block">~15 minutes</div>
            </div>

            <div 
              onClick={() => setCurrentTest('speed')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform shadow-lg"
            >
              <Zap className="w-12 h-12 mb-3" />
              <h2 className="text-xl font-bold mb-2">Verbal Speed</h2>
              <p className="text-purple-100 text-sm mb-3">Two timed tests of quick thinking</p>
              <div className="text-xs bg-white/20 rounded px-2 py-1 inline-block">6 minutes total</div>
            </div>

            <div 
              onClick={() => setCurrentTest('responsiveness')}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform shadow-lg"
            >
              <CheckCircle className="w-12 h-12 mb-3" />
              <h2 className="text-xl font-bold mb-2">Verbal Responsiveness</h2>
              <p className="text-green-100 text-sm mb-3">Find synonyms and antonyms</p>
              <div className="text-xs bg-white/20 rounded px-2 py-1 inline-block">~10 minutes</div>
            </div>
          </div>
        </div>

        {(scores.range || scores.speed.part1 || scores.responsiveness) && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Award className="w-8 h-8 text-yellow-500" />
              Your Scores
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {scores.range !== null && (
                <div className="border-2 border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-700 mb-2">Vocabulary Range</h3>
                  <div className="text-3xl font-bold text-blue-600">{scores.range}/60</div>
                  <div className="text-sm text-gray-600 mt-2">{getRangeLevel(scores.range)}</div>
                </div>
              )}
              {scores.speed.part1 !== null && (
                <div className="border-2 border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-700 mb-2">Verbal Speed</h3>
                  <div className="text-3xl font-bold text-purple-600">{scores.speed.part1 + scores.speed.part2}</div>
                  <div className="text-sm text-gray-600 mt-2">{getSpeedLevel(scores.speed.part1 + scores.speed.part2)}</div>
                </div>
              )}
              {scores.responsiveness !== null && (
                <div className="border-2 border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-700 mb-2">Responsiveness</h3>
                  <div className="text-3xl font-bold text-green-600">{scores.responsiveness}/50</div>
                  <div className="text-sm text-gray-600 mt-2">{getResponsivenessLevel(scores.responsiveness)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const getRangeLevel = (score) => {
    if (score <= 11) return "Below Average";
    if (score <= 35) return "Average";
    if (score <= 48) return "Above Average";
    if (score <= 54) return "Excellent";
    return "Superior";
  };

  const getSpeedLevel = (score) => {
    if (score < 50) return "Below Average";
    if (score < 75) return "Average";
    if (score < 100) return "Above Average";
    if (score < 150) return "Excellent";
    return "Superior";
  };

  const getResponsivenessLevel = (score) => {
    if (score <= 10) return "Below Average";
    if (score <= 20) return "Average";
    if (score <= 30) return "Above Average";
    if (score <= 40) return "Excellent";
    return "Superior";
  };

  const RangeTest = () => {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const handleAnswer = (questionId, optionIndex) => {
      setAnswers({ ...answers, [questionId]: optionIndex });
    };

    const handleSubmit = () => {
      const correctCount = rangeQuestions.reduce((count, q) => {
        return count + (answers[q.id] === q.answer ? 1 : 0);
      }, 0);
      setScores({ ...scores, range: correctCount });
      setSubmitted(true);
    };

    if (submitted) {
      const correctCount = scores.range;
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Test Complete!</h2>
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-blue-600 mb-2">{correctCount}/60</div>
              <div className="text-2xl text-gray-700">{getRangeLevel(correctCount)}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Score Ranges:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>0-11: Below Average</div>
                <div>12-35: Average</div>
                <div>36-48: Above Average</div>
                <div>49-54: Excellent</div>
                <div>55-60: Superior</div>
              </div>
            </div>
            <button
              onClick={() => setCurrentTest('menu')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Return to Menu
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <button
                onClick={() => setCurrentTest('menu')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Menu
              </button>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">Vocabulary Range Test</h2>
            <p className="text-gray-600 mb-8">Select the closest definition for each italicized word.</p>

            <div className="space-y-6">
              {rangeQuestions.map((q, idx) => (
                <div key={q.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {idx + 1}. <span className="italic">{q.word}</span>
                  </h3>
                  <div className="space-y-2">
                    {q.options.map((option, optIdx) => (
                      <label key={optIdx} className="flex items-center gap-3 cursor-pointer hover:bg-blue-50 p-2 rounded">
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          checked={answers[q.id] === optIdx}
                          onChange={() => handleAnswer(q.id, optIdx)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700">{String.fromCharCode(97 + optIdx)}. {option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">
                  Answered: {Object.keys(answers).length}/60
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < 60}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  Submit Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SpeedTest = () => {
    const [part, setPart] = useState(1);
    const [part1Answers, setPart1Answers] = useState({});
    const [part2Words, setPart2Words] = useState("");
    const [timeLeft, setTimeLeft] = useState(180);
    const [isActive, setIsActive] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
      let interval;
      if (isActive && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft(time => time - 1);
        }, 1000);
      } else if (timeLeft === 0 && isActive) {
        handleTimeUp();
      }
      return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleTimeUp = () => {
      setIsActive(false);
      if (part === 1) {
        const correctCount = speedPart1Questions.reduce((count, q, idx) => {
          return count + (part1Answers[idx] === q.answer ? 1 : 0);
        }, 0);
        
        let part1Score = 25;
        if (correctCount >= 11 && correctCount <= 20) part1Score = 50;
        else if (correctCount >= 21 && correctCount <= 25) part1Score = 75;
        else if (correctCount >= 26) part1Score = 100;
        
        setScores(prev => ({ ...prev, speed: { ...prev.speed, part1: part1Score } }));
        setPart(2);
        setTimeLeft(180);
      } else {
        const wordList = part2Words.trim().split(/\s+/).filter(w => w.startsWith('d') || w.startsWith('D'));
        const uniqueWords = [...new Set(wordList.map(w => w.toLowerCase()))];
        
        let part2Score = 25;
        if (uniqueWords.length >= 31 && uniqueWords.length <= 50) part2Score = 50;
        else if (uniqueWords.length >= 51 && uniqueWords.length <= 70) part2Score = 75;
        else if (uniqueWords.length >= 71) part2Score = 100;
        
        setScores(prev => ({ ...prev, speed: { ...prev.speed, part2: part2Score } }));
        setSubmitted(true);
      }
    };

    const startTest = () => {
      setIsActive(true);
    };

    if (submitted) {
      const totalScore = scores.speed.part1 + scores.speed.part2;
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Speed Test Complete!</h2>
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-purple-600 mb-2">{totalScore}</div>
              <div className="text-2xl text-gray-700">{getSpeedLevel(totalScore)}</div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Part 1 Score</h3>
                <div className="text-3xl font-bold text-purple-600">{scores.speed.part1}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Part 2 Score</h3>
                <div className="text-3xl font-bold text-purple-600">{scores.speed.part2}</div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Score Ranges:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>50: Below Average</div>
                <div>75: Average</div>
                <div>100: Above Average</div>
                <div>125-150: Excellent</div>
                <div>175-200: Superior</div>
              </div>
            </div>
            <button
              onClick={() => setCurrentTest('menu')}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Return to Menu
            </button>
          </div>
        </div>
      );
    }

    if (part === 1) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <button
                onClick={() => setCurrentTest('menu')}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                ← Back to Menu
              </button>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">Verbal Speed Test - Part 1</h2>
            <p className="text-gray-600 mb-6">Decide if words are Same, Opposite, or Different (3 minutes)</p>

            <div className="bg-purple-50 rounded-lg p-6 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-3xl font-bold text-purple-600">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
                  <div className="text-sm text-gray-600">Time Remaining</div>
                </div>
              </div>
              {!isActive && (
                <button
                  onClick={startTest}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Start Timer
                </button>
              )}
            </div>

            {isActive && (
              <div className="space-y-4">
                {speedPart1Questions.map((q, idx) => (
                  <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex gap-8 items-center flex-1">
                      <span className="font-mono text-gray-500 w-8">{idx + 1}.</span>
                      <span className="font-semibold text-gray-800 w-32">{q.colA}</span>
                      <span className="font-semibold text-gray-800 w-32">{q.colB}</span>
                    </div>
                    <div className="flex gap-2">
                      {['S', 'O', 'D'].map(option => (
                        <button
                          key={option}
                          onClick={() => setPart1Answers({ ...part1Answers, [idx]: option })}
                          className={`w-12 h-12 rounded-lg font-bold transition-all ${
                            part1Answers[idx] === option
                              ? 'bg-purple-600 text-white scale-110'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isActive && (
              <div className="text-center text-gray-500 py-12">
                Click "Start Timer" to begin the test
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Verbal Speed Test - Part 2</h2>
          <p className="text-gray-600 mb-6">Write as many words starting with 'D' as you can (3 minutes)</p>

          <div className="bg-purple-50 rounded-lg p-6 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-3xl font-bold text-purple-600">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
                <div className="text-sm text-gray-600">Time Remaining</div>
              </div>
            </div>
            {!isActive && (
              <button
                onClick={startTest}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Start Timer
              </button>
            )}
          </div>

          {isActive && (
            <div>
              <textarea
                value={part2Words}
                onChange={(e) => setPart2Words(e.target.value)}
                placeholder="Type words starting with D, separated by spaces or new lines..."
                className="w-full h-96 p-4 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none font-mono"
              />
              <div className="mt-4 text-gray-600">
                Words entered: {part2Words.trim().split(/\s+/).filter(w => w.startsWith('d') || w.startsWith('D')).length}
              </div>
            </div>
          )}

          {!isActive && (
            <div className="text-center text-gray-500 py-12">
              Click "Start Timer" to begin the test
            </div>
          )}
        </div>
      </div>
    );
  };

  const ResponsivenessTest = () => {
    const [part, setPart] = useState(1);
    const [part1Answers, setPart1Answers] = useState({});
    const [part2Answers, setPart2Answers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const part1Questions = [
      { word: "bucket", hint: "pail, pan" },
      { word: "trousers", hint: "pants" },
      { word: "maybe", hint: "perhaps, possibly, probably" },
      { word: "forgive", hint: "pardon" },
      { word: "separate", hint: "part" },
      { word: "likely", hint: "probable, possible, perhaps" },
      { word: "annoy", hint: "pester" },
      { word: "good-looking", hint: "pretty" },
      { word: "picture", hint: "photograph, painting" },
      { word: "choose", hint: "pick" },
      { word: "ugly", hint: "plain" },
      { word: "go", hint: "proceed" },
      { word: "dish", hint: "plate, platter" },
      { word: "location", hint: "place" },
      { word: "stone", hint: "pebble" },
      { word: "inactive", hint: "passive" },
      { word: "fussy", hint: "particular, picky" },
      { word: "suffering", hint: "pain" },
      { word: "castle", hint: "palace" },
      { word: "gasp", hint: "pant, puff" },
      { word: "fear", hint: "panic" },
      { word: "twosome", hint: "pair" },
      { word: "artist", hint: "painter" },
      { word: "sheet", hint: "page" },
      { word: "collection", hint: "pack" }
    ];

    const part2Questions = [
      { word: "lose", hint: "gain, get, garner, grab, glean, grasp, grip" },
      { word: "midget", hint: "giant, gigantic, great, gross" },
      { word: "special", hint: "general" },
      { word: "lady", hint: "gentleman" },
      { word: "take", hint: "give" },
      { word: "moron", hint: "genius" },
      { word: "sad", hint: "glad, gleeful, gleesome" },
      { word: "boy", hint: "girl" },
      { word: "happy", hint: "gloomy, glum, grieving, grumpy" },
      { word: "plain", hint: "gaudy, grand, grandiose" },
      { word: "hello", hint: "goodbye" },
      { word: "here", hint: "gone" },
      { word: "bad", hint: "good" },
      { word: "ugly", hint: "good-looking" },
      { word: "stingy", hint: "generous, giving" },
      { word: "awkward", hint: "graceful" },
      { word: "little", hint: "great, giant, gigantic" },
      { word: "rough", hint: "gentle" },
      { word: "bride", hint: "groom" },
      { word: "ripe", hint: "green" },
      { word: "unwanting", hint: "greedy, grasping" },
      { word: "unprotected", hint: "guarded" },
      { word: "experienced", hint: "green" },
      { word: "scarcity", hint: "glut, gobs" },
      { word: "unappreciative", hint: "grateful" }
    ];

    const checkAnswer = (userAnswer, correctAnswers) => {
      const answers = correctAnswers.toLowerCase().split(',').map(a => a.trim());
      return answers.some(answer => userAnswer.toLowerCase().trim() === answer);
    };

    const handleSubmit = () => {
      let correctCount = 0;
      
      part1Questions.forEach((q, idx) => {
        if (part1Answers[idx] && checkAnswer(part1Answers[idx], q.hint)) {
          correctCount++;
        }
      });
      
      part2Questions.forEach((q, idx) => {
        if (part2Answers[idx] && checkAnswer(part2Answers[idx], q.hint)) {
          correctCount++;
        }
      });
      
      setScores({ ...scores, responsiveness: correctCount });
      setSubmitted(true);
    };

    if (submitted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Test Complete!</h2>
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-green-600 mb-2">{scores.responsiveness}/50</div>
              <div className="text-2xl text-gray-700">{getResponsivenessLevel(scores.responsiveness)}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Score Ranges:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>0-10: Below Average</div>
                <div>11-20: Average</div>
                <div>21-30: Above Average</div>
                <div>31-40: Excellent</div>
                <div>41-50: Superior</div>
              </div>
            </div>
            <button
              onClick={() => setCurrentTest('menu')}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Return to Menu
            </button>
          </div>
        </div>
      );
    }

    if (part === 1) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <button
                onClick={() => setCurrentTest('menu')}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                ← Back to Menu
              </button>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">Verbal Responsiveness - Part 1</h2>
            <p className="text-gray-600 mb-6">Write a word starting with 'P' that means the same as the given word</p>

            <div className="space-y-4">
              {part1Questions.map((q, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-gray-500 w-8">{idx + 1}.</span>
                    <span className="font-semibold text-gray-800 w-48">{q.word}</span>
                    <input
                      type="text"
                      value={part1Answers[idx] || ''}
                      onChange={(e) => setPart1Answers({ ...part1Answers, [idx]: e.target.value })}
                      placeholder="Type a word starting with P..."
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg flex justify-between items-center">
              <span className="text-gray-600">
                Answered: {Object.keys(part1Answers).filter(k => part1Answers[k]?.trim()).length}/25
              </span>
              <button
                onClick={() => setPart(2)}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Continue to Part 2
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Verbal Responsiveness - Part 2</h2>
          <p className="text-gray-600 mb-6">Write a word starting with 'G' that is opposite to the given word</p>

          <div className="space-y-4">
            {part2Questions.map((q, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-gray-500 w-8">{idx + 1}.</span>
                  <span className="font-semibold text-gray-800 w-48">{q.word}</span>
                  <input
                    type="text"
                    value={part2Answers[idx] || ''}
                    onChange={(e) => setPart2Answers({ ...part2Answers, [idx]: e.target.value })}
                    placeholder="Type a word starting with G..."
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg flex justify-between items-center">
            <button
              onClick={() => setPart(1)}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              ← Back to Part 1
            </button>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Total Answered: {Object.keys(part1Answers).filter(k => part1Answers[k]?.trim()).length + Object.keys(part2Answers).filter(k => part2Answers[k]?.trim()).length}/50
              </span>
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {currentTest === 'menu' && <MenuScreen />}
      {currentTest === 'range' && <RangeTest />}
      {currentTest === 'speed' && <SpeedTest />}
      {currentTest === 'responsiveness' && <ResponsivenessTest />}
    </div>
  );
};

export default VocabularyTestApp;