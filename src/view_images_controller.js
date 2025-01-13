import Viewer from "viewerjs";
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  connect() {
    const images = this.element.getElementsByTagName('img');
    const imgArray = Array.from(images)
    // 为每个图片添加点击事件监听器
    imgArray.forEach((image) => {
      image.addEventListener("click", this.openViewer);
    });
  }

  openViewer = (event) => {
    const clickedImage = event.currentTarget;

    // 初始化 Viewer.js
    const viewer = new Viewer(this.element, {
      toolbar: {
        // 放大
        zoomIn: 1,
        // 缩小
        zoomOut: 1,
        // 原始大小
        oneToOne: 1,
        // 重置
        reset: 1,
        // 上一页
        prev: 1,
        // 全屏幻灯片
        play: {
          show: 1,
          size: "large",
        },
        // 下一页
        next: 1,
        // 向左旋转90
        rotateLeft: 1,
        // 向右旋转90
        rotateRight: 1,
        // 水平镜像翻转
        flipHorizontal: 1,
        // 垂直镜像翻转
        flipVertical: 1,
      },
    });
    viewer.view(clickedImage)
  }
}
