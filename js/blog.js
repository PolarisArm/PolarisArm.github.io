// Blog Interactivity Script

document.addEventListener('DOMContentLoaded', function() {
    initializeBlogFunctionality();
});

function initializeBlogFunctionality() {
    // Initialize write form
    const writeForm = document.querySelector('.write-form');
    if (writeForm) {
        writeForm.addEventListener('submit', handleWriteFormSubmit);
    }

    // Initialize comment form
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentFormSubmit);
    }

    // Initialize tool buttons
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
        btn.addEventListener('click', handleToolButtonClick);
    });

    // Initialize read more links
    const readMoreLinks = document.querySelectorAll('.read-more');
    readMoreLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });

    // Initialize comment actions
    const commentActions = document.querySelectorAll('.comment-action');
    commentActions.forEach(action => {
        action.addEventListener('click', handleCommentAction);
    });

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.navbar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
}

// Handle write form submission
function handleWriteFormSubmit(e) {
    e.preventDefault();
    
    const textarea = this.querySelector('.write-textarea');
    const content = textarea.value.trim();

    if (!content) {
        alert('Please write something before posting!');
        return;
    }

    // Show success message
    showNotification('Post published successfully!', 'success');
    
    // Reset form
    textarea.value = '';

    // Create new post element and add to feed
    const newPost = createPostElement(content);
    const postsGrid = document.querySelector('.posts-grid');
    if (postsGrid) {
        postsGrid.insertAdjacentHTML('afterbegin', newPost);
    }
}

// Handle comment form submission
function handleCommentFormSubmit(e) {
    e.preventDefault();
    
    const nameInput = this.querySelector('input[placeholder="Your Name"]');
    const emailInput = this.querySelector('input[placeholder="Your Email"]');
    const textareaInput = this.querySelector('textarea');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const comment = textareaInput.value.trim();

    if (!name || !email || !comment) {
        alert('Please fill in all fields!');
        return;
    }

    // Validate email
    if (!validateEmail(email)) {
        alert('Please enter a valid email address!');
        return;
    }

    // Show success message
    showNotification('Comment posted successfully!', 'success');

    // Create and insert new comment
    const newComment = createCommentElement(name, comment);
    const commentsList = document.querySelector('.comments-section');
    const formSection = document.querySelector('.comment-form-section');
    commentsList.insertBefore(newComment, formSection);

    // Reset form
    nameInput.value = '';
    emailInput.value = '';
    textareaInput.value = '';

    // Update comment count
    updateCommentCount();
}

// Handle tool button clicks
function handleToolButtonClick(e) {
    e.preventDefault();
    
    const textarea = document.querySelector('.write-textarea');
    const icon = this.querySelector('i').className;

    let insertText = '';

    if (icon.includes('fa-link')) {
        insertText = '[Link Text](https://example.com)';
    } else if (icon.includes('fa-image')) {
        insertText = '![Alt text](image-url)';
    } else if (icon.includes('fa-code')) {
        insertText = '```\nconst code = "here";\n```';
    } else if (icon.includes('fa-quote')) {
        insertText = '> Quote text here';
    }

    if (insertText) {
        textarea.value += '\n' + insertText;
        textarea.focus();
        showNotification('Format added!', 'info');
    }
}

// Handle comment actions (like, reply)
function handleCommentAction(e) {
    e.preventDefault();
    
    const actionIcon = this.querySelector('i').className;
    
    if (actionIcon.includes('fa-thumbs-up')) {
        this.style.color = 'var(--primary-color)';
        showNotification('Thanks for the thumbs up!', 'info');
    } else if (actionIcon.includes('fa-reply')) {
        showNotification('Reply feature coming soon!', 'info');
    }
}

// Smooth scroll handler
function smoothScroll(e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Create new post element
function createPostElement(content) {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const readTime = Math.ceil(content.split(' ').length / 200); // Estimate read time

    return `
        <article class="blog-card card" style="animation: slideDown 0.3s ease-out;">
            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop" class="card-img-top" alt="Post">
            <div class="card-body">
                <div class="post-meta">
                    <span class="post-date"><i class="far fa-calendar"></i> ${date}</span>
                    <span class="post-category"><i class="fas fa-tag"></i> New</span>
                </div>
                <h3 class="card-title">New Post</h3>
                <p class="card-text">${content.substring(0, 100)}...</p>
                <div class="post-footer">
                    <a href="#" class="read-more">Read More →</a>
                    <span class="read-time">${readTime} min read</span>
                </div>
            </div>
        </article>
    `;
}

// Create new comment element
function createCommentElement(name, comment) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    const div = document.createElement('div');
    div.className = 'comment';
    div.style.animation = 'fadeIn 0.5s ease-out';
    div.innerHTML = `
        <div class="comment-header">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${name}" alt="Avatar" class="comment-avatar">
            <div class="comment-info">
                <h4 class="comment-name">${escapeHtml(name)}</h4>
                <span class="comment-date">just now</span>
            </div>
        </div>
        <p class="comment-text">${escapeHtml(comment)}</p>
        <div class="comment-actions">
            <a href="#" class="comment-action"><i class="fas fa-thumbs-up"></i> Like</a>
            <a href="#" class="comment-action"><i class="fas fa-reply"></i> Reply</a>
        </div>
    `;

    // Add event listeners to new comment actions
    div.querySelectorAll('.comment-action').forEach(action => {
        action.addEventListener('click', handleCommentAction);
    });

    return div;
}

// Update comment count
function updateCommentCount() {
    const commentCount = document.querySelectorAll('.comment').length;
    const countElement = document.querySelector('.comment-count');
    if (countElement) {
        countElement.textContent = `(${commentCount})`;
    }
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Add animation
    const style = document.createElement('style');
    if (!document.querySelector('style[data-notification-animations]')) {
        style.setAttribute('data-notification-animations', 'true');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Add slideDown animation if not already added
if (!document.querySelector('style[data-extras]')) {
    const style = document.createElement('style');
    style.setAttribute('data-extras', 'true');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}
