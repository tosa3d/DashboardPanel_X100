document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealItems = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px" });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  document.querySelectorAll(".download-trigger").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      const downloadUrl = trigger.dataset.downloadUrl;
      if (downloadUrl) {
        trigger.href = downloadUrl;
        return;
      }

      event.preventDefault();
      const note = document.getElementById("download-note");
      if (note) note.textContent = "لینک فایل نصب هنوز به صفحه متصل نشده است.";
    });
  });
});
