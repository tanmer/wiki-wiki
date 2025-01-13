
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["checkbox"];

  connect() {
    const dark = localStorage.getItem("dark-mode");
    if (dark && dark == 'true') {
      document.documentElement.classList.add("dark");
      this.checkboxTarget.checked = true;
    } else {
      document.documentElement.classList.remove("dark");
      this.checkboxTarget.checked = false;
    }
  }

  toggle() {
    const checkbox = this.checkboxTarget;
    const isDarkMode = checkbox.checked;

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dark-mode", true);
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dark-mode", false);
    }
  }
}
