let input = document.getElementById("input_url");
let button = document.getElementById("button_submit");
let output = document.getElementById("output_text");

button.classList.add('btn-hover');
input.classList.add('input-focus');

button.addEventListener("click", function () {
    handleSubmit();
});

input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        handleSubmit();
    }
});

async function handleSubmit() {
    const url = input.value.trim();

    showFeatureCards();

    if (!url) {
        showError("Por favor, insira uma URL válida");
        return;
    }

    if (!isValidUrl(url)) {
        showError("Por favor, insira uma URL válida (ex: https://exemplo.com)");
        return;
    }

    await buscarDados(url);
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showError(message) {
    output.innerHTML = `
        <div class="flex items-center space-x-3 text-red-300">
            <i class="fas fa-exclamation-triangle text-xl"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;
    output.classList.remove('opacity-0', 'translate-y-4', 'success-state');
    output.classList.add('error-state', 'shake');

    hideFeatureCards();

    setTimeout(() => {
        output.classList.remove('shake');
    }, 500);
}

function showSuccess(urlEncurtada) {
    output.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center space-x-3 text-green-300 mb-4">
                <i class="fas fa-check-circle text-xl"></i>
                <span class="font-medium">URL encurtada com sucesso!</span>
            </div>
            <div class="bg-white/20 rounded-xl p-4">
                <div class="flex items-center justify-between">
                    <a href="${urlEncurtada}" target="_blank" 
                       class="text-white font-mono text-sm md:text-base break-all hover:text-blue-300 transition-colors">
                        ${urlEncurtada}
                    </a>
                    <button onclick="copyToClipboard('${urlEncurtada}')" 
                            class="ml-3 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-200 hover:scale-110">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    output.classList.remove('opacity-0', 'translate-y-4', 'error-state');
    output.classList.add('success-state', 'pulse-success');

    hideFeatureCards();

    setTimeout(() => {
        output.classList.remove('pulse-success');
    }, 600);
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);

        const copyBtn = document.querySelector('[onclick*="copyToClipboard"]');
        const icon = copyBtn.querySelector('i');
        const originalIcon = icon.className;

        icon.className = 'fas fa-check';
        copyBtn.classList.add('bg-green-500/30');

        setTimeout(() => {
            icon.className = originalIcon;
            copyBtn.classList.remove('bg-green-500/30');
        }, 2000);

    } catch (err) {
        console.error('Erro ao copiar: ', err);
    }
}

function hideFeatureCards() {
    const featureCards = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    if (featureCards && window.innerWidth < 768) {
        featureCards.style.display = 'none';
    }
}

function showFeatureCards() {
    const featureCards = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    if (featureCards) {
        featureCards.style.display = 'grid';
    }
}

async function buscarDados(urlParaEncurtar) {
    button.disabled = true;
    button.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
    `;

    output.classList.add('opacity-0', 'translate-y-4');
    output.classList.remove('success-state', 'error-state');

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: urlParaEncurtar })
    };

    const apiUrl = "https://encurtadorurl.fly.dev/url";

    try {
        const response = await fetch(apiUrl, options);

        const data = await response.json();

        console.log(data.value);

        if (data.isSuccess) {
            showSuccess(data.value.urlEncurtada);
        } else if (data.errorMessage != null) {
            showError(data.errorMessage);
        } else {
            showError('Erro ao encurtar a URL. Tente novamente.');
        }

    } catch (error) {
        console.error('Houve um problema com a sua requisição fetch:', error);
        showError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
        button.disabled = false;
        button.innerHTML = `
            <i class="fas fa-magic"></i>
            <span>Encurtar</span>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const featureCards = document.querySelectorAll('.bg-white\\/10');
    featureCards.forEach(card => {
        card.classList.add('feature-card');
    });

    const mainContainer = document.querySelector('.relative.z-10');
    mainContainer.style.opacity = '0';
    mainContainer.style.transform = 'translateY(20px)';

    setTimeout(() => {
        mainContainer.style.transition = 'all 0.8s ease-out';
        mainContainer.style.opacity = '1';
        mainContainer.style.transform = 'translateY(0)';
    }, 100);

    window.addEventListener('resize', function () {
        if (window.innerWidth >= 768) {
            showFeatureCards();
        }
    });
});