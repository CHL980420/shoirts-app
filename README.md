# YouTube Shorts Generator

로고 & 연락처가 자동으로 들어가는 YouTube Shorts 영상 생성기

## 기능

- 이미지 또는 비디오 파일을 YouTube Shorts 형식(1080x1920)으로 변환
- 4가지 배경음악 중 선택 가능
- 로고와 연락처 정보 자동 오버레이
- FFmpeg 기반 고품질 영상 처리

## 사전 요구사항

- [Node.js](https://nodejs.org/) v18 이상
- [FFmpeg](https://ffmpeg.org/) 설치 필요

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 모드 실행 (React만)
npm run dev

# Electron 개발 모드 실행
npm run electron:dev

# 프로덕션 빌드
npm run electron:build
```

## 에셋 설정

`assets/` 폴더에 다음 파일을 추가하세요:

- `logo.png` - 영상 상단에 표시될 로고 이미지
- `music/` - 배경음악 MP3 파일 4개:
  - `allmedia2024-calm-jazz-220610.mp3`
  - `krasnoshchok-background-music-soft-calm-404429.mp3`
  - `hitslab-calm-calm-soft-music-334182.mp3`
  - `andriig-calm-nature-music-471361.mp3`

## 기술 스택

- React 18 + Vite
- Tailwind CSS
- Electron
- FFmpeg (영상 처리)
- Lucide React (아이콘)
