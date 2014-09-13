module.exports = [
    { name: 'shape', shy: false, value: [50, 50] },
    { name: 'position', keyframes: [
        { time: 0, value: [0, 0] },
        { time: 2, value: [100, 100], ease: 'bounceOut' },
        { time: 4, value: [0, 100], ease: 'expoOut' }
    ] },
    { name: 'alpha', value: 0.75 },
    { name: 'fill', keyframes: [
        { time: 2, value: [100, 189, 100] },
        { time: 3, value: [255, 189, 120], ease: 'expoOut' }
    ] },
]