import { isHomeNoticeExpired, todayInRome } from '../../shared/homeNotices.ts';

export function initHomeNotices() {
  const noticesSection = document.querySelector<HTMLElement>('[data-home-notices]');
  if (noticesSection) {
    const noticeItems = [...noticesSection.querySelectorAll<HTMLElement>('.home-notices__item')];

    const refreshNotices = () => {
      const today = todayInRome();
      for (const item of noticeItems) {
        item.hidden = isHomeNoticeExpired(item.dataset.expiresOn, today);
      }
      noticesSection.hidden = noticeItems.every((item) => item.hidden);
    };

    refreshNotices();
    if (noticeItems.some((item) => item.dataset.expiresOn)) {
      const intervalId = window.setInterval(() => {
        refreshNotices();
        if (noticeItems.every((item) => item.hidden || !item.dataset.expiresOn)) {
          window.clearInterval(intervalId);
        }
      }, 60_000);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) refreshNotices();
      });
    }
  }
}
