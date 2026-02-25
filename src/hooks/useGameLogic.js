import { useState, useEffect, useCallback } from 'react';

// 한글 자모 분리 로직이 필요하다면 여기에 import (영어 게임이면 불필요)

export const useGameLogic = (playSound, level, score, setScore, showMessage) => {
  // 상태 관리
  const [currentWord, setCurrentWord] = useState('');      // 현재 입력된 단어 (문자열)
  const [selectedLetters, setSelectedLetters] = useState([]); // 입력된 글자들의 이력 (위치 정보 포함)
  const [scrambledLetters, setScrambledLetters] = useState([]); // 섞인 글자 버튼들
  const [solvedWords, setSolvedWords] = useState([]);      // 맞춘 단어 목록
  
  // 게임 데이터 (예시)
  const [category, setCategory] = useState('Animals');
  const [wordType, setWordType] = useState('NORMAL');
  const [targetWord, setTargetWord] = useState('CAT'); // 실제 정답
  
  // 힌트 관련
  const [hintStage, setHintStage] = useState(0);
  const [hintMessage, setHintMessage] = useState('');

  // 정답 여부
  const [isCorrect, setIsCorrect] = useState(false);

  // 레벨 초기화 (단어 설정 및 셔플)
  useEffect(() => {
    // 실제 게임에서는 레벨별 단어 데이터를 가져오는 로직이 들어갑니다.
    // 여기서는 예시로 간단히 처리합니다.
    const words = ["APPLE", "BANANA", "CHERRY", "GRAPE", "LEMON"];
    const newWord = words[(level - 1) % words.length] || "REACT";
    
    setTargetWord(newWord);
    setCategory("FRUIT"); // 예시 카테고리
    
    // 단어 섞기
    const chars = newWord.split('').map((char, index) => ({
      char,
      id: index, // 고유 ID
      isUsed: false // 사용 여부
    }));
    
    // 셔플 알고리즘
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    
    setScrambledLetters(chars);
    setCurrentWord('');
    setSelectedLetters([]);
    setSolvedWords([]);
    setIsCorrect(false);
    setHintStage(0);
    setHintMessage('');
  }, [level]);

  // ▼▼▼ [핵심 수정 1] 글자 클릭 시 위치(index)도 함께 저장 ▼▼▼
  const handleLetterClick = (char, index) => {
    playSound('click'); // 효과음

    // 1. 입력된 단어에 추가
    const newWord = currentWord + char;
    setCurrentWord(newWord);

    // 2. 이력 스택에 {글자, 원래위치} 저장
    setSelectedLetters((prev) => [...prev, { char, index }]);

    // 3. 해당 위치의 버튼을 '사용됨(isUsed)'으로 변경
    setScrambledLetters((prev) => {
      const newArr = [...prev];
      if (newArr[index]) {
        newArr[index].isUsed = true;
      }
      return newArr;
    });

    // 정답 체크 (자동 제출)
    if (newWord.length === targetWord.length) {
      if (newWord === targetWord) {
        setIsCorrect(true);
        playSound('success');
        showMessage('Correct!');
      } else {
        playSound('error');
        showMessage('Wrong!');
        // 틀렸을 때 흔들림 효과 등을 줄 수 있음
      }
    }
  };

  // ▼▼▼ [핵심 수정 2] Backspace: 마지막 버튼을 다시 살려냄 ▼▼▼
  const handleBackspace = () => {
    if (selectedLetters.length === 0) return; // 지울 게 없으면 중단

    playSound('click');

    // 1. 마지막 입력 정보 가져오기 (글자와 인덱스)
    const lastEntry = selectedLetters[selectedLetters.length - 1];

    // 2. 입력된 단어에서 마지막 글자 삭제
    setCurrentWord((prev) => prev.slice(0, -1));

    // 3. 이력 스택에서 제거
    setSelectedLetters((prev) => prev.slice(0, -1));

    // 4. 원래 위치의 버튼을 '사용가능(isUsed: false)'으로 복구
    setScrambledLetters((prev) => {
      const newArr = [...prev];
      // 저장해둔 index를 사용하여 정확히 그 버튼을 찾아 복구
      if (newArr[lastEntry.index]) {
        newArr[lastEntry.index].isUsed = false;
      }
      return newArr;
    });
  };

  // 초기화 (Reset)
  const handleReset = () => {
    playSound('click');
    setCurrentWord('');
    setSelectedLetters([]);
    setScrambledLetters((prev) => prev.map(item => ({ ...item, isUsed: false })));
  };

  // 셔플 (Shuffle)
  const handleShuffle = () => {
    playSound('shuffle');
    // 사용되지 않은 글자들만 섞기 (또는 전체 섞기 후 상태 유지)
    // 여기서는 간단히 전체 재배열하되 isUsed 상태는 유지
    setScrambledLetters((prev) => {
      const newArr = [...prev];
      // 셔플 로직 (피셔-예이츠)
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      
      // ⚠️ 주의: 셔플을 하면 인덱스가 섞이므로, 
      // 이미 입력된 글자(selectedLetters)의 index 정보가 꼬일 수 있습니다.
      // 완벽한 구현을 위해서는 selectedLetters에 index 대신 고유 ID를 저장하고 
      // ID로 찾는 방식을 써야 하지만, 
      // 간단하게는 "입력 중에는 셔플 불가" 또는 "셔플 시 입력 초기화"를 추천합니다.
      
      // 여기서는 셔플 시 입력을 초기화해버리는 게 가장 안전합니다.
      if (currentWord.length > 0) {
        setCurrentWord('');
        setSelectedLetters([]);
        return newArr.map(item => ({ ...item, isUsed: false }));
      }
      
      return newArr;
    });
  };

  // 힌트 (Hint)
  const handleHint = () => {
    // (기존 힌트 로직 유지...)
    // ...
  };

  return {
    currentWord,
    setCurrentWord, // 필요시 노출
    scrambledLetters,
    solvedWords,
    setSolvedWords,
    category,
    wordType,
    hintStage,
    hintMessage,
    isCorrect,
    handleLetterClick,
    handleBackspace,
    handleReset,
    handleShuffle,
    handleHint
  };
};
