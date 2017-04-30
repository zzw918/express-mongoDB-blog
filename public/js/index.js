window.onload = function () {
  // footer始终位于底部
  (function () {
    var tags = document.getElementsByTagName("*"),
        allHeight = 0;
    for (let i = 0; i < tags.length; i++) {
      if ((tags[i].parentNode.nodeName.toLowerCase() === "body" ) && (tags[i].className.toLowerCase() !== "footer")) {
        allHeight += parseFloat(tags[i].clientHeight);
      }
    }
    var footerHeight = document.getElementsByClassName("footer")[0].clientHeight,
        screenHeight = document.documentElement.clientHeight;
    if ((allHeight + footerHeight) < screenHeight) {
      document.querySelector(".footer").className += " fixed";
    } else {
      document.querySelector(".footer").style.visibility = "visible";
    }
  }())

  // 用户删除文章确认 
  (function () {
    var deleteLink = document.querySelector('.delete-link');
    deleteLink.onclick = function (e) {
      var assureDel = window.confirm("确定删除吗？"); 
      if (!assureDel) { 
        e.preventDefault();
      }
    }
  }())
}