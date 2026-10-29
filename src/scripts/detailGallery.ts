export function initDetailGalleries() {
  document.querySelectorAll<HTMLElement>('.detail-gallery').forEach((gallery) => {
    gallery.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const opener = target.closest<HTMLButtonElement>('[data-gallery-open]');
      const dialogId = opener?.dataset.galleryOpen;
      const dialog = dialogId && gallery.querySelector(`#${CSS.escape(dialogId)}`);
      if (dialog instanceof HTMLDialogElement) {
        dialog.showModal();
        dialog.focus({ preventScroll: true });
      }

      if (target instanceof HTMLDialogElement && target.classList.contains('gallery-lightbox')) {
        target.close();
      }
    });
  });
}
