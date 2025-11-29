document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.cont-form form');
    const submitButton = contactForm.querySelector('.submit');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Change button text to show loading
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        // Get form data
        const formData = {
            fullName: contactForm.querySelector('input[placeholder="Full Name"]').value,
            email: contactForm.querySelector('input[placeholder="Email"]').value,
            phone: contactForm.querySelector('input[placeholder="Phone Number"]').value,
            subject: contactForm.querySelector('input[placeholder="Subject"]').value,
            message: contactForm.querySelector('textarea[placeholder="Your Message"]').value
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Show success message
                alert('Message sent successfully! Thank you for contacting me.');
                contactForm.reset();
            } else {
                throw new Error(data.error || 'Failed to send message');
            }
        } catch (error) {
            // Show error message
            alert('Error sending message: ' + error.message);
        } finally {
            // Reset button state
            submitButton.textContent = 'Send Message';
            submitButton.disabled = false;
        }
    });
});