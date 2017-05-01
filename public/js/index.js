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

    // FIXME: 这里有问题，目前还不知原因
    if ((allHeight + footerHeight) < screenHeight - 35) {
      document.querySelector(".footer").className += " fixed";
    } else {
      document.querySelector(".footer").style.visibility = "visible";
      document.querySelector(".footer").className = "footer";
    }
    console.log(allHeight+footerHeight, screenHeight);
  }());

  (function () {
    var contentWrap = document.getElementsByTagName("body")[0];
    contentWrap.onclick = function (e) {
        if (e.target.className === "delete-link") {
            var assureDel = window.confirm("确定删除吗？"); 
              if (!assureDel) { 
                e.preventDefault();
              }
        }
    }
  }());
}