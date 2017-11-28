class LoadPage {
  constructor(opts) {
    this.datas = [];
    this.currentPage = 1;
    this.totalPage = 1;
    this.lock = false;

    this.noStatus = opts.noStatus;

    this.params = opts.params;
    this.formatData = opts.formatData;
    this.setData = opts.setData;
    this.pageSize = opts.pageSize || 10;

    this.promise = null;

    this.keys = Object.assign({
      // loading: 'loading',
      end: 'end',
      pageIndex: 'pageNum',
      totalPage: 'total',
    }, opts.keys);
  }

  request() {
    if (this.currentPage > this.totalPage) {
      this.setData({
        [this.keys.end]: true
      });

      return wx.Promise.resolve(null);
    }

    this.setData({
      [this.keys.end]: false
    });

    let noStatus = this.noStatus;

    if (noStatus === undefined) {
      if (this.currentPage !== 1) {
        noStatus = true;
      } else {
        noStatus = false;
      }
    }

    if (this.lock) {
      return wx.Promise.resolve(null);
    }

    const params = this.params;

    params.data[this.keys.pageIndex] = this.currentPage;

    this.lock = true;

    return this.promise = wx.fetch({
      url: params.url,
      data: params.data,
      method: params.method,
      header: params.header,
      noStatus,
      complete: () => {
        this.currentPage++;
        this.lock = false;        
      }
    }).then((res) => {
      const datas = this.formatData(res);
      this.datas = this.datas.concat(datas);
      this.totalPage = res.data.data[this.keys.totalPage];

      if (this.keys.totalPage === 'total') {
        this.totalPage = Math.ceil(this.totalPage / this.pageSize);
      }
      return this.datas;
    });
  }
}

module.exports = LoadPage
