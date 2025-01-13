import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['menuList'];

  connect() {
    this.addActiveClassToCurrentPage()
  }

  toggleActive(event) {
    const menuItem = event.currentTarget.closest('li');
    this.deactivateAll();

    this.activateAncestors(menuItem);
  }

  activateAncestors(menuItem) {
    menuItem.classList.add('active')

    let parentMenuItem = menuItem.closest('ul').previousElementSibling;

    while (parentMenuItem && parentMenuItem.tagName === 'LI') {
      parentMenuItem.classList.add('active');
      parentMenuItem = parentMenuItem.closest('ul').previousElementSibling;
    }
  }

  deactivateAll() {
    this.menuListTarget.querySelectorAll('li').forEach(item => {
      item.classList.remove('active');
    });
  }

  // 第一次进入或者手动刷新页面时, 为页面和祖先页面添加active
  addActiveClassToCurrentPage() {
    const currentPath = window.location.pathname;

    // 等待菜单加载完成
    const checkInterval = setInterval(() => {
      const menuItems = Array.from(this.menuListTarget.querySelectorAll('li'));

      const currentPageMenuItem = menuItems.find(menuItem => {
        const link = menuItem.querySelector('a');
        return link && link.pathname === currentPath;
      });
      if (currentPageMenuItem) {
        clearInterval(checkInterval);
        this.activateAncestors(currentPageMenuItem)
      }
    }, 100);
  }
}
