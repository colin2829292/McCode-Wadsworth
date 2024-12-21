document.addEventListener('DOMContentLoaded', () => {

    let modalData = {};
    let originalItems = [];
    let selectedKeywords = [];
    let selectedGroup = 'all';

    const resetButton = document.getElementById('resetButton');
    const filterInput = document.getElementById('filterInput');
    const groupList = document.getElementById('groupList');
    const filterList = document.getElementById('filterList');

    resetButton.addEventListener('click', () => {
        filterInput.value = '';
        selectedKeywords = [];
        selectedGroup = 'all';
        updateGroups();
        updateKeywords();
        updateItems();
        document.querySelectorAll('#groupList button, #filterList button').forEach(btn => btn.classList.remove('active'));
        groupList.scrollTop = 0;
        filterList.scrollTop = 0;
    });

    fetch('../Assets/json/modaldata.json')
        .then(response => response.json())
        .then(data => {
            modalData = data;
            initializeFilters();
            initializeModal();
        })
        .catch(error => console.error('Failed to load modal data:', error));

    function initializeFilters() {
        // Collect all items from all .item-grid elements
        document.querySelectorAll('.item-grid .item').forEach(item => originalItems.push(item));
        updateGroups();
        updateKeywords();
        filterInput.addEventListener('input', () => filterByQuery(filterInput.value.toLowerCase()));
    }

    function updateGroups() {
        const groups = new Set(['all']);
        Object.values(modalData).forEach(item => {
            if (item.Group && item.Group !== 'Coming Soon') {
                groups.add(item.Group);
            }
        });

        groupList.innerHTML = '';
        groups.forEach(group => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = group === 'all' ? 'All Groups' : group;
            button.addEventListener('click', () => {
                selectedGroup = (selectedGroup === group) ? 'all' : group;
                document.querySelectorAll('#groupList button').forEach(btn => btn.classList.toggle('active', btn === button && selectedGroup !== 'all'));
                updateKeywords();
                updateItems();
            });
            li.appendChild(button);
            groupList.appendChild(li);
        });
    }

    function updateKeywords() {
        const keywords = new Set();
        Object.values(modalData).forEach(item => {
            if (selectedGroup === 'all' || item.Group === selectedGroup) {
                item.Keywords?.split(',').forEach(kw => keywords.add(kw.trim()));
            }
        });

        filterList.innerHTML = '';
        keywords.forEach(keyword => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = keyword;
            button.addEventListener('click', () => {
                if (selectedKeywords.includes(keyword)) {
                    selectedKeywords = selectedKeywords.filter(k => k !== keyword);
                    button.classList.remove('active');
                } else {
                    selectedKeywords.push(keyword);
                    button.classList.add('active');
                }
                updateItems();
            });
            li.appendChild(button);
            filterList.appendChild(li);
        });
    }

    function updateItems() {
        document.querySelectorAll('.item-grid .item').forEach(item => {
            const title = item.getAttribute('data-title');
            const itemData = modalData[title];
            if (itemData) {
                const matchesGroup = selectedGroup === 'all' || itemData.Group === selectedGroup;
                const matchesKeywords = selectedKeywords.every(kw => itemData.Keywords?.includes(kw));
                item.style.display = (matchesGroup && matchesKeywords) ? 'block' : 'none';
            }
        });
    }

    function filterByQuery(query) {
        document.querySelectorAll('.item-grid .item').forEach(item => {
            const title = item.getAttribute('data-title').toLowerCase();
            item.style.display = title.includes(query) ? 'block' : 'none';
        });
    }
 
    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    // Initialize Modal Functionality
    function initializeModal() {
        const categoryItems = document.querySelectorAll('.category-item');

        // Lightbox Elements
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxPrev = document.getElementById('lightbox-prev');
        const lightboxNext = document.getElementById('lightbox-next');
        const lightboxClose = document.querySelector('.lightbox-close');

        let currentPhotoUrls = [];
        let currentIndex = 0;

        // Handle modal opening
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                const title = item.getAttribute('data-title');
                const data = modalData[title] || {};
                openModal(data, title);
            });
        });

        function openModal(data, title) {
            const photoItems = document.querySelectorAll('.photo-item');
            const overlayClass = 'photo-overlay'; // Overlay class for additional count

            // Handle images
            if (data.photoUrls && data.photoUrls.length) {
                photoItems.forEach((photoItem, index) => {
                    if (data.photoUrls[index]) {
                        photoItem.style.backgroundImage = `url(${data.photoUrls[index]})`;
                        photoItem.style.display = 'block'; // Show the photo item
                        photoItem.dataset.index = index; // Index for lightbox

                        // Clear any existing overlay
                        let existingOverlay = photoItem.querySelector(`.${overlayClass}`);
                        if (existingOverlay) existingOverlay.remove();

                        // If this is the last visible photo and there are extras, add an overlay
                        if (index === photoItems.length - 1 && data.photoUrls.length > photoItems.length) {
                            const remainingCount = data.photoUrls.length - photoItems.length;
                            const overlay = document.createElement('div');
                            overlay.className = overlayClass;
                            overlay.innerText = `+${remainingCount} more`;
                            photoItem.appendChild(overlay); // Add the overlay
                            overlay.style.display = 'block'; // Ensure it's visible
                        }
                    } else {
                        photoItem.style.backgroundImage = 'none';
                        photoItem.style.display = 'none'; // Hide unused items
                    }
                });
                document.getElementById('no-images-message').style.display = 'none';
            } else {
                photoItems.forEach(photoItem => {
                    photoItem.style.backgroundImage = 'none';
                    photoItem.style.display = 'none'; // Hide all items if no photos available
                });
                // Show "No Images Available" message
                document.getElementById('no-images-message').style.display = 'block';
            }

            // Populate modal fields dynamically
            const modalDetails = document.getElementById('modal-details');
            modalDetails.innerHTML = ''; // Clear existing content

            for (const [key, value] of Object.entries(data)) {
                // Skip photoUrls and Code as they are handled separately
                if (key === 'photoUrls' || key === 'Code') continue;

                // Handle Cover Image as an image element
                if (key === 'Cover Image') {
                    const tr = document.createElement('tr');

                    const tdAspect = document.createElement('td');
                    tdAspect.textContent = key;
                    tr.appendChild(tdAspect);

                    const tdDetails = document.createElement('td');
                    if (value) {
                        const img = document.createElement('img');
                        img.src = value;
                        img.alt = key;
                        img.style.maxWidth = '100px'; // Adjust as needed
                        tdDetails.appendChild(img);
                    } else {
                        // Optionally, omit this row if no cover image is provided
                        tdDetails.textContent = 'N/A';
                    }
                    tr.appendChild(tdDetails);

                    modalDetails.appendChild(tr);
                    continue;
                }

                // Handle other fields, supporting HTML content
                const tr = document.createElement('tr');

                const tdAspect = document.createElement('td');
                tdAspect.textContent = key;
                tr.appendChild(tdAspect);

                const tdDetails = document.createElement('td');
                // Check if value contains HTML tags
                if (/<[a-z][\s\S]*>/i.test(value)) {
                    tdDetails.innerHTML = value;
                } else {
                    tdDetails.textContent = value;
                }
                tr.appendChild(tdDetails);

                modalDetails.appendChild(tr);
            }

            // Handle multiple code sections
            const codeSectionsContainer = document.getElementById('code-sections');
            codeSectionsContainer.innerHTML = ''; // Clear existing code sections

            if (data.Code && Array.isArray(data.Code) && data.Code.length > 0) {
                data.Code.forEach((codeObj, index) => {
                    const { language, code } = codeObj;

                    // Create a container for each code snippet
                    const codeContainer = document.createElement('div');
                    codeContainer.classList.add('code-snippet');

                    // Create a header for the code type
                    const codeHeader = document.createElement('h4');
                    codeHeader.textContent = `${language} Code`;
                    codeContainer.appendChild(codeHeader);

                    // Create a button to copy the code
                    const copyButton = document.createElement('button');
                    copyButton.classList.add('copy-btn');
                    copyButton.textContent = 'Copy';
                    copyButton.setAttribute('data-code-index', index);
                    codeContainer.appendChild(copyButton);

                    // Create a pre > code block
                    const pre = document.createElement('pre');
                    const codeBlock = document.createElement('code');
                    codeBlock.classList.add(language.toLowerCase()); // e.g., 'html', 'css'
                    codeBlock.textContent = code;
                    pre.appendChild(codeBlock);
                    codeContainer.appendChild(pre);

                    // Append the code container to the main code sections container
                    codeSectionsContainer.appendChild(codeContainer);
                });

                // Initialize Highlight.js after adding code snippets
                if (window.hljs) {
                    hljs.highlightAll();
                }

                // Add event listeners to all copy buttons
                const copyButtons = codeSectionsContainer.querySelectorAll('.copy-btn');
                copyButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const codeIndex = button.getAttribute('data-code-index');
                        const codeText = data.Code[codeIndex].code;
                        navigator.clipboard.writeText(codeText)
                            .then(() => {
                                // Change button text to indicate success
                                const originalText = button.textContent;
                                button.textContent = 'Copied!';
                                button.disabled = true; // Optional: Disable to prevent multiple clicks
                                setTimeout(() => {
                                    button.textContent = originalText;
                                    button.disabled = false; // Re-enable the button
                                }, 2000); // Duration matches the CSS transition
                            })
                            .catch(err => {
                                console.error('Failed to copy: ', err);
                                // Optionally, provide feedback for failure
                                button.textContent = 'Error';
                                setTimeout(() => {
                                    button.textContent = 'Copy';
                                }, 2000);
                            });
                    });
                });

                // Show the code sections container
                codeSectionsContainer.style.display = 'block';
                // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                applySubscriptionRestrictions();

            } else {
                // Hide the code sections container if no code is available
                codeSectionsContainer.style.display = 'none';
            }

            // Update currentPhotoUrls for lightbox
            currentPhotoUrls = data.photoUrls || [];

            // Open the modal
            const modal = document.getElementById('infoModal');
            modal.style.display = 'block';
        }

        // Modal Elements
        const modal = document.getElementById('infoModal');
        const closeButton = modal.querySelector('.close-button');

        // Close modal when close button is clicked
        closeButton.addEventListener('click', () => {
            closeModal();
        });

        // Close modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });

        function closeModal() {
            modal.style.display = 'none';
        }

        // Lightbox Functions
        function openLightbox(index) {
            if (currentPhotoUrls.length === 0) return;
            currentIndex = index;
            lightboxImage.src = currentPhotoUrls[currentIndex];
            lightbox.style.display = 'flex';
        }

        function closeLightboxFunc() {
            lightbox.style.display = 'none';
        }

        function showNextImage() {
            if (currentPhotoUrls.length === 0) return;
            currentIndex = (currentIndex + 1) % currentPhotoUrls.length; // Wrap around
            lightboxImage.src = currentPhotoUrls[currentIndex];
        }

        function showPrevImage() {
            if (currentPhotoUrls.length === 0) return;
            currentIndex = (currentIndex - 1 + currentPhotoUrls.length) % currentPhotoUrls.length; // Wrap around
            lightboxImage.src = currentPhotoUrls[currentIndex];
        }

        // Add click event to photo items to open lightbox
        const photoGrid = document.querySelectorAll('.photo-item');
        photoGrid.forEach(photo => {
            photo.addEventListener('click', () => {
                const index = parseInt(photo.dataset.index, 10);
                if (!isNaN(index)) {
                    openLightbox(index);
                }
            });
        });

        // Lightbox event listeners
        lightboxClose.addEventListener('click', closeLightboxFunc);
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextImage();
        });
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrevImage();
        });

        // Prevent clicks inside the lightbox image from closing the lightbox
        lightboxImage.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Close lightbox when clicking outside the image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightboxFunc();
            }
        });

        // Keyboard navigation for lightbox
        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === 'flex') {
                if (e.key === 'ArrowRight') {
                    showNextImage();
                }
                if (e.key === 'ArrowLeft') {
                    showPrevImage();
                }
                if (e.key === 'Escape') {
                    closeLightboxFunc();
                }
            }
        });
    }
});



async function applySubscriptionRestrictions() {
    const subscribed = await isUserSubscribed(); // Uses the function from subscription.js
    const codeSectionsContainer = document.getElementById('code-sections');

    if (!codeSectionsContainer) return; // Safety check

    const codeSnippets = codeSectionsContainer.querySelectorAll('.code-snippet');
    const codeBlocks = codeSectionsContainer.querySelectorAll('pre code');
    const copyButtons = codeSectionsContainer.querySelectorAll('.copy-btn');

    if (!subscribed) {
        // If not subscribed, disable scroll and copy
        codeBlocks.forEach(block => {
            block.style.overflow = 'hidden';
        });

        copyButtons.forEach(button => {
            button.disabled = true;
            button.textContent = 'Upgrade to Copy';
        });

        // Disable text selection by adding .no-copy class to each code snippet
        codeSnippets.forEach(snippet => {
            snippet.classList.add('no-copy');
        });

        // Wrap each code snippet in an overlay-container and add no-copy-overlay
        codeSnippets.forEach(snippet => {
            if (!snippet.classList.contains('overlay-container')) {
                snippet.classList.add('overlay-container');
            }

            // Check if overlay already exists
            let overlay = snippet.querySelector('.no-copy-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.classList.add('no-copy-overlay');
                snippet.appendChild(overlay);
            }

            // Disable context menu on code snippets
            snippet.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        });

        // Optional: Prevent copy events directly
        codeBlocks.forEach(block => {
            block.addEventListener('copy', (e) => {
                e.preventDefault();
            });
        });

    } else {
        // If subscribed, enable scrolling and copying
        codeBlocks.forEach(block => {
            block.style.overflow = 'auto';
        });

        copyButtons.forEach(button => {
            button.disabled = false;
            button.textContent = 'Copy';
        });

        // Remove no-copy and overlay if previously added
        codeSnippets.forEach(snippet => {
            snippet.classList.remove('no-copy');
            snippet.classList.remove('overlay-container');

            // Remove overlay if exists
            const overlay = snippet.querySelector('.no-copy-overlay');
            if (overlay) {
                overlay.remove();
            }

            // Re-enable context menu if desired (not strictly necessary)
            snippet.removeEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        });

        // Remove copy event listeners if added (optional)
        codeBlocks.forEach(block => {
            // Since we defined inline listeners above, you could remove them if needed
            // For simplicity, this might be left as is, as it won't fire if subscribed.
        });
    }
}





/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */

const categoryLinks = document.querySelectorAll('.sidebar ul li a');

categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#') || href === '#') {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            const targetSection = document.getElementById(category.replace(/ /g, '-'));
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error(`No section found for category: "${category}"`);
            }
        }
    });
});

/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */

const currentPage = window.location.pathname.split('/').pop();

categoryLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */

document.getElementById('homeButton').addEventListener('click', () => {
window.location.href = '/html/homepage.html'; });