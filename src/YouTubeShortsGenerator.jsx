import React, { useState } from 'react';
import { Upload, Music, Download, CheckCircle, AlertCircle, Folder } from 'lucide-react';

export default function YouTubeShortsGenerator() {
  const [mediaFile, setMediaFile] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState('');
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const musicTracks = [
    { id: 1, name: '🎵 음원 1 - Calm Jazz', file: 'allmedia2024-calm-jazz-220610.mp3' },
    { id: 2, name: '🎵 음원 2 - Soft Calm', file: 'krasnoshchok-background-music-soft-calm-404429.mp3' },
    { id: 3, name: '🎵 음원 3 - Calm Soft Music', file: 'hitslab-calm-calm-soft-music-334182.mp3' },
    { id: 4, name: '🎵 음원 4 - Calm Nature Music', file: 'andriig-calm-nature-music-471361.mp3' }
  ];

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setStatus(`✓ 파일 준비: ${file.name}`);
    }
  };

  const handleGenerateVideo = async () => {
    if (!mediaFile || !selectedMusic) {
      setStatus('❌ 파일과 음원을 모두 선택해주세요');
      return;
    }

    setIsProcessing(true);
    setStatus('⏳ 영상 생성 중... (2-5분 소요)');

    try {
      // Electron IPC로 백엔드 호출
      if (window.ipcRenderer) {
        const result = await window.ipcRenderer.invoke('generate-video', {
          mediaPath: mediaFile.path || URL.createObjectURL(mediaFile),
          audioFile: selectedMusic
        });
        setStatus('✅ ' + result);
      }
    } catch (error) {
      setStatus('❌ 오류: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-8">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">🎬 YouTube Shorts Generator</h1>
          <p className="text-purple-100 text-lg">로고 & 연락처가 자동으로 들어가는 영상 생성</p>
        </div>

        {/* 메인 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-10">
            {/* Step 1: 미디어 업로드 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                <Upload size={28} className="text-purple-600" />
                Step 1: 미디어 파일 선택
              </h2>
              <div className="border-3 border-dashed border-purple-300 rounded-2xl p-10 text-center hover:border-purple-500 transition">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                  id="media-input"
                  disabled={isProcessing}
                />
                <label htmlFor="media-input" className="cursor-pointer block">
                  <div className="text-6xl mb-4">📸 🎥</div>
                  <p className="text-gray-700 text-lg font-semibold">
                    클릭하거나 드래그해서 파일 추가
                  </p>
                  <p className="text-gray-500 text-sm mt-3">
                    지원: JPG, PNG, MP4, MOV, AVI
                  </p>
                </label>
              </div>
              {mediaFile && (
                <div className="mt-4 flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle size={24} />
                  <div>
                    <p className="font-semibold">파일 준비 완료</p>
                    <p className="text-sm">{mediaFile.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: 음악 선택 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                <Music size={28} className="text-blue-600" />
                Step 2: 배경음악 선택 (4개)
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {musicTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedMusic(track.file)}
                    disabled={isProcessing}
                    className={`p-5 rounded-xl font-bold text-sm transition transform hover:scale-105 ${
                      selectedMusic === track.file
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {track.name}
                  </button>
                ))}
              </div>
              {selectedMusic && (
                <div className="mt-4 flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle size={24} />
                  <p className="font-semibold">음악 선택 완료</p>
                </div>
              )}
            </div>

            {/* Step 3: 생성 버튼 */}
            <div className="mb-8">
              <button
                onClick={handleGenerateVideo}
                disabled={!mediaFile || !selectedMusic || isProcessing}
                className={`w-full py-5 rounded-2xl font-bold text-lg transition transform hover:scale-105 flex items-center justify-center gap-3 ${
                  isProcessing
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-2xl'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    처리 중...
                  </>
                ) : (
                  <>
                    <Download size={24} />
                    영상 생성하기 (2-5분)
                  </>
                )}
              </button>
            </div>

            {/* 상태 메시지 */}
            {status && (
              <div className={`p-5 rounded-xl mb-6 flex items-start gap-3 ${
                status.includes('❌')
                  ? 'bg-red-50 text-red-700'
                  : status.includes('⏳')
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {status.includes('❌') ? (
                  <AlertCircle size={24} className="mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle size={24} className="mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold">{status}</p>
                </div>
              </div>
            )}

            {/* 주의사항 */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                📌 주의사항
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✓ 생성된 영상은 "shorts_output.mp4"로 저장됩니다</li>
                <li>✓ 로고와 연락처가 하단에 자동으로 추가됩니다</li>
                <li>✓ 해상도: 1920×1080 (YouTube Shorts 표준)</li>
                <li>✓ 처리 시간: 2-5분 (영상 길이에 따라)</li>
              </ul>
            </div>
          </div>

          {/* 푸터 */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-10 py-6 text-center text-white">
            <p className="font-semibold text-lg">🏠 호반공인중개사</p>
            <p className="text-purple-100 mt-1">☎️ 032-574-7744</p>
            <p className="text-xs mt-2 opacity-80">YouTube Shorts Generator v1.0 - Windows Edition</p>
          </div>
        </div>
      </div>
    </div>
  );
}
