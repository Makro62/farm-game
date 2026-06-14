export function showFloatText(element, text, type = 'normal') {
    if (!element) return;
    const el = document.createElement('div');
    el.className = `float-text float-${type}`;
    el.textContent = text;
    
    const rect = element.getBoundingClientRect();
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top  = `${rect.top}px`;
    el.style.position = 'fixed';
    
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}
