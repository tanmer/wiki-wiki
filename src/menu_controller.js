import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["links"]

  connect() {
    this.generateDirectory()

    this.hightLightActiveLink()
    window.addEventListener('scroll', this.hightLightActiveLink.bind(this))
  }

  generateDirectory() {
    const mainContainer = document.getElementsByClassName('ProseMirror')[0]
    const headings = Array.from(mainContainer.querySelectorAll("h1, h2, h3, h4, h5, h6"))
    const directory = this.buildDirectoryTree(headings)
    this.renderDirectory(directory, this.linksTarget)
  }

  // 生成目录树
  // { level: 0, children: [ {level: 1, id: '', text: '', children: [], parent: []} ] }
  buildDirectoryTree(headings) {
    const root = { level: 0, children: [] }

    let currentNode = root

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.substr(1), 10)

      const id = this.generateUniqueId(heading)

      const node = { level, id, text: heading.textContent, children: [] }

      if (level > currentNode.level) {
        // 该节点是currentNode的子节点
        currentNode.children.push(node)
      } else {
        while (level <= currentNode.level && currentNode !== root) {
          currentNode = currentNode.parent
        }
        currentNode.children.push(node)
      }

      node.parent = currentNode
      currentNode = node
    })

    return root
  }

  // 生成目录, 插入到页面
  renderDirectory(directory, container, level=0) {
    // 如果目录为空, 移除
    if (directory.children.length == 0) {
      const menuContainer = document.querySelector('[data-controller="menu"]')

      if (menuContainer) {
        menuContainer.remove()
      }
      return
    }

    const ul = document.createElement("ul");
    ul.classList=""

    // 创建dom元素
    directory.children.forEach((node) => {
      const li = document.createElement("li")
      li.classList = 'space-y-3'

      const link = document.createElement("a")
      link.style.paddingLeft = `${(level+1) * 8}px`

      link.href = `#${node.id}`
      link.setAttribute('data-turbo', false)
      link.textContent = node.text
      link.classList = "relative line-clamp-1 font-normal my-2 before:absolute before:-left-px before:top-2 before:bottom-2 before:w-0.5"

      // turbo-frame内部不会处理锚点导航，所以自定义处理
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.navigateToAnchor(link.getAttribute("href"));
      })

      li.appendChild(link)
      ul.appendChild(li)

      // 给 Heading 添加锚点复制功能
      const hea = document.getElementById(node.id)
      hea.classList = "flex group"
      hea.insertAdjacentHTML("beforeend",'<div data-controller="clipboard" data-clipboard-success-content-value=" Copied!"><input type="hidden" value="' + window.location.href + '#' + node.id + '" data-clipboard-target="source" /><button type="button" data-action="clipboard#copy" data-clipboard-target="button" class="flex ml-1 opacity-0 group-hover:opacity-100">\n      <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-5 text-gray-300 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">\n        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />\n      </svg>\n    </button></div>')

      if (node.children.length > 0) {
        const subList = this.renderDirectory(node, li, level+1)
        li.appendChild(subList)
      }
    })

    container.appendChild(ul)

    return ul
  }

  // 动态生成id
  generateUniqueId(node) {
    // 有id, 直接赋值; 没有, 随机生成
    if (node.id) {
      return node.id
    } else {
      const generateId =  `heading-${Math.random().toString(36).substring(2, 15)}`
      node.id = generateId
      return generateId
    }
  }



  // 为当前标签设置高亮显示
  hightLightActiveLink() {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
    const links = Array.from(this.linksTarget.querySelectorAll("a"))

    let activeLink = null

    // 循环判断是否是activeLink
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i]

      const link = links.find(link => link.getAttribute("href") === `#${heading.id}`)

      if (link && this.isHeadingInView(heading)) {
        activeLink = link
        break
      }
    }

    // 添加样式, 移除其他标签的active样式
    links.forEach(link => link.classList.remove('text-primary'))

    if (activeLink) {
      activeLink.classList.add("text-primary")
    }
  }

  // 判断heading的边界是否在视图区域
  isHeadingInView(heading) {
    // 获取当前heading的位置信息
    const bounding = heading.getBoundingClientRect()

    // 判断heading的边界是否在视图区域
    return (
      bounding.top >= this.headerHeight() &&
      bounding.left >= 0 &&
      bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  // 处理TurboFrame锚点导航
  navigateToAnchor(anchor) {
    const targetElement = document.querySelector(anchor);
    if (targetElement) {
      const headerHeight = this.headerHeight()
      const targetPosition = targetElement.getBoundingClientRect().top;
      const scrollToPosition = targetPosition - headerHeight;

      const scrollOptions = {
        top: scrollToPosition,
        behavior: "smooth",
      };

      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.scrollBy(0, -headerHeight);
      window.scrollBy(0, scrollToPosition);
    }
  }
  headerHeight() {
    // 动态获取header的高度，并且判断是否是固定
    const header = document.getElementById('header')
    let headerHight = 0
    if (header) {
      const headerStyles = window.getComputedStyle(header);

      let headerFixed = headerStyles.getPropertyValue("position") === 'fixed';
      if (headerFixed) {
        headerHight = header.offsetHeight;
      }
    }
    return headerHight
  }
}
