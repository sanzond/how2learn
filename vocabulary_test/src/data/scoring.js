// 评分等级配置
export const getRangeLevel = (score) => {
  if (score <= 11) return "Below Average";
  if (score <= 35) return "Average";
  if (score <= 48) return "Above Average";
  if (score <= 54) return "Excellent";
  return "Superior";
};

export const getSpeedLevel = (score) => {
  if (score < 50) return "Below Average";
  if (score < 75) return "Average";
  if (score < 100) return "Above Average";
  if (score < 150) return "Excellent";
  return "Superior";
};

export const getResponsivenessLevel = (score) => {
  if (score <= 15) return "Below Average";
  if (score <= 30) return "Average";
  if (score <= 40) return "Above Average";
  if (score <= 45) return "Excellent";
  return "Superior";
};

// 测试配置常量
export const TEST_CONFIG = {
  RANGE: {
    totalQuestions: 60,
    timeLimit: 15 * 60, // 15分钟
    description: "60 questions testing your word knowledge"
  },
  SPEED: {
    part1Questions: 30,
    part2Questions: 30,
    timeLimit: 3 * 60, // 3分钟每部分
    description: "Two timed tests of quick thinking"
  },
  RESPONSIVENESS: {
    totalQuestions: 50,
    timeLimit: 10 * 60, // 10分钟
    description: "Find synonyms and antonyms"
  }
};