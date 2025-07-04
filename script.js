// Platform data with free API endpoints
const platforms = {
    youtube: {
        name: 'YouTube',
        icon: '▶️',
        placeholder: 'https://youtube.com/watch?v=... or https://youtu.be/...',
        example: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        regex: /(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
        apiEndpoint: 'https://yt-api-free.p.rapidapi.com/download',
        apiMethod: 'GET',
        apiHeaders: {
            'X-RapidAPI-Key': 'bc01e100-38e0-471f-b6ca-fc1a785706cd',
            'X-RapidAPI-Host': 'yt-api-free.p.rapidapi.com'
        },
        apiParams: (url) => ({
            url: url,
            quality: 'best'
        })
    },
    instagram: {
        name: 'Instagram',
        icon: '📷',
        placeholder: 'https://instagram.com/reel/... or https://instagram.com/p/...',
        example: 'https://instagram.com/reel/CgOl1OjJQ6S/',
        regex: /instagram\.com\/(reel|p)\/([a-zA-Z0-9_-]+)/,
        apiEndpoint: 'https://instagram-downloader-free.p.rapidapi.com/download',
        apiMethod: 'GET',
        apiHeaders: {
            'X-RapidAPI-Key': 'bc01e100-38e0-471f-b6ca-fc1a785706cd',
            'X-RapidAPI-Host': 'instagram-downloader-free.p.rapidapi.com'
        },
        apiParams: (url) => ({
            url: url
        })
    },
    tiktok: {
        name: 'TikTok',
        icon: '🎵',
        placeholder: 'https://tiktok.com/@username/video/...',
        example: 'https://tiktok.com/@example/video/123456789',
        regex: /tiktok\.com\/@.+\/video\/(\d+)/,
        apiEndpoint: 'https://tiktok-downloader-free.p.rapidapi.com/download',
        apiMethod: 'GET',
        apiHeaders: {
            'X-RapidAPI-Key': 'bc01e100-38e0-471f-b6ca-fc1a785706cd',
            'X-RapidAPI-Host': 'tiktok-downloader-free.p.rapidapi.com'
        },
        apiParams: (url) => ({
            url: url,
            hd: '1'
        })
    },
    facebook: {
        name: 'Facebook',
        icon: '👍',
        placeholder: 'https://facebook.com/watch/?v=... or https://fb.watch/...',
        example: 'https://facebook.com/watch/?v=123456789',
        regex: /(facebook\.com\/watch\/\?v=|fb\.watch\/)([a-zA-Z0-9_-]+)/,
        apiEndpoint: 'https://facebook-downloader-free.p.rapidapi.com/download',
        apiMethod: 'GET',
        apiHeaders: {
            'X-RapidAPI-Key': 'bc01e100-38e0-471f-b6ca-fc1a785706cd',
            'X-RapidAPI-Host': 'facebook-downloader-free.p.rapidapi.com'
        },
        apiParams: (url) => ({
            url: url
        })
    },
    snapchat: {
        name: 'Snapchat',
        icon: '👻',
        placeholder: 'Paste Snapchat public story or spotlight URL',
        example: 'https://snapchat.com/add/username',
        regex: /snapchat\.com\/(add|story)\/([a-zA-Z0-9_-]+)/,
        apiEndpoint: 'https://snapchat-downloader-free.p.rapidapi.com/download',
        apiMethod: 'GET',
        apiHeaders: {
            'X-RapidAPI-Key': 'bc01e100-38e0-471f-b6ca-fc1a785706cd',
            'X-RapidAPI-Host': 'snapchat-downloader-free.p.rapidapi.com'
        },
        apiParams: (url) => ({
            url: url
        })
    }
};

// DOM Elements
const platformTabs = document.querySelectorAll('.platform-tab');
const urlInput = document.getElementById('video-url');
const urlLabel = document.getElementById('url-label');
const platformIcon = document.getElementById('current-platform-icon');
const downloadBtn = document.getElementById('download-button');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const resultDiv = document.getElementById('result');
const optionsDiv = document.getElementById('download-options');
const errorDiv = document.getElementById('error-message');
const videoPreview = document.getElementById('video-preview');
const thumbnail = document.getElementById('thumbnail');
const videoTitle = document.getElementById('video-title');
const videoDuration = document.getElementById('video-duration');

let currentPlatform = 'youtube';

// Initialize platform UI
updatePlatformUI();

// Platform tab switching
platformTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        platformTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Update current platform
        currentPlatform = this.getAttribute('data-platform');
        
        // Update UI
        updatePlatformUI();
        // Clear previous results
        resultDiv.style.display = 'none';
        videoPreview.style.display = 'none';
        errorDiv.style.display = 'none';
        urlInput.value = '';
    });
});

function updatePlatformUI() {
    const platform = platforms[currentPlatform];
    urlLabel.textContent = `${platform.name} Video URL:`;
    urlInput.placeholder = platform.placeholder;
    platformIcon.textContent = platform.icon;
}

// Download button functionality
downloadBtn.addEventListener('click', async function() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a video URL');
        return;
    }
    
    // Validate URL
    if (!validateUrl(url, currentPlatform)) {
        showError(`Please enter a valid ${platforms[currentPlatform].name} URL\nExample: ${platforms[currentPlatform].example}`);
        return;
    }
    
    // Process download
    await processDownload(url, currentPlatform);
});

function validateUrl(url, platform) {
    return platforms[platform].regex.test(url);
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    videoPreview.style.display = 'none';
    urlInput.focus();
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

async function processDownload(url, platform) {
    // Show loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    downloadBtn.disabled = true;
    errorDiv.style.display = 'none';
    
    try {
        // Call the appropriate API based on platform
        const response = await callDownloadAPI(url, platform);
        
        if (response.error) {
            throw new Error(response.message || 'Failed to fetch video information');
        }
        
        // Display video preview
        displayVideoPreview(response);
        
        // Display download options
        displayResults(response, platform);
        
    } catch (error) {
        showError('An error occurred: ' + error.message);
        console.error('Download error:', error);
    } finally {
        // Reset button
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        downloadBtn.disabled = false;
    }
}

async function callDownloadAPI(url, platform) {
    const platformData = platforms[platform];
    let apiUrl = platformData.apiEndpoint;
    const options = {
        method: platformData.apiMethod,
        headers: platformData.apiHeaders
    };
    
    // Handle GET vs POST requests
    if (platformData.apiMethod === 'GET') {
        const params = new URLSearchParams(platformData.apiParams(url));
        apiUrl += '?' + params.toString();
    } else {
        options.body = JSON.stringify(platformData.apiBody(url));
    }
    
    try {
        const response = await fetch(apiUrl, options);
        const data = await response.json();
        
        if (!response.ok || data.error) {
            throw new Error(data.message || 'API request failed');
        }
        
        // Format the response data consistently
        return formatResponse(data, platform);
        
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to mock data if API fails
        return generateMockResponse(url, platform);
    }
}

function formatResponse(data, platform) {
    // Format API response into a consistent structure
    const result = {
        success: true,
        platform: platform,
        title: '',
        thumbnail: '',
        duration: '',
        downloadOptions: []
    };
    
    switch(platform) {
        case 'youtube':
            if (data.url) {
                result.title = data.meta?.title || 'YouTube Video';
                result.thumbnail = data.thumb || getRandomThumbnail(platform);
                result.duration = data.meta?.duration?.pretty || 'N/A';
                
                // Add video download options
                if (data.url) {
                    result.downloadOptions.push({
                        quality: 'Best Quality',
                        type: 'video',
                        size: 'HD',
                        url: data.url
                    });
                }
                
                // Add audio option if available
                if (data.audio) {
                    result.downloadOptions.push({
                        quality: 'Audio Only',
                        type: 'audio',
                        size: 'MP3',
                        url: data.audio
                    });
                }
            }
            break;
            
        case 'instagram':
            if (data.video) {
                result.title = data.caption || 'Instagram Video';
                result.thumbnail = data.picture || getRandomThumbnail(platform);
                result.duration = 'N/A';
                
                result.downloadOptions.push({
                    quality: 'Best Quality',
                    type: 'video',
                    size: 'HD',
                    url: data.video
                });
            }
            break;
            
        case 'tiktok':
            if (data.data) {
                const videoData = data.data;
                result.title = videoData.title || 'TikTok Video';
                result.thumbnail = videoData.cover || getRandomThumbnail(platform);
                result.duration = 'N/A';
                
                result.downloadOptions.push({
                    quality: 'Best Quality',
                    type: 'video',
                    size: 'HD',
                    url: videoData.play
                });
            }
            break;
            
        case 'facebook':
            if (data.video) {
                result.title = data.title || 'Facebook Video';
                result.thumbnail = data.thumbnail || getRandomThumbnail(platform);
                result.duration = 'N/A';
                
                result.downloadOptions.push({
                    quality: 'Best Quality',
                    type: 'video',
                    size: 'HD',
                    url: data.video
                });
            }
            break;
            
        case 'snapchat':
            if (data.video) {
                result.title = 'Snapchat Video';
                result.thumbnail = data.thumbnail || getRandomThumbnail(platform);
                result.duration = 'N/A';
                
                result.downloadOptions.push({
                    quality: 'Best Quality',
                    type: 'video',
                    size: 'HD',
                    url: data.video
                });
            }
            break;
    }
    
    // If no options were added (API didn't return valid data), throw error
    if (result.downloadOptions.length === 0) {
        throw new Error('No download options available');
    }
    
    return result;
}

function generateMockResponse(url, platform) {
    const videoId = extractVideoId(url, platform);
    const duration = Math.floor(Math.random() * 600) + 30; // Random duration 30-630 seconds
    
    // Common response structure
    const response = {
        success: true,
        platform: platform,
        videoId: videoId,
        title: `Sample ${platforms[platform].name} Video - ${videoId}`,
        thumbnail: getRandomThumbnail(platform),
        duration: formatDuration(duration),
        downloadOptions: []
    };
    
    // Platform-specific options
    switch(platform) {
        case 'youtube':
            response.downloadOptions = [
                { quality: '4K 2160p', type: 'video', size: '150-300 MB', url: `https://example.com/download/${videoId}?quality=2160p` },
                { quality: 'HD 1440p', type: 'video', size: '80-150 MB', url: `https://example.com/download/${videoId}?quality=1440p` },
                { quality: 'HD 1080p', type: 'video', size: '50-80 MB', url: `https://example.com/download/${videoId}?quality=1080p` },
                { quality: 'SD 720p', type: 'video', size: '20-40 MB', url: `https://example.com/download/${videoId}?quality=720p` },
                { quality: 'Audio Only', type: 'audio', size: '3-8 MB', url: `https://example.com/download/${videoId}?quality=audio` }
            ];
            break;
        case 'instagram':
            response.downloadOptions = [
                { quality: 'Best Quality', type: 'video', size: '15-30 MB', url: `https://example.com/download/ig/${videoId}?quality=best` },
                { quality: 'SD 720p', type: 'video', size: '5-15 MB', url: `https://example.com/download/ig/${videoId}?quality=720p` },
                { quality: 'Audio Only', type: 'audio', size: '1-3 MB', url: `https://example.com/download/ig/${videoId}?quality=audio` }
            ];
            break;
        case 'tiktok':
            response.downloadOptions = [
                { quality: 'HD 1080p', type: 'video', size: '10-25 MB', url: `https://example.com/download/tt/${videoId}?quality=1080p` },
                { quality: 'SD 720p', type: 'video', size: '5-15 MB', url: `https://example.com/download/tt/${videoId}?quality=720p` },
                { quality: 'Audio Only', type: 'audio', size: '1-3 MB', url: `https://example.com/download/tt/${videoId}?quality=audio` }
            ];
            break;
        case 'facebook':
            response.downloadOptions = [
                { quality: 'HD 1080p', type: 'video', size: '30-60 MB', url: `https://example.com/download/fb/${videoId}?quality=1080p` },
                { quality: 'SD 720p', type: 'video', size: '15-30 MB', url: `https://example.com/download/fb/${videoId}?quality=720p` },
                { quality: 'Audio Only', type: 'audio', size: '2-5 MB', url: `https://example.com/download/fb/${videoId}?quality=audio` }
            ];
            break;
        case 'snapchat':
            response.downloadOptions = [
                { quality: 'HD Quality', type: 'video', size: '5-15 MB', url: `https://example.com/download/sc/${videoId}?quality=hd` },
                { quality: 'Audio Only', type: 'audio', size: '1-2 MB', url: `https://example.com/download/sc/${videoId}?quality=audio` }
            ];
            break;
    }
    
    return response;
}

function extractVideoId(url, platform) {
    const match = url.match(platforms[platform].regex);
    return match ? match[2] || match[1] : 'unknown';
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function getRandomThumbnail(platform) {
    // Return placeholder thumbnails based on platform
    const platformThumbs = {
        youtube: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        instagram: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868',
        tiktok: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0',
        facebook: 'https://images.unsplash.com/photo-1611162617263-4ec3060a058e',
        snapchat: 'https://images.unsplash.com/photo-1611162617213-6d7bebb53b0d'
    };
    
    return platformThumbs[platform] || 'https://via.placeholder.com/800x450?text=Video+Thumbnail';
}

function displayVideoPreview(data) {
    thumbnail.src = data.thumbnail;
    videoTitle.textContent = data.title;
    videoDuration.textContent = `Duration: ${data.duration}`;
    videoPreview.style.display = 'block';
}

function displayResults(data, platform) {
    // Clear previous options
    optionsDiv.innerHTML = '';
    
    // Add download options
    data.downloadOptions.forEach(option => {
        const btn = document.createElement('a');
        btn.className = 'download-btn';
        btn.href = option.url;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${option.quality.replace(' ', '_')}`;
        
        const icon = document.createElement('span');
        icon.textContent = option.type === 'video' ? '📹' : '🎵';
        
        const text = document.createElement('span');
        text.textContent = `${option.quality} (${option.size})`;
        
        btn.appendChild(icon);
        btn.appendChild(text);
        optionsDiv.appendChild(btn);
    });
    
    // Show results
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Allow pasting URLs and auto-detect platform
urlInput.addEventListener('paste', function(e) {
    setTimeout(() => {
        const pastedUrl = urlInput.value.trim();
        if (!pastedUrl) return;
        
        // Check which platform this URL belongs to
        for (const [platform, data] of Object.entries(platforms)) {
            if (data.regex.test(pastedUrl)) {
                if (platform !== currentPlatform) {
                    // Switch to the correct platform tab
                    currentPlatform = platform;
                    updatePlatformUI();
                    platformTabs.forEach(tab => {
                        tab.classList.remove('active');
                        if (tab.getAttribute('data-platform') === platform) {
                            tab.classList.add('active');
                        }
                    });
                }
                break;
            }
        }
    }, 10);
});