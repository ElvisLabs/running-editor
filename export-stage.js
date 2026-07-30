(function () {
  'use strict';

  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('浏览器无法生成 PNG 文件'));
      }, 'image/png');
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.exportStagePNG = async function exportStagePNG(stage, filename, options = {}) {
    if (!stage) throw new Error('找不到要导出的页面');
    if (typeof window.html2canvas !== 'function') {
      throw new Error('截图组件未加载');
    }

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const width = Math.round(parseFloat(getComputedStyle(stage).width));
    const height = Math.round(parseFloat(getComputedStyle(stage).height));
    const outputWidth = Number(options.width) > 0 ? Math.round(Number(options.width)) : width;
    const outputHeight = Number(options.height) > 0 ? Math.round(Number(options.height)) : height;
    const scale = Math.max(outputWidth / width, outputHeight / height);
    let canvas = await window.html2canvas(stage, {
      width,
      height,
      scale,
      backgroundColor: null,
      useCORS: true,
      imageTimeout: 0,
      logging: false,
      onclone(clonedDocument) {
        const clonedStage = clonedDocument.querySelector('.stage');
        if (clonedStage) {
          clonedStage.style.transform = 'none';
          clonedStage.style.transformOrigin = 'top left';
        }
      }
    });

    if (canvas.width !== outputWidth || canvas.height !== outputHeight) {
      const resized = document.createElement('canvas');
      resized.width = outputWidth;
      resized.height = outputHeight;
      resized.getContext('2d').drawImage(canvas, 0, 0, outputWidth, outputHeight);
      canvas = resized;
    }

    const blob = await canvasToBlob(canvas);
    downloadBlob(blob, filename);
  };
})();
