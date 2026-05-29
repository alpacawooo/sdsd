# Korean Music Context Studio

Local web dashboard for producing context-first Korean music reels and shorts for global listeners.

The app helps a curator prepare:

- artist / producer / song project briefs
- source links and core context
- English scripts in the `Hook -> Context -> Meaning Bridge -> Song Moment -> Closing Line` format
- lyric translation notes
- caption and hashtag drafts
- structured JSON packages that can later be used with OpenCut or Remotion

## Run Locally

```bash
cd "/Users/woojinyoung/Documents/아티스트 ,프로듀서는 무슨 생각으로 음악을 만들까/web_dashboard"
python3 -m http.server 8123
```

Open:

```text
http://localhost:8123
```

## Project Model

Each project is designed to be reusable across different artists, producers, and songs.

Core fields:

- `projectTitle`
- `artist`
- `producer`
- `songTitle`
- `sourceLinks`
- `coreContext`
- `script`
- `lyricTranslation`
- `videoSource`
- `caption`
- `exportStatus`
- `timelineSections`

Data is stored in `localStorage` under:

```text
koreanMusicContextStudio.projects.v1
```

## Editing Workflow

The dashboard is built around this production flow:

1. 곡 선정
2. 자료 조사
3. 핵심 맥락 정리
4. 영어 스크립트 작성
5. 가사 번역
6. 영상 소스 준비
7. 편집 템플릿 선택
8. 릴스/쇼츠 출력
9. 캡션/해시태그 작성
10. 업로드 후 반응 기록

## OpenCut and Remotion

OpenCut is treated as the main manual timeline editor, replacing CapCut in the workflow.

This dashboard does not try to become a full video editor. Its job is to package pre-production material for editing:

- timeline sections
- subtitle lines
- source video/audio notes
- lyric translation
- captions
- source credits

Remotion remains a future option for repeatable branded template rendering.

## GitHub Notes

Do not commit `github_references/`. Those repositories are local reference material only.

Do not commit rendered video exports from `reel_template/exports/`.
