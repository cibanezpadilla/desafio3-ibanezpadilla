import express from "express";
import { manager } from "./prodManager.js";


//creo una instancia de una aplicación express
const app = express();


/* Configuro el middleware express.json() en mi aplicación Express, para analizar y procesar 
las solicitudes entrantes que tienen datos en formato JSON en su cuerpo */
app.use(express.json());




/* -----------------------------------------------------------------*/
/* MIS ENDPOINTS */

/* GET PRODUCTS */
app.get('/api/products', async (req, res)=>{
    try {
        const products = await manager.getProducts(req.query)
    res.json({message: 'Products found', products})
    }
    catch (error){
        res.status(500).json({ message: error.message });
    }
})



/* GET PRODUCTS BY ID */
app.get('/api/products/:id', async (req, res) => {
    try{
        const {id} = req.params
        const productById = await manager.getProductById(+id)
        if (!productById) {
            return res
                .status(404)
                .json({ message: "Product not found with the id provided" });
            }
        res.status(200).json({ message: "Product found", productById });
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
        
})




/* -----------------------------------------------------------------*/
/*ESCUCHANDO */

app.listen(8080, () => {
    console.log("Escuchando al puerto 8080");
  });