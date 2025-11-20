// Syntax highlighting for HTTP requests (Burp Suite style)

function highlightHTTP(text) {
    if (!text) return '';

    const lines = text.split('\n');
    let inBody = false;
    let bodyStartIndex = -1;

    // Find where body starts (first empty line)
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '') {
            inBody = true;
            bodyStartIndex = i;
            break;
        }
    }

    let highlighted = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (i === 0) {
            // Request line: METHOD PATH VERSION
            const parts = line.split(' ');
            if (parts.length >= 2) {
                highlighted += `<span class="http-method">${escapeHtml(parts[0])}</span> `;
                highlighted += `<span class="http-path">${escapeHtml(parts.slice(1, -1).join(' '))}</span> `;
                if (parts.length > 2) {
                    highlighted += `<span class="http-version">${escapeHtml(parts[parts.length - 1])}</span>`;
                }
            } else {
                highlighted += escapeHtml(line);
            }
        } else if (!inBody || i < bodyStartIndex) {
            // Header line
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const headerName = line.substring(0, colonIndex);
                const headerValue = line.substring(colonIndex + 1);
                highlighted += `<span class="http-header-name">${escapeHtml(headerName)}</span>`;
                highlighted += '<span class="http-colon">:</span>';
                highlighted += `<span class="http-header-value">${escapeHtml(headerValue)}</span>`;
            } else {
                highlighted += escapeHtml(line);
            }
        } else if (i === bodyStartIndex) {
            // Empty line between headers and body
            highlighted += '';
        } else {
            // Body - try to detect and highlight JSON
            const bodyContent = lines.slice(bodyStartIndex + 1).join('\n');
            highlighted += highlightJSON(bodyContent);
            break;
        }

        if (i < lines.length - 1) {
            highlighted += '\n';
        }
    }

    return highlighted;
}

function highlightJSON(text) {
    try {
        // Try to parse as JSON
        JSON.parse(text);

        // If successful, highlight JSON syntax
        return text.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
                let cls = 'json-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return `<span class="${cls}">${escapeHtml(match)}</span>`;
            }
        );
    } catch (e) {
        // Not JSON, return as-is
        return escapeHtml(text);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
