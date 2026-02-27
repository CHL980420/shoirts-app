const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Generates a YouTube Shorts video using FFmpeg.
 * - For image input: creates a 30-second video from the image
 * - For video input: uses the video as-is
 * - Adds background music
 * - Overlays logo at top and contact text at bottom
 * - Outputs 1080x1920 vertical video (YouTube Shorts format)
 */
async function generateVideo({ mediaPath, audioPath, logoPath, outputPath, overlayText }) {
  return new Promise((resolve, reject) => {
    const isImage = /\.(jpg|jpeg|png|bmp|gif|webp)$/i.test(mediaPath);

    // Check if FFmpeg is available
    exec('ffmpeg -version', (err) => {
      if (err) {
        reject(new Error('FFmpeg가 설치되지 않았습니다. FFmpeg를 먼저 설치해주세요.'));
        return;
      }

      let ffmpegCmd;

      if (isImage) {
        // Image → 30-second video with zoom effect
        ffmpegCmd = buildImageCommand({ mediaPath, audioPath, logoPath, outputPath, overlayText });
      } else {
        // Video → re-encode with overlay
        ffmpegCmd = buildVideoCommand({ mediaPath, audioPath, logoPath, outputPath, overlayText });
      }

      exec(ffmpegCmd, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg error:', stderr);
          reject(new Error(`영상 생성 실패: ${error.message}`));
          return;
        }
        resolve(`영상이 생성되었습니다! 저장 위치: ${outputPath}`);
      });
    });
  });
}

function buildImageCommand({ mediaPath, audioPath, logoPath, outputPath, overlayText }) {
  const hasLogo = fs.existsSync(logoPath);
  const hasAudio = fs.existsSync(audioPath);

  let inputs = `-loop 1 -i "${mediaPath}"`;
  if (hasAudio) inputs += ` -i "${audioPath}"`;
  if (hasLogo) inputs += ` -i "${logoPath}"`;

  // Build filter chain
  let filterParts = [];

  // Scale input image to 1080x1920 with crop/pad
  filterParts.push(
    '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,' +
    'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,' +
    'zoompan=z=\'min(zoom+0.001,1.3)\':x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':d=750:s=1080x1920:fps=25[base]'
  );

  let currentStream = '[base]';
  let inputIdx = 1;

  // Add logo overlay if available
  if (hasLogo) {
    const logoIdx = hasAudio ? 2 : 1;
    filterParts.push(`[${logoIdx}:v]scale=200:-1[logo]`);
    filterParts.push(`${currentStream}[logo]overlay=(W-w)/2:50[withlogo]`);
    currentStream = '[withlogo]';
  }

  // Add text overlay for contact info
  filterParts.push(
    `${currentStream}drawtext=text='${overlayText}':` +
    "fontsize=36:fontcolor=white:borderw=3:bordercolor=black:" +
    "x=(w-text_w)/2:y=h-100[final]"
  );

  const filterComplex = filterParts.join(';');

  let audioMapping = '';
  if (hasAudio) {
    audioMapping = '-map [final] -map 1:a -shortest';
  } else {
    audioMapping = '-map [final]';
  }

  return `ffmpeg -y ${inputs} -filter_complex "${filterComplex}" ${audioMapping} -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -t 30 -r 25 "${outputPath}"`;
}

function buildVideoCommand({ mediaPath, audioPath, logoPath, outputPath, overlayText }) {
  const hasLogo = fs.existsSync(logoPath);
  const hasAudio = fs.existsSync(audioPath);

  let inputs = `-i "${mediaPath}"`;
  if (hasAudio) inputs += ` -i "${audioPath}"`;
  if (hasLogo) inputs += ` -i "${logoPath}"`;

  let filterParts = [];

  // Scale video to 1080x1920
  filterParts.push(
    '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,' +
    'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black[base]'
  );

  let currentStream = '[base]';
  let inputIdx = 1;

  // Add logo overlay if available
  if (hasLogo) {
    const logoIdx = hasAudio ? 2 : 1;
    filterParts.push(`[${logoIdx}:v]scale=200:-1[logo]`);
    filterParts.push(`${currentStream}[logo]overlay=(W-w)/2:50[withlogo]`);
    currentStream = '[withlogo]';
  }

  // Add text overlay
  filterParts.push(
    `${currentStream}drawtext=text='${overlayText}':` +
    "fontsize=36:fontcolor=white:borderw=3:bordercolor=black:" +
    "x=(w-text_w)/2:y=h-100[final]"
  );

  const filterComplex = filterParts.join(';');

  let audioMapping = '';
  if (hasAudio) {
    audioMapping = '-map [final] -map 1:a -shortest';
  } else {
    audioMapping = '-map [final] -map 0:a?';
  }

  return `ffmpeg -y ${inputs} -filter_complex "${filterComplex}" ${audioMapping} -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -r 25 "${outputPath}"`;
}

module.exports = { generateVideo };
