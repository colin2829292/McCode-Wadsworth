// Start Homepage.js --------------------------------------------------------------------------------------------------------------

// JavaScript code to handle category navigation and interactive code blocks
document.addEventListener('DOMContentLoaded', () => {
    // Handle sidebar navigation links
    const categoryLinks = document.querySelectorAll('.sidebar ul li a');

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Check if link is an external page or an anchor
            const href = link.getAttribute('href');
            if (href.startsWith('#') || href === '#') {
                e.preventDefault();
                const category = link.getAttribute('data-category');

                // Scroll to the selected category section
                const targetSection = document.getElementById(category);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Highlight the active sidebar link
    const currentPage = window.location.pathname.split('/').pop();

    categoryLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Handle category item clicks
    const categoryItems = document.querySelectorAll('.category-item');

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const code = item.getAttribute('data-code');
            const info = item.getAttribute('data-info');
            const title = item.getAttribute('data-title');

            // For demonstration, we'll use dummy data for "Calculate Area of a Circle"
            if (title === "Calculate Area of a Circle") {
                const dummyData = {
                    description: "A Python script that calculates the area of a circle given its radius.",
                    features: `
                        <ul>
                            <li>Simple and easy-to-use function</li>
                            <li>Uses Python's math module for accurate calculations</li>
                            <li>Handles user input gracefully</li>
                            <li>Lightweight and efficient</li>
                        </ul>
                    `,
                    usage: "Run the script and input the radius when prompted to get the area of the circle.",
                    pricing: "Free for personal use. Contact us for enterprise licensing.",
                    dependencies: `
                        <ul>
                            <li>Python 3.x</li>
                            <li>math module (standard library)</li>
                        </ul>
                    `,
                    installation: "Download the script and ensure Python 3.x is installed on your system.",
                    configuration: "No additional configuration required. Modify the script as needed for custom use cases.",
                    compatibility: "Compatible with Windows, macOS, and Linux operating systems.",
                    examples: `
                        <pre><code>
$ python calculate_area.py
Enter the radius of the circle: 5
The area of the circle is 78.53981633974483
                        </code></pre>
                    `,
                    documentation: "<a href='https://example.com/documentation/calculate-area'>View Detailed Documentation</a>",
                    support: "Email support available at support@mccode-wadsworth.com.",
                    license: "MIT License",
                    version: "1.0.0",
                    author: "John Smith (<a href='mailto:john.smith@example.com'>john.smith@example.com</a>)"
                };

                openModal(dummyData, code, title);
            } else {
                // Handle other items similarly or fetch data dynamically
                openModal({ 
                    // Placeholder for other items
                }, code, title);
            }
        });
    });

    // Modal functionality
    const modal = document.getElementById('infoModal');
    const closeButton = modal.querySelector('.close-button');
    const copyModalCodeBtn = document.getElementById('copyModalCode');

    closeButton.addEventListener('click', () => {
        closeModal();
    });

    copyModalCodeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent modal from closing when clicking copy
        const codeText = document.getElementById('modal-code').innerText;
        navigator.clipboard.writeText(codeText)
            .then(() => {
                alert('Code copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    function openModal(data, code, title) {
        const modalDescription = document.getElementById('modal-description');
        const modalFeatures = document.getElementById('modal-features');
        const modalUsage = document.getElementById('modal-usage');
        const modalPricing = document.getElementById('modal-pricing');
        const modalDependencies = document.getElementById('modal-dependencies');
        const modalInstallation = document.getElementById('modal-installation');
        const modalConfiguration = document.getElementById('modal-configuration');
        const modalCompatibility = document.getElementById('modal-compatibility');
        const modalExamples = document.getElementById('modal-examples');
        const modalDocumentation = document.getElementById('modal-documentation');
        const modalSupport = document.getElementById('modal-support');
        const modalLicense = document.getElementById('modal-license');
        const modalVersion = document.getElementById('modal-version');
        const modalAuthor = document.getElementById('modal-author');
        const modalCodeElement = document.getElementById('modal-code');

        modalDescription.innerHTML = data.description || 'N/A';
        modalFeatures.innerHTML = data.features || 'N/A';
        modalUsage.innerHTML = data.usage || 'N/A';
        modalPricing.innerHTML = data.pricing || 'N/A';
        modalDependencies.innerHTML = data.dependencies || 'N/A';
        modalInstallation.innerHTML = data.installation || 'N/A';
        modalConfiguration.innerHTML = data.configuration || 'N/A';
        modalCompatibility.innerHTML = data.compatibility || 'N/A';
        modalExamples.innerHTML = data.examples || 'N/A';
        modalDocumentation.innerHTML = data.documentation || 'N/A';
        modalSupport.innerHTML = data.support || 'N/A';
        modalLicense.innerHTML = data.license || 'N/A';
        modalVersion.innerHTML = data.version || 'N/A';
        modalAuthor.innerHTML = data.author || 'N/A';
        modalCodeElement.innerText = code || '// No code available';

        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }
});

// End Homepage.js --------------------------------------------------------------------------------------------------------------
