export const THEME_KEY = "atlas:theme";

/** Runs before first paint (inlined in <head>) to avoid a theme flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.dataset.theme=t;}catch(_){}})();`;
