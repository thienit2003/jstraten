const axios = require('axios');
const domino = require('domino');
const fs = require('fs');

// Tạo một luồng ghi file
const writeStream = fs.createWriteStream('HAI.html');

// Thông tin về trang
const fromPage = 1; // Trang bắt đầu
const toPage = 1; // Trang kết thúc

// Mảng chứa các promise cho các liên kết
const promiseLinks = [];

// Mảng chứa các promise cho các chi tiết
const promiseDetails = [];

// Mảng chứa các liên kết đã được thêm vào
const resultItem = [];

// Tạo các promise cho các liên kết
for (let page = fromPage; page <= toPage; page++) {
  const link = `https://www.tratencongty.com/thanh-pho-ho-chi-minh/?page=${page}`;
  promiseLinks.push(axios.get(link));
}

// Khi tất cả các promise cho các liên kết được thực hiện
Promise.all(promiseLinks).then(linkResults => {
  // Duyệt qua các kết quả
  linkResults.forEach(linkResult => {
    // Tạo một cửa sổ mới từ dữ liệu HTML
    var window = domino.createWindow(linkResult.data);

    // Duyệt qua các liên kết trong phần tìm kiếm
    window.document.querySelectorAll('.search-results a').forEach(item => {
      // Kiểm tra xem liên kết đã được thêm vào hay chưa
      if (resultItem.indexOf(item.href) === -1) {
        // Thêm liên kết vào mảng
        promiseDetails.push(axios.get(item.href));
        resultItem.push(item.href);
      }
    });
  });
}).finally(() => {
  // Khi tất cả các promise cho các chi tiết được thực hiện
  Promise.all(promiseDetails).then(details => {
    // Duyệt qua các kết quả
    details.forEach(detail => {
      // Tạo một cửa sổ mới từ dữ liệu HTML
      const companyDomino = domino.createWindow(detail.data).document;

      // Lấy phần tử chứa thông tin chi tiết
      const detailsElement = companyDomino.querySelector('.jumbotron');

      // Tạo một phần tử div mới
      const divElement = companyDomino.createElement('div');
      divElement.appendChild(detailsElement);

      // Tạo một phần tử div mới để chứa phần tử div vừa tạo
      const wrapperElement = companyDomino.createElement('div');
      wrapperElement.appendChild(divElement);

      // Ghi nội dung của phần tử div vào file
      writeStream.write(wrapperElement.innerHTML);
    });
  }).finally(() => {
    // Kết thúc luồng ghi file
    writeStream.end();
  });
});