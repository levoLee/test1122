/**
 * author: caozhongping
 * createTime: 2017-4-11
 * desc: 图片剪裁功能 对外方法 getImgSrc(图片原始src,图片需要显示的宽度)
 */

module.exports = {
  getHeight(src, width) {
    let match = src.match(/(\d+)w_(\d+)h/);

    if (!match) {
      match = src.match(/w(\d+)_h(\d+)/);
    }

    if (!match) {
      return 0;
    }

    return Math.ceil(width * (match[2] / match[1]) / 10) * 10;
  },
  getImgSrc(src, width) {
    const type = src.match(/\.([^.]+)$/)[1];

    let ratio = 1.5;
    if (wx.systemInfo.pixelRatio > 2) {
      ratio = 2;
    }

    // if (['wifi', '4g'].indexOf(wx.tuhu.getNetWork()) < 0) {
    //   ratio = 1;
    // }

    const height = this.getHeight(src, width);

    if (height) {
      src = src.replace(/@.+/, '');

      if (type === 'gif') {
        src += `?@${(Math.ceil(height * ratio) / 10) * 10}h_99q.src`;
      } else {
        src += `@${(Math.ceil(height * ratio) / 10) * 10}h_99q.${type}`;
      }
    }

    src = this.replaceCdn(src)

    return {
      src: height ? src.replace(/\.(?:webp|png)$/, '.jpg') : src,
      height
    };
  },
  getHashCode(url) {
    return (url.split('/').pop()[0].charCodeAt() % 4) + 1;
  },
  replaceCdn(url) {
    return url.replace('image.tuhu.cn', 'img1.tuhu.org').replace(/https?/, 'https');
  }
};
