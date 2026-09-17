import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        home: resolve('index.html'),
        tools: resolve('tool/index.html'),
        notes: resolve('note/index.html'),
        bottomToTop: resolve('idea/design_bottom_to_top/index.html'),
        fuwafuwa: resolve('idea/design_fuwafuwa/index.html'),
        neko: resolve('idea/design_neko/index.html'),
        terminal: resolve('idea/design_terminal/index.html'),
        videoCompressor: resolve('tool/video_compressor/index.html'),
        imageAudioToVideo: resolve('tool/image_audio_to_video/index.html'),
        imageConverter: resolve('tool/image_converter/index.html'),
        obs: resolve('tool/obs/index.html'),
        obsClock: resolve('tool/obs/widgets/clock/index.html'),
        obsCounter: resolve('tool/obs/widgets/counter/index.html'),
        obsTimer: resolve('tool/obs/widgets/timer/index.html'),
        obsMemo: resolve('tool/obs/widgets/memo/index.html'),
        obsSchedule: resolve('tool/obs/widgets/schedule/index.html'),
        obsComment: resolve('tool/obs/widgets/comment/index.html'),
        obsCounterConfig: resolve('tool/obs/widgets/counter/desigh_1/index.html'),
        obsTimerConfig: resolve('tool/obs/widgets/timer/desigh_1/index.html'),
        obsCounterConfig2: resolve('tool/obs/widgets/counter/desigh_2/index.html'),
        obsTimerConfig2: resolve('tool/obs/widgets/timer/desigh_2/index.html'),
        obsMemoConfig: resolve('tool/obs/widgets/memo/desigh_1/index.html'),
        obsMemoConfig2: resolve('tool/obs/widgets/memo/desigh_2/index.html'),
        obsClockConfig: resolve('tool/obs/widgets/clock/desigh_1/index.html'),
        obsClockConfig2: resolve('tool/obs/widgets/clock/desigh_2/index.html'),
        obsClockConfig3: resolve('tool/obs/widgets/clock/desigh_3/index.html'),
        obsScheduleConfig: resolve('tool/obs/widgets/schedule/desigh_1/index.html'),
        obsScheduleConfig2: resolve('tool/obs/widgets/schedule/desigh_2/index.html'),
        obsCommentConfig: resolve('tool/obs/widgets/comment/design_1/index.html'),
      },
    },
  },
});
