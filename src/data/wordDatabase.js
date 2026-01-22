// 1-19 레벨: 1단어
export const wordDatabase = [
  { word: 'apple', category: 'Fruits' },
  { word: 'pizza', category: 'Meals' },
  { word: 'cake', category: 'Desserts' },
  { word: 'coffee', category: 'Drinks' },
  { word: 'honey', category: 'Ingredients' },
  { word: 'cat', category: 'Pets' },
  { word: 'lion', category: 'Wild Animals' },
  { word: 'shark', category: 'Marine Life' },
  { word: 'eagle', category: 'Birds' },
  { word: 'ant', category: 'Nature' }
];

// 20-99 레벨: 2단어 (형용사 없이 두 단어 모두 카테고리에 부합)
export const twoWordDatabase = [
  // Pets: 두 마리의 반려동물 조합
  { word: 'cat dog', category: 'Pets' },
  { word: 'hamster rabbit', category: 'Pets' },
  { word: 'puppy kitten', category: 'Pets' },
  
  // Wild Animals: 두 마리의 야생동물 조합
  { word: 'lion tiger', category: 'Wild Animals' },
  { word: 'bear wolf', category: 'Wild Animals' },
  { word: 'zebra giraffe', category: 'Wild Animals' },
  { word: 'panda monkey', category: 'Wild Animals' },

  // Marine Life: 두 마리의 바다생물 조합
  { word: 'whale shark', category: 'Marine Life' },
  { word: 'dolphin turtle', category: 'Marine Life' },
  { word: 'crab shrimp', category: 'Marine Life' },

  // Fruits: 두 가지 과일 조합
  { word: 'apple banana', category: 'Fruits' },
  { word: 'grape orange', category: 'Fruits' },
  { word: 'mango melon', category: 'Fruits' },

  // Meals: 두 가지 음식 조합
  { word: 'pizza burger', category: 'Meals' },
  { word: 'steak pasta', category: 'Meals' },
  { word: 'sushi noodle', category: 'Meals' }
];

// 100-200 레벨: 3단어 (세 단어 모두 해당 카테고리 명사)
export const threeWordDatabase = [
  { word: 'lion tiger bear', category: 'Wild Animals' },
  { word: 'cat dog rabbit', category: 'Pets' },
  { word: 'apple banana grape', category: 'Fruits' },
  { word: 'shark whale dolphin', category: 'Marine Life' },
  { word: 'eagle owl parrot', category: 'Birds' },
  { word: 'pizza burger steak', category: 'Meals' },
  { word: 'coffee juice water', category: 'Drinks' }
];
