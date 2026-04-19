# The Papyrus Website

A static business website frontend built with HTML, CSS, and JavaScript, now integrated with Firebase for authentication and database.

## Features

- Responsive design
- Dual language support (English and Hindi)
- Smooth animations
- White background with blue and green gradients
- Firebase Authentication (Google sign-in)
- Firestore database integration (contact form submissions)
- Pages: Home, About, Services

## Usage

1. Open `index.html` in your web browser to view the website.
2. Use the "Switch to Hindi" button to toggle between English and Hindi.
3. Click "Login with Google" to authenticate.
4. Navigate between pages using the menu.
5. Use the contact form on the home page to send messages (requires login).

## Firebase Setup

The website uses Firebase for authentication and data storage. The configuration is included in the HTML files.

- Authentication: Google sign-in
- Database: Firestore for storing contact messages

## Customization

- Replace placeholder text in the HTML files with your actual content.
- Modify `styles.css` to adjust colors, fonts, and layouts.
- Add more features or languages in `script.js` if needed.
- Update Firebase config if using a different project.

## Troubleshooting

- If animations don't work, ensure your browser supports CSS animations.
- For Firebase issues, check the browser console for errors.
- Ensure internet connection for Firebase services.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- Firebase (Authentication & Firestore)