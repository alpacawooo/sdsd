const STORAGE_KEY = "koreanMusicContextStudio.projects.v1";

const WORKFLOW = [
  ["곡 선정", "해외 팬이 궁금해할 한국 곡을 고르고 설명할 가치가 있는 이유를 한 줄로 적는다."],
  ["자료 조사", "앨범 소개, 인터뷰, 라이브 멘트, 프로듀서 코멘트에서 곡의 출발점을 찾는다."],
  ["핵심 맥락", "자료를 하나의 이미지나 문장으로 압축한다. 이 문장이 영상의 중심축이다."],
  ["영어 스크립트", "Hook, Context, Meaning Bridge, Song Moment, Closing Line으로 45초 원고를 쓴다."],
  ["가사 번역", "전체 번역보다 감정이 가장 잘 살아나는 5-12초 구간을 고른다."],
  ["영상 소스 준비", "MV, 라이브, 직접 촬영, 생성 배경 중 OpenCut에 넘길 재료를 정리한다."],
  ["편집 템플릿", "OpenCut 수동 편집 또는 Remotion 반복 렌더 중 이번 영상에 맞는 방식을 고른다."],
  ["릴스 출력", "모바일 UI와 겹치지 않게 자막 위치를 확인하고 1080x1920으로 내보낸다."],
  ["캡션 작성", "출처, 번역 크레딧, 해시태그, 한 줄 감상 포인트를 붙인다."],
  ["반응 기록", "조회수보다 저장, 공유, 댓글에서 다음 곡 선정 힌트를 찾는다."]
];

const TOOLS = [
  ["OpenCut", "Manual Edit", "CapCut 대신 쓰는 수동 타임라인 편집기. 이 앱은 OpenCut에 넘길 자료 패키지를 준비한다."],
  ["Remotion", "Template Render", "반복 가능한 브랜드 템플릿과 자동 렌더 버튼을 붙일 때 사용한다."],
  ["MoviePy", "Source Prep", "원본에서 필요한 구간을 자르고 오디오와 배경 영상을 손질한다."],
  ["PupCaps", "Caption Style", "가사 번역과 핵심 단어를 쇼츠식 자막으로 강조할 때 참고한다."],
  ["editly", "Fast Prototype", "JSON 기반 컷 구조를 빠르게 시험하는 프로토타입 참고 자료다."],
  ["ai-video-generator", "Pipeline Map", "script, subtitle, metadata 생성 구조를 참고해 자동화 설계를 잡는다."],
  ["Short-Video-Creator", "Folder System", "곡별 입력/출력 폴더 구조를 참고한다."],
  ["yt-dlp", "Research Helper", "허가된 자료나 분석용 영상 메타데이터 확인에만 조심해서 쓴다."]
];

const SCRIPT_KEYS = [
  ["hook", "Hook"],
  ["context", "Context"],
  ["meaningBridge", "Meaning Bridge"],
  ["songMoment", "Song Moment"],
  ["closingLine", "Closing Line"]
];

const sampleProjects = [
  {
    id: "sample-hanroro-ibchun",
    projectTitle: "Hanroro - Ibchun context reel",
    artist: "Hanroro",
    producer: "Hanroro / track credits to verify",
    songTitle: "Ibchun",
    audience: "Global K-pop and Korean indie listeners",
    exportStatus: "Scripting",
    coreContext:
      "A tiny sprout pushing through hard asphalt. The song's spring is not just warmth, but proof that something survived.",
    videoSource:
      "Use clean MV/live/owned footage for final edit. The current screen-recorded reference is only for format testing.",
    sourceLinks:
      "Album note or official description to verify\nArtist interview or live comment to verify\nOfficial music video / platform audio source",
    lyricTranslation:
      "To me, barely lifting my head,\nit offers the first greeting of spring.",
    caption:
      "Before you listen to Hanroro's 'Ibchun,' know this: the spring in this song is less about warmth and more about surviving long enough to bloom.",
    hashtags: "#koreanmusic #koreanindie #klyrics #musicoftheday #hanroro",
    script: {
      hook:
        "Before you listen to Hanroro's 'Ibchun,' you need to know the image behind it.",
      context:
        "A tiny sprout pushing through hard asphalt. That fragile image is where the song begins.",
      meaningBridge:
        "So the spring in this song isn't just a warm season. It's proof that something survived.",
      songMoment:
        "To me, barely lifting my head, it offers the first greeting of spring.",
      closingLine:
        "Knowing that, 'Ibchun' feels less like spring arriving, and more like someone quietly choosing to bloom."
    },
    timelineSections: [
      { label: "Hook", start: 0, end: 3, purpose: "Stop the scroll with a clear question." },
      { label: "Context", start: 3, end: 12, purpose: "Show the image or thought behind the song." },
      { label: "Meaning Bridge", start: 12, end: 22, purpose: "Translate context into emotion." },
      { label: "Song Moment", start: 22, end: 38, purpose: "Let the lyric land after the context." },
      { label: "Closing Line", start: 38, end: 45, purpose: "Leave one sentence viewers remember." }
    ]
  }
];

let projects = loadProjects();
let activeProjectId = projects[0]?.id;

const selectors = {
  currentTitle: document.querySelector("#currentTitle"),
  projectList: document.querySelector("#projectList"),
  newProjectForm: document.querySelector("#newProjectForm"),
  workflowList: document.querySelector("#workflowList"),
  toolsGrid: document.querySelector("#toolsGrid"),
  briefForm: document.querySelector("#briefForm"),
  scriptEditor: document.querySelector("#scriptEditor"),
  scriptOutput: document.querySelector("#scriptOutput"),
  packageOutput: document.querySelector("#packageOutput"),
  previewSong: document.querySelector("#previewSong"),
  previewHook: document.querySelector("#previewHook"),
  previewBridge: document.querySelector("#previewBridge")
};

function loadProjects() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(stored) && stored.length) {
      return stored;
    }
  } catch (error) {
    console.warn("Could not parse stored projects.", error);
  }
  return structuredClone(sampleProjects);
}

function persistProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects, null, 2));
}

function activeProject() {
  return projects.find((project) => project.id === activeProjectId) || projects[0];
}

function projectPackage(project) {
  return {
    projectTitle: project.projectTitle,
    artist: project.artist,
    producer: project.producer,
    songTitle: project.songTitle,
    exportStatus: project.exportStatus,
    sourceVideoAudioNotes: project.videoSource,
    timelineSections: project.timelineSections,
    subtitleLines: SCRIPT_KEYS.map(([key, label]) => ({
      label,
      text: project.script[key]
    })),
    lyricTranslation: project.lyricTranslation,
    caption: project.caption,
    sourceCredits: project.sourceLinks
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    hashtags: project.hashtags
  };
}

function renderWorkflow() {
  selectors.workflowList.innerHTML = "";
  const project = activeProject();
  WORKFLOW.forEach(([title, body], index) => {
    const item = document.createElement("article");
    item.className = "step";
    item.innerHTML = `
      <span>${index + 1}</span>
      <h4>${title}</h4>
      <p>${body}</p>
      <label class="checkline">
        <input type="checkbox" ${index < statusProgress(project.exportStatus) ? "checked" : ""} />
        done
      </label>
    `;
    selectors.workflowList.appendChild(item);
  });
}

function statusProgress(status) {
  const progressMap = {
    Idea: 1,
    Researching: 3,
    Scripting: 5,
    "Ready for OpenCut": 7,
    Rendered: 8,
    Published: 10
  };
  return progressMap[status] || 1;
}

function renderTools() {
  selectors.toolsGrid.innerHTML = "";
  TOOLS.forEach(([name, tag, body]) => {
    const item = document.createElement("article");
    item.className = "tool-card";
    item.innerHTML = `<div class="tag">${tag}</div><h4>${name}</h4><p>${body}</p>`;
    selectors.toolsGrid.appendChild(item);
  });
}

function renderProjectList() {
  selectors.projectList.innerHTML = "";
  projects.forEach((project) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `project-item ${project.id === activeProjectId ? "selected" : ""}`;
    button.innerHTML = `
      <strong>${project.songTitle || "Untitled song"}</strong>
      <span>${project.artist || "Unknown artist"} · ${project.exportStatus || "Idea"}</span>
    `;
    button.addEventListener("click", () => {
      activeProjectId = project.id;
      renderAll();
    });
    selectors.projectList.appendChild(button);
  });
}

function renderBrief(project) {
  selectors.currentTitle.textContent = project.projectTitle || `${project.artist} - ${project.songTitle}`;
  document.querySelectorAll("[data-field]").forEach((field) => {
    const key = field.dataset.field;
    field.value = project[key] || "";
  });
}

function renderScript(project) {
  selectors.scriptEditor.innerHTML = "";
  SCRIPT_KEYS.forEach(([key, label]) => {
    const row = document.createElement("label");
    row.className = "script-row";
    row.innerHTML = `
      <span>${label}</span>
      <textarea data-script="${key}">${project.script[key] || ""}</textarea>
    `;
    selectors.scriptEditor.appendChild(row);
  });
}

function renderOutputs(project) {
  selectors.scriptOutput.textContent = SCRIPT_KEYS.map(([key, label]) => {
    return `${label}:\n${project.script[key] || ""}`;
  }).join("\n\n");

  selectors.packageOutput.textContent = JSON.stringify(projectPackage(project), null, 2);
  selectors.previewSong.textContent = `${project.artist || "Artist"} - ${project.songTitle || "Song"}`;
  selectors.previewHook.textContent = project.script.hook || "Hook appears here.";
  selectors.previewBridge.textContent = project.script.meaningBridge || project.coreContext || "Meaning bridge appears here.";
}

function updateActiveProjectFromForm() {
  const project = activeProject();
  document.querySelectorAll("[data-field]").forEach((field) => {
    project[field.dataset.field] = field.value;
  });
  document.querySelectorAll("[data-script]").forEach((field) => {
    project.script[field.dataset.script] = field.value;
  });
  if (!project.projectTitle.trim()) {
    project.projectTitle = `${project.artist || "Untitled artist"} - ${project.songTitle || "Untitled song"}`;
  }
  persistProjects();
  renderProjectList();
  renderWorkflow();
  renderOutputs(project);
}

function createProject({ songTitle, artist, producer }) {
  const id = `${Date.now()}-${songTitle}`.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-");
  const project = {
    id,
    projectTitle: `${artist} - ${songTitle} context reel`,
    artist,
    producer,
    songTitle,
    audience: "Global K-pop and Korean music listeners",
    exportStatus: "Idea",
    coreContext: "",
    videoSource: "",
    sourceLinks: "",
    lyricTranslation: "",
    caption: "",
    hashtags: "#koreanmusic #kpop #klyrics #musiccuration",
    script: {
      hook: `Before you listen to ${artist}'s '${songTitle}', here's the story behind it.`,
      context: "",
      meaningBridge: "",
      songMoment: "",
      closingLine: ""
    },
    timelineSections: structuredClone(sampleProjects[0].timelineSections)
  };
  projects.unshift(project);
  activeProjectId = project.id;
  persistProjects();
  renderAll();
}

function renderAll() {
  const project = activeProject();
  renderProjectList();
  renderBrief(project);
  renderWorkflow();
  renderScript(project);
  renderTools();
  renderOutputs(project);
}

selectors.newProjectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createProject({
    songTitle: document.querySelector("#newSongTitle").value.trim(),
    artist: document.querySelector("#newArtist").value.trim(),
    producer: document.querySelector("#newProducer").value.trim()
  });
  selectors.newProjectForm.reset();
});

document.querySelector("#newProjectButton").addEventListener("click", () => {
  document.querySelector("#newSongTitle").focus();
});

document.querySelector("#saveProjectButton").addEventListener("click", () => {
  updateActiveProjectFromForm();
  const button = document.querySelector("#saveProjectButton");
  button.textContent = "Saved";
  setTimeout(() => {
    button.textContent = "Save";
  }, 1200);
});

document.querySelector("#copyPackageButton").addEventListener("click", async () => {
  updateActiveProjectFromForm();
  await navigator.clipboard.writeText(selectors.packageOutput.textContent);
  const button = document.querySelector("#copyPackageButton");
  button.textContent = "Copied";
  setTimeout(() => {
    button.textContent = "Copy JSON";
  }, 1200);
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-field], [data-script]")) {
    updateActiveProjectFromForm();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-field], [data-script]")) {
    updateActiveProjectFromForm();
  }
});

renderAll();
