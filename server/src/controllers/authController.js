// controllers/authController.js
import UserModel from '../models/userModel.js';
import { registerUser, loginUser, getUserFromToken } from '../services/authService.js';

export const register = async (req, res) => {
    const { /* nombre, */ email, nro_documento, password} = req.body;

    // Validate required fields
    if ((/* !nombre || */ !email || !nro_documento || !password)) {
      return res
        .status(400)
        .json({ success: false, message: "Debe rellenar todos los campos." });
    }

    // Create user instance
    const user = new UserModel({ /* nombre, */ email, nro_documento, password });

    try {
        // Register user using auth service
        const response = await registerUser(user);
        if (response.success) {
            return res.status(201).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (error) {
        console.error('Error in user registration:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Falló el registro. Por favor, inténtelo de nuevo más tarde.' 
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'El email y la contraseña son obligatorios.' });
    }

    try {
        // Call loginUser function from auth service
        const response = await loginUser(email, password);
        
        if (response.success) {
            return res.status(200).json(response); // Login successful
        } else {
            return res.status(401).json(response); // Unauthorized
        }
    } catch (error) {
        console.error('Error in user login:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Falló el inicio de sesión. Por favor, inténtelo de nuevo más tarde.' 
        });
    }
};

export const getUserDetails = async (req, res) => {
    
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header
    console.log(token);

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }

    try {
        const response = await getUserFromToken(token);

        if (response.success) {
            return res.status(200).json({ success: true, user: response.user });
        } else {
            return res.status(401).json({ success: false, message: response.message });
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return res.status(500).json({ success: false, message: 'Falló al recuperar los detalles del usuario.' });
    }
};
