const duration = 120;
const cleaningTime = 30;
const startTime = new Date('2023-03-21 12:00:00Z');
const finishTime = new Date(startTime).setMinutes(
    startTime.getMinutes() + duration + cleaningTime
);
console.log(startTime.toISOString().slice(0, 10));
