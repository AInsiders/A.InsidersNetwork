// Simple Mobile Navigation - Working Hamburger Menu
document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple mobile navigation loaded');
    
    // Wait a bit to ensure DOM is fully ready
    setTimeout(function() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        console.log('Nav toggle element:', navToggle);
        console.log('Nav menu element:', navMenu);
        console.log('Nav toggle display:', navToggle ? getComputedStyle(navToggle).display : 'not found');
        console.log('Nav toggle z-index:', navToggle ? getComputedStyle(navToggle).zIndex : 'not found');
        
        if (navToggle && navMenu) {
            let clickCount = 0;
            
            // Add multiple event listeners to ensure it works
            navToggle.addEventListener('click', handleToggleClick);
            navToggle.addEventListener('mousedown', handleToggleClick);
            navToggle.addEventListener('touchstart', handleToggleClick);
            
            function handleToggleClick(e) {
                e.preventDefault();
                e.stopPropagation();
                clickCount++;
                console.log('Nav toggle clicked! Count:', clickCount);
                console.log('Event type:', e.type);
                
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                
                console.log('Toggle active:', navToggle.classList.contains('active'));
                console.log('Menu active:', navMenu.classList.contains('active'));
            }
            
            // Handle dropdown arrows
            const dropdownArrows = document.querySelectorAll('.dropdown-arrow');
            dropdownArrows.forEach(arrow => {
                arrow.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const dropdown = this.closest('.nav-dropdown');
                    if (dropdown) {
                        // Close other dropdowns first
                        document.querySelectorAll('.nav-dropdown.active').forEach(activeDropdown => {
                            if (activeDropdown !== dropdown) {
                                activeDropdown.classList.remove('active');
                            }
                        });
                        
                        dropdown.classList.toggle('active');
                        console.log('Dropdown toggled:', dropdown.classList.contains('active'));
                        console.log('Dropdown element:', dropdown);
                        console.log('Arrow clicked:', this);
                    }
                });
            });
            
            // Also handle clicks on the nav-link-container for better UX
            const navLinkContainers = document.querySelectorAll('.nav-link-container');
            navLinkContainers.forEach(container => {
                container.addEventListener('click', function(e) {
                    if (e.target.classList.contains('dropdown-arrow')) {
                        return; // Let the arrow handle it
                    }
                    
                    const dropdown = this.closest('.nav-dropdown');
                    if (dropdown) {
                        dropdown.classList.toggle('active');
                        console.log('Container clicked, dropdown toggled:', dropdown.classList.contains('active'));
                    }
                });
            });
            
            // Close menu when clicking on menu items
            const menuLinks = navMenu.querySelectorAll('.nav-link');
            menuLinks.forEach(link => {
                link.addEventListener('click', function() {
                    console.log('Menu link clicked:', this.href);
                    // Close all dropdowns when clicking a menu link
                    document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
                        dropdown.classList.remove('active');
                    });
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
            
            // Close menu when clicking outside with improved dropdown handling
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.nav-toggle') && 
                    !e.target.closest('.nav-menu') && 
                    navMenu.classList.contains('active')) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });

            // Removed hover delay to prevent orb tracking interference
            
            // Close menu on ESC key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
            
            console.log('Mobile navigation initialized successfully');
        } else {
            console.error('Navigation elements not found!');
            console.error('navToggle:', navToggle);
            console.error('navMenu:', navMenu);
        }
    }, 100);
    
    // Update width display
    function updateWidth() {
        console.log('Window width:', window.innerWidth + 'px');
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
});