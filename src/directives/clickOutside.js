export const vClickOutside = {
  mounted(el, binding) {
    el.__clickOutsideHandler__ = (event) => {
      // If click was inside the element, ignore
      if (el === event.target || el.contains(event.target)) return

      // Otherwise call the provided function
      if (typeof binding.value === 'function') {
        binding.value(event)
      }
    }

    document.addEventListener('click', el.__clickOutsideHandler__, true)
    document.addEventListener('touchstart', el.__clickOutsideHandler__, true)
  },

  unmounted(el) {
    document.removeEventListener('click', el.__clickOutsideHandler__, true)
    document.removeEventListener('touchstart', el.__clickOutsideHandler__, true)
    delete el.__clickOutsideHandler__
  },
}