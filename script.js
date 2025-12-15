// Gestion du formulaire en plusieurs étapes
document.addEventListener('DOMContentLoaded', function() {
    // Navigation entre les étapes du formulaire
    const nextStepButtons = document.querySelectorAll('.next-step');
    const prevStepButtons = document.querySelectorAll('.prev-step');
    const formSteps = document.querySelectorAll('.form-step');
    const form = document.getElementById('announcementForm');
    const successMessage = document.getElementById('successMessage');
    
    nextStepButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const nextStepId = this.getAttribute('data-next');
            const nextStep = document.getElementById(nextStepId);
            
            // Validation basique avant de passer à l'étape suivante
            const inputs = currentStep.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (isValid) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                
                // Mettre à jour l'indicateur d'étape
                updateStepIndicator(nextStepId);
            } else {
                alert('Veuillez remplir tous les champs obligatoires avant de continuer.');
            }
        });
    });
    
    prevStepButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const prevStepId = this.getAttribute('data-prev');
            const prevStep = document.getElementById(prevStepId);
            
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
            
            // Mettre à jour l'indicateur d'étape
            updateStepIndicator(prevStepId);
        });
    });
    
    // Mettre à jour l'indicateur d'étape
    function updateStepIndicator(stepId) {
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            step.classList.remove('active');
        });
        
        const stepNumber = stepId.replace('step', '');
        const stepIndicator = document.querySelector(`.step:nth-child(${stepNumber})`);
        if (stepIndicator) {
            stepIndicator.classList.add('active');
        }
    }
    
    // Gestion de la soumission du formulaire
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simuler l'envoi du formulaire
            form.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Faire défiler vers le haut du message de succès
            successMessage.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Gestion de l'upload de fichiers
    const fileInput = document.getElementById('images');
    const fileList = document.getElementById('file-list');
    
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            fileList.innerHTML = '';
            const files = Array.from(this.files);
            
            if (files.length > 5) {
                alert('Vous ne pouvez sélectionner que 5 fichiers maximum.');
                this.value = '';
                return;
            }
            
            files.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <i class="fas fa-file"></i>
                    <span>${file.name} (${formatBytes(file.size)})</span>
                    <button type="button" class="remove-file" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                fileList.appendChild(fileItem);
            });
            
            // Gestion des boutons de suppression
            document.querySelectorAll('.remove-file').forEach(button => {
                button.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    removeFileFromInput(index);
                });
            });
        });
    }
    
    // Supprimer un fichier de la liste
    function removeFileFromInput(index) {
        const dt = new DataTransfer();
        const files = Array.from(fileInput.files);
        
        files.forEach((file, i) => {
            if (i !== index) {
                dt.items.add(file);
            }
        });
        
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change'));
    }
    
    // Formater la taille des fichiers
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Filtrage des annonces
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const announcementCards = document.querySelectorAll('.announcement-card');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    function applyFilters() {
        const selectedCategory = categoryFilter.value;
        const selectedPrice = priceFilter.value;
        
        announcementCards.forEach(card => {
            const cardCategory = card.querySelector('.announcement-category').className.includes(selectedCategory);
            const cardPriceText = card.querySelector('.announcement-price').textContent;
            const cardPrice = extractPriceValue(cardPriceText);
            
            let categoryMatch = true;
            let priceMatch = true;
            
            if (selectedCategory && !cardCategory) {
                categoryMatch = false;
            }
            
            if (selectedPrice) {
                if (selectedPrice === '0-500' && cardPrice > 500) {
                    priceMatch = false;
                } else if (selectedPrice === '500-2000' && (cardPrice < 500 || cardPrice > 2000)) {
                    priceMatch = false;
                } else if (selectedPrice === '2000+' && cardPrice < 2000) {
                    priceMatch = false;
                }
            }
            
            if (categoryMatch && priceMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    function resetFilters() {
        categoryFilter.value = '';
        priceFilter.value = '';
        
        announcementCards.forEach(card => {
            card.style.display = 'block';
        });
    }
    
    // Extraire la valeur numérique d'un prix
    function extractPriceValue(priceText) {
        // Supprimer les caractères non numériques sauf le point et la virgule
        const numericString = priceText.replace(/[^\d,.]/g, '').replace(',', '.');
        const number = parseFloat(numericString);
        
        // Gérer les prix annuels (en divisant par 12 pour une comparaison approximative)
        if (priceText.includes('/an')) {
            return number / 12;
        } else if (priceText.includes('/mois')) {
            return number;
        } else {
            return number;
        }
    }
    
    // Menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
        
        // Fermer le menu mobile en cliquant sur un lien
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                }
            });
        });
    }
    
    // Ajuster l'affichage du menu en fonction de la taille de l'écran
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
        }
    });
});