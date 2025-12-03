import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ruta para enviar un mensaje
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    console.log('Mensaje de contacto recibido:');
    console.log({ name, email, message });
    
    // Leer mensajes existentes
    const messagesPath = path.join(__dirname, '../data/messages.json');
    let messages = [];
    
    try {
      const data = await fs.readFile(messagesPath, 'utf-8');
      messages = JSON.parse(data);
    } catch (error) {
      // Si no existe el archivo, empezamos con array vacío
      messages = [];
    }
    
    // Crear nuevo mensaje
    const newMessage = {
      id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
      name,
      email,
      message,
      date: new Date().toISOString(),
      read: false
    };
    
    // Agregar a la lista
    messages.push(newMessage);
    
    // Guardar en messages.json
    await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Mensaje recibido correctamente' 
    });
  } catch (error) {
    console.error('Error al guardar mensaje:', error);
    res.status(500).json({ error: 'Error al guardar el mensaje' });
  }
});

// Ruta para obtener todos los mensajes
router.get('/', async (req, res) => {
  try {
    const messagesPath = path.join(__dirname, '../data/messages.json');
    const data = await fs.readFile(messagesPath, 'utf-8');
    const messages = JSON.parse(data);
    res.json(messages);
  } catch (error) {
    res.json([]); // Si no hay mensajes, devolver array vacío
  }
});

// Ruta para marcar un mensaje como leído
router.patch('/:id/read', async (req, res) => {
  try {
    const messagesPath = path.join(__dirname, '../data/messages.json');
    const data = await fs.readFile(messagesPath, 'utf-8');
    const messages = JSON.parse(data);
    
    const message = messages.find(m => m.id === parseInt(req.params.id));
    if (message) {
      message.read = true;
      await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Mensaje no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar mensaje' });
  }
});

// Ruta para eliminar un mensaje
router.delete('/:id', async (req, res) => {
  try {
    const messagesPath = path.join(__dirname, '../data/messages.json');
    const data = await fs.readFile(messagesPath, 'utf-8');
    let messages = JSON.parse(data);
    
    messages = messages.filter(m => m.id !== parseInt(req.params.id));
    
    await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2));
    res.json({ success: true, message: 'Mensaje eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar mensaje' });
  }
});

export default router;  