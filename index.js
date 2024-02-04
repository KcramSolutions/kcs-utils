import express from 'express';
import multer from 'multer';
import PDFMerger from 'pdf-merger-js';
import fs from 'fs/promises';

const app = express();
const port = 8030;

// Configuración de Multer para manejar la carga de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Carpeta temporal para almacenar archivos temporales
const tempFolder = './temp';
await fs.mkdir(tempFolder, { recursive: true });

// Endpoint para fusionar archivos PDF
app.post('/utils/pdf/merge', upload.array('files'), async (req, res) => {
    const merger = new PDFMerger();

    // Agrega cada archivo PDF al objeto PDFMerger
    for (const file of req.files) {
        const tempFilePath = `${tempFolder}/${file.originalname}`;
        await fs.writeFile(tempFilePath, file.buffer);
        await merger.add(tempFilePath);
    }

    // Ruta para el PDF fusionado
    const mergedFilePath = `${tempFolder}/pdf_fusionado.pdf`;

    // Fusiona los archivos y guarda el PDF resultante
    await merger.save(mergedFilePath);

    // Lee el PDF fusionado y envía como respuesta
    const mergedData = await fs.readFile(mergedFilePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=pdf_fusionado.pdf');
    res.send(mergedData);

    // Elimina archivos temporales
    for (const file of req.files) {
        const tempFilePath = `${tempFolder}/${file.originalname}`;
        await fs.unlink(tempFilePath);
    }
    await fs.unlink(mergedFilePath);
});
app.get("*", (req, res) =>{
    res.json({
        status: "ok",
        msg: "online"
    })
})

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
