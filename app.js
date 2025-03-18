// Configuration
const IMGBB_API_KEY = '7a8b1190cabc8a5480bde9e6186b4428'; // Votre clé imgBB
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSaUJR8hUFpLIoHI9UyKPs40KneVNQifm7asoiXFKv0TdNzNjlfrxS_h2glvs9t9XOmQ/exec'; // Votre URL Google Script

// Gestion de la photo
document.getElementById('photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        document.getElementById('previewPhoto').style.backgroundImage = `url(${event.target.result})`;
    };
    
    reader.readAsDataURL(file);
});

// Soumission du formulaire
document.getElementById('formInscription').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const id = Date.now();
    const date = new Date().toISOString();

    try {
        // 1. Upload de la photo
        const photoFile = document.getElementById('photo').files[0];
        const photoURL = await uploadPhoto(photoFile);

        // 2. Préparer les données
        const data = {
            id,
            photo: photoURL,
            nom: form.nom.value,
            postnom: form.postnom.value || '',
            prenom: form.prenom.value,
            telephone: form.telephone.value,
            email: form.email.value,
            adresse: form.adresse.value || '',
            categorie: form.categorie.value,
            wazawazi: '', // À adapter si nécessaire
            date
        };

        // 3. Envoyer à Google Sheets
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        // 4. Générer PDF
        generatePDF(data);

        alert('Inscription réussie !');
        form.reset();
        document.getElementById('previewPhoto').style.backgroundImage = '';

    } catch (error) {
        alert(`Erreur : ${error.message}`);
    }
});

async function uploadPhoto(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) throw new Error('Échec de l\'upload de la photo');
    return (await response.json()).data.url;
}

function generatePDF(data) {
    const doc = new jspdf.jsPDF();
    
    // QR Code
    const qr = qrcode(0, 'M');
    qr.addData(data.id.toString());
    qr.make();
    
    // Contenu
    doc.setFontSize(18);
    doc.text("Fiche d'inscription", 20, 20);
    doc.addImage(data.photo, 'JPEG', 20, 30, 40, 40);
    doc.addImage(qr.createDataURL(4), 150, 30, 30, 30);
    doc.setFontSize(12);
    doc.text(`Nom : ${data.nom} ${data.postnom} ${data.prenom}`, 20, 80);
    doc.text(`Téléphone : ${data.telephone}`, 20, 90);
    
    doc.save(`inscription_${data.id}.pdf`);
}
