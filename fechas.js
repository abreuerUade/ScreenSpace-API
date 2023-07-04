const duration = 120;
const ONE_DAY = 1000 * 60 * 60 * 24;
const cleaningTime = 30;
const startTime = new Date('2023-03-21 12:00:00Z');
const finishTime = new Date(startTime).setMinutes(
    startTime.getMinutes() + duration + cleaningTime
);
console.log(startTime, new Date(startTime.getTime() + ONE_DAY));
