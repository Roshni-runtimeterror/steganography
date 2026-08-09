// --- LOGIN & SIGNUP LOGIC ---
function showSignup() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('forgot-form').classList.add('hidden');
}
function showLogin() {
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}
function showForgotPassword() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.remove('hidden');
}
document.getElementById('login').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Login successful! Welcome to the tool.');
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('tool-container').style.display = 'block';
});
document.getElementById('signup').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = this.querySelector('input[type="password"]').value;
    const confirmPassword = this.querySelector('input[type="password"]:nth-child(4)').value;
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    alert('Signup successful! Please log in. (This is a demo)');
    showLogin();
});
document.getElementById('forgot').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Password reset link sent to your email! (This is a demo)');
    showLogin();
});

// --- STEGANOGRAPHY TOOL LOGIC ---
function loadImage(fileInputId, canvasId) {
    const fileInput = document.getElementById(fileInputId);
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const file = fileInput.files[0];
    if (!file) return null;
    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };
    img.src = URL.createObjectURL(file);
    return img;
}

function stringToBinary(str) {
    return str.split('').map(char =>
        char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
}

function binaryToString(bin) {
    let result = '';
    for (let i = 0; i < bin.length; i += 8) {
        const byte = bin.substr(i, 8);
        if (byte) result += String.fromCharCode(parseInt(byte, 2));
    }
    return result;
}

function getImageData(canvas) {
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
function setImageData(canvas, imageData) {
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
}

function encode() {
    const imageInput = document.getElementById('imageInput');
    const messageInput = document.getElementById('messageInput');
    if (!imageInput.files[0] || !messageInput.value.trim()) {
        alert('Please select an image and enter a message.');
        return;
    }

    const canvas = document.getElementById('originalCanvas');
    loadImage('imageInput', 'originalCanvas');

    setTimeout(() => {
        const imageData = getImageData(canvas);
        const message = messageInput.value.trim();
        const messageBinary = stringToBinary(message);
        const lengthBinary = (message.length * 8).toString(2).padStart(32, '0');
        const fullBinary = lengthBinary + messageBinary;

        if (fullBinary.length > (imageData.data.length / 4)) {
            alert('Message too long for image size.');
            return;
        }

        let bitIndex = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (bitIndex < fullBinary.length) {
                const bit = parseInt(fullBinary[bitIndex]);
                imageData.data[i] = (imageData.data[i] & 0xFE) | bit;
                bitIndex++;
            } else break;
        }

        const encodedCanvas = document.getElementById('encodedCanvas');
        encodedCanvas.width = canvas.width;
        encodedCanvas.height = canvas.height;
        setImageData(encodedCanvas, imageData);

        const link = document.createElement('a');
        link.download = 'encoded_image.png';
        link.href = encodedCanvas.toDataURL();
        link.click();
    }, 100);
}

function decode() {
    const encodedImageInput = document.getElementById('encodedImageInput');
    if (!encodedImageInput.files[0]) {
        alert('Please select an encoded image.');
        return;
    }

    const canvas = document.getElementById('decodedCanvas');
    loadImage('encodedImageInput', 'decodedCanvas');

    setTimeout(() => {
        const imageData = getImageData(canvas);
        let fullBinary = '';

        for (let i = 0; i < 32 * 4; i += 4)
            fullBinary += (imageData.data[i] & 1);

        const lengthInBits = parseInt(fullBinary, 2);
        if (isNaN(lengthInBits) || lengthInBits <= 0) {
            document.getElementById('output').textContent = 'Invalid or no message found.';
            return;
        }

        let messageBin = '';
        for (let i = 32 * 4; i < (lengthInBits + 32) * 4; i += 4)
            if (i < imageData.data.length) messageBin += (imageData.data[i] & 1);

        const message = binaryToString(messageBin);
        document.getElementById('output').textContent = message || 'No message found.';
    }, 100);
}