
import { ChildProfile } from '../types';

// Helper to pick a random item from an array
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Praise messages for when the child is focused and on seat
const focusedPraises = [
  '{nickname}，你现在超级专注，太棒了！',
  '做得真好，{nickname}！继续保持这个状态哦。',
  '哇，坐得真端正，就像一个小科学家在做研究！',
  '看到你这么认真，我真为你高兴！',
  '这个学习状态太好了，给你点个大大的赞！',
  '{nickname}，你专心做作业的样子真有魅力！',
  '太投入啦，继续加油，胜利就在前方！',
  '保持住，你离完成目标又近了一步！',
];

// Reminders for when the child is on seat but not focused
const notFocusedReminders = [
  '{nickname}，是不是遇到难题了？别着急，慢慢来。',
  '有点分心咯，我们把注意力拉回来好不好？',
  '嘿，{nickname}，作业还在等你呢，我们继续吧！',
  '休息一下眼睛，看看远方，然后我们继续努力！',
  '是铅笔不好玩了，还是作业更有趣？快回来吧！',
  '一个小小的提醒，我们该专心学习啦！',
  '加油，{nickname}！集中精神，很快就能完成啦。',
  '感觉你有点累了，要不要坐直一点，深呼吸一下？',
];

// Reminders for when the child is not on their seat
const notOnSeatReminders = [
  '咦，{nickname}去哪里了？快回到座位上吧！',
  '小英雄，你的战场在这里哦，快回来继续战斗吧！',
  '座位在想你啦，{nickname}，我们该回来了。',
  '是不是去探险了？探险结束，要回来学习咯！',
  '时间宝贵，快回来吧，{nickname}！',
];

export const getReminder = (
  profile: ChildProfile,
  isFocused: boolean,
  isOnSeat: boolean
): string => {
  let template: string;

  if (isOnSeat) {
    if (isFocused) {
      template = pickRandom(focusedPraises);
    } else {
      template = pickRandom(notFocusedReminders);
    }
  } else {
    template = pickRandom(notOnSeatReminders);
  }

  return template.replace('{nickname}', profile.nickname);
};
